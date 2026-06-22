import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  theme: 'light',
  notification: null,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleTheme: (state) => {
      state.theme = state.theme === 'light' ? 'dark' : 'light';
    },

    setTheme: (state, action) => {
      state.theme = action.payload;
    },

    showNotification: (state, action) => {
      state.notification = action.payload;
    },

    clearNotification: (state) => {
      state.notification = null;
    },
  },
});

export const {
  toggleTheme,
  setTheme,
  showNotification,
  clearNotification,
} = uiSlice.actions;

export const selectTheme = (state) => state.ui.theme;
export const selectNotification = (state) => state.ui.notification;

export default uiSlice.reducer;