import { createSlice } from "@reduxjs/toolkit";

const chatSlice = createSlice({
  name: "chat",
  initialState: {
    completedFriends: {},
  },
  reducers: {
    setPaymentComplete: (state, action) => {
      state.completedFriends[action.payload] = true;
    },
    clearChatState: (state) => {
      state.completedFriends = {};
    },
  },
});

export const { setPaymentComplete, clearChatState } = chatSlice.actions;
export default chatSlice.reducer;
