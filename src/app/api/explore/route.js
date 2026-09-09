import { NextResponse } from "next/server";
import db from "../../../lib/db";
import authenticateAccessToken from "@/lib/authenticateAccessToken";
import { getUserFromToken } from "@/lib/getUserFromToken";

export async function GET(request) {
  // ==========================================
  // 1. AUTHENTICATION
  // ==========================================

  const auth = await authenticateAccessToken(request);

  if (auth.error) {
    return NextResponse.json(
      { success: false, message: auth.error },
      { status: auth.status }
    );
  }

  console.log(auth, "auth")

  try {
    // ==========================================
    // 2. GET LOGGED-IN USER
    // ==========================================

    const loggedInUser = await getUserFromToken();
    const loggedInUserId = loggedInUser?.userId;

    if (!loggedInUserId) {
      return NextResponse.json(
        { success: false, message: "Unable to identify logged-in user" },
        { status: 401 }
      );
    }

    // ==========================================
    // 3. GET FILTERS (all optional, no defaults)
    // ==========================================

    const { searchParams } = new URL(request.url);

    // ------------------------------------------
    // DISTANCE (null = no distance filter)
    // ------------------------------------------

    const distanceParam = searchParams.get("distance");
    const distance =
      distanceParam !== null && distanceParam !== ""
        ? Number(distanceParam)
        : null;

    // ------------------------------------------
    // AGE (null = no age filter)
    // ------------------------------------------

    const ageParam = searchParams.get("age");
    const age =
      ageParam !== null && ageParam !== "" ? Number(ageParam) : null;

    // ------------------------------------------
    // GENDER (empty = no gender filter)
    // ------------------------------------------

    const gender = (searchParams.get("gender") || "").trim().toLowerCase();

    // ==========================================
    // 4. VALIDATE DISTANCE (only if provided)
    // ==========================================

    if (distance !== null && (!Number.isFinite(distance) || distance <= 0)) {
      return NextResponse.json(
        { success: false, message: "Invalid distance" },
        { status: 400 }
      );
    }

    // ==========================================
    // 5. VALIDATE AGE (only if provided)
    // ==========================================

    if (age !== null && (!Number.isFinite(age) || age < 0 || age > 100)) {
      return NextResponse.json(
        { success: false, message: "Invalid age" },
        { status: 400 }
      );
    }

    // ==========================================
    // 6. NORMALIZE GENDER (only if provided)
    // ==========================================

    let genderFilter = "";

    if (gender) {
      if (!["male", "female", "other"].includes(gender)) {
        return NextResponse.json(
          { success: false, message: "Invalid gender" },
          { status: 400 }
        );
      }

      genderFilter = gender.charAt(0).toUpperCase() + gender.slice(1);
    }

    // ==========================================
    // 7. GET LOGGED-IN USER LOCATION
    //    (only needed if distance filter is active)
    // ==========================================

    let myLatitude = null;
    let myLongitude = null;

    if (distance !== null) {
      const [myLocationRows] = await db.execute(
        `
          SELECT latitude, longitude
          FROM user_locations
          WHERE user_id = ?
          LIMIT 1
        `,
        [loggedInUserId]
      );

      if (myLocationRows.length === 0) {
        return NextResponse.json(
          {
            success: true,
            message: "Your location is not available",
            users: [],
            count: 0,
          },
          { status: 200 }
        );
      }

      myLatitude = Number(myLocationRows[0].latitude);
      myLongitude = Number(myLocationRows[0].longitude);

      if (!Number.isFinite(myLatitude) || !Number.isFinite(myLongitude)) {
        return NextResponse.json(
          {
            success: true,
            message: "Your location coordinates are invalid",
            users: [],
            count: 0,
          },
          { status: 200 }
        );
      }
    }

    // ==========================================
    // 8. BASE QUERY
    // ==========================================

    // Distance is only computed (and joined against user_locations)
    // when a distance filter is actually requested. Otherwise we
    // LEFT JOIN so users without a saved location still show up.

    const needsDistance = distance !== null;

    let query = `
      SELECT
        u.id,
        u.username,
        u.fullname,
        u.gender,
        u.dob,
        u.dp,
        (
  SELECT COUNT(*)
  FROM dp_likes dl
  WHERE dl.profile_user_id = u.id
) AS dp_like_count,

(
  SELECT COUNT(*)
  FROM dp_likes dl2
  WHERE dl2.profile_user_id = u.id
    AND dl2.liker_user_id = ?
) AS dp_liked_by_me,


        ul.latitude,
        ul.longitude,
        ul.display_name,

        TIMESTAMPDIFF(YEAR, u.dob, CURDATE()) AS age
        ${
          needsDistance
            ? `,
        (
          6371 * ACOS(
            LEAST(
              1,
              GREATEST(
                -1,
                COS(RADIANS(?))
                * COS(RADIANS(ul.latitude))
                * COS(RADIANS(ul.longitude) - RADIANS(?))
                + SIN(RADIANS(?))
                * SIN(RADIANS(ul.latitude))
              )
            )
          )
        ) AS distance`
            : ``
        }

      FROM users u
      ${needsDistance ? "INNER JOIN" : "LEFT JOIN"} user_locations ul
        ON ul.user_id = u.id

      WHERE u.id != ?
        AND u.dob IS NOT NULL
        AND u.dob <= CURDATE()
        AND u.gender IS NOT NULL
    `;

const queryParams = needsDistance
  ? [loggedInUserId, myLatitude, myLongitude, myLatitude, loggedInUserId]
  : [loggedInUserId, loggedInUserId];

    // ==========================================
    // 9. GENDER FILTER (only if passed)
    // ==========================================

    if (genderFilter) {
      query += ` AND u.gender = ? `;
      queryParams.push(genderFilter);
    }

    // ==========================================
    // 10. AGE FILTER (only if passed)
    //     0 to <age>, Tinder-style upper bound
    // ==========================================

    if (age !== null) {
      query += `
        AND TIMESTAMPDIFF(YEAR, u.dob, CURDATE()) BETWEEN 0 AND ?
      `;
      queryParams.push(age);
    }

    // ==========================================
    // 11. DISTANCE FILTER (only if passed)
    // ==========================================

    if (needsDistance) {
      query += ` HAVING distance <= ? `;
      queryParams.push(distance);
    }

    // ==========================================
    // 12. SORT
    //     By distance when available, else newest signups first
    // ==========================================

    query += needsDistance
      ? ` ORDER BY distance ASC `
      : ` ORDER BY u.created_at DESC `;

    // ==========================================
    // 13. EXECUTE
    // ==========================================

    // console.log("QUERY:", query);
    // console.log("PARAMS:", queryParams);

    const [users] = await db.execute(query, queryParams);

    // ==========================================
    // 14. FORMAT USERS
    // ==========================================

    const formattedUsers = users.map((user) => ({
      id: user.id,
      username: user.username,
      fullName: user.fullname,
      gender: user.gender,
      age: Number(user.age),
      isOnline: global.onlineUsers?.has(user.id) ?? false,
      distance:
        needsDistance && user.distance !== undefined
          ? Number(Number(user.distance).toFixed(1))
          : null,
      image: user.dp,
        dpLikeCount: Number(user.dp_like_count),
  dpLikedByMe: Boolean(user.dp_liked_by_me),
      latitude: user.latitude !== null ? Number(user.latitude) : null,
      longitude: user.longitude !== null ? Number(user.longitude) : null,
      location: user.display_name || null,
    }));

    // ==========================================
    // 15. RESPONSE
    // ==========================================

    return NextResponse.json(
      {
        success: true,
        filters: {
          age,
          distance,
          gender: genderFilter || null,
        },
        count: formattedUsers.length,
        users: formattedUsers,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Explore API error:", error);

    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to load explore users",
      },
      { status: 500 }
    );
  }
}