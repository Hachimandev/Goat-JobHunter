/* eslint-disable @typescript-eslint/no-explicit-any */
import type { AxiosError, InternalAxiosRequestConfig } from 'axios';
import axios from 'axios';
import { isAccountPrivateError } from '@/utils/apiError';

// ============================================================
// Cấu hình mặc định cho các request
// ============================================================
const axiosClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true,
  timeout: 1000 * 60 * 10,
});

// ============================================================
// Biến để track trạng thái refresh token
// ============================================================
let isRefreshing = false;
let isLoggingOut = false; // Thêm flag để tránh logout nhiều lần
let failedQueue: Array<{
  resolve: (value?: any) => void;
  reject: (reason?: any) => void;
}> = [];

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

const refreshToken = async (): Promise<boolean> => {
  try {
    const response = await axiosClient.get(`/auth/refresh`);

    console.log('Refresh token success');
    return response.status === 200;
  } catch (error) {
    console.error('Refresh token failed:', error);
    return false;
  }
};

// ============================================================
// Hàm logout redux state
// ============================================================
const performLogout = async () => {
  // Tránh logout nhiều lần
  if (isLoggingOut) {
    console.log('Already logging out...');
    return;
  }

  isLoggingOut = true;
  console.log('Performing logout...');

  try {
    const { store } = await import('@/lib/store');
    const { clearUser } = await import('@/lib/features/authSlice');

    // Clear Redux state
    store.dispatch(clearUser());

    // Clear refresh flag
    isRefreshing = false;

    // Redirect to login page
    if (typeof window !== 'undefined') {
      window.location.href = '/signin'; // Chuyển sang /login thay vì "/"
    }
  } catch (error) {
    console.error('Logout error:', error);
  } finally {
    // Reset flag sau một khoảng thời gian
    setTimeout(() => {
      isLoggingOut = false;
    }, 1000);
  }
};

// ============================================================
// Hàm logout redux state
// ============================================================
const handle401CodeWithoutRefresh = async () => {
  try {
    const { store } = await import('@/lib/store');
    const { setIsAuthenticated } = await import('@/lib/features/authSlice');

    // Clear Redux state
    store.dispatch(setIsAuthenticated(false));
  } catch (error) {
    console.error('Handle 401 error:', error);
  }
};

// ============================================================
// Interceptor: Xử lý lỗi 401 và errorCode UNAUTHORIZED
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

    if (isAccountPrivateError({ data: error.response?.data })) {
      return Promise.reject(error);
    }

    const isUnauthorized = error.response?.status === 401;
    const isRefreshEndpoint = originalRequest.url?.includes('/auth/refresh');

    // Nếu refresh token endpoint bị 401, logout ngay
    if (isUnauthorized && isRefreshEndpoint) {
      console.log('Refresh token endpoint returned 401, logging out...');
      await performLogout();
      return Promise.reject(error);
    }

    const isRefreshTokenExpired =
      typeof error.response?.data === 'object' &&
      error.response?.data !== null &&
      'message' in error.response.data &&
      (error.response.data as { message?: string }).message === 'Refresh token is invalid or expired';

    if (isUnauthorized && !originalRequest._retry && !isRefreshEndpoint) {
      // Xử lý unauthorized trước khi handle tới refresh token
      // await handle401CodeWithoutRefresh();

      // Nếu refresh token đã hết hạn, logout ngay
      if (isRefreshTokenExpired) {
        console.log('Refresh token expired, logging out...');
        await performLogout();
        return Promise.reject(error);
      }

      // Đánh dấu request này đã retry để tránh infinite loop
      originalRequest._retry = true;

      if (isRefreshing) {
        // Nếu đang refresh, đưa request vào queue
        console.log('Adding request to queue...');
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => {
            // Retry request gốc (cookie đã được update)
            return axiosClient(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      console.log('Access token expired, refreshing...');
      isRefreshing = true;

      try {
        // Gọi API refresh token
        const refreshSuccess = await refreshToken();

        if (refreshSuccess) {
          console.log('Token refreshed successfully, retrying failed requests');
          // Xử lý tất cả requests trong queue
          processQueue(null, true);

          // Retry request gốc
          return axiosClient(originalRequest);
        } else {
          throw new Error('Token refresh failed');
        }
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);

        // Xử lý queue với error
        processQueue(refreshError, false);

        // Logout
        await performLogout();

        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);

export default axiosClient;
