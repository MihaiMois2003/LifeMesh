// src/shared/api/client.ts
import axios, {
  AxiosRequestConfig,
  AxiosRequestHeaders,
  InternalAxiosRequestConfig,
} from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { store } from "../../store/store";

let ifDevelopment = 1;
// Create axios instance with base configuration
export const apiClient = axios.create({
  baseURL: ifDevelopment
    ? "http://10.0.2.2:3000"
    : "https://life-mesh-backend.vercel.app",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// 🔑 Request interceptor: attach token
apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    let token: string | null = null;

    // 1️⃣ First, try Redux store (faster)
    const state = store.getState();
    token = state.auth?.token || null;

    // 2️⃣ If not found, fall back to AsyncStorage
    if (!token) {
      token = await AsyncStorage.getItem("userToken");
    }

    if (token) {
      const headers =
        (config.headers as AxiosRequestHeaders) || ({} as AxiosRequestHeaders);
      headers.Authorization = `Bearer ${token}`;
      config.headers = headers;
    } else {
      console.log("⚠️ No token found, request will be unauthenticated");
    }

    return config;
  },
  (error) => Promise.reject(error),
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
  },
);
