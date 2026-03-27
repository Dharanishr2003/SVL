package com.nexorcrm.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.util.List;

public class RrqRequest {

    @NotBlank(message = "RRQ name is required")
    @Size(min = 2, max = 200, message = "RRQ name must be between 2 and 200 characters")
    private String rrqName;

    @NotBlank(message = "RRQ type is required")
    @Size(min = 2, max = 160, message = "RRQ type must be between 2 and 160 characters")
    private String rrqType;

    private List<Long> assignedUserIds;

    public String getRrqName() { return rrqName; }
    public void setRrqName(String rrqName) { this.rrqName = rrqName; }

    public String getRrqType() { return rrqType; }
    public void setRrqType(String rrqType) { this.rrqType = rrqType; }

    public List<Long> getAssignedUserIds() { return assignedUserIds; }
    public void setAssignedUserIds(List<Long> assignedUserIds) { this.assignedUserIds = assignedUserIds; }
}
