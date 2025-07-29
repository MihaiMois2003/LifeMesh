import axios from "axios";

// Create axios instance with base configuration
export const apiClient = axios.create({
  baseURL: "http://10.0.2.2:3000", // Should work with emulator
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    console.log("🚀 REQUEST DETAILS:", {
      method: config.method?.toUpperCase(),
      url: `${config.baseURL}${config.url}`,
      fullURL: `${config.baseURL}${config.url}`,
      headers: config.headers,
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
