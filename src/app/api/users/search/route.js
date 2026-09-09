import { NextResponse } from "next/server";
import db from "@/lib/db";
import authenticateAccessToken from "@/lib/authenticateAccessToken";
import { getUserFromToken } from "@/lib/getUserFromToken";

export async function GET(request) {
//   const auth = await authenticateAccessToken(request);

//   if (auth.error) {
//     return NextResponse.json(
//       { success: false, message: auth.error },
//       { status: auth.status }
//     );
//   }

  try {
    const loggedInUser = await getUserFromToken();
    const loggedInUserId = loggedInUser?.userId;

    if (!loggedInUserId) {
      return NextResponse.json(
        { success: false, message: "Unable to identify logged-in user" },
        { status: 401 }
      );
    }


    // 1. GET SEARCH TERM
    const { searchParams } = new URL(request.url);
    const rawQuery = (searchParams.get("q") || "").trim();

    if (!rawQuery) {
      return NextResponse.json(
        { success: true, count: 0, users: [] },
        { status: 200 }
      );
    }

    // Minimum length guard — avoids matching everything on a
    // single character and returning huge/expensive result sets
    if (rawQuery.length < 2) {
      return NextResponse.json(
        {
          success: false,
          message: "Search term must be at least 2 characters",
        },
        { status: 400 }
      );
    }


    // 2. PAGINATION
    const page = Math.max(1, Number(searchParams.get("page")) || 1);
    const limit = Math.min(50, Number(searchParams.get("limit")) || 20);
    const offset = (page - 1) * limit;


    // 3. BUILD SEARCH PATTERNS
    const exactTerm = rawQuery;
    const prefixTerm = `${rawQuery}%`;
    const containsTerm = `%${rawQuery}%`;



    // 4. SEARCH QUERY WITH RANKING
    const [users] = await db.execute(
      `
        SELECT
          id,
          username,
          fullname,
          dp,
          dob,
          gender,

          CASE
            WHEN username = ? THEN 1
            WHEN username LIKE ? THEN 2
            WHEN fullname LIKE ? THEN 3
            WHEN username LIKE ? THEN 4
            ELSE 5
          END AS match_rank

        FROM users

        WHERE id != ?
          AND (
            username LIKE ?
            OR fullname LIKE ?
          )

        ORDER BY
          match_rank ASC,
          username ASC

        LIMIT ? OFFSET ?
      `,
      [
        exactTerm,        // rank 1: exact username
        prefixTerm,        // rank 2: username starts with term
        containsTerm,      // rank 3: fullname contains term
        containsTerm,      // rank 4: username contains term (fallback)
        loggedInUserId,    // exclude self
        containsTerm,      // WHERE: username contains term
        containsTerm,      // WHERE: fullname contains term
        limit,
        offset,
      ]
    );



    // 5. FORMAT RESULTS
    const formattedUsers = users.map((user) => ({
      id: user.id,
      username: user.username,
      fullName: user.fullname,
      image: user.dp,
      dob: user.dob,
      gender: user.gender,
       isOnline: global.onlineUsers?.has(user.id) ?? false,
    }));
// TOTAL COUNT (for pagination info)
const [totalRows] = await db.execute(
  `
    SELECT COUNT(*) AS total
    FROM users
    WHERE id != ?
      AND (
        username LIKE ?
        OR fullname LIKE ?
      )
  `,
  [loggedInUserId, containsTerm, containsTerm]
);

const totalCount = Number(totalRows[0].total);
const hasMore = offset + formattedUsers.length < totalCount;

    // 6. RESPONSE
    // console.log(formattedUsers, "formattedUsers")
    return NextResponse.json(
      {
        success: true,
        query: rawQuery,
        page,
        limit,
    totalCount,
    hasMore,
        count: formattedUsers.length,
        users: formattedUsers,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Search users error:", error);

    return NextResponse.json(
      { success: false, message: error.message || "Failed to search users" },
      { status: 500 }
    );
  }
}