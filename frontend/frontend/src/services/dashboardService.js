import api from "../utils/api";
import { dashboardData } from "../mock/dashboardData";
import { employeeDashboardData } from "../mock/employeeDashboardData";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8082";

function resolveAbsoluteUrl(value) {
  const raw = String(value || "").trim();
  if (!raw) {
    return "";
  }
  if (/^https?:\/\//i.test(raw)) {
    return raw;
  }
  return `${API_BASE}${raw.startsWith("/") ? raw : `/${raw}`}`;
}

function normalizeDashboardResponse(payload) {
  if (!payload || typeof payload !== "object") {
    return null;
  }

  return {
    header: payload.header || dashboardData.header,
    welcome: payload.welcome
      ? {
          ...payload.welcome,
          avatar: resolveAbsoluteUrl(payload.welcome.avatar),
        }
      : dashboardData.welcome,
    topStats: Array.isArray(payload.topStats) && payload.topStats.length > 0
      ? payload.topStats
      : dashboardData.topStats,
    recentActivities: Array.isArray(payload.recentActivities) ? payload.recentActivities : [],
  };
}

function normalizeEmployeeDashboardResponse(payload) {
  if (!payload || typeof payload !== "object") {
    return null;
  }

  return {
    header: payload.header || employeeDashboardData.header,
    profile: payload.profile || employeeDashboardData.profile,
    attendanceSummary: payload.attendanceSummary || employeeDashboardData.attendanceSummary,
    todayAttendance: payload.todayAttendance || null,
    leaveSummary: payload.leaveSummary || employeeDashboardData.leaveSummary,
    quickStats: Array.isArray(payload.quickStats) && payload.quickStats.length > 0
      ? payload.quickStats
      : employeeDashboardData.quickStats,
    recentLeaves: Array.isArray(payload.recentLeaves) ? payload.recentLeaves : [],
    recentActivities: Array.isArray(payload.recentActivities) ? payload.recentActivities : [],
    statusMessage: payload.statusMessage || employeeDashboardData.statusMessage,
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
  async getEmployeeDashboard() {
    try {
      const response = await api.get("/api/employee/dashboard");
      const normalized = normalizeEmployeeDashboardResponse(response?.data);
      return normalized || employeeDashboardData;
    } catch (error) {
      return employeeDashboardData;
    }
  },
};

export default dashboardService;
