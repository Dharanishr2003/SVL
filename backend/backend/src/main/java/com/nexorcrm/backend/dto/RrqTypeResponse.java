package com.nexorcrm.backend.dto;

import java.time.LocalDateTime;

public class RrqTypeResponse {
    private Long id;
    private String typeId;
    private String rrqType;
    private LocalDateTime createdDate;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getTypeId() { return typeId; }
    public void setTypeId(String typeId) { this.typeId = typeId; }
    public String getRrqType() { return rrqType; }
    public void setRrqType(String rrqType) { this.rrqType = rrqType; }
    public LocalDateTime getCreatedDate() { return createdDate; }
    public void setCreatedDate(LocalDateTime createdDate) { this.createdDate = createdDate; }
}
