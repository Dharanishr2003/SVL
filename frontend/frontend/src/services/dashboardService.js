import apiClient from "./apiClient";

const dashboardService = {
  getDashboard() {
    return apiClient.get("/dashboard");
  },
  getEmployeeDashboard() {
    return apiClient.get("/dashboard/employee");
  },
};

export default dashboardService;
