import { NextResponse } from "next/server";
import db from "../../../lib/db";
import authenticateAccessToken from "@/lib/authenticateAccessToken";
import { getUserFromToken } from "@/lib/getUserFromToken";

export async function GET(request, { params }) {
  const auth = await authenticateAccessToken(request);

  if (auth.error) {
    return NextResponse.json(
      { success: false, message: auth.error },
      { status: auth.status }
    );
  }

  try {
    // const { username } = await params;

    // Logged-in user
    const loggedInUser = await getUserFromToken();
    const loggedInUserId = loggedInUser?.userId;

    if (!loggedInUserId) {
      return NextResponse.json(
        { success: false, message: "Unable to identify logged-in user" },
        { status: 401 }
      );
    }

    // ==========================================
    // 1. GET LOGGED-IN USER'S LOCATION
    //    (needed to compute distance to target user)
    // ==========================================

    const [myLocationRows] = await db.execute(
      `
        SELECT latitude, longitude
        FROM user_locations
        WHERE user_id = ?
        LIMIT 1
      `,
      [loggedInUserId]
    );

    const myLatitude =
      myLocationRows.length > 0 ? Number(myLocationRows[0].latitude) : null;
    const myLongitude =
      myLocationRows.length > 0 ? Number(myLocationRows[0].longitude) : null;

    const hasMyLocation =
      Number.isFinite(myLatitude) && Number.isFinite(myLongitude);

    // ==========================================
    // 2. FIND TARGET USER BY USERNAME
    //    (now includes age + location fields)
    // ==========================================

    let userQuery = `
      SELECT
        u.id,
        u.username,
        u.fullname,
        u.email,
        u.gender,
        u.dob,
        u.dp,

        TIMESTAMPDIFF(YEAR, u.dob, CURDATE()) AS age,

        ul.latitude,
        ul.longitude,
        ul.display_name
    `;

    const userQueryParams = [];

    if (hasMyLocation) {
      userQuery += `
        ,
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
        ) AS distance
      `;
      userQueryParams.push(myLatitude, myLongitude, myLatitude);
    }

    userQuery += `
      FROM users u
      LEFT JOIN user_locations ul ON ul.user_id = u.id
      WHERE u.id = ?
      LIMIT 1
    `;
    userQueryParams.push(loggedInUserId);

    const [userRows] = await db.execute(userQuery, userQueryParams);

    if (userRows.length === 0) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    const targetUser = userRows[0];
    const targetUserId = targetUser.id;

    // ==========================================
    // 3. PAGINATION
    // ==========================================

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, Number(searchParams.get("page")) || 1);
    const limit = Math.min(50, Number(searchParams.get("limit")) || 10);
    const offset = (page - 1) * limit;

    // ==========================================
    // 4. GET USER'S POSTS (unchanged)
    // ==========================================

    const [posts] = await db.execute(
      `
        SELECT
          p.id,
          p.user_id,
          p.caption,
          p.image_url,
          p.created_at,

          u.username,
          u.fullname,
          u.dp,

          COUNT(DISTINCT pl.id) AS like_count,

          MAX(CASE WHEN pl.user_id = ? THEN 1 ELSE 0 END) AS liked_by_me

        FROM posts p
        INNER JOIN users u ON u.id = p.user_id
        LEFT JOIN post_likes pl ON pl.post_id = p.id

        WHERE p.user_id = ?

        GROUP BY
          p.id, p.user_id, p.caption, p.image_url, p.created_at,
          u.username, u.fullname, u.dp

        ORDER BY p.created_at DESC
        LIMIT ? OFFSET ?
      `,
      [loggedInUserId, targetUserId, limit, offset]
    );

    // ==========================================
    // 5. FORMAT POSTS
    // ==========================================

    const formattedPosts = posts.map((post) => ({
      id: post.id,
      caption: post.caption,
      imageUrl: post.image_url,
      createdAt: post.created_at,
      likeCount: Number(post.like_count),
      likedByMe: Boolean(post.liked_by_me),
      user: {
        id: post.user_id,
        username: post.username,
        fullName: post.fullname,
        image: post.dp,
      },
    }));

    // ==========================================
    // 6. RESPONSE
    // ==========================================

    return NextResponse.json(
      {
        success: true,

        user: {
          id: targetUser.id,
          username: targetUser.username,
          fullName: targetUser.fullname,
          email: targetUser.email,
          gender: targetUser.gender,
          dob: targetUser.dob,
          age: targetUser.age !== null ? Number(targetUser.age) : null,
          image: targetUser.dp,

          location: targetUser.display_name || null,
          latitude:
            targetUser.latitude !== null ? Number(targetUser.latitude) : null,
          longitude:
            targetUser.longitude !== null
              ? Number(targetUser.longitude)
              : null,

          distance:
            hasMyLocation && targetUser.distance !== undefined
              ? Number(Number(targetUser.distance).toFixed(1))
              : null,
        },

        page,
        count: formattedPosts.length,
        posts: formattedPosts,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Get user posts error:", error);

    return NextResponse.json(
      { success: false, message: error.message || "Failed to load user" },
      { status: 500 }
    );
  }
}