import { createSlice, nanoid } from '@reduxjs/toolkit';

const notificationSlice = createSlice({
  name: 'notifications',
  initialState: {
    items: [],
  },
  reducers: {
    addNotification: {
      reducer: (state, action) => {
        state.items.unshift(action.payload);
      },
      prepare: (data) => ({
        payload: {
          id: nanoid(),
          createdAt: new Date().toISOString(),
          read: false,
          ...data,
        },
      }),
    },
    markNotificationRead: (state, action) => {
      const notif = state.items.find((n) => n.id === action.payload);
      if (notif) notif.read = true;
    },
    clearNotifications: (state) => {
      state.items = [];
    },
  },
});

export const { addNotification, markNotificationRead, clearNotifications } =
  notificationSlice.actions;

export default notificationSlice.reducer;
