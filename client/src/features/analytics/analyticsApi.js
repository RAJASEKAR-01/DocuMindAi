import api from "../../lib/axios";

export const fetchDashboardStats = () => api.get("/analytics/dashboard").then((res) => res.data);
