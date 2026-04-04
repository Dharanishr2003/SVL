package com.nexorcrm.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.util.List;

public class UpdateUserGroupRequest {

    @NotBlank
    @Size(min = 2, max = 120)
    private String name;

    private String institutionName;
    private String departmentName;
    private List<String> teamNames;
    private List<String> pageKeys;
    private String memberScope;

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getInstitutionName() {
        return institutionName;
    }

    public void setInstitutionName(String institutionName) {
        this.institutionName = institutionName;
    }

    public String getDepartmentName() {
        return departmentName;
    }

    public void setDepartmentName(String departmentName) {
        this.departmentName = departmentName;
    }

    public List<String> getTeamNames() {
        return teamNames;
    }

    public void setTeamNames(List<String> teamNames) {
        this.teamNames = teamNames;
    }

    public List<String> getPageKeys() {
        return pageKeys;
    }

    public void setPageKeys(List<String> pageKeys) {
        this.pageKeys = pageKeys;
    }

    public String getMemberScope() {
        return memberScope;
    }

    public void setMemberScope(String memberScope) {
        this.memberScope = memberScope;
    }
}
