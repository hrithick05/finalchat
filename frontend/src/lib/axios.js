import axios from "axios";

export const axiosInstance = axios.create({
  baseURL: import.meta.env.MODE === "development" ? "/api" : "https://finalchat-7zx7.onrender.com/api",
  withCredentials: true,
});

// Attach token from localStorage to every request
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem("jwt-token");
  if (token) config.headers["x-auth-token"] = token;
  return config;
});

// Save token from response headers
axiosInstance.interceptors.response.use((response) => {
  const token = response.headers["x-auth-token"];
  if (token) localStorage.setItem("jwt-token", token);
  return response;
});
