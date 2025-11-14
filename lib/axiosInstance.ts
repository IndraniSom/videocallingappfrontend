import axios from "axios";
import { auth } from "./firebase";
import { getIdToken } from "firebase/auth";

const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: { "Content-Type": "application/json" },
});

// Add Firebase ID token to requests
axiosInstance.interceptors.request.use(
  async (config) => {
    const currentUser = auth.currentUser;
    if (currentUser) {
      try {
        const token = await getIdToken(currentUser);
        config.headers.Authorization = `Bearer ${token}`;
      } catch (error) {
        console.error("Error getting Firebase token:", error);
      }
    } else {
      // Try to get token from localStorage as fallback
      const storedToken = localStorage.getItem('token');
      if (storedToken) {
        config.headers.Authorization = `Bearer ${storedToken}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default axiosInstance;
