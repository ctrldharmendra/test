
// "use client";

// import { useEffect, useRef, useState } from "react";
// import { useDispatch, useSelector } from "react-redux";
// import {
//   FaArrowLeft,
//   FaEllipsis,
//   FaPaperPlane,
//   FaFaceSmile,
//   FaXmark,
//   FaReply,
// } from "react-icons/fa6";
// import { getSocket } from "@/lib/socket";
// import {
//   fetchMessages,
//   addOptimisticMessage,
//   receiveMessage,
//   applyMessageEdited,
//   applyMessageDeleted,
//   applyReaction,
//   setTypingStatus,
// } from "@/redux/slices/message/messagesSlice";
// import { setUnreadCount } from "@/redux/slices/message/unreadCountSlice";

// const reactionsList = ["❤️", "😂", "😍", "😮", "😢", "👍"];
// let typingTimeout = null;

// export default function ChatWindow({ conversationId, otherUser, onBack, isNew = false }) {
//   const dispatch = useDispatch();
//   const loggedInUserId = useSelector((state) => state?.userState?.loggedInUserId);
//   const onlineIds = useSelector((state) => state.onlineUsers?.ids || []);
//   const convoState = useSelector((state) => state.messages.byConversation[conversationId]);

//   const messages = convoState?.messages || [];
//   const typingUserId = convoState?.typingUserId || null;
//   const isOtherUserOnline = onlineIds.includes(otherUser.id);
//   const isOtherUserTyping = typingUserId === otherUser.id;

//   const [messageText, setMessageText] = useState("");
//   const [activeReaction, setActiveReaction] = useState(null);
//   const [replyingTo, setReplyingTo] = useState(null);

//   const pressTimer = useRef(null);
//   const touchStartX = useRef(0);
//   const messagesEndRef = useRef(null);



// // EDIT 
// const [actionMenuFor, setActionMenuFor] = useState(null); // NAYA — kis message ka action menu khula hai
// const [editingMessage, setEditingMessage] = useState(null); // NAYA — kaunsa message edit ho raha hai




// useEffect(() => {
//   if (!conversationId) return;

//   // Only attempt to fetch messages if conversation ID is valid and exists on DB
//   if (!isNew && !String(conversationId).startsWith("temp")) {
//     dispatch(fetchMessages({ conversationId }))
//       .unwrap()
//       .catch((err) => {
//         // Silently ignore 403 on fresh/race-condition conversations
//         console.warn("Messages not loaded yet:", err);
//       });
//   }

//   const socket = getSocket();
//   socket.emit("conversation:join", conversationId);

//   return () => {
//     socket.emit("conversation:leave", conversationId);
//   };
// }, [conversationId, isNew, dispatch]);



//   useEffect(() => {
//     const socket = getSocket();

//     const handleNewMessage = (message) => {
//       if (String(message.conversationId) !== String(conversationId)) return;
//       dispatch(receiveMessage(message));
      
//       // Emit Read acknowledge immediately when screen is open
//       if (message.senderId !== loggedInUserId) {
//         socket.emit("message:read", {
//           conversationId,
//           lastMessageId: message.id,
//         });
//       }
//     };

//     const handleEdited = ({ messageId, newContent }) => {
//       dispatch(applyMessageEdited({ conversationId, messageId, newContent }));
//     };

//     const handleDeleted = ({ messageId }) => {
//       dispatch(applyMessageDeleted({ conversationId, messageId }));
//     };

//     const handleReacted = ({ messageId, userId, emoji, action }) => {
//       dispatch(applyReaction({ conversationId, messageId, userId, emoji, action }));
//     };

//     const handleTyping = ({ conversationId: cId, userId, isTyping }) => {
//       if (String(cId) !== String(conversationId)) return;
//       if (userId === loggedInUserId) return;
//       dispatch(setTypingStatus({ conversationId, userId, isTyping }));
//     };

//     socket.on("message:new", handleNewMessage);
//     socket.on("message:edited", handleEdited);
//     socket.on("message:deleted", handleDeleted);
//     socket.on("message:reacted", handleReacted);
//     socket.on("typing:update", handleTyping);

//     return () => {
//       socket.off("message:new", handleNewMessage);
//       socket.off("message:edited", handleEdited);
//       socket.off("message:deleted", handleDeleted);
//       socket.off("message:reacted", handleReacted);
//       socket.off("typing:update", handleTyping);
//     };
//   }, [conversationId, loggedInUserId, dispatch]);

//   // Auto Read & Unread sync
//   useEffect(() => {
//     if (messages.length === 0) return;
//     const lastMessage = messages[messages.length - 1];
//     if (lastMessage.isOptimistic) return;

//     const socket = getSocket();
//     socket.emit("message:read", {
//       conversationId,
//       lastMessageId: lastMessage.id,
//     });
//   }, [messages, conversationId]);

//   useEffect(() => {
//     messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
//   }, [messages.length]);

//   const handleInputChange = (e) => {
//     setMessageText(e.target.value);
//     const socket = getSocket();
//     socket.emit("typing:start", { conversationId });

//     clearTimeout(typingTimeout);
//     typingTimeout = setTimeout(() => {
//       socket.emit("typing:stop", { conversationId });
//     }, 1500);
//   };

//   const sendMessage = () => {
//     const text = messageText.trim();
//     if (!text) return;

//     const socket = getSocket();
//     const tempId = `temp-${Date.now()}`;

//     dispatch(
//       addOptimisticMessage({
//         conversationId,
//         message: {
//           tempId,
//           isOptimistic: true,
//           id: tempId,
//           senderId: loggedInUserId,
//           type: "text",
//           content: text,
//           imageUrl: null,
//           replyTo: replyingTo ? { ...replyingTo } : null,
//           isEdited: false,
//           isDeleted: false,
//           reactions: [],
//           createdAt: new Date().toISOString(),
//         },
//       })
//     );

//     socket.emit("message:send", {
//       conversationId: Number(conversationId),
//       type: "text",
//       content: text,
//       replyToMessageId: replyingTo?.id || null,
//       tempId,
//     });

//     clearTimeout(typingTimeout);
//     socket.emit("typing:stop", { conversationId });

//     setMessageText("");
//     setReplyingTo(null);
//   };

//   const addReaction = (messageId, emoji) => {
//     const socket = getSocket();
//     socket.emit("message:react", { messageId, emoji });
//     setActiveReaction(null);
//   };

//   const handlePressStart = (message) => {
//     clearTimeout(pressTimer.current);
//     pressTimer.current = setTimeout(() => {
//           if (message.senderId === loggedInUserId && !message.isDeleted) {
//       setActionMenuFor(message?.id); // apna message — action menu (edit/delete/reply)
//     } else {
//       setActiveReaction(message?.id); // doosre ka message — sirf reaction
//     }
//       setActiveReaction(message.id);
//       if (typeof window !== "undefined" && window.navigator?.vibrate) {
//         window.navigator.vibrate(30);
//       }
//     }, 450);
//   };

//   const handlePressEnd = () => {
//     clearTimeout(pressTimer.current);
//   };

//   const handleTouchStart = (e) => {
//     touchStartX.current = e.touches[0].clientX;
//   };

//   const handleTouchEnd = (e, message) => {
//     const endX = e.changedTouches[0].clientX;
//     const difference = endX - touchStartX.current;

//     if (difference > 70) {
//       setReplyingTo(message);
//       if (typeof window !== "undefined" && window.navigator?.vibrate) {
//         window.navigator.vibrate(20);
//       }
//     }
//   };

//   const formatTime = (dateStr) => {
//     if (!dateStr) return "";
//     return new Date(dateStr).toLocaleTimeString("en-US", {
//       hour: "numeric",
//       minute: "2-digit",
//     });
//   };

//   return (
//     <div className="fixed inset-0 z-50 flex flex-col bg-[#080808] select-none">
//       {/* Click outside overlay to dismiss Reaction Popup */}
//       {activeReaction && (
//         <div
//           onClick={() => setActiveReaction(null)}
//           className="fixed inset-0 z-20 bg-black/20 backdrop-blur-[1px]"
//         />
//       )}

//       {/* HEADER */}
//       <header className="z-10 flex shrink-0 items-center gap-3 border-b border-white/[0.07] bg-[#080808]/95 px-3 pb-3 pt-[calc(env(safe-area-inset-top)+10px)] backdrop-blur-xl">
//         <button
//           type="button"
//           onClick={onBack}
//           className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/[0.06] text-white/80 active:scale-90"
//         >
//           <FaArrowLeft className="text-sm" />
//         </button>

//         <img
//           src={otherUser.image || "/default-avatar.png"}
//           alt={otherUser.fullName}
//           className="h-10 w-10 shrink-0 rounded-full object-cover ring-1 ring-white/10"
//         />

//         <div className="min-w-0 flex-1">
//           <h1 className="truncate text-sm font-bold text-white">{otherUser.fullName}</h1>
//           <p className="mt-0.5 flex items-center gap-1.5 text-[10px] text-white/35">
//             {isOtherUserTyping ? (
//               <span className="text-red-400 font-medium animate-pulse">typing...</span>
//             ) : (
//               <>
//                 <span
//                   className={`h-1.5 w-1.5 rounded-full ${
//                     isOtherUserOnline ? "bg-emerald-500" : "bg-white/20"
//                   }`}
//                 />
//                 {isOtherUserOnline ? "Active now" : "Offline"}
//               </>
//             )}
//           </p>
//         </div>

//         <button
//           type="button"
//           className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/[0.06] text-white/50 active:scale-90"
//         >
//           <FaEllipsis className="text-sm" />
//         </button>
//       </header>

//       {/* MESSAGES LIST */}
//       <div className="min-h-0 flex-1 overflow-y-auto px-3 py-4">
//         <div className="mx-auto flex w-full max-w-[600px] flex-col gap-2.5">
//           {messages?.map((message) => {
//             const isMe = message.senderId === loggedInUserId;
//             const isReactionOpen = activeReaction === message.id;

//             return (
//               <div
//                 key={message.id || message.tempId}
//                 className={`relative flex ${isMe ? "justify-end" : "justify-start"}`}
//               >
//                 <div
//                   className={`relative max-w-[80%] ${
//                     isReactionOpen ? "z-30" : "z-0"
//                   }`}
//                 >
//                   {message.replyTo && (
//                     <div className="mb-1 rounded-xl border-l-2 border-red-500 bg-white/[0.06] px-3 py-1.5 text-[10px] text-white/50 truncate">
//                       Replying to: {message.replyTo.content || "📷 Photo"}
//                     </div>
//                   )}

//                   {/* Reaction Popup */}
//                   {isReactionOpen && (
//                     <div
//                       className={`absolute bottom-full mb-2 z-40 flex items-center gap-1.5 rounded-full border border-white/10 bg-[#181818] px-2.5 py-1.5 shadow-2xl animate-in fade-in zoom-in-95 duration-150 ${
//                         isMe ? "right-0" : "left-0"
//                       }`}
//                     >
//                       {reactionsList.map((emoji) => (
//                         <button
//                           key={emoji}
//                           type="button"
//                           onClick={() => addReaction(message.id, emoji)}
//                           className="flex h-8 w-8 items-center justify-center rounded-full text-base transition active:scale-125"
//                         >
//                           {emoji}
//                         </button>
//                       ))}
//                     </div>
//                   )}

//                   <div
//                     onTouchStart={(e) => {
//                       handlePressStart(message);
//                       handleTouchStart(e);
//                     }}
//                     onTouchEnd={(e) => {
//                       handlePressEnd();
//                       handleTouchEnd(e, message);
//                     }}
//                     onMouseDown={() => handlePressStart(message)}
//                     onMouseUp={handlePressEnd}
//                     onMouseLeave={handlePressEnd}
//                     className={`cursor-pointer rounded-[20px] px-4 py-2 text-sm leading-relaxed ${
//                       isMe
//                         ? "rounded-br-[4px] bg-red-500 text-white"
//                         : "rounded-bl-[4px] bg-white/[0.08] text-white/90"
//                     } ${message.isOptimistic ? "opacity-60" : ""}`}
//                   >
//                     <p className="break-words">
//                       {message.isDeleted ? (
//                         <span className="italic text-white/40 text-xs">
//                           This message was deleted
//                         </span>
//                       ) : (
//                         message.content
//                       )}
//                     </p>
//                   </div>

//                   <div className={`mt-0.5 flex items-center gap-1.5 px-1 ${isMe ? "justify-end" : "justify-start"}`}>
//                     <span className="text-[9px] text-white/40">
//                       {message.isOptimistic ? "Sending..." : formatTime(message.createdAt)}
//                     </span>

//                     {message.reactions?.length > 0 && (
//                       <span className="rounded-full border border-white/10 bg-[#181818] px-1.5 py-0.5 text-[10px]">
//                         {message.reactions.map((r) => r.emoji).join("")}
//                       </span>
//                     )}
//                   </div>
//                 </div>
//               </div>
//             );
//           })}

//           {isOtherUserTyping && (
//             <div className="flex justify-start">
//               <div className="rounded-[18px] rounded-bl-[4px] bg-white/[0.08] px-3.5 py-2.5">
//                 <div className="flex gap-1 items-center">
//                   <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-white/50 [animation-delay:-0.3s]" />
//                   <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-white/50 [animation-delay:-0.15s]" />
//                   <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-white/50" />
//                 </div>
//               </div>
//             </div>
//           )}

//           <div ref={messagesEndRef} />
//         </div>
//       </div>

//       {/* REPLY BANNER */}
//       {replyingTo && (
//         <div className="border-t border-white/[0.06] bg-[#111111] px-4 py-2">
//           <div className="flex items-center gap-3 max-w-[600px] mx-auto">
//             <div className="h-7 w-0.5 rounded-full bg-red-500" />
//             <div className="min-w-0 flex-1">
//               <p className="text-[10px] font-semibold text-red-500">
//                 Replying to {replyingTo.senderId === loggedInUserId ? "yourself" : otherUser.fullName}
//               </p>
//               <p className="truncate text-xs text-white/40">{replyingTo.content}</p>
//             </div>
//             <button
//               type="button"
//               onClick={() => setReplyingTo(null)}
//               className="flex h-7 w-7 items-center justify-center rounded-full bg-white/[0.06] text-white/40 active:scale-90"
//             >
//               <FaXmark className="text-xs" />
//             </button>
//           </div>
//         </div>
//       )}

//       {/* INPUT CONTROLS */}
//       <div className="shrink-0 border-t border-white/[0.07] bg-[#080808]/95 px-3 pb-[calc(env(safe-area-inset-bottom)+10px)] pt-2.5 backdrop-blur-xl">
//         <div className="mx-auto flex max-w-[600px] items-end gap-2">
//           <button
//             type="button"
//             className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/[0.06] text-white/40 active:scale-90"
//           >
//             <FaFaceSmile className="text-sm" />
//           </button>

//           <div className="flex min-h-10 flex-1 items-center rounded-full border border-white/[0.08] bg-white/[0.06] px-4">
//             <input
//               type="text"
//               value={messageText}
//               onChange={handleInputChange}
//               onKeyDown={(e) => {
//                 if (e.key === "Enter") sendMessage();
//               }}
//               placeholder="Message..."
//               className="min-w-0 flex-1 bg-transparent py-2 text-sm text-white outline-none placeholder:text-white/25"
//             />
//           </div>

//           <button
//             type="button"
//             onClick={sendMessage}
//             disabled={!messageText.trim()}
//             className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-500 text-white transition active:scale-90 disabled:bg-white/[0.06] disabled:text-white/20"
//           >
//             <FaPaperPlane className="ml-[-1px] text-xs" />
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }

"use client";

import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  FaArrowLeft,
  FaEllipsis,
  FaPaperPlane,
  FaFaceSmile,
  FaXmark,
  FaReply,
  FaPen,
  FaTrash,
  FaCheck,
} from "react-icons/fa6";
import { getSocket } from "@/lib/socket";
import {
  fetchMessages,
  addOptimisticMessage,
  receiveMessage,
  applyMessageEdited,
  applyMessageDeleted,
  applyReaction,
  setTypingStatus,
} from "@/redux/slices/message/messagesSlice";
import { setUnreadCount } from "@/redux/slices/message/unreadCountSlice";

const reactionsList = ["❤️", "😂", "😍", "😮", "😢", "👍"];
let typingTimeout = null;

export default function ChatWindow({ conversationId, otherUser, onBack, isNew = false }) {
  const dispatch = useDispatch();
  const loggedInUserId = useSelector((state) => state?.userState?.loggedInUserId);
  const onlineIds = useSelector((state) => state.onlineUsers?.ids || []);
  const convoState = useSelector((state) => state.messages.byConversation[conversationId]);

  const messages = convoState?.messages || [];
  const typingUserId = convoState?.typingUserId || null;
  const isOtherUserOnline = onlineIds.includes(otherUser.id);
  const isOtherUserTyping = typingUserId === otherUser.id;

  const [messageText, setMessageText] = useState("");
  const [activeReaction, setActiveReaction] = useState(null);
  const [replyingTo, setReplyingTo] = useState(null);

  const pressTimer = useRef(null);
  const touchStartX = useRef(null);
  const messagesEndRef = useRef(null);

const inputRef = useRef(null); // NAYA
  // EDIT
  const [actionMenuFor, setActionMenuFor] = useState(null); // kis message ka action menu khula hai
  const [editingMessage, setEditingMessage] = useState(null); // kaunsa message edit ho raha hai


  useEffect(() => {
  if ((replyingTo || editingMessage) && inputRef.current) {
    inputRef.current.focus();
  }
}, [replyingTo, editingMessage]);

  useEffect(() => {
  if (replyingTo && inputRef.current) {
    inputRef.current.focus();
  }
}, [replyingTo]);

  useEffect(() => {
    if (!conversationId) return;

    // Only attempt to fetch messages if conversation ID is valid and exists on DB
    if (!isNew && !String(conversationId).startsWith("temp")) {
      dispatch(fetchMessages({ conversationId }))
        .unwrap()
        .catch((err) => {
          // Silently ignore 403 on fresh/race-condition conversations
          console.warn("Messages not loaded yet:", err);
        });
    }

    const socket = getSocket();
    socket.emit("conversation:join", conversationId);

    return () => {
      socket.emit("conversation:leave", conversationId);
    };
  }, [conversationId, isNew, dispatch]);

  useEffect(() => {
    const socket = getSocket();

    const handleNewMessage = (message) => {
      if (String(message.conversationId) !== String(conversationId)) return;
      dispatch(receiveMessage(message));

      // Emit Read acknowledge immediately when screen is open
      if (message.senderId !== loggedInUserId) {
        socket.emit("message:read", {
          conversationId,
          lastMessageId: message.id,
        });
      }
    };

    const handleEdited = ({ messageId, newContent }) => {
      dispatch(applyMessageEdited({ conversationId, messageId, newContent }));
    };

    const handleDeleted = ({ messageId }) => {
      dispatch(applyMessageDeleted({ conversationId, messageId }));
    };

    const handleReacted = ({ messageId, userId, emoji, action }) => {
      dispatch(applyReaction({ conversationId, messageId, userId, emoji, action }));
    };

    const handleTyping = ({ conversationId: cId, userId, isTyping }) => {
      if (String(cId) !== String(conversationId)) return;
      if (userId === loggedInUserId) return;
      dispatch(setTypingStatus({ conversationId, userId, isTyping }));
    };

    socket.on("message:new", handleNewMessage);
    socket.on("message:edited", handleEdited);
    socket.on("message:deleted", handleDeleted);
    socket.on("message:reacted", handleReacted);
    socket.on("typing:update", handleTyping);

    return () => {
      socket.off("message:new", handleNewMessage);
      socket.off("message:edited", handleEdited);
      socket.off("message:deleted", handleDeleted);
      socket.off("message:reacted", handleReacted);
      socket.off("typing:update", handleTyping);
    };
  }, [conversationId, loggedInUserId, dispatch]);

  // Auto Read & Unread sync
  useEffect(() => {
    if (messages.length === 0) return;
    const lastMessage = messages[messages.length - 1];
    if (lastMessage.isOptimistic) return;

    const socket = getSocket();
    socket.emit("message:read", {
      conversationId,
      lastMessageId: lastMessage.id,
    });
  }, [messages, conversationId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  useEffect(() => {
    return () => clearTimeout(pressTimer.current);
  }, []);

  const handleInputChange = (e) => {
    setMessageText(e.target.value);
    const socket = getSocket();
    socket.emit("typing:start", { conversationId });

    clearTimeout(typingTimeout);
    typingTimeout = setTimeout(() => {
      socket.emit("typing:stop", { conversationId });
    }, 1500);
  };

  const sendMessage = () => {
    // EDIT MODE — agar edit ho raha hai to alag path
    if (editingMessage) {
      saveEdit();
      return;
    }

    const text = messageText.trim();
    if (!text) return;

    const socket = getSocket();
    const tempId = `temp-${Date.now()}`;

    dispatch(
      addOptimisticMessage({
        conversationId,
        message: {
          tempId,
          isOptimistic: true,
          id: tempId,
          senderId: loggedInUserId,
          type: "text",
          content: text,
          imageUrl: null,
          replyTo: replyingTo ? { ...replyingTo } : null,
          isEdited: false,
          isDeleted: false,
          reactions: [],
          createdAt: new Date().toISOString(),
        },
      })
    );

    socket.emit("message:send", {
      conversationId: Number(conversationId),
      type: "text",
      content: text,
      replyToMessageId: replyingTo?.id || null,
      tempId,
    });

    clearTimeout(typingTimeout);
    socket.emit("typing:stop", { conversationId });

    setMessageText("");
    setReplyingTo(null);
  };

  const addReaction = (messageId, emoji) => {
    const socket = getSocket();
    socket.emit("message:react", { messageId, emoji });
    setActiveReaction(null);
  };

  // EDIT — enter edit mode
  const startEdit = (message) => {
    setEditingMessage(message);
    setMessageText(message.content || "");
    setActionMenuFor(null);
    setReplyingTo(null); // edit aur reply ek saath nahi ho sakte
  };

  // EDIT — save
  const saveEdit = () => {
    const trimmed = messageText.trim();
    if (!trimmed || !editingMessage) return;

    const socket = getSocket();
    socket.emit("message:edit", {
      messageId: editingMessage.id,
      newContent: trimmed,
    });

    // optimistic update — turant dikhao
    dispatch(
      applyMessageEdited({
        conversationId,
        messageId: editingMessage.id,
        newContent: trimmed,
      })
    );

    setEditingMessage(null);
    setMessageText("");
  };

  // EDIT — cancel
  const cancelEdit = () => {
    setEditingMessage(null);
    setMessageText("");
  };

  // DELETE
  const deleteMessage = (message) => {
    const socket = getSocket();
    socket.emit("message:delete", { messageId: message.id });

    // optimistic update
    dispatch(applyMessageDeleted({ conversationId, messageId: message.id }));

    setActionMenuFor(null);
  };

  const handlePressStart = (message) => {
    clearTimeout(pressTimer.current);
    pressTimer.current = setTimeout(() => {
      if (message.senderId === loggedInUserId && !message.isDeleted) {
        setActionMenuFor(message.id); // apna message — action menu (edit/delete/reply)
      } else if (!message.isDeleted) {
        setActiveReaction(message.id); // doosre ka message — sirf reaction
      }

      if (typeof window !== "undefined" && window.navigator?.vibrate) {
        window.navigator.vibrate(30);
      }
    }, 450);
  };

  const handlePressEnd = () => {
    clearTimeout(pressTimer.current);
  };

  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e, message) => {
    const endX = e.changedTouches[0].clientX;
    const difference = endX - touchStartX.current;

    if (difference > 70) {
      setReplyingTo(message);
      if (typeof window !== "undefined" && window.navigator?.vibrate) {
        window.navigator.vibrate(20);
      }
    }
  };

  const formatTime = (dateStr) => {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#080808] select-none">
      {/* Click outside overlay to dismiss Reaction Popup / Action Menu */}
      {(activeReaction || actionMenuFor) && (
        <div
          onClick={() => {
            setActiveReaction(null);
            setActionMenuFor(null);
          }}
          className="fixed inset-0 z-20 bg-black/20 backdrop-blur-[1px]"
        />
      )}

      {/* HEADER */}
      <header className="z-10 flex shrink-0 items-center gap-3 border-b border-white/[0.07] bg-[#080808]/95 px-3 pb-3 pt-[calc(env(safe-area-inset-top)+10px)] backdrop-blur-xl">
        <button
          type="button"
          onClick={onBack}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/[0.06] text-white/80 active:scale-90"
        >
          <FaArrowLeft className="text-sm" />
        </button>

        <img
          src={otherUser.image || "/default-avatar.png"}
          alt={otherUser.fullName}
          className="h-10 w-10 shrink-0 rounded-full object-cover ring-1 ring-white/10"
        />

        <div className="min-w-0 flex-1">
          <h1 className="truncate text-sm font-bold text-white">{otherUser.fullName}</h1>
          <p className="mt-0.5 flex items-center gap-1.5 text-[10px] text-white/35">
            {isOtherUserTyping ? (
              <span className="text-red-400 font-medium animate-pulse">typing...</span>
            ) : (
              <>
                <span
                  className={`h-1.5 w-1.5 rounded-full ${
                    isOtherUserOnline ? "bg-emerald-500" : "bg-white/20"
                  }`}
                />
                {isOtherUserOnline ? "Active now" : "Offline"}
              </>
            )}
          </p>
        </div>

        <button
          type="button"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/[0.06] text-white/50 active:scale-90"
        >
          <FaEllipsis className="text-sm" />
        </button>
      </header>

      {/* MESSAGES LIST */}
      <div className="min-h-0 flex-1 overflow-y-auto px-3 py-4">
        <div className="mx-auto flex w-full max-w-[600px] flex-col gap-2.5">
          {messages?.map((message) => {
            const isMe = message.senderId === loggedInUserId;
            const isReactionOpen = activeReaction === message.id;
            const isActionMenuOpen = actionMenuFor === message.id;

            return (
              <div
                key={message.id || message.tempId}
                className={`relative flex ${isMe ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`relative max-w-[80%] ${
                    isReactionOpen || isActionMenuOpen ? "z-30" : "z-0"
                  }`}
                >
                  {message.replyTo && (
                    <div className="mb-1 rounded-xl border-l-2 border-red-500 bg-white/[0.06] px-3 py-1.5 text-[10px] text-white/50 truncate">
                      Replying to:{" "}
                      {message.replyTo.isDeleted
                        ? "deleted message"
                        : message.replyTo.content || "📷 Photo"}
                    </div>
                  )}

                  {/* Reaction Popup — doosre ka message */}
{/* Reaction Popup — doosre ka message: reactions + reply */}
{isReactionOpen && (
  <div
    className={`absolute bottom-full mb-2 z-40 flex items-center gap-1.5 rounded-full border border-white/10 bg-[#181818] px-2.5 py-1.5 shadow-2xl animate-in fade-in zoom-in-95 duration-150 ${
      isMe ? "right-0" : "left-0"
    }`}
  >
    {reactionsList.map((emoji) => (
      <button
        key={emoji}
        type="button"
        onClick={() => addReaction(message.id, emoji)}
        className="flex h-8 w-8 items-center justify-center rounded-full text-base transition active:scale-125"
      >
        {emoji}
      </button>
    ))}

    {/* Divider */}
    <div className="h-5 w-px bg-white/10" />

    {/* NAYA — Reply button */}
    <button
      type="button"
      onClick={() => {
        setReplyingTo(message);
        setActiveReaction(null);
      }}
      className="flex h-8 w-8 items-center justify-center rounded-full text-white/60 transition hover:bg-white/[0.08] active:scale-125"
    >
      <FaReply className="text-sm" />
    </button>
  </div>
)}

                  {/* Action Menu — apna message: Edit / Reply / Delete */}
                  {isActionMenuOpen && (
                    <div
                      className={`absolute bottom-full mb-2 z-40 flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#181818] shadow-2xl animate-in fade-in zoom-in-95 duration-150 ${
                        isMe ? "right-0" : "left-0"
                      }`}
                    >
                      {message.type === "text" && (
                        <button
                          type="button"
                          onClick={() => startEdit(message)}
                          className="flex items-center gap-2.5 px-4 py-2.5 text-left text-sm text-white/80 transition hover:bg-white/[0.08] active:scale-[0.98]"
                        >
                          <FaPen className="text-xs" />
                          Edit
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => {
                          setReplyingTo(message);
                          setActionMenuFor(null);
                        }}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-left text-sm text-white/80 transition hover:bg-white/[0.08] active:scale-[0.98]"
                      >
                        <FaReply className="text-xs" />
                        Reply
                      </button>

                      <button
                        type="button"
                        onClick={() => deleteMessage(message)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-left text-sm text-red-400 transition hover:bg-white/[0.08] active:scale-[0.98]"
                      >
                        <FaTrash className="text-xs" />
                        Delete
                      </button>
                    </div>
                  )}

                  <div
                    onTouchStart={(e) => {
                      handlePressStart(message);
                      handleTouchStart(e);
                    }}
                    onTouchEnd={(e) => {
                      handlePressEnd();
                      handleTouchEnd(e, message);
                    }}
                    onMouseDown={() => handlePressStart(message)}
                    onMouseUp={handlePressEnd}
                    onMouseLeave={handlePressEnd}
                    className={`cursor-pointer rounded-[20px] px-4 py-2 text-sm leading-relaxed ${
                      isMe
                        ? "rounded-br-[4px] bg-red-500 text-white"
                        : "rounded-bl-[4px] bg-white/[0.08] text-white/90"
                    } ${message.isOptimistic ? "opacity-60" : ""}`}
                  >
                    <p className="break-words">
                      {message.isDeleted ? (
                        <span className="italic text-white/40 text-xs">
                          This message was deleted
                        </span>
                      ) : (
                        message.content
                      )}
                    </p>
                  </div>

                  <div className={`mt-0.5 flex items-center gap-1.5 px-1 ${isMe ? "justify-end" : "justify-start"}`}>
                    <span className="text-[9px] text-white/40">
                      {message.isOptimistic ? "Sending..." : formatTime(message.createdAt)}
                      {message.isEdited && !message.isDeleted && " · edited"}
                    </span>

                    {message.reactions?.length > 0 && (
                      <span className="rounded-full border border-white/10 bg-[#181818] px-1.5 py-0.5 text-[10px]">
                        {message.reactions.map((r) => r.emoji).join("")}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {isOtherUserTyping && (
            <div className="flex justify-start">
              <div className="rounded-[18px] rounded-bl-[4px] bg-white/[0.08] px-3.5 py-2.5">
                <div className="flex gap-1 items-center">
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-white/50 [animation-delay:-0.3s]" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-white/50 [animation-delay:-0.15s]" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-white/50" />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* EDIT BANNER — reply banner ki jagah, jab edit mode active ho */}
      {editingMessage ? (
        <div className="border-t border-white/[0.06] bg-[#111111] px-4 py-2">
          <div className="flex items-center gap-3 max-w-[600px] mx-auto">
            <div className="h-7 w-0.5 rounded-full bg-blue-500" />
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-semibold text-blue-400">Editing message</p>
              <p className="truncate text-xs text-white/40">{editingMessage.content}</p>
            </div>
            <button
              type="button"
              onClick={cancelEdit}
              className="flex h-7 w-7 items-center justify-center rounded-full bg-white/[0.06] text-white/40 active:scale-90"
            >
              <FaXmark className="text-xs" />
            </button>
          </div>
        </div>
      ) : (
        replyingTo && (
          <div className="border-t border-white/[0.06] bg-[#111111] px-4 py-2">
            <div className="flex items-center gap-3 max-w-[600px] mx-auto">
              <div className="h-7 w-0.5 rounded-full bg-red-500" />
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-semibold text-red-500">
                  Replying to {replyingTo.senderId === loggedInUserId ? "yourself" : otherUser.fullName}
                </p>
                <p className="truncate text-xs text-white/40">{replyingTo.content}</p>
              </div>
              <button
                type="button"
                onClick={() => setReplyingTo(null)}
                className="flex h-7 w-7 items-center justify-center rounded-full bg-white/[0.06] text-white/40 active:scale-90"
              >
                <FaXmark className="text-xs" />
              </button>
            </div>
          </div>
        )
      )}

      {/* INPUT CONTROLS */}
      <div className="shrink-0 border-t border-white/[0.07] bg-[#080808]/95 px-3 pb-[calc(env(safe-area-inset-bottom)+10px)] pt-2.5 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[600px] items-end gap-2">
          <button
            type="button"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/[0.06] text-white/40 active:scale-90"
          >
            <FaFaceSmile className="text-sm" />
          </button>

          <div className="flex min-h-10 flex-1 items-center rounded-full border border-white/[0.08] bg-white/[0.06] px-4">
<input
  ref={inputRef}   // NAYA
  type="text"
  value={messageText}
  onChange={handleInputChange}
  onKeyDown={(e) => {
    if (e.key === "Enter") sendMessage();
    if (e.key === "Escape" && editingMessage) cancelEdit();
  }}
  placeholder={editingMessage ? "Edit message..." : "Message..."}
  className="min-w-0 flex-1 bg-transparent py-2 text-sm text-white outline-none placeholder:text-white/25"
/>
          </div>

          <button
            type="button"
            onClick={sendMessage}
            disabled={!messageText.trim()}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-500 text-white transition active:scale-90 disabled:bg-white/[0.06] disabled:text-white/20"
          >
            {editingMessage ? (
              <FaCheck className="text-xs" />
            ) : (
              <FaPaperPlane className="ml-[-1px] text-xs" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}