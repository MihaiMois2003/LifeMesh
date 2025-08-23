import { apiClient } from "../../../shared/api/client";
import {
  LoginRequest,
  RegisterRequest,
  ApiResponse,
  LoginResponse,
  RegisterResponse,
} from "../../../shared/types/api";
import { loginSuccess, logout } from "../store/authSlice";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { store } from "../../../store/store";

class AuthService {
  /**
   * Login user with email and password
   */
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    try {
      console.log("🔍 Attempting login with:", {
        email: credentials.email,
        password: "***hidden***",
        url: "/api/auth/login",
      });

      const response = await apiClient.post<ApiResponse<LoginResponse>>(
        "/api/auth/login",
        credentials
      );

      const { user, token } = response.data.data;

      if (!token) {
        throw new Error("No token received from server");
      }

      console.log("✅ Login successful! Saving token:", token);

      // 🔑 Save token to AsyncStorage
      await AsyncStorage.setItem("userToken", token);

      // 🔑 Save to Redux
      store.dispatch(loginSuccess({ user, token }));

      return response.data.data;
    } catch (error: any) {
      console.log("❌ Login failed with error:", {
        status: error.response?.status,
        backendMessage: error.response?.data?.message,
      });

      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        `HTTP ${error.response?.status}: ${error.response?.statusText}` ||
        "Login failed - network error";
      throw new Error(errorMessage);
    }
  }

  /**
   * Register new user
   */
  async register(userData: RegisterRequest): Promise<RegisterResponse> {
    try {
      console.log("🔍 Attempting registration with:", {
        email: userData.email,
        username: userData.username,
        password: "***hidden***",
      });

      const response = await apiClient.post<ApiResponse<RegisterResponse>>(
        "/api/auth/register",
        userData
      );

      console.log("✅ Registration successful!");
      return response.data.data;
    } catch (error: any) {
      console.log("❌ Registration failed:", error.response?.data);

      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Registration failed";
      throw new Error(errorMessage);
    }
  }

  /**
   * Logout (clear local data, optionally call backend)
   */
  async logout(): Promise<void> {
    try {
      console.log("🔍 Logging out user");
      await AsyncStorage.removeItem("userToken"); // clear from storage
      store.dispatch(logout()); // clear redux
    } catch (error) {
      console.warn("Logout error:", error);
    }
  }
}

// Export a singleton instance
export const authService = new AuthService();
