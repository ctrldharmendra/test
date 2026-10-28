

"use client";
import { getSocket } from "@/lib/socket";
import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  setOnlineSnapshot,
  userWentOnline,
  userWentOffline,
} from "@/redux/slices/onlineuser/onlineuserSlice";
import {
  setUnreadCount,
  incrementUnread,
  fetchUnreadCount,
} from "@/redux/slices/message/unreadCountSlice";
import { requestNotificationPermission, showBrowserNotification } from "@/lib/showNotification";
import toast from "react-hot-toast";

export default function SocketInitializer() {
  const dispatch = useDispatch();
  const loggedInUserId = useSelector((state) => state?.userState?.loggedInUserId);

  // Keep the latest userId in a ref so socket callbacks (connect / message:new)
  // never use a stale closure. This was the root cause of flaky delivery: if the
  // socket connected while the effect still saw loggedInUserId === null
  // (redux-persist rehydrates asynchronously), "register" was never sent, the
  // server had no userId for the socket, and message:send silently dropped the
  // message (so it never reached the DB and vanished on refresh).
  const userIdRef = useRef(loggedInUserId);
  useEffect(() => {
    userIdRef.current = loggedInUserId;
  }, [loggedInUserId]);



useEffect(() => {
  requestNotificationPermission();
  const socket = getSocket();
  const handleSnapshot = (ids) => dispatch(setOnlineSnapshot(ids));
  const handleStatusChange = ({ userId, isOnline }) => {
    dispatch(isOnline ? userWentOnline(userId) : userWentOffline(userId));
  };


      // unread badge real-time update
    const handleUnreadUpdate = ({ totalUnreadCount }) => {
      dispatch(setUnreadCount(totalUnreadCount));
    };


// 2. Global listener for new incoming messages
    const handleGlobalNewMessage = (message) => {
      // Never count your own messages.
      if (message.senderId === userIdRef.current) return;

      // Bump the badge locally for every incoming message. If the chat is
      // currently open, ChatWindow marks it read and the server replies with the
      // authoritative total (unread:count-updated), which overwrites this value.
      // For closed chats there is no read, so the +1 stands. This replaces the
      // old server-side push that raced with message:read and could arrive
      // afterwards with a stale higher number, leaving a stuck badge.
      dispatch(incrementUnread());

      const title = message.senderName || "New Message";
      const body = message.type === "image" ? "📷 Sent an image" : message.content;

      showBrowserNotification(title, {
        body,
        icon: message.senderImage || "/default-avatar.png",
        url: `/chats?conversationId=${message.conversationId}`,
        tag: `convo-${message.conversationId}`, // Group notifications per conversation
      });
    };

        const handleIncomingMessage = (message) => {
      if (Number(message.senderId) === Number(loggedInUserId)) return;
      socket.emit("message:ack-delivered", {
        conversationId: message.conversationId,
        messageId: message.id,
      });
    };



  // "register" tells the server this socket belongs to userId (so it can be
  // reached via the `user:<id>` room). Uses the ref so it is never stale.
  const register = () => {
    const uid = userIdRef.current;
    if (!uid) return;
    socket.emit("register", uid);
    // Pull the authoritative unread total on every (re)connect so the badge is
    // correct from load and after network drops.
    dispatch(fetchUnreadCount());
  };


  const handleReactionToast = (p) => {
  if (p.action !== "added") return;
  if (Number(p.messageOwnerId) !== Number(loggedInUserId)) return; // sirf jiska message hai
  if (Number(p.reactorId) === Number(loggedInUserId)) return;
  if (String(window.activeConversationId) === String(p.conversationId)) return; // chat khuli hai to toast nahi

  toast(`${p.reactorName} reacted to your message`, { icon: p.emoji });
};



// Fires on first connect AND on every reconnect.
const handleConnect = () => register();

socket.on("online-users:snapshot", handleSnapshot);
socket.on("user:status-changed", handleStatusChange);
socket.on("connect", handleConnect);
socket.on("unread:count-updated", handleUnreadUpdate); // NAYA
socket.on("message:new", handleGlobalNewMessage);
socket.on("conversation:reaction-updated", handleReactionToast);
    socket.on("message:new", handleIncomingMessage);



  // If the socket is already connected by the time this effect runs (common
  // once redux-persist finishes rehydrating the userId), register right away.
  if (socket.connected) register();

  return () => {
    socket.off("online-users:snapshot", handleSnapshot);
    socket.off("user:status-changed", handleStatusChange);
          socket.off("unread:count-updated", handleUnreadUpdate);
          socket.off("message:new", handleGlobalNewMessage);
    socket.off("connect", handleConnect);
    socket.off("conversation:reaction-updated", handleReactionToast);
    socket.off("message:new", handleIncomingMessage);
  };
}, [dispatch, loggedInUserId]);
  return null;
}