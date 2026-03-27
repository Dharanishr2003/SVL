package com.nexorcrm.backend.dto;

import java.time.LocalDate;

public class OvertimeRequest {
    private Long employeeId;
    private LocalDate overtimeDate;
    private Integer overtimeHours;
    private Integer remainingHours;
    private String projectName;
    private String approvedBy;
    private String description;
    private String status;

    public Long getEmployeeId() { return employeeId; }
    public void setEmployeeId(Long employeeId) { this.employeeId = employeeId; }

    public LocalDate getOvertimeDate() { return overtimeDate; }
    public void setOvertimeDate(LocalDate overtimeDate) { this.overtimeDate = overtimeDate; }

    public Integer getOvertimeHours() { return overtimeHours; }
    public void setOvertimeHours(Integer overtimeHours) { this.overtimeHours = overtimeHours; }

    public Integer getRemainingHours() { return remainingHours; }
    public void setRemainingHours(Integer remainingHours) { this.remainingHours = remainingHours; }

    public String getProjectName() { return projectName; }
    public void setProjectName(String projectName) { this.projectName = projectName; }

    public String getApprovedBy() { return approvedBy; }
    public void setApprovedBy(String approvedBy) { this.approvedBy = approvedBy; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}
