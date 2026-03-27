package com.nexorcrm.backend.dto;

import java.time.LocalDateTime;
import java.util.List;

public class RrqResponse {
    private Long id;
    private String rrqId;
    private String rrqName;
    private String rrqType;
    private LocalDateTime createdDate;
    private List<RrqAssignedUserResponse> assignedUsers;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getRrqId() { return rrqId; }
    public void setRrqId(String rrqId) { this.rrqId = rrqId; }
    public String getRrqName() { return rrqName; }
    public void setRrqName(String rrqName) { this.rrqName = rrqName; }
    public String getRrqType() { return rrqType; }
    public void setRrqType(String rrqType) { this.rrqType = rrqType; }
    public LocalDateTime getCreatedDate() { return createdDate; }
    public void setCreatedDate(LocalDateTime createdDate) { this.createdDate = createdDate; }
    public List<RrqAssignedUserResponse> getAssignedUsers() { return assignedUsers; }
    public void setAssignedUsers(List<RrqAssignedUserResponse> assignedUsers) { this.assignedUsers = assignedUsers; }
}
