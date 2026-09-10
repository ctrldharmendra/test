

"use client";
import { getSocket } from "@/lib/socket";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  setOnlineSnapshot,
  userWentOnline,
  userWentOffline,
} from "@/redux/slices/onlineuser/onlineuserSlice";
import { setUnreadCount } from "@/redux/slices/message/unreadCountSlice";
import { requestNotificationPermission, showBrowserNotification } from "@/lib/showNotification";

export default function SocketInitializer() {
  const dispatch = useDispatch();
  const loggedInUserId = useSelector((state) => state?.userState?.loggedInUserId);



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
      // Don't show notification for own messages
      if (message.senderId === loggedInUserId) return;

      const title = message.senderName || "New Message";
      const body = message.type === "image" ? "📷 Sent an image" : message.content;

      showBrowserNotification(title, {
        body,
        icon: message.senderImage || "/default-avatar.png",
        url: `/chats?conversationId=${message.conversationId}`,
        tag: `convo-${message.conversationId}`, // Group notifications per conversation
      });
    };


  const handleConnect = () => {
    if (loggedInUserId) {
      socket.emit("register", loggedInUserId);
    }
  };

  socket.on("online-users:snapshot", handleSnapshot);
  socket.on("user:status-changed", handleStatusChange);
  socket.on("connect", handleConnect);
      socket.on("unread:count-updated", handleUnreadUpdate); // NAYA
      socket.on("message:new", handleGlobalNewMessage);


  // agar socket already connected hai (jaisa mostly hota hai jab
  // component mount hone tak connection ban chuka ho), turant bhi register karo
  if (socket.connected && loggedInUserId) {
    socket.emit("register", loggedInUserId);
  }

  return () => {
    socket.off("online-users:snapshot", handleSnapshot);
    socket.off("user:status-changed", handleStatusChange);
          socket.off("unread:count-updated", handleUnreadUpdate);
          socket.off("message:new", handleGlobalNewMessage);
    socket.off("connect", handleConnect);
  };
}, [loggedInUserId]);
  return null;
}