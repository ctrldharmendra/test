
import authenticateAccessToken from "@/lib/authenticateAccessToken";
import { getUserFromToken } from "@/lib/getUserFromToken";
import db from "@/lib/db";
import { NextResponse } from "next/server";



export async function POST(request, { params }) {
  const auth = await authenticateAccessToken(request);
  if (auth.error) {
    return NextResponse.json(
      { success: false, message: auth.error },
      { status: auth.status }
    );
  }
  const { id } = await params; //post id
  let connection;

  try {
    const loggedInUser = await getUserFromToken();
    const loggedInUserId = loggedInUser?.userId;




    connection = await db.getConnection();
    await connection.beginTransaction();

    // ==========================================
    // CONFIRM POST EXISTS
    // ==========================================

    const [postRows] = await connection.execute(
      `SELECT id FROM posts WHERE id = ? LIMIT 1`,
      [id]
    );

    if (postRows.length === 0) {
      await connection.rollback();
      return NextResponse.json(
        { success: false, message: "Post not found" },
        { status: 404 }
      );
    }

    // ==========================================
    // CHECK EXISTING LIKE
    // ==========================================

    const [existingLike] = await connection.execute(
      `SELECT id FROM post_likes WHERE post_id = ? AND user_id = ? LIMIT 1`,
      [id, loggedInUserId]
    );

    let liked;

    // GET OWNER ID OF POST 
    const [postOwner] = await connection.execute(
      `SELECT user_id FROM posts WHERE id = ? LIMIT 1`, [id]
    )
    let postOwnerId = postOwner?.[0]?.user_id


    if (existingLike.length > 0) {
      // ALREADY LIKED -> UNLIKE (remove it)
      await connection.execute(
        `DELETE FROM post_likes WHERE id = ?`, [existingLike[0].id]);

      // Delete notification too if availale
      await connection.execute(
        `
          DELETE FROM notifications
          WHERE recipient_id = ?
            AND actor_id = ?
            AND post_id = ?
            AND type = 'like'
        `,
        [postOwnerId, loggedInUserId, id]
      );

              // NOW GETTING NOTIFICATION COUNT FOR THE USER FOR WHOM THIS UNLIKE WAS DONE | ALL UNSEEN NOTIFICATION COUNT
        const [notificationCount] = await connection.execute(
          `SELECT COUNT(id) AS count FROM notifications WHERE recipient_id = ?  AND is_seen = FALSE`,
          [postOwnerId]
        )

        if (global.io) {
          global.io.to(`user:${postOwnerId}`).emit("notification:new", 
            {
            type: "dislike",
            actor: "", 
            unSeenNotificationCount: notificationCount?.[0]?.count
             }
            );
        }

      liked = false;
    } else {
      // NOT LIKED -> LIKE (insert it)
      await connection.execute(
        `INSERT INTO post_likes (post_id, user_id) VALUES (?, ?)`,
        [id, loggedInUserId]
      );

      // Don't notify yourself for liking your own post
      if (postOwnerId !== loggedInUserId) {
        await connection.execute(
          `
            INSERT INTO notifications
              (recipient_id, actor_id, type, post_id, is_seen, is_read)
            VALUES (?, ?, 'like', ?, FALSE, FALSE)
          `,
          [postOwnerId, loggedInUserId, id]
        );

        // TO SEND LIKEED NOTIFICATION TO FRONTEND — SOCKET EMIT | PARTICULAR USER ONLY

        // EXTRACTING ACTOR DETAILS TO Send IN FRONTEND | IT MEANS THE ONE WHO DID THIS ACTION
        const [actorRows] = await connection.execute(
          `SELECT username, dp, id FROM users WHERE id = ?`,
          [loggedInUserId]
        );

        // NOW GETTING NOTIFICATION FOR THE USER FOR WHOM THIS LIKE WAS DONE | ALL UNSEEN NOTIFICATION COUNT
        const [notificationCount] = await connection.execute(
          `SELECT COUNT(id) AS count FROM notifications WHERE recipient_id = ?  AND is_seen = FALSE`,
          [postOwnerId]
        )
        const actor = actorRows[0];

        if (global.io) {
          global.io.to(`user:${postOwnerId}`).emit("notification:new", 
            {
            type: "like",
            actor: actor, 
            unSeenNotificationCount: notificationCount?.[0]?.count
             }
            );
        }

      }
      liked = true;
    }

    // ==========================================
    // GET UPDATED COUNT
    // ==========================================

    const [countRows] = await connection.execute(
      `SELECT COUNT(*) AS count FROM post_likes WHERE post_id = ?`,
      [id]
    );

    await connection.commit();


    //  TO SEND LIKE COUNT UPDATE TO FRONTEND | ALSO SEND PARTICULAR POST — SOCKET EMIT
    const [likedPost] = await connection.execute(
      `SELECT
          p.id,

          COUNT(DISTINCT pl.id) AS likeCount,

          MAX(
            CASE
              WHEN pl.user_id = ? THEN 1
              ELSE 0
            END
          ) AS likedByMe

        FROM posts p

        INNER JOIN users u
          ON u.id = p.user_id

        LEFT JOIN post_likes pl
          ON pl.post_id = p.id

        WHERE p.id = ?

        GROUP BY
          p.id

        LIMIT 1`
       , [loggedInUserId, id]
    )

    if (global.io) {
      global.io.emit("post:like-updated", {
        postId: id,
        liked,
        likeCount: Number(countRows[0].count),
        likedPost: likedPost?.[0]
      });
    }



    return NextResponse.json(
      {
        success: true,
        liked,
        likeCount: Number(countRows[0].count),
      },
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

    console.error("Toggle like error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to toggle like" },
      { status: 500 }
    );
  } finally {
    if (connection) connection.release();
  }
}
