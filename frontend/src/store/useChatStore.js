import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "./useAuthStore";

export const useChatStore = create((set, get) => ({
  messages: [],
  users: [],
  selectedUser: null,
  isUsersLoading: false,
  isMessagesLoading: false,

  getUsers: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get("/messages/users");
      set({ users: res.data });
    } catch (error) {
      const errorMessage = error?.response?.data?.message || "Failed to load users. Is the server running?";
      toast.error(errorMessage);
    } finally {
      set({ isUsersLoading: false });
    }
  },

  getMessages: async (userId) => {
    set({ isMessagesLoading: true });
    try {
      const res = await axiosInstance.get(`/messages/${userId}`);
      set({ messages: res.data });
    } catch (error) {
      const errorMessage = error?.response?.data?.message || "Failed to load messages. Is the server running?";
      toast.error(errorMessage);
    } finally {
      set({ isMessagesLoading: false });
    }
  },
  sendMessage: async (messageData) => {
    const { selectedUser, messages } = get();
    try {
      const res = await axiosInstance.post(`/messages/send/${selectedUser._id}`, messageData);
      set({ messages: [...messages, res.data] });
    } catch (error) {
      const errorMessage = error?.response?.data?.message || "Failed to send message. Is the server running?";
      toast.error(errorMessage);
    }
  },

  subscribeToMessages: () => {
    const { selectedUser } = get();
    if (!selectedUser) return;

    const socket = useAuthStore.getState().socket;
    if (!socket) return;

    // Remove existing listeners to avoid duplicates
    socket.off("newMessage");
    socket.off("messageImageUpdated");

    // Listen for new messages
    socket.on("newMessage", (newMessage) => {
      const senderId = newMessage.senderId?._id || newMessage.senderId;
      const isMessageSentFromSelectedUser = senderId?.toString() === selectedUser._id?.toString();
      if (!isMessageSentFromSelectedUser) return;

      set({
        messages: [...get().messages, newMessage],
      });
    });

    // Handle image uploads completed in background
    socket.on("messageImageUpdated", (data) => {
      const { messageId, imageUrl } = data;
      console.log("Image updated:", messageId, imageUrl);
      
      set((state) => ({
        messages: state.messages.map((msg) =>
          msg._id === messageId 
            ? { ...msg, image: imageUrl } 
            : msg
        ),
      }));
    });
  },

  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;
    if (!socket) return;
    socket.off("newMessage");
    socket.off("messageImageUpdated");
  },

  setSelectedUser: (selectedUser) => set({ selectedUser }),
}));
