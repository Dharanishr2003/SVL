package com.nexorcrm.backend.dto;

public class DesignationMasterResponse {
    private Long id;
    private String name;
    private String department;
    private Long departmentMasterId;
    private String status;
    private Long employeeCount; // optional

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }

    public Long getDepartmentMasterId() { return departmentMasterId; }
    public void setDepartmentMasterId(Long departmentMasterId) { this.departmentMasterId = departmentMasterId; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public Long getEmployeeCount() { return employeeCount; }
    public void setEmployeeCount(Long employeeCount) { this.employeeCount = employeeCount; }
}
