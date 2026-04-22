import type { AxiosError, InternalAxiosRequestConfig } from "axios";
import axios from "axios";
import { tokenManager } from "../lib/tokenManager";

// ============================================================
// Cấu hình mặc định cho các request
// ============================================================
const axiosClient = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL || "http://localhost:5000/api/v1",
  timeout: 1000 * 60 * 10,
  withCredentials: true, // Enable cookie support for auth tokens
});

// ============================================================
// Biến để track trạng thái refresh token
// ============================================================
let isLoggingOut = false;
let failedQueue: {
  resolve: (value?: any) => void;
  reject: (reason?: any) => void;
}[] = [];

// ============================================================
// Hàm xử lý queue khi refresh token hoàn thành
// ============================================================
const processQueue = (error: any, success: boolean = false) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(success);
    }
  });

  failedQueue = [];
};

// ============================================================
// Hàm refresh token - Now saves tokens and notifies tokenManager
// ============================================================
const refreshToken = async (retryCount: number = 0): Promise<boolean> => {
  const maxRetries = 3;
  try {
    // Cookies are automatically sent with withCredentials: true
    const response = await axiosClient.get(`/auth/refresh`);

    console.log("Refresh token success");

    // If tokens are returned in response body, save them
    if (response.data?.accessToken && response.data?.refreshToken) {
      await tokenManager.saveTokens(
        response.data.accessToken,
        response.data.refreshToken,
      );
      console.log("[Axios] Tokens saved from refresh response");
    } else {
      // Tokens are in HTTP-only cookies (backend handles it)
      // Just mark this in tokenManager
      // Notify listeners that tokens were refreshed
      console.log("[Axios] Tokens refreshed (HTTP-only cookies)");
    }

    // New tokens are automatically saved via Set-Cookie headers (HTTP-only)
    return response.status === 200;
  } catch (error) {
    console.error("Refresh token failed:", error);
    if (retryCount < maxRetries) {
      console.log(
        `Retrying refresh token (${retryCount + 1}/${maxRetries})...`,
      );
      await new Promise((resolve) =>
        setTimeout(resolve, 1000 * (retryCount + 1)),
      ); // Exponential backoff
      return refreshToken(retryCount + 1);
    }
    return false;
  }
};

// ============================================================
// Hàm logout redux state
// ============================================================
const performLogout = async () => {
  // Tránh logout nhiều lần
  if (isLoggingOut) {
    console.log("Already logging out...");
    return;
  }

  isLoggingOut = true;
  console.log("Performing logout...");

  try {
    // Dynamic import để tránh circular dependency
    const { store } = await import("../lib/store");
    const { clearUser } = await import("../lib/authSlice");

    // Clear tokens using tokenManager (handles AsyncStorage + memory)
    await tokenManager.clearTokens();

    // Clear Redux state
    store.dispatch(clearUser());

    // Note: Navigation sẽ được handle bởi component khi detect isAuthenticated = false
  } catch (error) {
    console.error("Logout error:", error);
  } finally {
    // Reset flag sau một khoảng thời gian
    setTimeout(() => {
      isLoggingOut = false;
    }, 1000);
  }
};

// ============================================================
// Request Interceptor: Cookies are automatically included via withCredentials
// ============================================================
axiosClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    // No need to manually add Authorization header
    // Cookies (accessToken, refreshToken) are automatically sent with each request
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// ============================================================
// Response Interceptor: Xử lý lỗi 401 và auto refresh token
// ============================================================
axiosClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // Nếu không có config, reject ngay
    if (!originalRequest) {
      return Promise.reject(error);
    }

    const isUnauthorized = error.response?.status === 401;
    const isRefreshEndpoint = originalRequest.url?.includes("/auth/refresh");
    const isLogoutEndpoint = originalRequest.url?.includes("/auth/logout");
    const isLoginEndpoint = originalRequest.url?.includes("/auth/login");
    const isSignupEndpoint = originalRequest.url?.includes("/auth/register");

    // Logout endpoint failed - still perform logout Redux state
    if (isLogoutEndpoint) {
      console.log("Logout endpoint failed, performing logout anyway...");
      await performLogout();
      return Promise.reject(error);
    }

    // Skip refresh token cho auth endpoints (không cần token để authenticate)
    if (isLoginEndpoint || isSignupEndpoint) {
      console.log("Auth endpoint failed, not retrying...");
      return Promise.reject(error);
    }

    // Nếu refresh token endpoint bị 401, logout ngay
    if (isUnauthorized && isRefreshEndpoint) {
      console.log("Refresh token endpoint returned 401, logging out...");
      await performLogout();
      return Promise.reject(error);
    }

    // Nếu refresh token endpoint bị 5xx error, logout ngay (server error)
    if (isRefreshEndpoint && error.response?.status === 500) {
      console.log("Refresh token endpoint returned 500, logging out...");
      await performLogout();
      return Promise.reject(error);
    }

    const isRefreshTokenExpired =
      typeof error.response?.data === "object" &&
      error.response?.data !== null &&
      "message" in error.response.data &&
      (error.response.data as { message?: string }).message ===
        "Refresh token is invalid or expired";

    if (isUnauthorized && !originalRequest._retry && !isRefreshEndpoint) {
      // Nếu user chưa đăng nhập, just reject (không cố refresh, không spam log)
      const hasToken = await tokenManager.hasValidToken();
      if (!hasToken) {
        return Promise.reject(error);
      }

      // Nếu refresh token đã hết hạn, logout ngay
      if (isRefreshTokenExpired) {
        console.log("Refresh token expired, logging out...");
        await performLogout();
        return Promise.reject(error);
      }

      // Đánh dấu request này đã retry để tránh infinite loop
      originalRequest._retry = true;

      if (tokenManager.isRefreshing()) {
        // Nếu đang refresh, đưa request vào queue
        console.log("Adding request to queue...");
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => {
            // Retry request gốc (token đã được update)
            return axiosClient(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      console.log("Access token expired, refreshing...");
      tokenManager.setRefreshing(true);

      try {
        // Gọi API refresh token
        const refreshSuccess = await refreshToken();

        if (refreshSuccess) {
          console.log("Token refreshed successfully, retrying failed requests");
          // Xử lý tất cả requests trong queue
          processQueue(null, true);

          // Retry request gốc
          return axiosClient(originalRequest);
        } else {
          throw new Error("Token refresh failed");
        }
      } catch (refreshError) {
        console.error("Token refresh failed:", refreshError);

        // Xử lý queue với error
        processQueue(refreshError, false);

        // Logout
        await performLogout();

        return Promise.reject(refreshError);
      } finally {
        tokenManager.setRefreshing(false);
      }
    }

    return Promise.reject(error);
  },
);

export default axiosClient;
