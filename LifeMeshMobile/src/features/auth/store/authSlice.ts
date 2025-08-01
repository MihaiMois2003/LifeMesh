import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { UserRole } from "../../../shared/types/user";

// Define the shape of our auth state - matching your Prisma schema exactly
interface User {
  id: string;
  email: string;
  username: string; // ✅ Changed from 'name' to 'username'
  displayName: string | null;
  bio: string | null;
  avatar: string | null;
  role: UserRole;
  reputation: number;
  level: number;
  latitude: number | null;
  longitude: number | null;
  address: string | null;
  isVerified: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  lastLoginAt: string | null;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;
}

// Initial state
const initialState: AuthState = {
  user: null,
  token: null,
  isLoading: false,
  error: null,
  isAuthenticated: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    // Action: Start login process
    loginStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },

    // Action: Login success
    loginSuccess: (
      state,
      action: PayloadAction<{ user: User; token: string }>
    ) => {
      state.isLoading = false;
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      state.error = null;
    },

    // Action: Login failure
    loginFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
      state.isAuthenticated = false;
    },

    // Action: Logout
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;
      state.isLoading = false;
    },

    // Action: Clear error
    clearError: (state) => {
      state.error = null;
    },

    updateUser: (state, action: PayloadAction<any>) => {
      // Only update if user is logged in
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
      }
    },
  },
});

// Export actions
export const {
  loginStart,
  loginSuccess,
  loginFailure,
  logout,
  clearError,
  updateUser,
} = authSlice.actions;

// Export reducer
export default authSlice.reducer;
