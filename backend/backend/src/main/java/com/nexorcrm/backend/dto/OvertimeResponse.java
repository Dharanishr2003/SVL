package com.nexorcrm.backend.dto;

import java.time.LocalDate;

public class OvertimeResponse {
    private Long id;
    private Long employeeId;
    private String employeeName;
    private String employeeDept;
    private LocalDate overtimeDate;
    private Integer overtimeHours;
    private Integer remainingHours;
    private String projectName;
    private String approvedBy;
    private String description;
    private String status;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getEmployeeId() { return employeeId; }
    public void setEmployeeId(Long employeeId) { this.employeeId = employeeId; }

    public String getEmployeeName() { return employeeName; }
    public void setEmployeeName(String employeeName) { this.employeeName = employeeName; }

    public String getEmployeeDept() { return employeeDept; }
    public void setEmployeeDept(String employeeDept) { this.employeeDept = employeeDept; }

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
