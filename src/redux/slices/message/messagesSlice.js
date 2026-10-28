import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axiosInstance from "@/lib/axiosInstance";

export const fetchMessages = createAsyncThunk(
  "messages/fetchMessages",
  async ({ conversationId, cursor }, { rejectWithValue }) => {
    try {
      const params = cursor ? { cursor, limit: 30 } : { limit: 30 };
      const res = await axiosInstance.get(
        `/api/conversations/${conversationId}/messages`,
        { params }
      );
      return { conversationId, ...res.data };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to load messages");
    }
  }
);

const emptyConvoState = () => ({
  messages: [],
  nextCursor: null,
  hasMore: true,
  status: "idle",
  typingUserId: null,
});

// status kabhi neeche nahi jaana chahiye (events duplicate/ulte order me aa sakte hai)
const STATUS_RANK = { sending: 0, sent: 1, delivered: 2, read: 3 };

const upgradeStatus = (msg, next) => {
  if ((STATUS_RANK[next] ?? -1) > (STATUS_RANK[msg.status] ?? -1)) {
    msg.status = next;
  }
};

const hasRealId = (m) => Number.isFinite(Number(m.id)); // optimistic ka id "temp-..." hota hai

const messagesSlice = createSlice({
  name: "messages",
  initialState: { byConversation: {} },
  reducers: {
    addOptimisticMessage: (state, action) => {
      const { conversationId, message } = action.payload;
      if (!state.byConversation[conversationId]) {
        state.byConversation[conversationId] = emptyConvoState();
      }
      state.byConversation[conversationId].messages.push({
        status: "sending",
        ...message,
      });
    },

    receiveMessage: (state, action) => {
      const { conversationId } = action.payload;
      if (!state.byConversation[conversationId]) {
        state.byConversation[conversationId] = emptyConvoState();
      }
      const convo = state.byConversation[conversationId];

      const optimisticIndex = convo.messages.findIndex(
        (m) => m.isOptimistic && m.tempId === action.payload.tempId
      );

      if (optimisticIndex !== -1) {
        convo.messages[optimisticIndex] = action.payload; // status: "sent"
      } else {
        const alreadyExists = convo.messages.some((m) => m.id === action.payload.id);
        if (!alreadyExists) {
          convo.messages.push(action.payload);
        }
      }
    },

    markMessageFailed: (state, action) => {
      const { conversationId, tempId } = action.payload;
      const convo = state.byConversation[conversationId];
      if (!convo) return;
      const msg = convo.messages.find((m) => m.isOptimistic && m.tempId === tempId);
      if (msg) msg.status = "failed";
    },

    // receiver ke app ne message receive kiya
    applyDelivered: (state, action) => {
      const { conversationId, senderId, upToMessageId } = action.payload;
      const convo = state.byConversation[conversationId];
      if (!convo) return;
      const upTo = Number(upToMessageId);

      for (const m of convo.messages) {
        if (Number(m.senderId) === Number(senderId) && hasRealId(m) && Number(m.id) <= upTo) {
          upgradeStatus(m, "delivered");
        }
      }
    },

    // receiver ne chat dekhi (reader ke alawa sab messages "read" ho jaate hai)
    applyRead: (state, action) => {
      const { conversationId, readerId, upToMessageId } = action.payload;
      const convo = state.byConversation[conversationId];
      if (!convo) return;
      const upTo = Number(upToMessageId);

      for (const m of convo.messages) {
        if (Number(m.senderId) !== Number(readerId) && hasRealId(m) && Number(m.id) <= upTo) {
          upgradeStatus(m, "read");
        }
      }
    },

    applyMessageEdited: (state, action) => {
      const { conversationId, messageId, newContent } = action.payload;
      const convo = state.byConversation[conversationId];
      if (!convo) return;
      const msg = convo.messages.find((m) => m.id === messageId);
      if (msg) {
        msg.content = newContent;
        msg.isEdited = true;
      }
    },

    applyMessageDeleted: (state, action) => {
      const { conversationId, messageId } = action.payload;
      const convo = state.byConversation[conversationId];
      if (!convo) return;
      const msg = convo.messages.find((m) => m.id === messageId);
      if (msg) {
        msg.isDeleted = true;
        msg.content = null;
        msg.imageUrl = null;
      }
    },

    applyReaction: (state, action) => {
      const { conversationId, messageId, userId, emoji, action: reactAction } = action.payload;
      const convo = state.byConversation[conversationId];
      if (!convo) return;
      const msg = convo.messages.find((m) => m.id === messageId);
      if (!msg) return;

      if (!msg.reactions) msg.reactions = [];
      msg.reactions = msg.reactions.filter((r) => r.userId !== userId);

      if (reactAction === "added" && emoji) {
        msg.reactions.push({ userId, emoji });
      }
    },

    setTypingStatus: (state, action) => {
      const { conversationId, userId, isTyping } = action.payload;
      if (!state.byConversation[conversationId]) {
        state.byConversation[conversationId] = emptyConvoState();
      }
      state.byConversation[conversationId].typingUserId = isTyping ? userId : null;
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(fetchMessages.pending, (state, action) => {
        const { conversationId } = action.meta.arg;
        if (!state.byConversation[conversationId]) {
          state.byConversation[conversationId] = emptyConvoState();
        }
        state.byConversation[conversationId].status = "loading";
      })
      .addCase(fetchMessages.fulfilled, (state, action) => {
        const { conversationId, messages, nextCursor, hasMore } = action.payload;
        const isFirstPage = !action.meta.arg?.cursor;
        const convo = state.byConversation[conversationId];

        const chronological = [...messages].reverse();

        convo.messages = isFirstPage
          ? chronological
          : [...chronological, ...convo.messages];

        convo.nextCursor = nextCursor;
        convo.hasMore = hasMore;
        convo.status = "succeeded";
      })
      .addCase(fetchMessages.rejected, (state, action) => {
        const { conversationId } = action.meta.arg;
        if (state.byConversation[conversationId]) {
          state.byConversation[conversationId].status = "failed";
        }
      });
  },
});

export const {
  addOptimisticMessage,
  receiveMessage,
  markMessageFailed,
  applyDelivered,
  applyRead,
  applyMessageEdited,
  applyMessageDeleted,
  applyReaction,
  setTypingStatus,
} = messagesSlice.actions;

export default messagesSlice.reducer;