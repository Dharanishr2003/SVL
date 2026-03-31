package com.nexorcrm.backend.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import java.util.List;

public class BulkLeadCreateRequest {

    @NotEmpty(message = "At least one lead is required")
    @Valid
    private List<BulkLeadItem> leads;

    public List<BulkLeadItem> getLeads() { return leads; }
    public void setLeads(List<BulkLeadItem> leads) { this.leads = leads; }
}
