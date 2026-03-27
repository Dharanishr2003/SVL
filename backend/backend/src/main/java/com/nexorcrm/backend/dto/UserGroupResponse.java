package com.nexorcrm.backend.dto;

public class UserGroupResponse {
    private Long id;
    private String name;
    private Integer groupLevel;
    private long members;
    private boolean canDelete;
    private String institutionName;
    private String institutionCategory;
    private String institutionType;
    private String departmentName;
    private java.util.List<String> teamNames;
    private java.util.List<String> pageKeys;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public Integer getGroupLevel() {
        return groupLevel;
    }

    public void setGroupLevel(Integer groupLevel) {
        this.groupLevel = groupLevel;
    }

    public long getMembers() {
        return members;
    }

    public void setMembers(long members) {
        this.members = members;
    }

    public boolean isCanDelete() {
        return canDelete;
    }

    public void setCanDelete(boolean canDelete) {
        this.canDelete = canDelete;
    }

    public String getInstitutionName() {
        return institutionName;
    }

    public void setInstitutionName(String institutionName) {
        this.institutionName = institutionName;
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

    public String getDepartmentName() {
        return departmentName;
    }

    public void setDepartmentName(String departmentName) {
        this.departmentName = departmentName;
    }

    public java.util.List<String> getTeamNames() {
        return teamNames;
    }

    public void setTeamNames(java.util.List<String> teamNames) {
        this.teamNames = teamNames;
    }

    public java.util.List<String> getPageKeys() {
        return pageKeys;
    }

    public void setPageKeys(java.util.List<String> pageKeys) {
        this.pageKeys = pageKeys;
    }
}
