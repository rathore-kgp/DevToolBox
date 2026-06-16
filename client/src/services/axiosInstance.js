import axios from 'axios';
import { store } from '../store/index';
import { setCredentials, clearAuth } from '../store/slices/authSlice';

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  withCredentials: true, // Required for HttpOnly cookies (refresh token)
  timeout: 10000,
});

// REQUEST INTERCEPTOR: Attach access token
axiosInstance.interceptors.request.use(
  (config) => {
    const state = store.getState();
    const token = state.auth.accessToken;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Silent refresh queue: holds all requests that failed while refresh was in-progress
let isRefreshing = false;
let failedRequestQueue = [];

const processQueue = (error, token = null) => {
  failedRequestQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedRequestQueue = [];
};

// RESPONSE INTERCEPTOR: Handle 401 with silent refresh
axiosInstance.interceptors.response.use(
  (response) => response, // Pass through successful responses
  async (error) => {
    const originalRequest = error.config;

    const isRefreshRequest = originalRequest.url && originalRequest.url.includes('/auth/refresh');

    // If 401 and we haven't already tried to refresh for this request, and it's not the refresh request itself
    if (error.response?.status === 401 && !originalRequest._retry && !isRefreshRequest) {
      if (isRefreshing) {
        // Queue this request until refresh completes
        return new Promise((resolve, reject) => {
          failedRequestQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return axiosInstance(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true; // Mark to prevent infinite loop
      isRefreshing = true;

      try {
        // This call sends the HttpOnly refresh token cookie automatically
        const { data } = await axiosInstance.post('/auth/refresh');

        const newAccessToken = data.accessToken;

        // Update Redux store with new credentials
        store.dispatch(setCredentials({ accessToken: newAccessToken, user: data.user }));

        // Update the header for the original failed request
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

        // Resolve all queued requests with new token
        processQueue(null, newAccessToken);

        return axiosInstance(originalRequest);
      } catch (refreshError) {
        // Refresh failed — session is dead, force logout
        processQueue(refreshError, null);
        store.dispatch(clearAuth());
        window.location.href = '/login'; // Hard redirect
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;