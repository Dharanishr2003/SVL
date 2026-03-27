package com.nexorcrm.backend.dto;

import java.time.LocalDate;

public class VendorResponse {

    private Long id;
    private String vendorName;
    private String contactPerson;
    private String phone;
    private String email;
    private String address;
    private String materialsSupplied;
    private String countryCode;
    private String vendorTypeIds;
    private String productIds;
    private String brandIds;
    private String dealsWith;
    private String internalRepresentative;
    private LocalDate relationshipSince;
    private String companyWebsite;
    private String countryOfRegistration;
    private String companyRegistrationNo;
    private String gstNumber;
    private String panNumber;
    private String companyAddress;
    private String status;
    private String officialEmail;
    private String secondaryEmail;

    // Getters
    public Long getId() { return id; }
    public String getVendorName() { return vendorName; }
    public String getContactPerson() { return contactPerson; }
    public String getPhone() { return phone; }
    public String getEmail() { return email; }
    public String getAddress() { return address; }
    public String getMaterialsSupplied() { return materialsSupplied; }
    public String getCountryCode() { return countryCode; }
    public String getVendorTypeIds() { return vendorTypeIds; }
    public String getProductIds() { return productIds; }
    public String getBrandIds() { return brandIds; }
    public String getDealsWith() { return dealsWith; }
    public String getInternalRepresentative() { return internalRepresentative; }
    public LocalDate getRelationshipSince() { return relationshipSince; }
    public String getCompanyWebsite() { return companyWebsite; }
    public String getCountryOfRegistration() { return countryOfRegistration; }
    public String getCompanyRegistrationNo() { return companyRegistrationNo; }
    public String getGstNumber() { return gstNumber; }
    public String getPanNumber() { return panNumber; }
    public String getCompanyAddress() { return companyAddress; }
    public String getStatus() { return status; }
    public String getOfficialEmail() { return officialEmail; }
    public String getSecondaryEmail() { return secondaryEmail; }

    // Setters
    public void setId(Long id) { this.id = id; }
    public void setVendorName(String vendorName) { this.vendorName = vendorName; }
    public void setContactPerson(String contactPerson) { this.contactPerson = contactPerson; }
    public void setPhone(String phone) { this.phone = phone; }
    public void setEmail(String email) { this.email = email; }
    public void setAddress(String address) { this.address = address; }
    public void setMaterialsSupplied(String materialsSupplied) { this.materialsSupplied = materialsSupplied; }
    public void setCountryCode(String countryCode) { this.countryCode = countryCode; }
    public void setVendorTypeIds(String vendorTypeIds) { this.vendorTypeIds = vendorTypeIds; }
    public void setProductIds(String productIds) { this.productIds = productIds; }
    public void setBrandIds(String brandIds) { this.brandIds = brandIds; }
    public void setDealsWith(String dealsWith) { this.dealsWith = dealsWith; }
    public void setInternalRepresentative(String internalRepresentative) { this.internalRepresentative = internalRepresentative; }
    public void setRelationshipSince(LocalDate relationshipSince) { this.relationshipSince = relationshipSince; }
    public void setCompanyWebsite(String companyWebsite) { this.companyWebsite = companyWebsite; }
    public void setCountryOfRegistration(String countryOfRegistration) { this.countryOfRegistration = countryOfRegistration; }
    public void setCompanyRegistrationNo(String companyRegistrationNo) { this.companyRegistrationNo = companyRegistrationNo; }
    public void setGstNumber(String gstNumber) { this.gstNumber = gstNumber; }
    public void setPanNumber(String panNumber) { this.panNumber = panNumber; }
    public void setCompanyAddress(String companyAddress) { this.companyAddress = companyAddress; }
    public void setStatus(String status) { this.status = status; }
    public void setOfficialEmail(String officialEmail) { this.officialEmail = officialEmail; }
    public void setSecondaryEmail(String secondaryEmail) { this.secondaryEmail = secondaryEmail; }
}
