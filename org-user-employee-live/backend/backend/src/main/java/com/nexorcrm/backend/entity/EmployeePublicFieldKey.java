package com.nexorcrm.backend.entity;

import java.time.LocalDate;
import java.util.Locale;
import java.util.function.BiConsumer;
import java.util.function.Function;

public enum EmployeePublicFieldKey {
    EMPLOYEE_CODE("Employee Code", EmployeePublicFieldInputType.TEXT, false, Employee::getEmployeeCode, (e, v) -> e.setEmployeeCode(trimToNull(v))),
    NAME("Full Name", EmployeePublicFieldInputType.TEXT, true, Employee::getName, (e, v) -> e.setName(trimToNull(v))),
    EMAIL("Email", EmployeePublicFieldInputType.EMAIL, false, Employee::getEmail, (e, v) -> e.setEmail(trimToNull(v))),
    COUNTRY_CODE("Country Code", EmployeePublicFieldInputType.TEXT, true, Employee::getCountryCode, (e, v) -> e.setCountryCode(trimToNull(v))),
    PHONE("Phone", EmployeePublicFieldInputType.PHONE, true, Employee::getPhone, (e, v) -> e.setPhone(trimToNull(v))),
    DEPT("Dept", EmployeePublicFieldInputType.TEXT, true, Employee::getDept, (e, v) -> e.setDept(trimToNull(v))),
    INSTITUTION("Institution", EmployeePublicFieldInputType.TEXT, false, Employee::getInstitution, (e, v) -> e.setInstitution(trimToNull(v))),
    DEPARTMENT_NAME("Department Name", EmployeePublicFieldInputType.TEXT, true, Employee::getDepartmentName, (e, v) -> e.setDepartmentName(trimToNull(v))),
    TEAM("Team", EmployeePublicFieldInputType.TEXT, true, Employee::getTeam, (e, v) -> e.setTeam(trimToNull(v))),
    DESIGNATION("Designation", EmployeePublicFieldInputType.TEXT, true, Employee::getDesignation, (e, v) -> e.setDesignation(trimToNull(v))),

    HEAD_OFFICE_ID("Head Office", EmployeePublicFieldInputType.NUMBER, false, e -> toStringOrNull(e.getHeadOfficeId()), (e, v) -> e.setHeadOfficeId(parseLongOrNull(v))),
    BRANCH_ID("Branch", EmployeePublicFieldInputType.NUMBER, false, e -> toStringOrNull(e.getBranchId()), (e, v) -> e.setBranchId(parseLongOrNull(v))),
    DEPARTMENT_MASTER_ID("Department", EmployeePublicFieldInputType.NUMBER, false, e -> toStringOrNull(e.getDepartmentMasterId()), (e, v) -> e.setDepartmentMasterId(parseLongOrNull(v))),
    DESIGNATION_MASTER_ID("Designation", EmployeePublicFieldInputType.NUMBER, false, e -> toStringOrNull(e.getDesignationMasterId()), (e, v) -> e.setDesignationMasterId(parseLongOrNull(v))),

    EMPLOYEE_ID_NUMBER("Employee ID Number", EmployeePublicFieldInputType.TEXT, false, Employee::getEmployeeIdNumber, (e, v) -> e.setEmployeeIdNumber(trimToNull(v))),
    FATHER_NAME("Father Name", EmployeePublicFieldInputType.TEXT, true, Employee::getFatherName, (e, v) -> e.setFatherName(trimToNull(v))),
    MOTHER_NAME("Mother Name", EmployeePublicFieldInputType.TEXT, true, Employee::getMotherName, (e, v) -> e.setMotherName(trimToNull(v))),
    PERSONAL_CONTACT_NUMBER("Personal Contact", EmployeePublicFieldInputType.PHONE, true, Employee::getPersonalContactNumber, (e, v) -> e.setPersonalContactNumber(trimToNull(v))),
    ALTERNATE_CONTACT_NUMBER("Alternate Contact", EmployeePublicFieldInputType.PHONE, true, Employee::getAlternateContactNumber, (e, v) -> e.setAlternateContactNumber(trimToNull(v))),
    LOCATION("Location", EmployeePublicFieldInputType.TEXT, true, Employee::getLocation, (e, v) -> e.setLocation(trimToNull(v))),
    PIN_CODE("Pin Code", EmployeePublicFieldInputType.TEXT, true, Employee::getPinCode, (e, v) -> e.setPinCode(trimToNull(v))),
    STATE("State", EmployeePublicFieldInputType.TEXT, true, Employee::getState, (e, v) -> e.setState(trimToNull(v))),
    CURRENT_ADDRESS("Current Address", EmployeePublicFieldInputType.TEXTAREA, true, Employee::getCurrentAddress, (e, v) -> e.setCurrentAddress(trimToNull(v))),
    PERMANENT_ADDRESS("Permanent Address", EmployeePublicFieldInputType.TEXTAREA, true, Employee::getPermanentAddress, (e, v) -> e.setPermanentAddress(trimToNull(v))),
    PERSONAL_EMAIL("Personal Email", EmployeePublicFieldInputType.EMAIL, true, Employee::getPersonalEmail, (e, v) -> e.setPersonalEmail(trimToNull(v))),
    OFFICIAL_EMAIL("Official Email", EmployeePublicFieldInputType.EMAIL, true, Employee::getOfficialEmail, (e, v) -> e.setOfficialEmail(trimToNull(v))),

    DATE_OF_BIRTH("Date of Birth", EmployeePublicFieldInputType.DATE, true, e -> toStringOrNull(e.getDateOfBirth()), (e, v) -> e.setDateOfBirth(parseDateOrNull(v))),
    GENDER("Gender", EmployeePublicFieldInputType.TEXT, true, Employee::getGender, (e, v) -> e.setGender(trimToNull(v))),
    MARITAL_STATUS("Marital Status", EmployeePublicFieldInputType.TEXT, true, Employee::getMaritalStatus, (e, v) -> e.setMaritalStatus(trimToNull(v))),
    SPOUSE_NAME("Spouse Name", EmployeePublicFieldInputType.TEXT, true, Employee::getSpouseName, (e, v) -> e.setSpouseName(trimToNull(v))),
    BLOOD_GROUP("Blood Group", EmployeePublicFieldInputType.TEXT, true, Employee::getBloodGroup, (e, v) -> e.setBloodGroup(trimToNull(v))),
    PAN_NUMBER("PAN Number", EmployeePublicFieldInputType.TEXT, true, Employee::getPanCardNo, (e, v) -> e.setPanCardNo(trimToNull(v))),
    AADHAAR_NUMBER("Aadhaar Number", EmployeePublicFieldInputType.TEXT, true, Employee::getAadharCardNo, (e, v) -> e.setAadharCardNo(trimToNull(v))),

    BANK_ACCOUNT_HOLDER_NAME("Bank A/C Holder Name", EmployeePublicFieldInputType.TEXT, true, Employee::getBankAccountHolderName, (e, v) -> e.setBankAccountHolderName(trimToNull(v))),
    BANK_ACCOUNT_NUMBER("Bank A/C Number", EmployeePublicFieldInputType.TEXT, true, Employee::getBankAccountNumber, (e, v) -> e.setBankAccountNumber(trimToNull(v))),
    BANK_IFSC("IFSC Code", EmployeePublicFieldInputType.TEXT, true, Employee::getIfscCode, (e, v) -> e.setIfscCode(trimToNull(v))),
    BANK_NAME_BRANCH("Bank Name & Branch", EmployeePublicFieldInputType.TEXT, true, Employee::getBankAndBranch, (e, v) -> e.setBankAndBranch(trimToNull(v))),

    EMPLOYMENT_DETAILS_1("Employment Details 1", EmployeePublicFieldInputType.TEXTAREA, true, Employee::getEmploymentDetails1, (e, v) -> e.setEmploymentDetails1(trimToNull(v))),
    EMPLOYMENT_DETAILS_2("Employment Details 2", EmployeePublicFieldInputType.TEXTAREA, true, Employee::getEmploymentDetails2, (e, v) -> e.setEmploymentDetails2(trimToNull(v))),
    GRADUATION_DETAILS("Graduation Details", EmployeePublicFieldInputType.TEXT, true, Employee::getGraduationDetails, (e, v) -> e.setGraduationDetails(trimToNull(v))),
    HSC_MARK_AND_YEAR("HSC Mark & Year", EmployeePublicFieldInputType.TEXT, true, Employee::getHscMarkAndYear, (e, v) -> e.setHscMarkAndYear(trimToNull(v))),
    SSLC_MARK_AND_YEAR("SSLC Mark & Year", EmployeePublicFieldInputType.TEXT, true, Employee::getSslcMarkAndYear, (e, v) -> e.setSslcMarkAndYear(trimToNull(v))),

    FRIEND_REF_NAME_1("Friend Ref Name 1", EmployeePublicFieldInputType.TEXT, true, Employee::getFriendRefName1, (e, v) -> e.setFriendRefName1(trimToNull(v))),
    FRIEND_REF_CONTACT_1("Friend Ref Contact 1", EmployeePublicFieldInputType.TEXT, true, Employee::getFriendRefContact1, (e, v) -> e.setFriendRefContact1(trimToNull(v))),
    FRIEND_REF_NAME_2("Friend Ref Name 2", EmployeePublicFieldInputType.TEXT, true, Employee::getFriendRefName2, (e, v) -> e.setFriendRefName2(trimToNull(v))),
    FRIEND_REF_CONTACT_2("Friend Ref Contact 2", EmployeePublicFieldInputType.TEXT, true, Employee::getFriendRefContact2, (e, v) -> e.setFriendRefContact2(trimToNull(v))),

    EMERGENCY_CONTACT_NAME_1("Emergency Contact Name 1", EmployeePublicFieldInputType.TEXT, true, Employee::getEmergencyContactName1, (e, v) -> e.setEmergencyContactName1(trimToNull(v))),
    EMERGENCY_CONTACT_RELATION_1("Emergency Contact Relation 1", EmployeePublicFieldInputType.TEXT, true, Employee::getEmergencyContactRelation1, (e, v) -> e.setEmergencyContactRelation1(trimToNull(v))),
    EMERGENCY_CONTACT_PHONE_1("Emergency Contact Phone 1", EmployeePublicFieldInputType.PHONE, true, Employee::getEmergencyContactPhone1, (e, v) -> e.setEmergencyContactPhone1(trimToNull(v))),
    EMERGENCY_CONTACT_NAME_2("Emergency Contact Name 2", EmployeePublicFieldInputType.TEXT, true, Employee::getEmergencyContactName2, (e, v) -> e.setEmergencyContactName2(trimToNull(v))),
    EMERGENCY_CONTACT_RELATION_2("Emergency Contact Relation 2", EmployeePublicFieldInputType.TEXT, true, Employee::getEmergencyContactRelation2, (e, v) -> e.setEmergencyContactRelation2(trimToNull(v))),
    EMERGENCY_CONTACT_PHONE_2("Emergency Contact Phone 2", EmployeePublicFieldInputType.PHONE, true, Employee::getEmergencyContactPhone2, (e, v) -> e.setEmergencyContactPhone2(trimToNull(v))),

    BRANCH_TO_JOIN("Branch To Join", EmployeePublicFieldInputType.TEXT, true, Employee::getBranchToJoin, (e, v) -> e.setBranchToJoin(trimToNull(v))),
    PLATFORM_SOURCE("Platform Source", EmployeePublicFieldInputType.TEXT, true, Employee::getPlatformSource, (e, v) -> e.setPlatformSource(trimToNull(v))),
    PF_UAN("PF UAN", EmployeePublicFieldInputType.TEXT, true, Employee::getPfUan, (e, v) -> e.setPfUan(trimToNull(v))),
    ESI_NO("ESI No", EmployeePublicFieldInputType.TEXT, true, Employee::getEsiNo, (e, v) -> e.setEsiNo(trimToNull(v))),

    DECLARATION_DATE("Declaration Date", EmployeePublicFieldInputType.DATE, true, e -> toStringOrNull(e.getDeclarationDate()), (e, v) -> e.setDeclarationDate(parseDateOrNull(v))),
    DECLARATION_PLACE("Declaration Place", EmployeePublicFieldInputType.TEXT, true, Employee::getDeclarationPlace, (e, v) -> e.setDeclarationPlace(trimToNull(v))),

    JOIN_DATE("Join Date", EmployeePublicFieldInputType.DATE, true, e -> toStringOrNull(e.getJoinDate()), (e, v) -> e.setJoinDate(parseDateOrNull(v))),
    STATUS("Status", EmployeePublicFieldInputType.TEXT, false, Employee::getStatus, (e, v) -> e.setStatus(trimToNull(v)));

    private final String label;
    private final EmployeePublicFieldInputType inputType;
    private final boolean editable;
    private final Function<Employee, String> getter;
    private final BiConsumer<Employee, String> setter;

    EmployeePublicFieldKey(String label,
                           EmployeePublicFieldInputType inputType,
                           boolean editable,
                           Function<Employee, String> getter,
                           BiConsumer<Employee, String> setter) {
        this.label = label;
        this.inputType = inputType;
        this.editable = editable;
        this.getter = getter;
        this.setter = setter;
    }

    public String getKey() {
        return name();
    }

    public String getLabel() {
        return label;
    }

    public EmployeePublicFieldInputType getInputType() {
        return inputType;
    }

    public boolean isEditable() {
        return editable;
    }

    public String getValue(Employee employee) {
        return getter == null ? null : getter.apply(employee);
    }

    public void applyValue(Employee employee, String rawValue) {
        if (setter != null) {
            setter.accept(employee, rawValue);
        }
    }

    public static EmployeePublicFieldKey fromKey(String key) {
        if (key == null) return null;
        try {
            return EmployeePublicFieldKey.valueOf(key.trim().toUpperCase(Locale.ROOT));
        } catch (Exception e) {
            return null;
        }
    }

    private static String trimToNull(String value) {
        if (value == null) return null;
        String t = value.trim();
        return t.isEmpty() ? null : t;
    }

    private static Long parseLongOrNull(String value) {
        String t = trimToNull(value);
        if (t == null) return null;
        try {
            return Long.parseLong(t);
        } catch (Exception e) {
            return null;
        }
    }

    private static LocalDate parseDateOrNull(String value) {
        String t = trimToNull(value);
        if (t == null) return null;
        try {
            return LocalDate.parse(t);
        } catch (Exception e) {
            return null;
        }
    }

    private static String toStringOrNull(Object value) {
        return value == null ? null : String.valueOf(value);
    }
}
