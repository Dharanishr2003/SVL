package com.nexorcrm.backend.dto;

import jakarta.validation.constraints.NotBlank;
import com.nexorcrm.backend.validation.ValidPhoneNumber;
import java.time.LocalDate;

public class EmployeeRequest {

    @NotBlank
    private String name;

    private String email;
    private String countryCode;
    @ValidPhoneNumber
    private String phone;
    private String dept;
    private String institution;
    private String institutionCategory;
    private String institutionType;
    private String userDepartmentName;
    private String departmentName;
    private String team;
    private String designation;
    private LocalDate joinDate;
    private String status;
    private String img;
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
	public String getPhone() {
		return phone;
	}
	public void setPhone(String phone) {
		this.phone = phone;
	}
	public String getDept() {
		return dept;
	}
	public void setDept(String dept) {
		this.dept = dept;
	}
	public String getInstitution() {
		return institution;
	}
	public void setInstitution(String institution) {
		this.institution = institution;
	}
	public String getInstitutionCategory() {
		return institutionCategory;
	}
	public void setInstitutionCategory(String institutionCategory) {
		this.institutionCategory = institutionCategory;
	}
	public String getInstitutionType() {
		return institutionType;
	}
	public void setInstitutionType(String institutionType) {
		this.institutionType = institutionType;
	}
	public String getUserDepartmentName() {
		return userDepartmentName;
	}
	public void setUserDepartmentName(String userDepartmentName) {
		this.userDepartmentName = userDepartmentName;
	}
	public String getDepartmentName() {
		return departmentName;
	}
	public void setDepartmentName(String departmentName) {
		this.departmentName = departmentName;
	}
	public String getTeam() {
		return team;
	}
	public void setTeam(String team) {
		this.team = team;
	}
	public String getDesignation() {
		return designation;
	}
	public void setDesignation(String designation) {
		this.designation = designation;
	}
	public LocalDate getJoinDate() {
		return joinDate;
	}
	public void setJoinDate(LocalDate joinDate) {
		this.joinDate = joinDate;
	}
	public String getStatus() {
		return status;
	}
	public void setStatus(String status) {
		this.status = status;
	}
	public String getImg() {
		return img;
	}
	public void setImg(String img) {
		this.img = img;
	}

    
}
