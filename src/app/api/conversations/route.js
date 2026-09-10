import authenticateAccessToken from "@/lib/authenticateAccessToken";
import { getUserFromToken } from "@/lib/getUserFromToken";
import { NextResponse } from "next/server";
import db from "../../../lib/db";




// GET CONVERSATIONs
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

    const [conversations] = await db.execute(
      `
        SELECT
          c.id AS conversation_id,
          c.last_message_at,

          other_user.id AS other_user_id,
          other_user.username AS other_username,
          other_user.fullname AS other_fullname,
          other_user.dp AS other_dp,

          last_msg.id AS last_message_id,
          last_msg.sender_id AS last_message_sender_id,
          last_msg.message_type AS last_message_type,
          last_msg.content AS last_message_content,
          last_msg.is_deleted AS last_message_is_deleted,
          last_msg.created_at AS last_message_created_at,

          my_cp.last_read_message_id,

          (
            SELECT COUNT(*)
            FROM messages m
            WHERE m.conversation_id = c.id
              AND m.sender_id != ?
              AND (my_cp.last_read_message_id IS NULL OR m.id > my_cp.last_read_message_id)
          ) AS unread_count

        FROM conversations c

        INNER JOIN conversation_participants my_cp
          ON my_cp.conversation_id = c.id AND my_cp.user_id = ?

        INNER JOIN conversation_participants other_cp
          ON other_cp.conversation_id = c.id AND other_cp.user_id != ?

        INNER JOIN users other_user
          ON other_user.id = other_cp.user_id

        LEFT JOIN messages last_msg
          ON last_msg.id = (
            SELECT id FROM messages
            WHERE conversation_id = c.id
            ORDER BY created_at DESC
            LIMIT 1
          )

        ORDER BY c.last_message_at DESC
      `,
      [loggedInUserId, loggedInUserId, loggedInUserId]
    );

    const formatted = conversations.map((c) => ({
      conversationId: c.conversation_id,
      lastMessageAt: c.last_message_at,
      unreadCount: Number(c.unread_count),

      otherUser: {
        id: c.other_user_id,
        username: c.other_username,
        fullName: c.other_fullname,
        image: c.other_dp,
      },

      lastMessage: c.last_message_id
        ? {
            id: c.last_message_id,
            senderId: c.last_message_sender_id,
            type: c.last_message_type,
            content: c.last_message_is_deleted ? null : c.last_message_content,
            isDeleted: Boolean(c.last_message_is_deleted),
            createdAt: c.last_message_created_at,
          }
        : null,
    }));

    return NextResponse.json(
      { success: true, count: formatted.length, conversations: formatted },
      { status: 200 }
    );
  } catch (error) {
    console.error("Get conversations error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to load conversations" },
      { status: 500 }
    );
  }
}


// POST CONVERSATIONS 
export async function POST(request) {
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

    const body = await request.json();
    const targetUserId = Number(body?.targetUserId);

    if (!Number.isFinite(targetUserId)) {
      return NextResponse.json(
        { success: false, message: "Invalid targetUserId" },
        { status: 400 }
      );
    }

    if (targetUserId === loggedInUserId) {
      return NextResponse.json(
        { success: false, message: "Cannot start a conversation with yourself" },
        { status: 400 }
      );
    }

    connection = await db.getConnection();
    await connection.beginTransaction();

    // CHECK IF CONVERSATION ALREADY EXISTS
    // (dono users ke beech, 1-to-1 assumption)

    const [existingRows] = await connection.execute(
      `
        SELECT cp1.conversation_id
        FROM conversation_participants cp1
        INNER JOIN conversation_participants cp2
          ON cp1.conversation_id = cp2.conversation_id
        WHERE cp1.user_id = ? AND cp2.user_id = ?
        LIMIT 1
      `,
      [loggedInUserId, targetUserId]
    );

    if (existingRows.length > 0) {
      await connection.commit();
      return NextResponse.json(
        {
          success: true,
          conversationId: existingRows[0].conversation_id,
          isNew: false,
        },
        { status: 200 }
      );
    }

    // CREATE NEW CONVERSATION

    const [convResult] = await connection.execute(
      `INSERT INTO conversations (created_at) VALUES (NOW())`
    );

    const conversationId = convResult.insertId;

    await connection.execute(
      `
        INSERT INTO conversation_participants (conversation_id, user_id)
        VALUES (?, ?), (?, ?)
      `,
      [conversationId, loggedInUserId, conversationId, targetUserId]
    );

    await connection.commit();

    return NextResponse.json(
      { success: true, conversationId, isNew: true },
      { status: 201 }
    );
  } catch (error) {
    if (connection) {
      try {
        await connection.rollback();
      } catch (_) {}
    }
    console.error("Create conversation error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to create conversation" },
      { status: 500 }
    );
  } finally {
    if (connection) connection.release();
  }
}