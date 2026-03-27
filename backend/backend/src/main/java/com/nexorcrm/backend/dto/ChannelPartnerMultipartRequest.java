package com.nexorcrm.backend.dto;

import org.springframework.web.multipart.MultipartFile;

public class ChannelPartnerMultipartRequest {
    private String channelPartnerType;
    private String companyName;
    private String partnerName;
    private String mobile;
    private String officeLandlineNumber;
    private String emailAddress;
    private String companyRegistrationNumber;
    private String registeredAddress;
    private String communicationAddress;
    private String message;
    private String websiteUrl;
    private String aadhaarNumber;
    private String panCompany;
    private String gstRegistrationNumber;
    private String reraRegistrationNumber;
    private String beneficiaryBankName;
    private String bankAccountNo;
    private String beneficiaryName;
    private String ifscCode;
    private String status;

    private MultipartFile aadhaarCopy;
    private MultipartFile panCopy;
    private MultipartFile gstCopy;
    private MultipartFile reraCopy;

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
    public String getPanCompany() { return panCompany; }
    public void setPanCompany(String panCompany) { this.panCompany = panCompany; }
    public String getGstRegistrationNumber() { return gstRegistrationNumber; }
    public void setGstRegistrationNumber(String gstRegistrationNumber) { this.gstRegistrationNumber = gstRegistrationNumber; }
    public String getReraRegistrationNumber() { return reraRegistrationNumber; }
    public void setReraRegistrationNumber(String reraRegistrationNumber) { this.reraRegistrationNumber = reraRegistrationNumber; }
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
    public MultipartFile getAadhaarCopy() { return aadhaarCopy; }
    public void setAadhaarCopy(MultipartFile aadhaarCopy) { this.aadhaarCopy = aadhaarCopy; }
    public MultipartFile getPanCopy() { return panCopy; }
    public void setPanCopy(MultipartFile panCopy) { this.panCopy = panCopy; }
    public MultipartFile getGstCopy() { return gstCopy; }
    public void setGstCopy(MultipartFile gstCopy) { this.gstCopy = gstCopy; }
    public MultipartFile getReraCopy() { return reraCopy; }
    public void setReraCopy(MultipartFile reraCopy) { this.reraCopy = reraCopy; }
}
