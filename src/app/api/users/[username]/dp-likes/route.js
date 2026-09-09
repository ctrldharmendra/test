import authenticateAccessToken from "@/lib/authenticateAccessToken";
import { getUserFromToken } from "@/lib/getUserFromToken";
import { NextResponse } from "next/server";
import db from "@/lib/db";





export async function POST(request, { params }) {
//   const auth = await authenticateAccessToken(request);
//   if (auth.error) {
//     return NextResponse.json(
//       { success: false, message: auth.error },
//       { status: auth.status }
//     );
//   }

  let connection;

  try {
    const loggedInUser = await getUserFromToken();
    const loggedInUserId = loggedInUser?.userId;

    const { username } = await params;

    connection = await db.getConnection();
    await connection.beginTransaction();

    // FIND TARGET USER (whose dp is being liked)

    const [userRows] = await connection.execute(
      `SELECT id FROM users WHERE username = ? LIMIT 1`,
      [username]
    );

    if (userRows.length === 0) {
      await connection.rollback();
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    const profileUserId = userRows[0].id;  // target user id
         

    // Can't like your own dp
    if (profileUserId === loggedInUserId) {
      await connection.rollback();
      return NextResponse.json(
        { success: false, message: "You can't like your own profile picture." },
        { status: 400 }
      );
    }

    // CHECK EXISTING LIKE

    const [existingLike] = await connection.execute(
      `SELECT id FROM dp_likes WHERE profile_user_id = ? AND liker_user_id = ? LIMIT 1`,
      [profileUserId, loggedInUserId]
    );

    let liked;

    if (existingLike.length > 0) {
      // UNLIKE
      await connection.execute(
        `DELETE FROM dp_likes WHERE id = ?`,
        [existingLike[0].id]
      );

      // remove matching notification, same pattern as post likes
      await connection.execute(
        `
          DELETE FROM notifications
          WHERE recipient_id = ?
            AND actor_id = ?
            AND type = 'dp_like'
        `,
        [profileUserId, loggedInUserId]
      );


                    // NOW GETTING NOTIFICATION COUNT FOR THE USER FOR WHOM THIS UNLIKE WAS DONE | ALL UNSEEN NOTIFICATION COUNT
        const [notificationCount] = await connection.execute(
          `SELECT COUNT(id) AS count FROM notifications WHERE recipient_id = ?  AND is_seen = FALSE`,
          [profileUserId]
        )

        if (global.io) {
          global.io.to(`user:${profileUserId}`).emit("notification:new",
            {
            type: "dp_dislike",
            actor: "", 
            unSeenNotificationCount: notificationCount?.[0]?.count
             }
            );
        }

      liked = false;
    } else {
      // LIKE
      await connection.execute(
        `INSERT INTO dp_likes (profile_user_id, liker_user_id) VALUES (?, ?)`,
        [profileUserId, loggedInUserId]
      );

      await connection.execute(
        `
          INSERT INTO notifications
            (recipient_id, actor_id, type, post_id, is_seen, is_read)
          VALUES (?, ?, 'dp_like', NULL, FALSE, FALSE)
        `,
        [profileUserId, loggedInUserId]
      );

      liked = true;

    //   REAL TIME NOTIFICATION TO SEND TO PARTICULAR USER 
            const [actorRows] = await connection.execute(
          `SELECT username, dp, id FROM users WHERE id = ?`,
          [loggedInUserId]
        );

        // // NOW GETTING NOTIFICATION FOR THE USER FOR WHOM THIS LIKE WAS DONE | ALL UNSEEN NOTIFICATION COUNT
        const [notificationCount] = await connection.execute(
          `SELECT COUNT(id) AS count FROM notifications WHERE recipient_id = ?  AND is_seen = FALSE`,
          [profileUserId]
        )
        const actor = actorRows[0];

        if (global.io) {
          console.log("DP LIKE RUN")
          global.io.to(`user:${profileUserId}`).emit("notification:new", 
            {
            type: "dp_like",
            actor: actor, 
            unSeenNotificationCount: notificationCount?.[0]?.count
             }
            );
        }
    //   REAL TIME NOTIFICATION TO SEND TO PARTICULAR USER END
    }

    // GET UPDATED COUNT

    const [countRows] = await connection.execute(
      `SELECT COUNT(*) AS count FROM dp_likes WHERE profile_user_id = ?`,
      [profileUserId]
    );

    await connection.commit();

    return NextResponse.json(
      { success: true, liked, likeCount: Number(countRows[0].count) },
      { status: 200 }
    );
  } catch (error) {
    if (connection) {
      try {
        await connection.rollback();
      } catch (rollbackError) {
        console.error("Rollback error:", rollbackError);
      }
    }

    console.error("Toggle dp like error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to toggle dp like" },
      { status: 500 }
    );
  } finally {
    if (connection) connection.release();
  }
}