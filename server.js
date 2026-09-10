// require("dotenv").config({ path: ".env.local" });

// const { createServer } = require("http");
// const { parse } = require("url");
// const { Server } = require("socket.io");
// const next = require("next");

// const dev = process.env.NODE_ENV !== "production";
// const hostname = "localhost";
// const port = process.env.PORT || 3000;

// const app = next({ dev, hostname, port });
// const handle = app.getRequestHandler();

// // ONLINE USERS — module-level, single source of truth
// const onlineUsers = new Map(); // userId -> Set of socket ids


// // LAZY DB LOADER
// // db.js ES Modules syntax (import/export default) use karta hai,
// // aur server.js plain CommonJS hai — isliye require() nahi chalega,
// // dynamic import() use karna padta hai jo ESM ko bhi load kar sakta hai
// let dbPromise = null;
// function getDb() {
//   if (!dbPromise) {
//     dbPromise = import("./src/lib/db.js").then((mod) => mod.default);
//   }
//   return dbPromise;
// }

// app.prepare().then(() => {
//   const server = createServer((req, res) => {
//     const parsedUrl = parse(req.url, true);
//     handle(req, res, parsedUrl);
//   });

//   // ==========================================
//   // SOCKET.IO — attached directly to the raw HTTP server
//   // ==========================================

//   const io = new Server(server, {
//     path: "/api/socket_io",
//   });

//   global.io = io;
//   global.onlineUsers = onlineUsers;

//   io.on("connection", (socket) => {
//     let currentUserId = null;

//     console.log("Socket connected:", socket.id);



// // server.js me, register handler ke andar
// // ON REGISTER |||
// socket.on("register", (userId) => {
//   currentUserId = Number(userId);
//   socket.join(`user:${currentUserId}`);
//   console.log(`User ${currentUserId} joined the room`);

//   if (!onlineUsers.has(currentUserId)) {
//     onlineUsers.set(currentUserId, new Set());
//   }
//   onlineUsers.get(currentUserId).add(socket.id);

//   // SABKO poori updated list bhejo, sirf registering socket ko nahi
//   const allOnlineIds = Array.from(onlineUsers.keys());
//   io.emit("online-users:snapshot", allOnlineIds);

//   if (onlineUsers.get(currentUserId).size === 1) {
//     broadcastOnlineStatus(io, currentUserId, true);
//   }
// });

// // ON DISCONNECT |||
//     socket.on("disconnect", () => {
//       if (!currentUserId) {
//         console.log("Unregistered socket disconnect hua:", socket.id);
//         return;
//       }

//       const userSockets = onlineUsers.get(currentUserId);

//       if (userSockets) {
//         userSockets.delete(socket.id);

//         if (userSockets.size === 0) {
//           onlineUsers.delete(currentUserId);

//           const userIdForTimeout = currentUserId;

//           setTimeout(async () => {
//             if (!onlineUsers.has(userIdForTimeout)) {
//               try {
//                 const db = await getDb();

//                 await db.execute(
//                   `UPDATE users SET last_seen_at = NOW() WHERE id = ?`,
//                   [userIdForTimeout]
//                 );

//                 broadcastOnlineStatus(io, userIdForTimeout, false);
//               } catch (error) {
//                 console.error("Failed to update last_seen_at:", error);
//               }
//             }
//           }, 10000);
//         }
//       }
//       console.log("User disconnect hua:", socket.id, "userId:", currentUserId);
//     });

//   // ON MESSAGE SEND |||
// socket.on("message:send", async ({ conversationId, type, content, imageUrl, replyToMessageId }) => {
//   try {
//     const db = await getDb();

//     const [result] = await db.execute(
//       `
//         INSERT INTO messages (conversation_id, sender_id, message_type, content, image_url, reply_to_message_id)
//         VALUES (?, ?, ?, ?, ?, ?)
//       `,
//       [conversationId, currentUserId, type, content || null, imageUrl || null, replyToMessageId || null]
//     );

//     // ... last_message_at update, recipient dhundo 
//     await db.execute(
//       `UPDATE conversations SET last_message_at = NOW() WHERE id = ?`,
//       [conversationId]
//     );

//     // recipient dhundo (participant jo sender nahi hai)
//     const [participants] = await db.execute(
//       `SELECT user_id FROM conversation_participants WHERE conversation_id = ? AND user_id != ?`,
//       [conversationId, currentUserId]
//     );

//     const recipientId = participants[0]?.user_id;


//     // agar reply hai, original message ka preview bhi fetch karo response ke liye
//     let replyPreview = null;
//     if (replyToMessageId) {
//       const [replyRows] = await db.execute(
//         `
//           SELECT id, sender_id, message_type, content, image_url, is_deleted
//           FROM messages WHERE id = ?
//         `,
//         [replyToMessageId]
//       );
//       if (replyRows.length > 0) {
//         const r = replyRows[0];
//         replyPreview = {
//           id: r.id,
//           senderId: r.sender_id,
//           type: r.message_type,
//           content: r.is_deleted ? null : r.content,
//           imageUrl: r.is_deleted ? null : r.image_url,
//           isDeleted: Boolean(r.is_deleted),
//         };
//       }
//     }

//     const messagePayload = {
//       id: result.insertId,
//       conversationId,
//       senderId: currentUserId,
//       type,
//       content,
//       imageUrl,
//       replyTo: replyPreview, // NAYA
//       createdAt: new Date().toISOString(),
//     };

//     // recipient + sender ko bhejo (jaisa pehle tha)
//     if (recipientId) {
//       io.to(`user:${recipientId}`).emit("message:new", messagePayload);
//     }
//     socket.emit("message:new", messagePayload);
//   } catch (error) {
//     console.error("Send message error:", error);
//     socket.emit("message:error", { message: "Failed to send message" });
//   }
// });
// // ON MESSAGE EDIT |||
// socket.on("message:edit", async ({ messageId, newContent }) => {
//   const db = await getDb();

//   const [result] = await db.execute(
//     `UPDATE messages SET content = ?, is_edited = TRUE WHERE id = ? AND sender_id = ?`,
//     [newContent, messageId, currentUserId]
//   );

//   if (result.affectedRows === 0) return; // sirf apna message edit kar sakta hai

//   const [msgRows] = await db.execute(
//     `SELECT conversation_id FROM messages WHERE id = ?`,
//     [messageId]
//   );

//   const [participants] = await db.execute(
//     `SELECT user_id FROM conversation_participants WHERE conversation_id = ? AND user_id != ?`,
//     [msgRows[0].conversation_id, currentUserId]
//   );

//   const recipientId = participants[0]?.user_id;
//   if (recipientId) {
//     io.to(`user:${recipientId}`).emit("message:edited", {
//       messageId,
//       newContent,
//       isEdited: true,
//     });
//   }
// });

// // ON MESSAGE DELETE |||
// socket.on("message:delete", async ({ messageId }) => {
//   const db = await getDb();

//   const [result] = await db.execute(
//     `UPDATE messages SET is_deleted = TRUE, content = NULL, image_url = NULL WHERE id = ? AND sender_id = ?`,
//     [messageId, currentUserId]
//   );

//   if (result.affectedRows === 0) return;

//   const [msgRows] = await db.execute(
//     `SELECT conversation_id FROM messages WHERE id = ?`,
//     [messageId]
//   );

//   const [participants] = await db.execute(
//     `SELECT user_id FROM conversation_participants WHERE conversation_id = ? AND user_id != ?`,
//     [msgRows[0].conversation_id, currentUserId]
//   );

//   const recipientId = participants[0]?.user_id;
//   if (recipientId) {
//     io.to(`user:${recipientId}`).emit("message:deleted", { messageId });
//   }
// });

// // ON MESSAGE REACTION |||
// socket.on("message:react", async ({ messageId, emoji }) => {
//   const db = await getDb();

//   // toggle: agar same emoji already hai, remove karo; warna insert/update karo
//   const [existing] = await db.execute(
//     `SELECT id, emoji FROM message_reactions WHERE message_id = ? AND user_id = ?`,
//     [messageId, currentUserId]
//   );

//   let action;

//   if (existing.length > 0 && existing[0].emoji === emoji) {
//     // same emoji dobara click = remove
//     await db.execute(`DELETE FROM message_reactions WHERE id = ?`, [existing[0].id]);
//     action = "removed";
//   } else {
//     // naya reaction ya emoji change
//     await db.execute(
//       `
//         INSERT INTO message_reactions (message_id, user_id, emoji)
//         VALUES (?, ?, ?)
//         ON DUPLICATE KEY UPDATE emoji = VALUES(emoji)
//       `,
//       [messageId, currentUserId, emoji]
//     );
//     action = "added";
//   }

//   // message ke sender ko batao (uska message hai jispe react hua)
//   const [msgRows] = await db.execute(
//     `SELECT sender_id, conversation_id FROM messages WHERE id = ?`,
//     [messageId]
//   );

//   const senderId = msgRows[0]?.sender_id;
//   if (senderId && senderId !== currentUserId) {
//     io.to(`user:${senderId}`).emit("message:reacted", {
//       messageId,
//       userId: currentUserId,
//       emoji: action === "removed" ? null : emoji,
//       action,
//     });
//   }
// });

// // ON TYPING |||
// socket.on("typing:start", ({ conversationId }) => {
//   socket.to(`conversation:${conversationId}`).emit("typing:update", {
//     conversationId,
//     userId: currentUserId,
//     isTyping: true,
//   });
// });

// socket.on("typing:stop", ({ conversationId }) => {
//   socket.to(`conversation:${conversationId}`).emit("typing:update", {
//     conversationId,
//     userId: currentUserId,
//     isTyping: false,
//   });
// });





//   });










//   server.listen(port, () => {
//     console.log(`> Ready on http://${hostname}:${port}`);
//     console.log(`> Socket.io listening on path /api/socket_io`);
//   });
// });

// // BROADCAST ONLINE STATUS
// async function broadcastOnlineStatus(io, userId, isOnline) {
//   try {
//     const db = await getDb();

//     const [rows] = await db.execute(
//       `SELECT is_online_status_visible FROM users WHERE id = ?`,
//       [userId]
//     );

//     if (!rows[0]?.is_online_status_visible) return;

//     io.emit("user:status-changed", { userId, isOnline });
//   } catch (error) {
//     console.error("Failed to broadcast online status:", error);
//   }
// }




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
  const server = createServer((req, res) => {
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
    });


    // CONVERSATION JOIN — for typing indicators scoped to a chat
    socket.on("conversation:join", (conversationId) => {
      socket.join(`conversation:${conversationId}`);
    });

    socket.on("conversation:leave", (conversationId) => {
      socket.leave(`conversation:${conversationId}`);
    });


    // MESSAGE: SEND
    socket.on("message:send", async ({ conversationId, type, content, imageUrl, replyToMessageId, tempId  }) => {
      try {
        if (!currentUserId) return;
        const db = await getDb();

        const [result] = await db.execute(
          `
            INSERT INTO messages
              (conversation_id, sender_id, message_type, content, image_url, reply_to_message_id)
            VALUES (?, ?, ?, ?, ?, ?)
          `,
          [
            conversationId,
            currentUserId,
            type,
            content || null,
            imageUrl || null,
            replyToMessageId || null,
          ]
        );

        await db.execute(
          `UPDATE conversations SET last_message_at = NOW() WHERE id = ?`,
          [conversationId]
        );

        const [participants] = await db.execute(
          `SELECT user_id FROM conversation_participants WHERE conversation_id = ? AND user_id != ?`,
          [conversationId, currentUserId]
        );

        const recipientId = participants[0]?.user_id;

        // agar reply hai, original message ka preview fetch karo
        let replyPreview = null;
        if (replyToMessageId) {
          const [replyRows] = await db.execute(
            `
              SELECT id, sender_id, message_type, content, image_url, is_deleted
              FROM messages WHERE id = ?
            `,
            [replyToMessageId]
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
          conversationId,
          senderId: currentUserId,
          type,
          content: content || null,
          imageUrl: imageUrl || null,
          replyTo: replyPreview,
          isEdited: false,
          isDeleted: false,
          reactions: [],
          createdAt: new Date().toISOString(),
           tempId: tempId || null,  
        };

        // recipient ko bhejo
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

        // sender ko confirm bhejo (uski khud ki screen update karne ke liye)
        socket.emit("message:new", messagePayload);
      } catch (error) {
        console.error("message:send error:", error);
        socket.emit("message:error", { message: "Failed to send message" });
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

        const [msgRows] = await db.execute(
          `SELECT sender_id, conversation_id FROM messages WHERE id = ?`,
          [messageId]
        );

        if (msgRows.length === 0) return;

        const { sender_id: senderId, conversation_id: conversationId } = msgRows[0];

        const payload = {
          messageId,
          userId: currentUserId,
          emoji: action === "removed" ? null : emoji,
          action,
        };

        // dono participants ko batao (jisne react kiya, aur jiska message hai)
        const [participants] = await db.execute(
          `SELECT user_id FROM conversation_participants WHERE conversation_id = ?`,
          [conversationId]
        );

        for (const p of participants) {
          io.to(`user:${p.user_id}`).emit("message:reacted", payload);
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

        await db.execute(
          `UPDATE conversation_participants SET last_read_message_id = ? WHERE conversation_id = ? AND user_id = ?`,
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