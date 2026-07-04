import { useQuery } from "@tanstack/react-query";
import { fetchDashboardStats } from "./analyticsApi";

export const useDashboardStats = () =>
  useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: fetchDashboardStats,
  });
