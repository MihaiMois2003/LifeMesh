import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import {
  loginStart,
  loginSuccess,
  loginFailure,
  logout as logoutAction,
  clearError,
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

      // For now, we'll assume no token is returned
      // When your backend returns a token, we'll handle it here
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
      dispatch(loginStart()); // Use same loading state

      const response = await authService.register(userData);

      // After successful registration, we could auto-login
      // For now, just return success
      dispatch(
        loginSuccess({
          user: response,
          token: "", // No token from register endpoint
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
      // Even if logout fails, clear local state
      dispatch(logoutAction());
      return { success: true }; // Always succeed locally
    }
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
    isLoading: authState.isLoading,
    error: authState.error,
    isAuthenticated: authState.isAuthenticated,

    // Actions
    login,
    register,
    logout,
    clearAuthError,
  };
};
