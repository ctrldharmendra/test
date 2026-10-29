"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { FaMessage, FaPenToSquare } from "react-icons/fa6";
import axiosInstance from "@/lib/axiosInstance";
import { getSocket } from "@/lib/socket";
import ChatList from "./components/ChatList";
import ChatWindow from "./components/ChatWindow";
import { useSelector } from "react-redux";

export default function MessagePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const conversationIdFromUrl = searchParams.get("conversationId");

const STATUS_RANK = { sent: 1, delivered: 2, read: 3 };
const upgradeStatus = (cur, next) =>
  (STATUS_RANK[next] || 0) > (STATUS_RANK[cur] || 0) ? next : cur;



  const unreadCount = useSelector((state) => state?.unreadCount?.count);
  const loggedInUserId = useSelector((state) => state?.userState?.loggedInUserId);

  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedConvo, setSelectedConvo] = useState(null);

  // socket handlers me latest selectedConvo chahiye, isliye ref me rakha
  const selectedConvoRef = useRef(null);

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

  console.log(conversations, "conversations");

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  // selectedConvo ka latest value ref me sync rakho
  useEffect(() => {
    selectedConvoRef.current = selectedConvo;
  }, [selectedConvo]);

  // ==========================================
  // REALTIME — reaction + naya message se chat list update
  // ==========================================

  useEffect(() => {
    const socket = getSocket();

    const handleReactionUpdated = (p) => {
      setConversations((prev) => {
        const target = prev.find((c) => c.conversationId === p.conversationId);
        if (!target) return prev;

        if (p.action === "added") {
          const updated = {
            ...target,
            lastMessageAt: p.createdAt,
            lastReaction: {
              messageId: p.messageId,
              userId: p.reactorId,
              userName: p.reactorName,
              emoji: p.emoji,
              messageOwnerId: p.messageOwnerId,
              messageSnippet: p.messageSnippet,
              createdAt: p.createdAt,
            },
          };
          return [updated, ...prev.filter((c) => c.conversationId !== p.conversationId)];
        }

        return prev.map((c) =>
          c.conversationId === p.conversationId &&
          c.lastReaction?.messageId === p.messageId &&
          c.lastReaction?.userId === p.reactorId
            ? { ...c, lastReaction: null }
            : c
        );
      });
    };

    const handleNewMessage = (m) => {
      setConversations((prev) => {
        const target = prev.find((c) => c.conversationId === m.conversationId);
        if (!target) return prev;

        const isOpen =
          String(selectedConvoRef.current?.conversationId) === String(m.conversationId);
        const fromOther = Number(m.senderId) !== Number(loggedInUserId);

        const updated = {
          ...target,
          lastReaction: null,
          lastMessageAt: m.createdAt,
          lastMessage: {
            id: m.id,
            senderId: m.senderId,
            type: m.type,
            content: m.content,
            isDeleted: false,
            createdAt: m.createdAt,
            status: fromOther ? null : "sent",
          },
          unreadCount:
            fromOther && !isOpen ? Number(target.unreadCount) + 1 : target.unreadCount,
        };

        return [updated, ...prev.filter((c) => c.conversationId !== m.conversationId)];
      });
    };

    const handleDelivered = ({ conversationId, senderId, upToMessageId }) => {
      setConversations((prev) =>
        prev.map((c) => {
          const lm = c.lastMessage;
          if (Number(c.conversationId) !== Number(conversationId) || !lm) return c;
          if (Number(lm.senderId) !== Number(senderId)) return c;
          if (Number(lm.id) > Number(upToMessageId)) return c;
          return { ...c, lastMessage: { ...lm, status: upgradeStatus(lm.status, "delivered") } };
        })
      );
    };

    const handleSeen = ({ conversationId, readByUserId, lastReadMessageId }) => {
      setConversations((prev) =>
        prev.map((c) => {
          const lm = c.lastMessage;
          if (Number(c.conversationId) !== Number(conversationId) || !lm) return c;
          if (Number(lm.senderId) === Number(readByUserId)) return c;
          if (Number(lm.id) > Number(lastReadMessageId)) return c;
          return { ...c, lastMessage: { ...lm, status: upgradeStatus(lm.status, "read") } };
        })
      );
    };

    socket.on("conversation:reaction-updated", handleReactionUpdated);
    socket.on("message:new", handleNewMessage);
    socket.on("message:delivered", handleDelivered);
    socket.on("message:seen", handleSeen);

    return () => {
      socket.off("conversation:reaction-updated", handleReactionUpdated);
      socket.off("message:new", handleNewMessage);
      socket.off("message:delivered", handleDelivered);
      socket.off("message:seen", handleSeen);
    };
  }, [loggedInUserId]);

  // Handle Back Button correctly by cleaning URL
  const handleBack = () => {
    setSelectedConvo(null);
    // Clear the query parameters so useEffect doesn't re-trigger
    router.replace("/chats", { scroll: false });
    fetchConversations();
  };

  useEffect(() => {
    fetchConversations();
  }, [unreadCount]);
if(!loggedInUserId) return (
  <div className="flex min-h-[100vh] items-center justify-center">
    <div className="text-gray-500">loggedinUserid is null. </div>
  </div>
)
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