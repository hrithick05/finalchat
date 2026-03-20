import { create } from "zustand";
import { axiosInstance } from "../lib/axios.js";
import toast from "react-hot-toast";
import { io } from "socket.io-client";

const BASE_URL = import.meta.env.MODE === "development" ? "http://localhost:5175" : "https://finalchat-7zx7.onrender.com";

export const useAuthStore = create((set, get) => ({
  authUser: null,
  isSigningUp: false,
  isLoggingIn: false,
  isUpdatingProfile: false,
  isCheckingAuth: true,
  onlineUsers: [],
  socket: null,
  isDatabaseError: false,

  checkAuth: async () => {
    try {
      const res = await axiosInstance.get("/auth/check");

      set({ authUser: res.data, isDatabaseError: false });
      get().connectSocket();
    } catch (error) {
      console.log("Error in checkAuth:", error);
      
      // Check if it's a 500 error (database connection issue)
      if (error.response?.status === 500) {
        set({ isDatabaseError: true });
      }
      
      set({ authUser: null });
    } finally {
      set({ isCheckingAuth: false });
    }
  },

  signup: async (data) => {
    set({ isSigningUp: true });
    try {
      const res = await axiosInstance.post("/auth/signup", data);
      if (res.data.token) localStorage.setItem("jwt-token", res.data.token);
      set({ authUser: res.data, isDatabaseError: false });
      toast.success("Account created successfully");
      get().connectSocket();
    } catch (error) {
      if (error.response?.status === 500) {
        set({ isDatabaseError: true });
        toast.error("Database connection error. Please try again in a moment.");
      } else {
        toast.error(error.response?.data?.message || "Signup failed");
      }
    } finally {
      set({ isSigningUp: false });
    }
  },

  login: async (data) => {
    set({ isLoggingIn: true });
    try {
      const res = await axiosInstance.post("/auth/login", data);
      if (res.data.token) localStorage.setItem("jwt-token", res.data.token);
      set({ authUser: res.data, isDatabaseError: false });
      toast.success("Logged in successfully");
      get().connectSocket();
    } catch (error) {
      if (error.response?.status === 500) {
        set({ isDatabaseError: true });
        toast.error("Database connection error. Please try again in a moment.");
      } else {
        toast.error(error.response?.data?.message || "Login failed");
      }
    } finally {
      set({ isLoggingIn: false });
    }
  },

  logout: async () => {
    try {
      await axiosInstance.post("/auth/logout");
      localStorage.removeItem("jwt-token");
      set({ authUser: null, isDatabaseError: false });
      toast.success("Logged out successfully");
      get().disconnectSocket();
    } catch (error) {
      toast.error(error.response?.data?.message || "Logout failed");
    }
  },

  updateProfile: async (data) => {
    set({ isUpdatingProfile: true });
    try {
      const res = await axiosInstance.put("/auth/update-profile", data);
      set({ authUser: res.data, isDatabaseError: false });
      toast.success("Profile updated successfully");
    } catch (error) {
      console.log("error in update profile:", error);
      if (error.response?.status === 500) {
        set({ isDatabaseError: true });
        toast.error("Database connection error. Please try again.");
      } else {
        toast.error(error.response?.data?.message || "Update failed");
      }
    } finally {
      set({ isUpdatingProfile: false });
    }
  },

  connectSocket: () => {
    const { authUser } = get();
    if (!authUser || get().socket?.connected) return;

    const socket = io(BASE_URL, {
      query: {
        userId: authUser._id,
      },
    });
    socket.connect();

    set({ socket: socket });

    socket.on("getOnlineUsers", (userIds) => {
      set({ onlineUsers: userIds });
    });
  },
  disconnectSocket: () => {
    if (get().socket?.connected) get().socket.disconnect();
  },
}));
