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

// ==========================================
// ONLINE USERS — module-level, single source of truth
// ==========================================

const onlineUsers = new Map(); // userId -> Set of socket ids

// ==========================================
// LAZY DB LOADER
// db.js ES Modules syntax (import/export default) use karta hai,
// aur server.js plain CommonJS hai — isliye require() nahi chalega,
// dynamic import() use karna padta hai jo ESM ko bhi load kar sakta hai
// ==========================================

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

  // ==========================================
  // SOCKET.IO — attached directly to the raw HTTP server
  // ==========================================

  const io = new Server(server, {
    path: "/api/socket_io",
  });

  global.io = io;
  global.onlineUsers = onlineUsers;

  io.on("connection", (socket) => {
    let currentUserId = null;

    console.log("Socket connected:", socket.id);





    // socket.on("register", (userId) => {
    //   currentUserId = Number(userId);
    //   socket.join(`user:${currentUserId}`);
    //   console.log(`User ${currentUserId} joined the room`);

    //   if (!onlineUsers.has(currentUserId)) {
    //     onlineUsers.set(currentUserId, new Set());
    //   }
    //   onlineUsers.get(currentUserId).add(socket.id);

    //   if (onlineUsers.get(currentUserId).size === 1) {
    //     broadcastOnlineStatus(io, currentUserId, true);
    //   }
    // });
// server.js me, register handler ke andar
socket.on("register", (userId) => {
  currentUserId = Number(userId);
  socket.join(`user:${currentUserId}`);
  console.log(`User ${currentUserId} joined the room`);

  if (!onlineUsers.has(currentUserId)) {
    onlineUsers.set(currentUserId, new Set());
  }
  onlineUsers.get(currentUserId).add(socket.id);

  // SABKO poori updated list bhejo, sirf registering socket ko nahi
  const allOnlineIds = Array.from(onlineUsers.keys());
  io.emit("online-users:snapshot", allOnlineIds);

  if (onlineUsers.get(currentUserId).size === 1) {
    broadcastOnlineStatus(io, currentUserId, true);
  }
});
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

// ==========================================
// BROADCAST ONLINE STATUS
// ==========================================

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