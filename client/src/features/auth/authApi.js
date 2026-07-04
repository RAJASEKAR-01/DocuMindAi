import api from "../../lib/axios";

export const registerUser = (payload) => api.post("/auth/register", payload).then((res) => res.data);
export const loginUser = (payload) => api.post("/auth/login", payload).then((res) => res.data);
export const logoutUser = () => api.post("/auth/logout").then((res) => res.data);
export const fetchCurrentUser = () => api.get("/auth/me").then((res) => res.data);
export const updateUserProfile = (payload) => api.put("/auth/profile", payload).then((res) => res.data);
export const refreshSession = () => api.post("/auth/refresh").then((res) => res.data);
