// app/api/conversations/[id]/messages/route.js
import { NextResponse } from "next/server";
import db from "../../../../../lib/db";
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
    const loggedInUser = await getUserFromToken();
    const loggedInUserId = loggedInUser?.userId;

    const { id } = await params;
    const conversationId = Number(id);

    if (!Number.isFinite(conversationId)) {
      return NextResponse.json(
        { success: false, message: "Invalid conversation id" },
        { status: 400 }
      );
    }

    // ==========================================
    // VERIFY LOGGED-IN USER IS A PARTICIPANT
    // ==========================================

    const [participantCheck] = await db.execute(
      `SELECT id FROM conversation_participants WHERE conversation_id = ? AND user_id = ? LIMIT 1`,
      [conversationId, loggedInUserId]
    );

    if (participantCheck.length === 0) {
      return NextResponse.json(
        { success: false, message: "You are not part of this conversation" },
        { status: 403 }
      );
    }

    // ==========================================
    // PAGINATION (cursor = created_at of oldest message client has)
    // ==========================================

    const { searchParams } = new URL(request.url);
    const limit = Math.min(50, Number(searchParams.get("limit")) || 30);
    const cursor = searchParams.get("cursor");

    let query = `
      SELECT
        m.id,
        m.sender_id,
        m.message_type,
        m.content,
        m.image_url,
        m.is_edited,
        m.is_deleted,
        m.created_at,
        m.reply_to_message_id,

        rm.id AS reply_id,
        rm.sender_id AS reply_sender_id,
        rm.message_type AS reply_type,
        rm.content AS reply_content,
        rm.image_url AS reply_image_url,
        rm.is_deleted AS reply_is_deleted

      FROM messages m
      LEFT JOIN messages rm ON rm.id = m.reply_to_message_id

      WHERE m.conversation_id = ?
    `;

    const queryParams = [conversationId];

    if (cursor) {
      query += ` AND m.created_at < ? `;
      queryParams.push(cursor);
    }

    query += `
      ORDER BY m.created_at DESC
      LIMIT ?
    `;
    queryParams.push(limit);

    const [messages] = await db.execute(query, queryParams);

    if (messages.length === 0) {
      return NextResponse.json(
        { success: true, count: 0, messages: [], nextCursor: null, hasMore: false },
        { status: 200 }
      );
    }

    // ==========================================
    // FETCH REACTIONS for these messages (single query)
    // ==========================================

    const messageIds = messages.map((m) => m.id);
    const placeholders = messageIds.map(() => "?").join(",");

    const [reactions] = await db.execute(
      `
        SELECT mr.message_id, mr.user_id, mr.emoji, u.username
        FROM message_reactions mr
        INNER JOIN users u ON u.id = mr.user_id
        WHERE mr.message_id IN (${placeholders})
      `,
      messageIds
    );

    const reactionsByMessage = {};
    for (const r of reactions) {
      if (!reactionsByMessage[r.message_id]) reactionsByMessage[r.message_id] = [];
      reactionsByMessage[r.message_id].push({
        userId: r.user_id,
        username: r.username,
        emoji: r.emoji,
      });
    }

    // ==========================================
    // FORMAT
    // ==========================================

    const formattedMessages = messages.map((m) => ({
      id: m.id,
      senderId: m.sender_id,
      type: m.message_type,
      content: m.is_deleted ? null : m.content,
      imageUrl: m.is_deleted ? null : m.image_url,
      isEdited: Boolean(m.is_edited),
      isDeleted: Boolean(m.is_deleted),
      createdAt: m.created_at,

      replyTo: m.reply_to_message_id
        ? {
            id: m.reply_id,
            senderId: m.reply_sender_id,
            type: m.reply_type,
            content: m.reply_is_deleted ? null : m.reply_content,
            imageUrl: m.reply_is_deleted ? null : m.reply_image_url,
            isDeleted: Boolean(m.reply_is_deleted),
          }
        : null,

      reactions: reactionsByMessage[m.id] || [],
    }));

    const nextCursor = formattedMessages[formattedMessages.length - 1].createdAt;
    const hasMore = formattedMessages.length === limit;

    return NextResponse.json(
      {
        success: true,
        count: formattedMessages.length,
        messages: formattedMessages,
        nextCursor,
        hasMore,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Get messages error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to load messages" },
      { status: 500 }
    );
  }
}