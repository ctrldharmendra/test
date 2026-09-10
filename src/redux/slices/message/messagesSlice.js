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
      return { conversationId, ...res?.data };
    } catch (err) {
      if (err.response?.status === 403) {
        return {
          conversationId,
          messages: [],
          nextCursor: null,
          hasMore: false,
        };
      }
      console.error("Get conversations error:", err);
      return rejectWithValue(err.response?.data?.message || "Failed to load messages");
    }
  }
);

const emptyConvoState = () => ({
  messages: [],
  nextCursor: null,
  hasMore: true,
  status: "idle",
  typingUserId: null, // NAYA — doosra banda type kar raha hai kya
});

const messagesSlice = createSlice({
  name: "messages",
  initialState: { byConversation: {} },
  reducers: {
    addOptimisticMessage: (state, action) => {
      const { conversationId, message } = action.payload;
      if (!state.byConversation[conversationId]) {
        state.byConversation[conversationId] = emptyConvoState();
      }
      state.byConversation[conversationId].messages.push(message);
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
        convo.messages[optimisticIndex] = action.payload;
      } else {
        const alreadyExists = convo.messages.some((m) => m.id === action.payload.id);
        if (!alreadyExists) {
          convo.messages.push(action.payload);
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

      // purana reaction is user ka hata do
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
  applyMessageEdited,
  applyMessageDeleted,
  applyReaction,
  setTypingStatus,
} = messagesSlice.actions;

export default messagesSlice.reducer;