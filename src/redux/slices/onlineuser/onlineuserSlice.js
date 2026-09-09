// redux/slices/onlineUsers/onlineUsersSlice.js
import { createSlice } from "@reduxjs/toolkit";

const onlineUsersSlice = createSlice({
  name: "onlineUsers",
  initialState: { ids: [] },
  reducers: {
    setOnlineSnapshot: (state, action) => {
      state.ids = action.payload; // poori list, connect/register hone par
    },
    userWentOnline: (state, action) => {
      if (!state.ids.includes(action.payload)) {
        state.ids.push(action.payload);
      }
    },
    userWentOffline: (state, action) => {
      state.ids = state.ids.filter((id) => id !== action.payload);
    },
  },
});

export const { setOnlineSnapshot, userWentOnline, userWentOffline } =
  onlineUsersSlice.actions;
export default onlineUsersSlice.reducer;