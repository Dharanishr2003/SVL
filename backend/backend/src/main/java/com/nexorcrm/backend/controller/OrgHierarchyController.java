package com.nexorcrm.backend.controller;

import com.nexorcrm.backend.dto.*;
import com.nexorcrm.backend.service.OrgHierarchyService;
import jakarta.validation.Valid;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/org")
public class OrgHierarchyController {

    private final OrgHierarchyService service;

    public OrgHierarchyController(OrgHierarchyService service) {
        this.service = service;
    }

    @GetMapping("/institutions")
    public List<OrgOptionResponse> listInstitutions() {
        return service.listInstitutions();
    }

    @PostMapping("/institutions")
    public OrgOptionResponse addInstitution(@Valid @RequestBody CreateInstitutionRequest request, Authentication auth) {
        return service.addInstitution(request, auth.getName());
    }

    @GetMapping("/categories")
    public List<OrgOptionResponse> listCategories(@RequestParam Long institutionId) {
        return service.listCategories(institutionId);
    }

    @PostMapping("/categories")
    public OrgOptionResponse addCategory(@Valid @RequestBody CreateInstitutionCategoryRequest request, Authentication auth) {
        return service.addCategory(request, auth.getName());
    }

    @GetMapping("/types")
    public List<OrgOptionResponse> listTypes(@RequestParam Long institutionId, @RequestParam Long categoryId) {
        return service.listTypes(institutionId, categoryId);
    }

    @PostMapping("/types")
    public OrgOptionResponse addType(@Valid @RequestBody CreateInstitutionTypeRequest request, Authentication auth) {
        return service.addType(request, auth.getName());
    }

    @GetMapping("/departments")
    public List<OrgOptionResponse> listDepartments(@RequestParam Long institutionId, @RequestParam Long categoryId, @RequestParam Long typeId) {
        return service.listDepartments(institutionId, categoryId, typeId);
    }

    @PostMapping("/departments")
    public OrgOptionResponse addDepartment(@Valid @RequestBody CreateDepartmentRequest request, Authentication auth) {
        return service.addDepartment(request, auth.getName());
    }

    @GetMapping("/teams")
    public List<OrgOptionResponse> listTeams(@RequestParam Long institutionId, @RequestParam Long categoryId, @RequestParam Long typeId, @RequestParam Long departmentId) {
        return service.listTeams(institutionId, categoryId, typeId, departmentId);
    }

    @PostMapping("/teams")
    public OrgOptionResponse addTeam(@Valid @RequestBody CreateTeamRequest request, Authentication auth) {
        return service.addTeam(request, auth.getName());
    }

    @GetMapping("/user/{id}")
    public OrgSelectionResponse getUserOrgSelection(@PathVariable("id") Long id, Authentication auth) {
        return service.getUserOrgSelection(id, auth.getName());
    }
}
