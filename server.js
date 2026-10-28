


// --------------------------NEW 
require("dotenv").config({ path: ".env.local" });

const { createServer } = require("http");
const { parse } = require("url");
const { Server } = require("socket.io");
const next = require("next");

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = process.env.PORT || 3000;

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

// ONLINE USERS — module-level, single source of truth
const onlineUsers = new Map(); // userId -> Set of socket ids


// LAZY DB LOADER (db.js is ESM, server.js is CommonJS)

let dbPromise = null;
function getDb() {
  if (!dbPromise) {
    dbPromise = import("./src/lib/db.js").then((mod) => mod.default);
  }
  return dbPromise;
}

app.prepare().then(() => {
  // const server = createServer((req, res) => {
  //   const parsedUrl = parse(req.url, true);
  //   handle(req, res, parsedUrl);
  // });
const server = createServer((req, res) => {
  // Allow all CORS origins
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, PATCH, DELETE, OPTIONS"
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization"
  );

  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }

  const parsedUrl = parse(req.url, true);
  handle(req, res, parsedUrl);
});

  const io = new Server(server, {
    path: "/api/socket_io",
  });

  global.io = io;
  global.onlineUsers = onlineUsers;

  io.on("connection", (socket) => {
    let currentUserId = null;

    console.log("Socket connected:", socket.id);


    // REGISTER — user identifies themselves after connecting
    socket.on("register", (userId) => {
      currentUserId = Number(userId);
      socket.join(`user:${currentUserId}`);
      console.log(`User ${currentUserId} joined the room`);

      if (!onlineUsers.has(currentUserId)) {
        onlineUsers.set(currentUserId, new Set());
      }
      onlineUsers.get(currentUserId).add(socket.id);

      // sabko poori updated online list bhejo (self-healing sync)
      io.emit("online-users:snapshot", Array.from(onlineUsers.keys()));

      if (onlineUsers.get(currentUserId).size === 1) {
        broadcastOnlineStatus(io, currentUserId, true);
      }
            markDeliveredForUser(io, currentUserId);
    });


    // CONVERSATION JOIN — for typing indicators scoped to a chat
    socket.on("conversation:join", (conversationId) => {
      socket.join(`conversation:${conversationId}`);
    });

    socket.on("conversation:leave", (conversationId) => {
      socket.leave(`conversation:${conversationId}`);
    });


    // MESSAGE: SEND
    socket.on("message:send", async ({ conversationId, type, content, imageUrl, replyToMessageId, tempId }) => {
      try {
        if (!currentUserId) return;

        const convId = Number(conversationId);
        const isText = type === "text";
        const isImage = type === "image";

        if (!Number.isInteger(convId) || (!isText && !isImage) ||
            (isText && !String(content || "").trim()) || (isImage && !imageUrl)) {
          socket.emit("message:error", { tempId, message: "Invalid message" });
          return;
        }

        const db = await getDb();

        // sirf conversation ke participants hi message bhej sakte hai
        const [participants] = await db.execute(
          `SELECT user_id FROM conversation_participants WHERE conversation_id = ?`,
          [convId]
        );

        if (!participants.some((p) => Number(p.user_id) === currentUserId)) {
          socket.emit("message:error", { tempId, message: "Not allowed" });
          return;
        }

        const recipientId = participants.find(
          (p) => Number(p.user_id) !== currentUserId
        )?.user_id;

        const [result] = await db.execute(
          `
            INSERT INTO messages
              (conversation_id, sender_id, message_type, content, image_url, reply_to_message_id)
            VALUES (?, ?, ?, ?, ?, ?)
          `,
          [convId, currentUserId, type, content || null, imageUrl || null, replyToMessageId || null]
        );

        await db.execute(
          `
            UPDATE conversations
            SET last_message_at = NOW(),
                last_reaction_message_id = NULL,
                last_reaction_user_id = NULL,
                last_reaction_emoji = NULL,
                last_reaction_at = NULL
            WHERE id = ?
          `,
          [convId]
        );

        let replyPreview = null;
        if (replyToMessageId) {
          const [replyRows] = await db.execute(
            `SELECT id, sender_id, message_type, content, image_url, is_deleted FROM messages WHERE id = ? AND conversation_id = ?`,
            [replyToMessageId, convId]
          );
          if (replyRows.length > 0) {
            const r = replyRows[0];
            replyPreview = {
              id: r.id,
              senderId: r.sender_id,
              type: r.message_type,
              content: r.is_deleted ? null : r.content,
              imageUrl: r.is_deleted ? null : r.image_url,
              isDeleted: Boolean(r.is_deleted),
            };
          }
        }

        const messagePayload = {
          id: result.insertId,
          conversationId: convId,
          senderId: currentUserId,
          type,
          content: content || null,
          imageUrl: imageUrl || null,
          replyTo: replyPreview,
          isEdited: false,
          isDeleted: false,
          reactions: [],
          status: "sent",
          deliveredAt: null,
          createdAt: new Date().toISOString(),
          tempId: tempId || null,
        };

        // 1) PEHLE sender ko (uske saare tabs), taaki optimistic message real id le le
        //    isse pehle ki receiver ka "delivered" event aaye
        io.to(`user:${currentUserId}`).emit("message:new", messagePayload);

        // 2) phir receiver ko
        if (recipientId) {
          io.to(`user:${recipientId}`).emit("message:new", messagePayload);

          const [unreadRows] = await db.execute(
            `
              SELECT COUNT(*) AS count FROM messages m
              INNER JOIN conversation_participants cp
                ON cp.conversation_id = m.conversation_id AND cp.user_id = ?
              WHERE m.sender_id != ?
                AND (cp.last_read_message_id IS NULL OR m.id > cp.last_read_message_id)
            `,
            [recipientId, recipientId]
          );

          io.to(`user:${recipientId}`).emit("unread:count-updated", {
            totalUnreadCount: Number(unreadRows[0].count),
          });
        }
      } catch (error) {
        console.error("message:send error:", error);
        socket.emit("message:error", { tempId, message: "Failed to send message" });
      }
    });

// MESSAGE : DELIVERED 
      socket.on("message:ack-delivered", async ({ conversationId, messageId }) => {
      try {
        if (!currentUserId) return;

        const convId = Number(conversationId);
        const msgId = Number(messageId);
        if (!Number.isInteger(convId) || !Number.isInteger(msgId)) return;

        const db = await getDb();

        // message isi user ke liye hona chahiye (participant ho, aur sender na ho)
        const [rows] = await db.execute(
          `
            SELECT m.sender_id
            FROM messages m
            INNER JOIN conversation_participants cp
              ON cp.conversation_id = m.conversation_id AND cp.user_id = ?
            WHERE m.id = ? AND m.conversation_id = ? AND m.sender_id != ?
            LIMIT 1
          `,
          [currentUserId, msgId, convId, currentUserId]
        );

        if (rows.length === 0) return;
        const senderId = rows[0].sender_id;

        const [result] = await db.execute(
          `
            UPDATE messages
            SET delivered_at = NOW()
            WHERE conversation_id = ? AND sender_id = ? AND id <= ? AND delivered_at IS NULL
          `,
          [convId, senderId, msgId]
        );

        if (result.affectedRows === 0) return; // pehle se delivered, dobara emit nahi

        io.to(`user:${senderId}`).emit("message:delivered", {
          conversationId: convId,
          senderId,
          upToMessageId: msgId,
        });
      } catch (error) {
        console.error("message:ack-delivered error:", error);
      }
    });

    // MESSAGE : READ 
        socket.on("message:read", async ({ conversationId, lastMessageId }) => {
      try {
        if (!currentUserId) return;

        const convId = Number(conversationId);
        const lastId = Number(lastMessageId);
        if (!Number.isInteger(convId) || !Number.isInteger(lastId)) return;

        const db = await getDb();

        const [cp] = await db.execute(
          `SELECT last_read_message_id FROM conversation_participants WHERE conversation_id = ? AND user_id = ? LIMIT 1`,
          [convId, currentUserId]
        );
        if (cp.length === 0) return;

        const [msg] = await db.execute(
          `SELECT id FROM messages WHERE id = ? AND conversation_id = ? LIMIT 1`,
          [lastId, convId]
        );
        if (msg.length === 0) return;

        const prevRead = cp[0].last_read_message_id;
        const advanced = prevRead === null || lastId > Number(prevRead);

        if (advanced) {
          // sirf aage badhne wala update (peeche kabhi nahi jaata)
          await db.execute(
            `
              UPDATE conversation_participants
              SET last_read_message_id = ?
              WHERE conversation_id = ? AND user_id = ?
                AND (last_read_message_id IS NULL OR last_read_message_id < ?)
            `,
            [lastId, convId, currentUserId, lastId]
          );

          // read ka matlab delivered bhi
          await db.execute(
            `
              UPDATE messages SET delivered_at = NOW()
              WHERE conversation_id = ? AND sender_id != ? AND id <= ? AND delivered_at IS NULL
            `,
            [convId, currentUserId, lastId]
          );

          const [others] = await db.execute(
            `SELECT user_id FROM conversation_participants WHERE conversation_id = ? AND user_id != ?`,
            [convId, currentUserId]
          );

          for (const o of others) {
            io.to(`user:${o.user_id}`).emit("message:seen", {
              conversationId: convId,
              readByUserId: currentUserId,
              lastReadMessageId: lastId,
            });
          }
        }

        // unread badge refresh (reader ke saare tabs me)
        const [unreadRows] = await db.execute(
          `
            SELECT COUNT(*) AS count FROM messages m
            INNER JOIN conversation_participants cp
              ON cp.conversation_id = m.conversation_id AND cp.user_id = ?
            WHERE m.sender_id != ?
              AND (cp.last_read_message_id IS NULL OR m.id > cp.last_read_message_id)
          `,
          [currentUserId, currentUserId]
        );

        io.to(`user:${currentUserId}`).emit("unread:count-updated", {
          totalUnreadCount: Number(unreadRows[0].count),
        });
      } catch (error) {
        console.error("message:read error:", error);
      }
    });
    // MESSAGE: EDIT
    socket.on("message:edit", async ({ messageId, newContent }) => {
      try {
        if (!currentUserId) return;
        const db = await getDb();

        const [result] = await db.execute(
          `UPDATE messages SET content = ?, is_edited = TRUE WHERE id = ? AND sender_id = ? AND is_deleted = FALSE`,
          [newContent, messageId, currentUserId]
        );

        if (result.affectedRows === 0) return;

        const [msgRows] = await db.execute(
          `SELECT conversation_id FROM messages WHERE id = ?`,
          [messageId]
        );

        const [participants] = await db.execute(
          `SELECT user_id FROM conversation_participants WHERE conversation_id = ? AND user_id != ?`,
          [msgRows[0].conversation_id, currentUserId]
        );

        const recipientId = participants[0]?.user_id;
        if (recipientId) {
          io.to(`user:${recipientId}`).emit("message:edited", {
            messageId,
            newContent,
            isEdited: true,
          });
        }

        // sender ko bhi confirm bhejo (multi-device sync)
        socket.emit("message:edited", { messageId, newContent, isEdited: true });
      } catch (error) {
        console.error("message:edit error:", error);
      }
    });


    // MESSAGE: DELETE FOR EVERYONE
    socket.on("message:delete", async ({ messageId }) => {
      try {
        if (!currentUserId) return;
        const db = await getDb();

        const [result] = await db.execute(
          `UPDATE messages SET is_deleted = TRUE, content = NULL, image_url = NULL WHERE id = ? AND sender_id = ?`,
          [messageId, currentUserId]
        );

        if (result.affectedRows === 0) return;

        const [msgRows] = await db.execute(
          `SELECT conversation_id FROM messages WHERE id = ?`,
          [messageId]
        );

        const [participants] = await db.execute(
          `SELECT user_id FROM conversation_participants WHERE conversation_id = ? AND user_id != ?`,
          [msgRows[0].conversation_id, currentUserId]
        );

        const recipientId = participants[0]?.user_id;
        if (recipientId) {
          io.to(`user:${recipientId}`).emit("message:deleted", { messageId });
        }

        socket.emit("message:deleted", { messageId });
      } catch (error) {
        console.error("message:delete error:", error);
      }
    });

    // MESSAGE: REACT (toggle — same emoji dobara = remove)
socket.on("message:react", async ({ messageId, emoji }) => {
  try {
    if (!currentUserId) return;
    const db = await getDb();

    const [msgRows] = await db.execute(
      `SELECT sender_id, conversation_id, message_type, content, is_deleted FROM messages WHERE id = ?`,
      [messageId]
    );
    if (msgRows.length === 0) return;

    const msg = msgRows[0];
    if (msg.is_deleted) return;

    const conversationId = msg.conversation_id;

    // sirf is conversation ke participants hi react kar sakte hai
    const [participants] = await db.execute(
      `SELECT user_id FROM conversation_participants WHERE conversation_id = ?`,
      [conversationId]
    );
    if (!participants.some((p) => p.user_id === currentUserId)) return;

    // toggle logic (pehle jaisa)
    const [existing] = await db.execute(
      `SELECT id, emoji FROM message_reactions WHERE message_id = ? AND user_id = ?`,
      [messageId, currentUserId]
    );

    let action;

    if (existing.length > 0 && existing[0].emoji === emoji) {
      await db.execute(`DELETE FROM message_reactions WHERE id = ?`, [existing[0].id]);
      action = "removed";
    } else {
      await db.execute(
        `
          INSERT INTO message_reactions (message_id, user_id, emoji)
          VALUES (?, ?, ?)
          ON DUPLICATE KEY UPDATE emoji = VALUES(emoji)
        `,
        [messageId, currentUserId, emoji]
      );
      action = "added";
    }

    // conversation ki "last reaction" update karo
    if (action === "added") {
      await db.execute(
        `
          UPDATE conversations
          SET last_reaction_message_id = ?,
              last_reaction_user_id = ?,
              last_reaction_emoji = ?,
              last_reaction_at = NOW(),
              last_message_at = NOW()
          WHERE id = ?
        `,
        [messageId, currentUserId, emoji, conversationId]
      );
    } else {
      // sirf tab clear karo jab wahi reaction last tha
      await db.execute(
        `
          UPDATE conversations
          SET last_reaction_message_id = NULL,
              last_reaction_user_id = NULL,
              last_reaction_emoji = NULL,
              last_reaction_at = NULL
          WHERE id = ?
            AND last_reaction_message_id = ?
            AND last_reaction_user_id = ?
        `,
        [conversationId, messageId, currentUserId]
      );
    }

    const [reactorRows] = await db.execute(
      `SELECT fullname, username FROM users WHERE id = ?`,
      [currentUserId]
    );
    const reactor = reactorRows[0];

    const messageSnippet =
      msg.message_type === "image" ? "📷 Photo" : (msg.content || "").slice(0, 40);

    const reactionPayload = {
      messageId,
      userId: currentUserId,
      emoji: action === "removed" ? null : emoji,
      action,
    };

    const listPayload = {
      conversationId,
      messageId,
      messageOwnerId: msg.sender_id,
      reactorId: currentUserId,
      reactorName: reactor?.fullname || reactor?.username || "Someone",
      emoji: action === "removed" ? null : emoji,
      action,
      messageSnippet,
      createdAt: new Date().toISOString(),
    };

    for (const p of participants) {
      io.to(`user:${p.user_id}`).emit("message:reacted", reactionPayload);
      io.to(`user:${p.user_id}`).emit("conversation:reaction-updated", listPayload);
    }
  } catch (error) {
    console.error("message:react error:", error);
  }
});

    // MESSAGE: READ (unread clear + "seen" for sender)
    socket.on("message:read", async ({ conversationId, lastMessageId }) => {
      try {
        if (!currentUserId) return;
        const db = await getDb();

        // Only ever move the read-pointer FORWARD. Out-of-order / stale
        // `message:read` events must not rewind it, otherwise already-read
        // messages get counted as unread again.
        await db.execute(
          `UPDATE conversation_participants
           SET last_read_message_id = GREATEST(COALESCE(last_read_message_id, 0), ?)
           WHERE conversation_id = ? AND user_id = ?`,
          [lastMessageId, conversationId, currentUserId]
        );

        const [participants] = await db.execute(
          `SELECT user_id FROM conversation_participants WHERE conversation_id = ? AND user_id != ?`,
          [conversationId, currentUserId]
        );

        const otherUserId = participants[0]?.user_id;
        if (otherUserId) {
          io.to(`user:${otherUserId}`).emit("message:seen", {
            conversationId,
            readByUserId: currentUserId,
            lastReadMessageId: lastMessageId,
          });
        }

        // apna khud ka unread count bhi refresh karo (multi-device)
        const [unreadRows] = await db.execute(
          `
            SELECT COUNT(*) AS count FROM messages m
            INNER JOIN conversation_participants cp
              ON cp.conversation_id = m.conversation_id AND cp.user_id = ?
            WHERE m.sender_id != ?
              AND (cp.last_read_message_id IS NULL OR m.id > cp.last_read_message_id)
          `,
          [currentUserId, currentUserId]
        );

        socket.emit("unread:count-updated", {
          totalUnreadCount: Number(unreadRows[0].count),
        });
      } catch (error) {
        console.error("message:read error:", error);
      }
    });

    // TYPING INDICATOR
    socket.on("typing:start", ({ conversationId }) => {
      if (!currentUserId) return;
      socket.to(`conversation:${conversationId}`).emit("typing:update", {
        conversationId,
        userId: currentUserId,
        isTyping: true,
      });
    });

    socket.on("typing:stop", ({ conversationId }) => {
      if (!currentUserId) return;
      socket.to(`conversation:${conversationId}`).emit("typing:update", {
        conversationId,
        userId: currentUserId,
        isTyping: false,
      });
    });

    // ==========================================
    // DISCONNECT
    // ==========================================

    socket.on("disconnect", () => {
      if (!currentUserId) {
        console.log("Unregistered socket disconnect hua:", socket.id);
        return;
      }

      const userSockets = onlineUsers.get(currentUserId);

      if (userSockets) {
        userSockets.delete(socket.id);

        if (userSockets.size === 0) {
          onlineUsers.delete(currentUserId);

          const userIdForTimeout = currentUserId;

          setTimeout(async () => {
            if (!onlineUsers.has(userIdForTimeout)) {
              try {
                const db = await getDb();

                await db.execute(
                  `UPDATE users SET last_seen_at = NOW() WHERE id = ?`,
                  [userIdForTimeout]
                );

                broadcastOnlineStatus(io, userIdForTimeout, false);
                io.emit("online-users:snapshot", Array.from(onlineUsers.keys()));
              } catch (error) {
                console.error("Failed to update last_seen_at:", error);
              }
            }
          }, 10000);
        }
      }

      console.log("User disconnect hua:", socket.id, "userId:", currentUserId);
    });
  });

  server.listen(port, () => {
    console.log(`> Ready on http://${hostname}:${port}`);
    console.log(`> Socket.io listening on path /api/socket_io`);
  });
});


// BROADCAST ONLINE STATUS
async function broadcastOnlineStatus(io, userId, isOnline) {
  try {
    const db = await getDb();

    const [rows] = await db.execute(
      `SELECT is_online_status_visible FROM users WHERE id = ?`,
      [userId]
    );

    if (!rows[0]?.is_online_status_visible) return;

    io.emit("user:status-changed", { userId, isOnline });
  } catch (error) {
    console.error("Failed to broadcast online status:", error);
  }
}


// MARK DELIVERED FOR USER 
async function markDeliveredForUser(io, userId) {
  try {
    const db = await getDb();

    // snapshot: har conversation/sender ka sabse bada pending message id
    const [pending] = await db.execute(
      `
        SELECT m.conversation_id, m.sender_id, MAX(m.id) AS up_to_message_id
        FROM messages m
        INNER JOIN conversation_participants cp
          ON cp.conversation_id = m.conversation_id AND cp.user_id = ?
        WHERE m.sender_id != ? AND m.delivered_at IS NULL
        GROUP BY m.conversation_id, m.sender_id
      `,
      [userId, userId]
    );

    for (const row of pending) {
      const upTo = Number(row.up_to_message_id);

      // "id <= snapshot" taaki beech me aaya naya message bina ack ke delivered na ho jaye
      const [result] = await db.execute(
        `
          UPDATE messages
          SET delivered_at = NOW()
          WHERE conversation_id = ? AND sender_id = ? AND id <= ? AND delivered_at IS NULL
        `,
        [row.conversation_id, row.sender_id, upTo]
      );

      if (result.affectedRows > 0) {
        io.to(`user:${row.sender_id}`).emit("message:delivered", {
          conversationId: row.conversation_id,
          senderId: row.sender_id,
          upToMessageId: upTo,
        });
      }
    }
  } catch (error) {
    console.error("markDeliveredForUser error:", error);
  }
}