import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  user: null,
  accessToken: null,
  isAuthResolved: false, // becomes true once we've checked for an existing session on app load
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      state.user = action.payload.user;
      state.accessToken = action.payload.accessToken;
      state.isAuthResolved = true;
    },
    setAccessToken: (state, action) => {
      state.accessToken = action.payload;
    },
    clearCredentials: (state) => {
      state.user = null;
      state.accessToken = null;
      state.isAuthResolved = true;
    },
    authResolved: (state) => {
      state.isAuthResolved = true;
    },
  },
});

export const { setCredentials, setAccessToken, clearCredentials, authResolved } = authSlice.actions;
export default authSlice.reducer;

export const selectCurrentUser = (state) => state.auth.user;
export const selectAccessToken = (state) => state.auth.accessToken;
export const selectIsAuthResolved = (state) => state.auth.isAuthResolved;
