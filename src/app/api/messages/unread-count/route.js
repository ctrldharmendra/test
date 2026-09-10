// app/api/messages/unread-count/route.js
import { NextResponse } from "next/server";
import db from "@/lib/db";
import authenticateAccessToken from "@/lib/authenticateAccessToken";
import { getUserFromToken } from "@/lib/getUserFromToken";

export async function GET(request) {
  const auth = await authenticateAccessToken(request);
  if (auth.error) {
    return NextResponse.json(
      { success: false, message: auth.error },
      { status: auth.status }
    );
  }

  try {
    const loggedInUser = await getUserFromToken();
    const loggedInUserId = loggedInUser?.userId;

    const [rows] = await db.execute(
      `
        SELECT COUNT(*) AS total_unread
        FROM messages m
        INNER JOIN conversation_participants cp
          ON cp.conversation_id = m.conversation_id AND cp.user_id = ?
        WHERE m.sender_id != ?
          AND (cp.last_read_message_id IS NULL OR m.id > cp.last_read_message_id)
      `,
      [loggedInUserId, loggedInUserId]
    );

    return NextResponse.json(
      { success: true, totalUnreadCount: Number(rows[0].total_unread) },
      { status: 200 }
    );
  } catch (error) {
    console.error("Unread count error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to get unread count" },
      { status: 500 }
    );
  }
}