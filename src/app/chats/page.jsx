
// "use client";

// import { useEffect, useState, useCallback } from "react";
// import { useSearchParams } from "next/navigation";
// import { FaMessage, FaPenToSquare } from "react-icons/fa6";
// import axiosInstance from "@/lib/axiosInstance";
// import { getSocket } from "@/lib/socket";
// import ChatList from "./components/ChatList";
// import ChatWindow from "./components/ChatWindow";

// export default function MessagePage() {
//   const searchParams = useSearchParams();
//   const conversationIdFromUrl = searchParams.get("conversationId");

//   const [conversations, setConversations] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [selectedConvo, setSelectedConvo] = useState(null);

//   const fetchConversations = useCallback(async () => {
//     try {
//       const res = await axiosInstance.get("/api/conversations");
//       const list = res.data.conversations || [];
//       setConversations(list);

//       if (conversationIdFromUrl && !selectedConvo) {
//         const match = list.find(
//           (c) => String(c.conversationId) === String(conversationIdFromUrl)
//         );

//         if (match) {
//           setSelectedConvo({
//             conversationId: match.conversationId,
//             otherUser: match.otherUser,
//           });
//         } else {
//           const otherUserId = searchParams.get("otherUserId");
//           if (otherUserId) {
//             setSelectedConvo({
//               conversationId: conversationIdFromUrl,
//               otherUser: {
//                 id: Number(otherUserId),
//                 fullName: searchParams.get("otherUserName") || "User",
//                 username: searchParams.get("otherUserUsername") || "",
//                 image: searchParams.get("otherUserImage") || null,
//               },
//             });
//           }
//         }
//       }
//     } catch (error) {
//       console.error("Failed to load conversations:", error);
//     } finally {
//       setLoading(false);
//     }
//   }, [conversationIdFromUrl, searchParams, selectedConvo]);

//   useEffect(() => {
//     fetchConversations();
//   }, [fetchConversations]);

//   // Handle Realtime Socket Message & Read updates
//   useEffect(() => {
//     const socket = getSocket();

//     const handleNewGlobalMessage = (message) => {
//       setConversations((prev) => {
//         const existingIndex = prev.findIndex(
//           (c) => String(c.conversationId) === String(message.conversationId)
//         );

//         const isOpen = selectedConvo && String(selectedConvo.conversationId) === String(message.conversationId);

//         if (existingIndex !== -1) {
//           const updatedList = [...prev];
//           const item = updatedList[existingIndex];
          
//           updatedList[existingIndex] = {
//             ...item,
//             lastMessageAt: message.createdAt || new Date().toISOString(),
//             unreadCount: isOpen ? 0 : item.unreadCount + 1,
//             lastMessage: {
//               id: message.id,
//               senderId: message.senderId,
//               type: message.type || "text",
//               content: message.content,
//               isDeleted: false,
//               createdAt: message.createdAt,
//             },
//           };
//           // Move updated chat to top
//           return updatedList.sort((a, b) => new Date(b.lastMessageAt) - new Date(a.lastMessageAt));
//         } else {
//           fetchConversations();
//           return prev;
//         }
//       });
//     };

//     socket.on("message:new", handleNewGlobalMessage);
//     return () => socket.off("message:new", handleNewGlobalMessage);
//   }, [selectedConvo, fetchConversations]);

//   // Clear unread count locally when conversation is opened
//   const handleSelectConversation = (convo) => {
//     setSelectedConvo(convo);
//     setConversations((prev) =>
//       prev.map((c) =>
//         c.conversationId === convo.conversationId ? { ...c, unreadCount: 0 } : c
//       )
//     );
//   };

//   return (
//     <main className="min-h-dvh bg-[#080808] text-white">
//       <div className="mx-auto min-h-dvh w-full max-w-[600px] flex flex-col">
//         {!selectedConvo ? (
//           <>
//             <header className="flex items-center justify-between px-4 pb-3 pt-[calc(env(safe-area-inset-top)+16px)]">
//               <div className="flex items-center gap-3">
//                 <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-red-500/10 text-red-500">
//                   <FaMessage className="text-base" />
//                 </div>
//                 <div>
//                   <h1 className="text-xl font-bold tracking-tight">Messages</h1>
//                   <p className="text-[11px] text-white/30">Your conversations</p>
//                 </div>
//               </div>

//               <button
//                 type="button"
//                 className="flex h-9 w-9 items-center justify-center rounded-full bg-white/[0.06] text-white/60 transition active:scale-90"
//               >
//                 <FaPenToSquare className="text-xs" />
//               </button>
//             </header>

//             {loading ? (
//               <div className="px-4 py-12 text-center text-sm text-white/30">
//                 Loading conversations...
//               </div>
//             ) : (
//               <ChatList
//                 conversations={conversations}
//                 onSelectConversation={handleSelectConversation}
//               />
//             )}
//           </>
//         ) : (
//           <ChatWindow
//             conversationId={selectedConvo.conversationId}
//             otherUser={selectedConvo.otherUser}
//             onBack={() => {
//               setSelectedConvo(null);
//               fetchConversations();
//             }}
//           />
//         )}
//       </div>
//     </main>
//   );
// }



// File: src/app/(withBottomNav)/chats/page.jsx
"use client";

import { useEffect, useState, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { FaMessage, FaPenToSquare } from "react-icons/fa6";
import axiosInstance from "@/lib/axiosInstance";
import { getSocket } from "@/lib/socket";
import ChatList from "./components/ChatList";
import ChatWindow from "./components/ChatWindow";
import { useSelector } from "react-redux";
// import ChatWindow from "@/components/chatWindow/ChatWindow";

export default function MessagePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const conversationIdFromUrl = searchParams.get("conversationId");

const unreadCount = useSelector((state) => state?.unreadCount?.count);

  
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedConvo, setSelectedConvo] = useState(null);

  const fetchConversations = useCallback(async () => {
    try {
      const res = await axiosInstance.get("/api/conversations");
      const list = res?.data?.conversations || [];
      setConversations(list);

      if (conversationIdFromUrl) {
        const match = list.find(
          (c) => String(c.conversationId) === String(conversationIdFromUrl)
        );

        if (match) {
          setSelectedConvo({
            conversationId: match.conversationId,
            otherUser: match.otherUser,
            isNew: false,
          });
        } else {
          // Fallback for new chat started from user profile
          const otherUserId = searchParams.get("otherUserId");
          if (otherUserId) {
            setSelectedConvo({
              conversationId: conversationIdFromUrl,
              otherUser: {
                id: Number(otherUserId),
                fullName: searchParams.get("otherUserName") || "User",
                username: searchParams.get("otherUserUsername") || "",
                image: searchParams.get("otherUserImage") || null,
              },
              isNew: true, // Flag as new chat
            });
          }
        }
      }
    } catch (error) {
      console.error("Failed to load conversations:", error);
    } finally {
      setLoading(false);
    }
  }, [conversationIdFromUrl, searchParams]);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  // Handle Back Button correctly by cleaning URL
  const handleBack = () => {
    setSelectedConvo(null);
    // Clear the query parameters so useEffect doesn't re-trigger
    router.replace("/chats", { scroll: false });
    fetchConversations();
  };


  useEffect(() => {
fetchConversations();
  }, [unreadCount])
  

  return (
    <main className="min-h-dvh bg-[#080808] text-white">
      <div className="mx-auto min-h-dvh w-full max-w-[600px] flex flex-col">
        {!selectedConvo ? (
          <>
            <header className="flex items-center justify-between px-4 pb-3 pt-[calc(env(safe-area-inset-top)+16px)]">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-red-500/10 text-red-500">
                  <FaMessage className="text-base" />
                </div>
                <div>
                  <h1 className="text-xl font-bold tracking-tight">Messages</h1>
                  <p className="text-[11px] text-white/30">Your conversations</p>
                </div>
              </div>

              <button
                type="button"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-white/[0.06] text-white/60 transition active:scale-90"
              >
                <FaPenToSquare className="text-xs" />
              </button>
            </header>

            {loading ? (
              <div className="px-4 py-12 text-center text-sm text-white/30">
                Loading conversations...
              </div>
            ) : (
              <ChatList
                conversations={conversations}
                onSelectConversation={(convo) => setSelectedConvo(convo)}
              />
            )}
          </>
        ) : (
          <ChatWindow
            conversationId={selectedConvo?.conversationId}
            otherUser={selectedConvo?.otherUser}
            isNew={selectedConvo?.isNew}
            onBack={handleBack}
          />
        )}
      </div>
    </main>
  );
}