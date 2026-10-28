import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axiosInstance from "@/lib/axiosInstance";

export const fetchUnreadCount = createAsyncThunk(
  "unreadCount/fetch",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get("/api/messages/unread-count");
      return res.data.totalUnreadCount;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to fetch unread count");
    }
  }
);

const unreadCountSlice = createSlice({
  name: "unreadCount",
  initialState: { count: 0 },
  reducers: {
    setUnreadCount: (state, action) => {
      state.count = action.payload;
    },
    // Local +1 for an incoming message. The server's authoritative total
    // (sent back on `message:read`) will overwrite this, so any brief
    // over/under-count is self-correcting.
    incrementUnread: (state) => {
      state.count = Number(state.count || 0) + 1;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchUnreadCount.fulfilled, (state, action) => {
      state.count = action.payload;
    });
  },
});

export const { setUnreadCount, incrementUnread } = unreadCountSlice.actions;
export default unreadCountSlice.reducer;