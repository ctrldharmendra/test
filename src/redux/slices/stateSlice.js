import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  selectedAge: "",
  selectedGender: "",
  selectedDistance:25,
  isViewingPost: false,
  currentPost: null,
  selectedImageToPost: null,
  writtenCaptionToPost: "",
  currentPosts: [],
  loggedInUserId: null,
  unSeenNotificationCount: null,
  searchedUsers: [],
}

export const stateSlice = createSlice({
  name: 'state',
  initialState,
  reducers: {
   setSelectedAge:(state, action)=>{
      state.selectedAge = action?.payload;
    },
    setSelectedGender:(state, action)=>{
      state.selectedGender = action?.payload;
    },
    setSelectedDistance:(state, action)=>{
      state.selectedDistance = action?.payload;
    },
    setIsViewingPost:(state, action)=>{
      state.isViewingPost = action?.payload;
    },
    setCurrentPost:(state, action)=>{
      state.currentPost = action?.payload;
    },
    setSelectedImageToPost:(state, action)=>{
      state.selectedImageToPost = action?.payload;
    },
    setWrittenCaptionToPost:(state, action)=>{
      state.writtenCaptionToPost = action?.payload;
    },
      setCurrentPosts:(state, action)=>{
        state.currentPosts = action?.payload;
      },
      setLoggedInUserId:(state, action)=>{
        state.loggedInUserId = action?.payload;
      },
    setUnSeenNotificationCount:(state, action)=>{
      state.unSeenNotificationCount = action?.payload;
    },
    setSearchedUsers:(state, action)=>{
      state.searchedUsers = action?.payload;
    },

  },
})

// Action creators are generated for each case reducer function
export const { 
  setSelectedAge, setSelectedGender, setSelectedDistance, setIsViewingPost,
   setCurrentPost, setSelectedImageToPost, setWrittenCaptionToPost, 
   setCurrentPosts, setLoggedInUserId, setUnSeenNotificationCount,
   setSearchedUsers
  
  } = stateSlice.actions

export default stateSlice.reducer