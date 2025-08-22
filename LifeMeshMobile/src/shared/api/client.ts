// src/shared/api/client.ts (REPLACE ENTIRE FILE)
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Create axios instance with base configuration
export const apiClient = axios.create({
  baseURL: "http://10.0.2.2:3000",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// 🆕 SINGLE REQUEST INTERCEPTOR (with auth)
apiClient.interceptors.request.use(
  async (config) => {
    // Add auth token if available
    try {
      const token = await AsyncStorage.getItem("userToken");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.warn("Failed to get auth token:", error);
    }

    console.log("🚀 REQUEST DETAILS:", {
      method: config.method?.toUpperCase(),
      url: `${config.baseURL}${config.url}`,
      fullURL: `${config.baseURL}${config.url}`,
      headers: {
        ...config.headers,
        Authorization: config.headers.Authorization
          ? "Bearer [TOKEN]"
          : "NO AUTH",
      },
      data: config.data,
    });
    return config;
  },
  (error) => {
    console.error("❌ REQUEST SETUP ERROR:", error);
    return Promise.reject(error);
  }
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => {
    console.log("✅ RESPONSE SUCCESS:", {
      status: response.status,
      statusText: response.statusText,
      data: response.data,
    });
    return response;
  },
  (error) => {
    console.error("❌ RESPONSE ERROR:", {
      message: error.message,
      code: error.code,
      request: error.request ? "Request was made" : "No request made",
      response: error.response
        ? {
            status: error.response.status,
            statusText: error.response.statusText,
            data: error.response.data,
          }
        : "No response received",
    });
    return Promise.reject(error);
  }
);
