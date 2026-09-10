// "use client";

// import { FaMagnifyingGlass, FaChevronRight } from "react-icons/fa6";
// import { useSelector } from "react-redux";
// import formatPostDate from "@/lib/formatPostDate"; // aapka existing date formatter

// export default function ChatList({ conversations, onSelectConversation }) {
//   const onlineIds = useSelector((state) => state?.onlineUsers?.ids || []);

//   return (
//     <div className="px-4 pb-28">
//       <div className="mb-4 flex items-center gap-3 rounded-2xl border border-white/[0.07] bg-white/[0.05] px-4 py-3.5">
//         <FaMagnifyingGlass className="text-sm text-white/30" />
//         <input
//           type="text"
//           placeholder="Search conversations..."
//           className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-white/25"
//         />
//       </div>

//       {conversations?.length === 0 ? (
//         <div className="py-10 text-center text-sm text-white/30">
//           No conversations yet
//         </div>
//       ) : (
//         <div className="space-y-1">
//           {conversations?.map((convo) => {
//             const isOnline = onlineIds.includes(convo?.otherUser.id);

//             const lastMessagePreview = convo?.lastMessage?.isDeleted
//               ? "This message was deleted"
//               : convo?.lastMessage?.type === "image"
//               ? "📷 Photo"
//               : convo?.lastMessage?.content || "Say hi 👋";

//             return (
//               <button
//                 key={convo?.conversationId}
//                 type="button"
//                 onClick={() =>
//                   onSelectConversation({
//                     conversationId: convo?.conversationId,
//                     otherUser: { ...convo?.otherUser, online: isOnline },
//                   })
//                 }
//                 className="flex w-full items-center gap-3 rounded-2xl px-2 py-3.5 text-left transition hover:bg-white/[0.04] active:scale-[0.98]"
//               >
//                 <div className="relative shrink-0">
//                   <img
//                     src={convo?.otherUser.image || "/default-avatar.png"}
//                     alt={convo?.otherUser.fullName}
//                     className="h-14 w-14 rounded-full object-cover ring-1 ring-white/10"
//                   />
//                   {isOnline && (
//                     <span className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-[#080808] bg-green-500" />
//                   )}
//                 </div>

//                 <div className="min-w-0 flex-1">
//                   <div className="flex items-center justify-between gap-2">
//                     <h2 className="truncate text-sm font-semibold text-white">
//                       {convo?.otherUser.fullName}
//                     </h2>
//                     <span className="shrink-0 text-[10px] text-white/25">
//                       {formatPostDate(convo?.lastMessageAt)}
//                     </span>
//                   </div>

//                   <div className="mt-1 flex items-center justify-between gap-2">
//                     <p className="truncate text-xs text-white/35">{lastMessagePreview}</p>

//                     {convo?.unreadCount > 0 && (
//                       <span className="flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-red-500 px-1.5 text-[10px] font-bold text-white">
//                         {convo?.unreadCount}
//                       </span>
//                     )}
//                   </div>
//                 </div>

//                 <FaChevronRight className="shrink-0 text-[10px] text-white/15" />
//               </button>
//             );
//           })}
//         </div>
//       )}
//     </div>
//   );
// }

// File: src/app/(withBottomNav)/chats/components/ChatList.jsx
"use client";

import { FaMagnifyingGlass, FaChevronRight } from "react-icons/fa6";
import { useSelector } from "react-redux";
import { useState } from "react";
import formatPostDate from "@/lib/formatPostDate";

export default function ChatList({ conversations = [], onSelectConversation }) {
  const onlineIds = useSelector((state) => state?.onlineUsers?.ids || []);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredConversations = conversations.filter((convo) =>
    convo?.otherUser?.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    convo?.otherUser?.username?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="px-4 pb-28 pt-2">
      <div className="mb-4 flex items-center gap-3 rounded-2xl border border-white/[0.07] bg-white/[0.05] px-4 py-3">
        <FaMagnifyingGlass className="text-sm text-white/30 shrink-0" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search conversations..."
          className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-white/25"
        />
      </div>

      {filteredConversations.length === 0 ? (
        <div className="py-12 text-center text-sm text-white/30">
          No conversations found
        </div>
      ) : (
        <div className="space-y-1">
          {filteredConversations.map((convo) => {
            const isOnline = onlineIds.includes(convo?.otherUser?.id);

            const lastMessagePreview = convo?.lastMessage?.isDeleted
              ? "This message was deleted"
              : convo?.lastMessage?.type === "image"
              ? "📷 Photo"
              : convo?.lastMessage?.content || "Say hi 👋";

            const hasUnread = Number(convo?.unreadCount) > 0;

            return (
              <button
                key={convo?.conversationId}
                type="button"
                onClick={() =>
                  onSelectConversation({
                    conversationId: convo?.conversationId,
                    otherUser: { ...convo?.otherUser, online: isOnline },
                  })
                }
                className="flex w-full items-center gap-3 rounded-2xl px-3 py-3.5 text-left transition active:bg-white/[0.06] touch-manipulation select-none"
              >
                <div className="relative shrink-0">
                  <img
                    src={convo?.otherUser?.image || "/default-avatar.png"}
                    alt={convo?.otherUser?.fullName || "User"}
                    className="h-13 w-13 rounded-full object-cover ring-1 ring-white/10"
                  />
                  {isOnline && (
                    <span className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-[#080808] bg-emerald-500" />
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <h2 className="truncate text-sm font-semibold text-white">
                      {convo?.otherUser?.fullName}
                    </h2>
                    <span className={`shrink-0 text-[10px] ${hasUnread ? "text-red-400 font-medium" : "text-white/30"}`}>
                      {formatPostDate(convo?.lastMessageAt)}
                    </span>
                  </div>

                  <div className="mt-1 flex items-center justify-between gap-2">
                    <p className={`truncate text-xs ${hasUnread ? "font-medium text-white/90" : "text-white/40"}`}>
                      {lastMessagePreview}
                    </p>

                    {hasUnread && (
                      <span className="flex h-5 min-w-[20px] shrink-0 items-center justify-center rounded-full bg-red-500 px-1.5 text-[10px] font-bold text-white shadow-sm shadow-red-500/30">
                        {convo.unreadCount}
                      </span>
                    )}
                  </div>
                </div>

                <FaChevronRight className="shrink-0 text-[10px] text-white/15" />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}