package com.nexorcrm.backend.dto;

import jakarta.validation.constraints.NotBlank;

public class DesignationMasterRequest {

    @NotBlank
    private String name;

    private String department;

    private Long departmentMasterId;

    private String status; // ACTIVE / INACTIVE

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }

    public Long getDepartmentMasterId() { return departmentMasterId; }
    public void setDepartmentMasterId(Long departmentMasterId) { this.departmentMasterId = departmentMasterId; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}
