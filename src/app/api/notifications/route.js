import authenticateAccessToken from "@/lib/authenticateAccessToken";
import { getUserFromToken } from "@/lib/getUserFromToken";
import db from "@/lib/db";
import { NextResponse } from "next/server";



// get all notifications of loggedin user
export async function GET(request, { params }) {
  const auth = await authenticateAccessToken(request);
  if (auth.error) {
    return NextResponse.json(
      { success: false, message: auth.error },
      { status: auth.status }
    );
  }

  let connection;

  try {
      const loggedInUser = await getUserFromToken();
    const loggedInUserId = loggedInUser?.userId;


const [notifications] = await db.execute(
  `SELECT
      n.id AS not_id, 
      n.recipient_id AS recipient_id,
      n.actor_id AS actor_id,
      n.type AS type,
      n.post_id AS post_id,
      n.is_seen AS is_seen,
      n.is_read AS is_read,
      n.created_at AS created_at,
        u.id AS user_id,
      u.username AS username,
      u.fullname AS fullname,
      u.dp AS dp

   FROM notifications n

   INNER JOIN users u
      ON u.id = n.actor_id

   WHERE n.recipient_id = ?

   ORDER BY n.created_at DESC`,
  [loggedInUserId]
);


// console.log(notifications, "NOTI B")
return NextResponse.json(
  { success: true, notifications },
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

    console.error("show all noti:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to toggle like" },
      { status: 500 }
    );
  } finally {
    if (connection) connection.release();
  }
}

