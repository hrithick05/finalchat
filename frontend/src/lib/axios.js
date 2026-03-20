import axios from "axios";

export const axiosInstance = axios.create({
  baseURL: "https://finalchat-7zx7.onrender.com/api",
  withCredentials: true,
});
