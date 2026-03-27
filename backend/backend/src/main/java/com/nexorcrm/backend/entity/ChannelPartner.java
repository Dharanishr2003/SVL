package com.nexorcrm.backend.entity;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "channel_partners")
public class ChannelPartner {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "cp_id", nullable = false, unique = true, length = 64)
    private String cpId;

    @Column(name = "channel_partner_type", length = 80)
    private String channelPartnerType;

    @Column(name = "company_name", nullable = false, length = 200)
    private String companyName;

    @Column(name = "partner_name", nullable = false, length = 200)
    private String partnerName;

    @Column(name = "mobile", nullable = false, length = 32)
    private String mobile;

    @Column(name = "office_landline_number", length = 32)
    private String officeLandlineNumber;

    @Column(name = "email_address", nullable = false, length = 190)
    private String emailAddress;

    @Column(name = "company_registration_number", length = 120)
    private String companyRegistrationNumber;

    @Column(name = "registered_address", columnDefinition = "text")
    private String registeredAddress;

    @Column(name = "communication_address", columnDefinition = "text")
    private String communicationAddress;

    @Column(name = "message", columnDefinition = "text")
    private String message;

    @Column(name = "website_url", length = 255)
    private String websiteUrl;

    @Column(name = "aadhaar_number", length = 32)
    private String aadhaarNumber;

    @Column(name = "aadhaar_copy_name", length = 255)
    private String aadhaarCopyName;

    @Column(name = "pan_company", length = 32)
    private String panCompany;

    @Column(name = "pan_copy_name", length = 255)
    private String panCopyName;

    @Column(name = "gst_registration_number", length = 64)
    private String gstRegistrationNumber;

    @Column(name = "gst_copy_name", length = 255)
    private String gstCopyName;

    @Column(name = "rera_registration_number", length = 120)
    private String reraRegistrationNumber;

    @Column(name = "rera_copy_name", length = 255)
    private String reraCopyName;

    @Column(name = "beneficiary_bank_name", length = 160)
    private String beneficiaryBankName;

    @Column(name = "bank_account_no", length = 80)
    private String bankAccountNo;

    @Column(name = "beneficiary_name", length = 160)
    private String beneficiaryName;

    @Column(name = "ifsc_code", length = 40)
    private String ifscCode;

    @Column(name = "status", nullable = false, length = 60)
    private String status = "Registered";

    @Column(name = "lead_owner_user_id")
    private Long leadOwnerUserId;

    @Column(name = "lead_owner_username", length = 80)
    private String leadOwnerUsername;

    @Column(name = "is_deleted", nullable = false)
    private boolean deleted = false;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    void onCreate() {
        if (createdAt == null) createdAt = LocalDateTime.now();
        if (status == null || status.isBlank()) status = "Registered";
    }

    @PreUpdate
    void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public String getCpId() { return cpId; }
    public void setCpId(String cpId) { this.cpId = cpId; }
    public String getChannelPartnerType() { return channelPartnerType; }
    public void setChannelPartnerType(String channelPartnerType) { this.channelPartnerType = channelPartnerType; }
    public String getCompanyName() { return companyName; }
    public void setCompanyName(String companyName) { this.companyName = companyName; }
    public String getPartnerName() { return partnerName; }
    public void setPartnerName(String partnerName) { this.partnerName = partnerName; }
    public String getMobile() { return mobile; }
    public void setMobile(String mobile) { this.mobile = mobile; }
    public String getOfficeLandlineNumber() { return officeLandlineNumber; }
    public void setOfficeLandlineNumber(String officeLandlineNumber) { this.officeLandlineNumber = officeLandlineNumber; }
    public String getEmailAddress() { return emailAddress; }
    public void setEmailAddress(String emailAddress) { this.emailAddress = emailAddress; }
    public String getCompanyRegistrationNumber() { return companyRegistrationNumber; }
    public void setCompanyRegistrationNumber(String companyRegistrationNumber) { this.companyRegistrationNumber = companyRegistrationNumber; }
    public String getRegisteredAddress() { return registeredAddress; }
    public void setRegisteredAddress(String registeredAddress) { this.registeredAddress = registeredAddress; }
    public String getCommunicationAddress() { return communicationAddress; }
    public void setCommunicationAddress(String communicationAddress) { this.communicationAddress = communicationAddress; }
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
    public String getWebsiteUrl() { return websiteUrl; }
    public void setWebsiteUrl(String websiteUrl) { this.websiteUrl = websiteUrl; }
    public String getAadhaarNumber() { return aadhaarNumber; }
    public void setAadhaarNumber(String aadhaarNumber) { this.aadhaarNumber = aadhaarNumber; }
    public String getAadhaarCopyName() { return aadhaarCopyName; }
    public void setAadhaarCopyName(String aadhaarCopyName) { this.aadhaarCopyName = aadhaarCopyName; }
    public String getPanCompany() { return panCompany; }
    public void setPanCompany(String panCompany) { this.panCompany = panCompany; }
    public String getPanCopyName() { return panCopyName; }
    public void setPanCopyName(String panCopyName) { this.panCopyName = panCopyName; }
    public String getGstRegistrationNumber() { return gstRegistrationNumber; }
    public void setGstRegistrationNumber(String gstRegistrationNumber) { this.gstRegistrationNumber = gstRegistrationNumber; }
    public String getGstCopyName() { return gstCopyName; }
    public void setGstCopyName(String gstCopyName) { this.gstCopyName = gstCopyName; }
    public String getReraRegistrationNumber() { return reraRegistrationNumber; }
    public void setReraRegistrationNumber(String reraRegistrationNumber) { this.reraRegistrationNumber = reraRegistrationNumber; }
    public String getReraCopyName() { return reraCopyName; }
    public void setReraCopyName(String reraCopyName) { this.reraCopyName = reraCopyName; }
    public String getBeneficiaryBankName() { return beneficiaryBankName; }
    public void setBeneficiaryBankName(String beneficiaryBankName) { this.beneficiaryBankName = beneficiaryBankName; }
    public String getBankAccountNo() { return bankAccountNo; }
    public void setBankAccountNo(String bankAccountNo) { this.bankAccountNo = bankAccountNo; }
    public String getBeneficiaryName() { return beneficiaryName; }
    public void setBeneficiaryName(String beneficiaryName) { this.beneficiaryName = beneficiaryName; }
    public String getIfscCode() { return ifscCode; }
    public void setIfscCode(String ifscCode) { this.ifscCode = ifscCode; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public Long getLeadOwnerUserId() { return leadOwnerUserId; }
    public void setLeadOwnerUserId(Long leadOwnerUserId) { this.leadOwnerUserId = leadOwnerUserId; }
    public String getLeadOwnerUsername() { return leadOwnerUsername; }
    public void setLeadOwnerUsername(String leadOwnerUsername) { this.leadOwnerUsername = leadOwnerUsername; }
    public boolean isDeleted() { return deleted; }
    public void setDeleted(boolean deleted) { this.deleted = deleted; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
}
 
