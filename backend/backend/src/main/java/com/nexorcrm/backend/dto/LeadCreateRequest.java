package com.nexorcrm.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class LeadCreateRequest {

    @NotBlank(message = "Name is required")
    @Size(max = 200, message = "Name must be at most 200 characters")
    private String name;

    @Size(max = 190, message = "Email must be at most 190 characters")
    private String email;

    @Size(max = 20, message = "Country Code must be at most 20 characters")
    private String countryCode;

    @NotBlank(message = "Mobile is required")
    @Size(max = 40, message = "Mobile must be at most 40 characters")
    private String mobile;

    @NotBlank(message = "Primary Source is required")
    @Size(max = 160, message = "Primary Source must be at most 160 characters")
    private String primarySource;

    @Size(max = 160, message = "Secondary Source must be at most 160 characters")
    private String secondarySource;

    @Size(max = 160, message = "Tertiary Source must be at most 160 characters")
    private String tertiarySource;

    @Size(max = 200, message = "Project Name must be at most 200 characters")
    private String projectName;

    private Long channelPartnerId;

    private Long leadGroupId;

    @Size(max = 200, message = "Channel Partner Name must be at most 200 characters")
    private String channelPartnerName;

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getCountryCode() {
        return countryCode;
    }

    public void setCountryCode(String countryCode) {
        this.countryCode = countryCode;
    }

    public String getMobile() {
        return mobile;
    }

    public void setMobile(String mobile) {
        this.mobile = mobile;
    }

    public String getPrimarySource() {
        return primarySource;
    }

    public void setPrimarySource(String primarySource) {
        this.primarySource = primarySource;
    }

    public String getSecondarySource() {
        return secondarySource;
    }

    public void setSecondarySource(String secondarySource) {
        this.secondarySource = secondarySource;
    }

    public String getTertiarySource() {
        return tertiarySource;
    }

    public void setTertiarySource(String tertiarySource) {
        this.tertiarySource = tertiarySource;
    }

    public String getProjectName() {
        return projectName;
    }

    public void setProjectName(String projectName) {
        this.projectName = projectName;
    }

    public Long getChannelPartnerId() {
        return channelPartnerId;
    }

    public void setChannelPartnerId(Long channelPartnerId) {
        this.channelPartnerId = channelPartnerId;
    }

    public Long getLeadGroupId() {
        return leadGroupId;
    }

    public void setLeadGroupId(Long leadGroupId) {
        this.leadGroupId = leadGroupId;
    }

    public String getChannelPartnerName() {
        return channelPartnerName;
    }

    public void setChannelPartnerName(String channelPartnerName) {
        this.channelPartnerName = channelPartnerName;
    }
}
