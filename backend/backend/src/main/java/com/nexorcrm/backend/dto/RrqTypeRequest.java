package com.nexorcrm.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class RrqTypeRequest {

    @NotBlank(message = "RRQ type is required")
    @Size(min = 2, max = 160, message = "RRQ type must be between 2 and 160 characters")
    private String rrqType;

    public String getRrqType() { return rrqType; }
    public void setRrqType(String rrqType) { this.rrqType = rrqType; }
}
