package com.nexorcrm.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class BulkLeadItem {

    @NotBlank(message = "Name is required")
    @Size(max = 200, message = "Name must be at most 200 characters")
    private String name;

    @NotBlank(message = "Mobile is required")
    @Size(max = 40, message = "Mobile must be at most 40 characters")
    private String mobile;

    @NotBlank(message = "Primary Source is required")
    @Size(max = 160, message = "Primary Source must be at most 160 characters")
    private String primarySource;

    @NotNull(message = "Assigned user ID is required")
    private Long assignedUserId;

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getMobile() { return mobile; }
    public void setMobile(String mobile) { this.mobile = mobile; }

    public String getPrimarySource() { return primarySource; }
    public void setPrimarySource(String primarySource) { this.primarySource = primarySource; }

    public Long getAssignedUserId() { return assignedUserId; }
    public void setAssignedUserId(Long assignedUserId) { this.assignedUserId = assignedUserId; }
}
