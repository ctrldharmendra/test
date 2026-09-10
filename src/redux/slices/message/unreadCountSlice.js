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
  },
  extraReducers: (builder) => {
    builder.addCase(fetchUnreadCount.fulfilled, (state, action) => {
      state.count = action.payload;
    });
  },
});

export const { setUnreadCount } = unreadCountSlice.actions;
export default unreadCountSlice.reducer;