package com.nexorcrm.backend.dto;

import jakarta.validation.constraints.NotBlank;

public class DesignationMasterRequest {

    @NotBlank
    private String name;

    @NotBlank
    private String department;

    private String status; // ACTIVE / INACTIVE

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}
