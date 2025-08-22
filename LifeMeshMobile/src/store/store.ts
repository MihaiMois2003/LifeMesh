import { configureStore } from "@reduxjs/toolkit";
import authSlice from "../features/auth/store/authSlice";
import postsSlice from "../features/posts/store/postsSlice";

export const store = configureStore({
  reducer: {
    auth: authSlice,
    posts: postsSlice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ["persist/PERSIST", "persist/REHYDRATE"],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
