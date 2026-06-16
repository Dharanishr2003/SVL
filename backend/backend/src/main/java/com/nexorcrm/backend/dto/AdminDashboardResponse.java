package com.nexorcrm.backend.dto;

import java.util.List;

public class AdminDashboardResponse {
    private DashboardHeaderResponse header;
    private DashboardWelcomeResponse welcome;
    private List<DashboardStatResponse> topStats;
    private List<DashboardActivityResponse> recentActivities;

    public DashboardHeaderResponse getHeader() {
        return header;
    }

    public void setHeader(DashboardHeaderResponse header) {
        this.header = header;
    }

    public DashboardWelcomeResponse getWelcome() {
        return welcome;
    }

    public void setWelcome(DashboardWelcomeResponse welcome) {
        this.welcome = welcome;
    }

    public List<DashboardStatResponse> getTopStats() {
        return topStats;
    }

    public void setTopStats(List<DashboardStatResponse> topStats) {
        this.topStats = topStats;
    }

    public List<DashboardActivityResponse> getRecentActivities() {
        return recentActivities;
    }

    public void setRecentActivities(List<DashboardActivityResponse> recentActivities) {
        this.recentActivities = recentActivities;
    }
}
