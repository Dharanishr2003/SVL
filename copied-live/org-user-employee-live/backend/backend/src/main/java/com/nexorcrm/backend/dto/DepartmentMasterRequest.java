package com.nexorcrm.backend.dto;

import jakarta.validation.constraints.NotBlank;

public class DepartmentMasterRequest {

    @NotBlank
    private String name;

    private Long branchId;

    private String status; // ACTIVE / INACTIVE

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public Long getBranchId() { return branchId; }
    public void setBranchId(Long branchId) { this.branchId = branchId; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}
