import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL,
  withCredentials: true
});

// Attach token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle token expiry
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If token expired
    if (error.response?.status === 403 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const res = await axios.post(
          import.meta.env.VITE_BACKEND_URL + "/api/user/refresh",
          {},
          { withCredentials: true }
        );

        const newToken = res.data.accessToken;

        // Save new token
        localStorage.setItem("token", newToken);

        // Update header
        originalRequest.headers.Authorization = `Bearer ${newToken}`;

        // Retry original request
        return api(originalRequest);

      } catch (err) {
        // Refresh failed → logout
        localStorage.removeItem("token");
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);

export default api;