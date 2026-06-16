import api from "../utils/api";
import { dashboardData } from "../mock/dashboardData";
import { employeeDashboardData } from "../mock/employeeDashboardData";

function normalizeDashboardResponse(payload) {
  if (!payload || typeof payload !== "object") {
    return null;
  }

  return {
    header: payload.header || dashboardData.header,
    welcome: payload.welcome || dashboardData.welcome,
    topStats: Array.isArray(payload.topStats) && payload.topStats.length > 0
      ? payload.topStats
      : dashboardData.topStats,
    recentActivities: Array.isArray(payload.recentActivities) ? payload.recentActivities : [],
  };
}

const dashboardService = {
  async getDashboard() {
    try {
      const response = await api.get("/api/admin/dashboard");
      const normalized = normalizeDashboardResponse(response?.data);
      return normalized || dashboardData;
    } catch (error) {
      return {
        ...dashboardData,
        recentActivities: [],
      };
    }
  },
  getEmployeeDashboard() {
    return Promise.resolve(employeeDashboardData);
  },
};

export default dashboardService;
