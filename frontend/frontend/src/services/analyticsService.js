import apiClient from "./apiClient";

const analyticsService = {
  getAnalytics() {
    return apiClient.get("/analytics");
  },
};

export default analyticsService;
