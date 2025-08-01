// src/features/auth/hooks/useAuth.ts (Updated)
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import {
  loginStart,
  loginSuccess,
  loginFailure,
  logout as logoutAction,
  clearError,
  updateUser as updateUserAction, // 🆕 Import new action
} from "../store/authSlice";
import { authService } from "../services/authService";
import { LoginRequest, RegisterRequest } from "../../../shared/types/api";

export const useAuth = () => {
  const dispatch = useAppDispatch();
  const authState = useAppSelector((state) => state.auth);

  /**
   * Login function
   */
  const login = async (credentials: LoginRequest) => {
    try {
      dispatch(loginStart());

      const response = await authService.login(credentials);

      dispatch(
        loginSuccess({
          user: response.user,
          token: response.token || "",
        })
      );

      return { success: true };
    } catch (error: any) {
      dispatch(loginFailure(error.message));
      return { success: false, error: error.message };
    }
  };

  /**
   * Register function
   */
  const register = async (userData: RegisterRequest) => {
    try {
      dispatch(loginStart());

      const response = await authService.register(userData);

      dispatch(
        loginSuccess({
          user: response,
          token: "",
        })
      );

      return { success: true };
    } catch (error: any) {
      dispatch(loginFailure(error.message));
      return { success: false, error: error.message };
    }
  };

  /**
   * Logout function
   */
  const logout = async () => {
    try {
      await authService.logout();
      dispatch(logoutAction());
      return { success: true };
    } catch (error: any) {
      dispatch(logoutAction());
      return { success: true };
    }
  };

  /**
   * 🆕 NEW: Update user function
   * Updates the current user data in the store
   */
  const updateUser = (userData: any) => {
    dispatch(updateUserAction(userData));
  };

  /**
   * Clear error function
   */
  const clearAuthError = () => {
    dispatch(clearError());
  };

  return {
    // State
    user: authState.user,
    token: authState.token,
    isLoading: authState.isLoading,
    error: authState.error,
    isAuthenticated: authState.isAuthenticated,

    // Actions
    login,
    register,
    logout,
    updateUser, // 🆕 Add this new function
    clearAuthError,
  };
};
