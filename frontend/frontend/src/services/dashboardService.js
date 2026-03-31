import { dashboardData } from "../mock/dashboardData";
import { employeeDashboardData } from "../mock/employeeDashboardData";

const dashboardService = {
  getDashboard() {
    return Promise.resolve(dashboardData);
  },
  getEmployeeDashboard() {
    return Promise.resolve(employeeDashboardData);
  },
};

export default dashboardService;
