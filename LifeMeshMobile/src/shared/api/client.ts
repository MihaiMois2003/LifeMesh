import axios from "axios";

// Create axios instance with base configuration
export const apiClient = axios.create({
  baseURL: "http://localhost:3000", // Your backend URL
  timeout: 10000, // 10 second timeout
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor - runs before every request
apiClient.interceptors.request.use(
  (config) => {
    // We'll add auth token here later
    console.log(
      `Making ${config.method?.toUpperCase()} request to: ${config.url}`
    );
    return config;
  },
  (error) => {
    console.error("Request error:", error);
    return Promise.reject(error);
  }
);

// Response interceptor - runs after every response
apiClient.interceptors.response.use(
  (response) => {
    // Log successful responses in development
    console.log("API Response:", response.data);
    return response;
  },
  (error) => {
    // Handle common errors
    console.error("API Error:", error.response?.data || error.message);

    // You can handle common errors here (401, 500, etc.)
    if (error.response?.status === 401) {
      // Handle unauthorized - maybe logout user
      console.log("Unauthorized - token might be expired");
    }

    return Promise.reject(error);
  }
);
