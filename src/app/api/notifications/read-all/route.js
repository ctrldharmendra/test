import authenticateAccessToken from "@/lib/authenticateAccessToken";
import { getUserFromToken } from "@/lib/getUserFromToken";
import db from "@/lib/db";
import { NextResponse } from "next/server";



// MAKE ALL NOTIFICATION is_seen = 1 and is_read = 1
export async function PATCH(request, { params }) {
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

    // first check if there is any notification which is not seen
    const [isThereAnyNotificationWhichIsNotRead] = await db.execute(
      `SELECT COUNT(id) AS count FROM notifications WHERE recipient_id = ? AND is_read = FALSE`,
      [loggedInUserId]
    );

    if (isThereAnyNotificationWhichIsNotRead[0].count > 0) {
      const [countRows] = await db.execute(
    `UPDATE notifications SET is_seen = 1, is_read = 1 WHERE recipient_id = ?`, [loggedInUserId]
)
return NextResponse.json(
  { success: true, countRows },
  { status: 200 }

);

    }
    
    return NextResponse.json(
      { success: false, message: "There are No any Unread Notifications" },
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

    return NextResponse.json(
      { success: false, message: error.message || "Failed to toggle like" },
      { status: 500 }
    );
  } finally {
    if (connection) connection.release();
  }
}

