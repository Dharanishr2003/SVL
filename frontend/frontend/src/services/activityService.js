import apiClient from "./apiClient";

const activityService = {
  getActivity() {
    return apiClient.get("/activity");
  },
};

export default activityService;
