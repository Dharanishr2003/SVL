package com.nexorcrm.backend.dto;

import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;

public class EmployeeOnboardRequest {

    private Long headOfficeId;
    private Long branchId;
    private Long departmentMasterId;
    private Long designationMasterId;

    private String nameInCaps;
    private String designation;
    private String employeeIdNumber;
    private String fatherName;
    private String motherName;
    private String personalContactNumber;
    private String alternateContactNumber;
    private String location;
    private String pinCode;
    private String state;
    private String currentAddress;
    private String permanentAddress;

    private String personalEmail;
    private String officialEmail;
    private LocalDate dateOfBirth;
    private LocalDate dateOfJoining;
    private String maritalStatus;
    private String spouseName;
    private String bloodGroup;
    private String panCardNo;
    private String aadharCardNo;

    private String bankAccountHolderName;
    private String bankAccountNumber;
    private String ifscCode;
    private String bankAndBranch;

    private String employmentDetails1;
    private String employmentDetails2;
    private String graduationDetails;
    private String hscMarkAndYear;
    private String sslcMarkAndYear;

    private String emergencyContactName1;
    private String emergencyContactRelation1;
    private String emergencyContactPhone1;
    private String emergencyContactName2;
    private String emergencyContactRelation2;
    private String emergencyContactPhone2;

    private String friendRefName1;
    private String friendRefContact1;
    private String friendRefName2;
    private String friendRefContact2;

    private String branchToJoin;
    private String platformSource;
    private String pfUan;
    private String esiNo;
    private LocalDate declarationDate;
    private String declarationPlace;

    private MultipartFile candidatePhoto;
    private MultipartFile uploadCandidateAadharCard;
    private MultipartFile uploadCandidatePanCard;
    private MultipartFile uploadBankPassBookCopy;
    private MultipartFile uploadExperienceCertificate;
    private MultipartFile uploadGraduationCertificate;
    private MultipartFile uploadGraduationMarksheet;
    private MultipartFile uploadHscMarkSheet;
    private MultipartFile uploadSslcMarkSheet;
    private MultipartFile uploadCommunityCertificate;

    public Long getHeadOfficeId() { return headOfficeId; }
    public void setHeadOfficeId(Long headOfficeId) { this.headOfficeId = headOfficeId; }

    public Long getBranchId() { return branchId; }
    public void setBranchId(Long branchId) { this.branchId = branchId; }

    public Long getDepartmentMasterId() { return departmentMasterId; }
    public void setDepartmentMasterId(Long departmentMasterId) { this.departmentMasterId = departmentMasterId; }

    public Long getDesignationMasterId() { return designationMasterId; }
    public void setDesignationMasterId(Long designationMasterId) { this.designationMasterId = designationMasterId; }

    public String getNameInCaps() { return nameInCaps; }
    public void setNameInCaps(String nameInCaps) { this.nameInCaps = nameInCaps; }

    public String getDesignation() { return designation; }
    public void setDesignation(String designation) { this.designation = designation; }

    public String getEmployeeIdNumber() { return employeeIdNumber; }
    public void setEmployeeIdNumber(String employeeIdNumber) { this.employeeIdNumber = employeeIdNumber; }

    public String getFatherName() { return fatherName; }
    public void setFatherName(String fatherName) { this.fatherName = fatherName; }

    public String getMotherName() { return motherName; }
    public void setMotherName(String motherName) { this.motherName = motherName; }

    public String getPersonalContactNumber() { return personalContactNumber; }
    public void setPersonalContactNumber(String personalContactNumber) { this.personalContactNumber = personalContactNumber; }

    public String getAlternateContactNumber() { return alternateContactNumber; }
    public void setAlternateContactNumber(String alternateContactNumber) { this.alternateContactNumber = alternateContactNumber; }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }

    public String getPinCode() { return pinCode; }
    public void setPinCode(String pinCode) { this.pinCode = pinCode; }

    public String getState() { return state; }
    public void setState(String state) { this.state = state; }

    public String getCurrentAddress() { return currentAddress; }
    public void setCurrentAddress(String currentAddress) { this.currentAddress = currentAddress; }

    public String getPermanentAddress() { return permanentAddress; }
    public void setPermanentAddress(String permanentAddress) { this.permanentAddress = permanentAddress; }

    public String getPersonalEmail() { return personalEmail; }
    public void setPersonalEmail(String personalEmail) { this.personalEmail = personalEmail; }

    public String getOfficialEmail() { return officialEmail; }
    public void setOfficialEmail(String officialEmail) { this.officialEmail = officialEmail; }

    public LocalDate getDateOfBirth() { return dateOfBirth; }
    public void setDateOfBirth(LocalDate dateOfBirth) { this.dateOfBirth = dateOfBirth; }

    public LocalDate getDateOfJoining() { return dateOfJoining; }
    public void setDateOfJoining(LocalDate dateOfJoining) { this.dateOfJoining = dateOfJoining; }

    public String getMaritalStatus() { return maritalStatus; }
    public void setMaritalStatus(String maritalStatus) { this.maritalStatus = maritalStatus; }

    public String getSpouseName() { return spouseName; }
    public void setSpouseName(String spouseName) { this.spouseName = spouseName; }

    public String getBloodGroup() { return bloodGroup; }
    public void setBloodGroup(String bloodGroup) { this.bloodGroup = bloodGroup; }

    public String getPanCardNo() { return panCardNo; }
    public void setPanCardNo(String panCardNo) { this.panCardNo = panCardNo; }

    public String getAadharCardNo() { return aadharCardNo; }
    public void setAadharCardNo(String aadharCardNo) { this.aadharCardNo = aadharCardNo; }

    public String getBankAccountHolderName() { return bankAccountHolderName; }
    public void setBankAccountHolderName(String bankAccountHolderName) { this.bankAccountHolderName = bankAccountHolderName; }

    public String getBankAccountNumber() { return bankAccountNumber; }
    public void setBankAccountNumber(String bankAccountNumber) { this.bankAccountNumber = bankAccountNumber; }

    public String getIfscCode() { return ifscCode; }
    public void setIfscCode(String ifscCode) { this.ifscCode = ifscCode; }

    public String getBankAndBranch() { return bankAndBranch; }
    public void setBankAndBranch(String bankAndBranch) { this.bankAndBranch = bankAndBranch; }

    public String getEmploymentDetails1() { return employmentDetails1; }
    public void setEmploymentDetails1(String employmentDetails1) { this.employmentDetails1 = employmentDetails1; }

    public String getEmploymentDetails2() { return employmentDetails2; }
    public void setEmploymentDetails2(String employmentDetails2) { this.employmentDetails2 = employmentDetails2; }

    public String getGraduationDetails() { return graduationDetails; }
    public void setGraduationDetails(String graduationDetails) { this.graduationDetails = graduationDetails; }

    public String getHscMarkAndYear() { return hscMarkAndYear; }
    public void setHscMarkAndYear(String hscMarkAndYear) { this.hscMarkAndYear = hscMarkAndYear; }

    public String getSslcMarkAndYear() { return sslcMarkAndYear; }
    public void setSslcMarkAndYear(String sslcMarkAndYear) { this.sslcMarkAndYear = sslcMarkAndYear; }

    public String getEmergencyContactName1() { return emergencyContactName1; }
    public void setEmergencyContactName1(String emergencyContactName1) { this.emergencyContactName1 = emergencyContactName1; }

    public String getEmergencyContactRelation1() { return emergencyContactRelation1; }
    public void setEmergencyContactRelation1(String emergencyContactRelation1) { this.emergencyContactRelation1 = emergencyContactRelation1; }

    public String getEmergencyContactPhone1() { return emergencyContactPhone1; }
    public void setEmergencyContactPhone1(String emergencyContactPhone1) { this.emergencyContactPhone1 = emergencyContactPhone1; }

    public String getEmergencyContactName2() { return emergencyContactName2; }
    public void setEmergencyContactName2(String emergencyContactName2) { this.emergencyContactName2 = emergencyContactName2; }

    public String getEmergencyContactRelation2() { return emergencyContactRelation2; }
    public void setEmergencyContactRelation2(String emergencyContactRelation2) { this.emergencyContactRelation2 = emergencyContactRelation2; }

    public String getEmergencyContactPhone2() { return emergencyContactPhone2; }
    public void setEmergencyContactPhone2(String emergencyContactPhone2) { this.emergencyContactPhone2 = emergencyContactPhone2; }

    public String getFriendRefName1() { return friendRefName1; }
    public void setFriendRefName1(String friendRefName1) { this.friendRefName1 = friendRefName1; }

    public String getFriendRefContact1() { return friendRefContact1; }
    public void setFriendRefContact1(String friendRefContact1) { this.friendRefContact1 = friendRefContact1; }

    public String getFriendRefName2() { return friendRefName2; }
    public void setFriendRefName2(String friendRefName2) { this.friendRefName2 = friendRefName2; }

    public String getFriendRefContact2() { return friendRefContact2; }
    public void setFriendRefContact2(String friendRefContact2) { this.friendRefContact2 = friendRefContact2; }

    public String getBranchToJoin() { return branchToJoin; }
    public void setBranchToJoin(String branchToJoin) { this.branchToJoin = branchToJoin; }

    public String getPlatformSource() { return platformSource; }
    public void setPlatformSource(String platformSource) { this.platformSource = platformSource; }

    public String getPfUan() { return pfUan; }
    public void setPfUan(String pfUan) { this.pfUan = pfUan; }

    public String getEsiNo() { return esiNo; }
    public void setEsiNo(String esiNo) { this.esiNo = esiNo; }

    public LocalDate getDeclarationDate() { return declarationDate; }
    public void setDeclarationDate(LocalDate declarationDate) { this.declarationDate = declarationDate; }

    public String getDeclarationPlace() { return declarationPlace; }
    public void setDeclarationPlace(String declarationPlace) { this.declarationPlace = declarationPlace; }

    public MultipartFile getCandidatePhoto() { return candidatePhoto; }
    public void setCandidatePhoto(MultipartFile candidatePhoto) { this.candidatePhoto = candidatePhoto; }

    public MultipartFile getUploadCandidateAadharCard() { return uploadCandidateAadharCard; }
    public void setUploadCandidateAadharCard(MultipartFile uploadCandidateAadharCard) { this.uploadCandidateAadharCard = uploadCandidateAadharCard; }

    public MultipartFile getUploadCandidatePanCard() { return uploadCandidatePanCard; }
    public void setUploadCandidatePanCard(MultipartFile uploadCandidatePanCard) { this.uploadCandidatePanCard = uploadCandidatePanCard; }

    public MultipartFile getUploadBankPassBookCopy() { return uploadBankPassBookCopy; }
    public void setUploadBankPassBookCopy(MultipartFile uploadBankPassBookCopy) { this.uploadBankPassBookCopy = uploadBankPassBookCopy; }

    public MultipartFile getUploadExperienceCertificate() { return uploadExperienceCertificate; }
    public void setUploadExperienceCertificate(MultipartFile uploadExperienceCertificate) { this.uploadExperienceCertificate = uploadExperienceCertificate; }

    public MultipartFile getUploadGraduationCertificate() { return uploadGraduationCertificate; }
    public void setUploadGraduationCertificate(MultipartFile uploadGraduationCertificate) { this.uploadGraduationCertificate = uploadGraduationCertificate; }

    public MultipartFile getUploadGraduationMarksheet() { return uploadGraduationMarksheet; }
    public void setUploadGraduationMarksheet(MultipartFile uploadGraduationMarksheet) { this.uploadGraduationMarksheet = uploadGraduationMarksheet; }

    public MultipartFile getUploadHscMarkSheet() { return uploadHscMarkSheet; }
    public void setUploadHscMarkSheet(MultipartFile uploadHscMarkSheet) { this.uploadHscMarkSheet = uploadHscMarkSheet; }

    public MultipartFile getUploadSslcMarkSheet() { return uploadSslcMarkSheet; }
    public void setUploadSslcMarkSheet(MultipartFile uploadSslcMarkSheet) { this.uploadSslcMarkSheet = uploadSslcMarkSheet; }

    public MultipartFile getUploadCommunityCertificate() { return uploadCommunityCertificate; }
    public void setUploadCommunityCertificate(MultipartFile uploadCommunityCertificate) { this.uploadCommunityCertificate = uploadCommunityCertificate; }
}

