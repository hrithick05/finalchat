import axios from "axios";

export const axiosInstance = axios.create({
  baseURL: import.meta.env.MODE === "development" ? "/api" : "https://finalchat-7zx7.onrender.com/api",
  withCredentials: true,
});
