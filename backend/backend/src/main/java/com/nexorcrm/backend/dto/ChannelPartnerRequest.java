package com.nexorcrm.backend.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class ChannelPartnerRequest {

    private String channelPartnerType;

    @NotBlank(message = "Company Name is required")
    @Size(max = 200, message = "Company Name must be at most 200 characters")
    private String companyName;

    @NotBlank(message = "Owner/Partner Name is required")
    @Size(max = 200, message = "Owner/Partner Name must be at most 200 characters")
    private String partnerName;

    @NotBlank(message = "Mobile Number is required")
    @Size(max = 32, message = "Mobile Number must be at most 32 characters")
    private String mobile;

    private String officeLandlineNumber;

    @NotBlank(message = "Email Address is required")
    @Email(message = "Email Address is invalid")
    @Size(max = 190, message = "Email Address must be at most 190 characters")
    private String emailAddress;

    private String companyRegistrationNumber;
    private String registeredAddress;
    private String communicationAddress;
    private String message;
    private String websiteUrl;
    private String aadhaarNumber;
    private String aadhaarCopyName;
    private String panCompany;
    private String panCopyName;
    private String gstRegistrationNumber;
    private String gstCopyName;
    private String reraRegistrationNumber;
    private String reraCopyName;
    private String beneficiaryBankName;
    private String bankAccountNo;
    private String beneficiaryName;
    private String ifscCode;
    private String status;

    public String getChannelPartnerType() {
        return channelPartnerType;
    }

    public void setChannelPartnerType(String channelPartnerType) {
        this.channelPartnerType = channelPartnerType;
    }

    public String getCompanyName() {
        return companyName;
    }

    public void setCompanyName(String companyName) {
        this.companyName = companyName;
    }

    public String getPartnerName() {
        return partnerName;
    }

    public void setPartnerName(String partnerName) {
        this.partnerName = partnerName;
    }

    public String getMobile() {
        return mobile;
    }

    public void setMobile(String mobile) {
        this.mobile = mobile;
    }

    public String getOfficeLandlineNumber() {
        return officeLandlineNumber;
    }

    public void setOfficeLandlineNumber(String officeLandlineNumber) {
        this.officeLandlineNumber = officeLandlineNumber;
    }

    public String getEmailAddress() {
        return emailAddress;
    }

    public void setEmailAddress(String emailAddress) {
        this.emailAddress = emailAddress;
    }

    public String getCompanyRegistrationNumber() {
        return companyRegistrationNumber;
    }

    public void setCompanyRegistrationNumber(String companyRegistrationNumber) {
        this.companyRegistrationNumber = companyRegistrationNumber;
    }

    public String getRegisteredAddress() {
        return registeredAddress;
    }

    public void setRegisteredAddress(String registeredAddress) {
        this.registeredAddress = registeredAddress;
    }

    public String getCommunicationAddress() {
        return communicationAddress;
    }

    public void setCommunicationAddress(String communicationAddress) {
        this.communicationAddress = communicationAddress;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getWebsiteUrl() {
        return websiteUrl;
    }

    public void setWebsiteUrl(String websiteUrl) {
        this.websiteUrl = websiteUrl;
    }

    public String getAadhaarNumber() {
        return aadhaarNumber;
    }

    public void setAadhaarNumber(String aadhaarNumber) {
        this.aadhaarNumber = aadhaarNumber;
    }

    public String getAadhaarCopyName() {
        return aadhaarCopyName;
    }

    public void setAadhaarCopyName(String aadhaarCopyName) {
        this.aadhaarCopyName = aadhaarCopyName;
    }

    public String getPanCompany() {
        return panCompany;
    }

    public void setPanCompany(String panCompany) {
        this.panCompany = panCompany;
    }

    public String getPanCopyName() {
        return panCopyName;
    }

    public void setPanCopyName(String panCopyName) {
        this.panCopyName = panCopyName;
    }

    public String getGstRegistrationNumber() {
        return gstRegistrationNumber;
    }

    public void setGstRegistrationNumber(String gstRegistrationNumber) {
        this.gstRegistrationNumber = gstRegistrationNumber;
    }

    public String getGstCopyName() {
        return gstCopyName;
    }

    public void setGstCopyName(String gstCopyName) {
        this.gstCopyName = gstCopyName;
    }

    public String getReraRegistrationNumber() {
        return reraRegistrationNumber;
    }

    public void setReraRegistrationNumber(String reraRegistrationNumber) {
        this.reraRegistrationNumber = reraRegistrationNumber;
    }

    public String getReraCopyName() {
        return reraCopyName;
    }

    public void setReraCopyName(String reraCopyName) {
        this.reraCopyName = reraCopyName;
    }

    public String getBeneficiaryBankName() {
        return beneficiaryBankName;
    }

    public void setBeneficiaryBankName(String beneficiaryBankName) {
        this.beneficiaryBankName = beneficiaryBankName;
    }

    public String getBankAccountNo() {
        return bankAccountNo;
    }

    public void setBankAccountNo(String bankAccountNo) {
        this.bankAccountNo = bankAccountNo;
    }

    public String getBeneficiaryName() {
        return beneficiaryName;
    }

    public void setBeneficiaryName(String beneficiaryName) {
        this.beneficiaryName = beneficiaryName;
    }

    public String getIfscCode() {
        return ifscCode;
    }

    public void setIfscCode(String ifscCode) {
        this.ifscCode = ifscCode;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}
