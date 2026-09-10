
// "use client"; 
// import { getSocket } from "@/lib/socket";
// import { useEffect } from "react";
// import { useSelector } from "react-redux";

// export default function SocketInitializer() { 


//     useEffect(() => { fetch("/api/socket"); }, []); 

    
// let loggedInUserId = useSelector((state) => state?.userState?.loggedInUserId);
//     useEffect(() => {
//   fetch("/api/socket").then(() => {
//     const socket = getSocket();
//     if (loggedInUserId) {
//       socket.emit("register", loggedInUserId);   // db userid of logged in user
//     }
//   });
// }, [loggedInUserId]);
// }

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

export default function SocketInitializer() {
  const dispatch = useDispatch();
  const loggedInUserId = useSelector((state) => state?.userState?.loggedInUserId);
// console.log(loggedInUserId, "LSAJKL")
  // useEffect(() => {
  //   const socket = getSocket();

  //   const handleSnapshot = (ids) => dispatch(setOnlineSnapshot(ids));
  //   const handleStatusChange = ({ userId, isOnline }) => {
  //     dispatch(isOnline ? userWentOnline(userId) : userWentOffline(userId));
  //   };

  //   socket.on("online-users:snapshot", handleSnapshot);
  //   socket.on("user:status-changed", handleStatusChange);

  //   if (loggedInUserId) {
  //     socket.emit("register", loggedInUserId);
  //   }

  //   return () => {
  //     socket.off("online-users:snapshot", handleSnapshot);
  //     socket.off("user:status-changed", handleStatusChange);
  //   };
  // }, [loggedInUserId]);
useEffect(() => {
  const socket = getSocket();

  const handleSnapshot = (ids) => dispatch(setOnlineSnapshot(ids));
  const handleStatusChange = ({ userId, isOnline }) => {
    dispatch(isOnline ? userWentOnline(userId) : userWentOffline(userId));
  };


      // unread badge real-time update
    const handleUnreadUpdate = ({ totalUnreadCount }) => {
      dispatch(setUnreadCount(totalUnreadCount));
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


  // agar socket already connected hai (jaisa mostly hota hai jab
  // component mount hone tak connection ban chuka ho), turant bhi register karo
  if (socket.connected && loggedInUserId) {
    socket.emit("register", loggedInUserId);
  }

  return () => {
    socket.off("online-users:snapshot", handleSnapshot);
    socket.off("user:status-changed", handleStatusChange);
          socket.off("unread:count-updated", handleUnreadUpdate);
    socket.off("connect", handleConnect);
  };
}, [loggedInUserId]);
  return null;
}