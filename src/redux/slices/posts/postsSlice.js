"use client";

import axiosInstance from "@/lib/axiosInstance";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";




const initialState = {
  posts: [],
  nextCursor: null,
  hasMore: true,
  status: "idle",       // idle | loading | succeeded | failed
  loadingMore: false,   // separate flag for "loading page 2+" vs initial load
};

export const fetchPosts = createAsyncThunk(
  "posts/fetchPosts",
  async ({ cursor } = {}, { rejectWithValue }) => {
    try {
      const params = cursor ? { cursor, limit: 10 } : { limit: 10 };
      const res = await axiosInstance.get("/api/post", { params });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to load posts");
    }
  }
);


const postsSlice = createSlice({
  name: 'postsSlice',
 initialState : {
  posts: [],
  nextCursor: null,
  hasMore: true,
  status: "idle",       // idle | loading | succeeded | failed
  loadingMore: false,   // separate flag for "loading page 2+" vs initial load
},
  reducers: {},

  extraReducers: (builder) => {
    // POST | CREATE AWARD
  builder
  .addCase(fetchPosts.pending, (state, action) => {
    const isFirstPage = !action.meta.arg?.cursor;
    if (isFirstPage) {
      state.status = "loading";
    } else {
      state.loadingMore = true;
    }
  })
  .addCase(fetchPosts.fulfilled, (state, action) => {
    const isFirstPage = !action.meta.arg?.cursor;
    state.posts = isFirstPage
      ? action.payload.posts               // replace on first load
      : [...state.posts, ...action.payload.posts]; // append on scroll
    state.nextCursor = action.payload.nextCursor;
    state.hasMore = action.payload.hasMore;
    state.status = "succeeded";
    state.loadingMore = false;
  })
  .addCase(fetchPosts.rejected, (state) => {
    state.status = "failed";
    state.loadingMore = false;
  });

  },
});

export default postsSlice.reducer;