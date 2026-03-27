package com.nexorcrm.backend.dto;

public class DepartmentMasterResponse {
    private Long id;
    private String name;
    private String status;
    private Long employeeCount; // optional for UI

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public Long getEmployeeCount() { return employeeCount; }
    public void setEmployeeCount(Long employeeCount) { this.employeeCount = employeeCount; }
}
