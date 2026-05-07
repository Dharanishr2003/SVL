package com.nexorcrm.backend.controller;

import com.nexorcrm.backend.dto.EmployeeRequest;
import com.nexorcrm.backend.dto.EmployeeResponse;
import com.nexorcrm.backend.dto.EmployeeOnboardRequest;
import com.nexorcrm.backend.service.EmployeeService;
import jakarta.validation.Valid;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/employees")
public class EmployeeController {

    private final EmployeeService employeeService;

    public EmployeeController(EmployeeService employeeService) {
        this.employeeService = employeeService;
    }

    @GetMapping
    public Object list(
            @RequestParam(required = false) Integer page,
            @RequestParam(required = false) Integer size,
            @RequestParam(required = false) Long headOfficeId,
            @RequestParam(required = false) Long branchId,
            @RequestParam(required = false) Long departmentId,
            @RequestParam(required = false) Long designationId,
            @RequestParam(required = false) String profileStatus
    ) {
        boolean pagedRequest = page != null || size != null
                || headOfficeId != null || branchId != null || departmentId != null || designationId != null
                || (profileStatus != null && !profileStatus.isBlank());
        if (!pagedRequest) {
            return employeeService.list();
        }
        return employeeService.list(page, size, headOfficeId, branchId, departmentId, designationId, profileStatus);
    }

    @GetMapping("/available")
    public List<EmployeeResponse> getAvailableEmployees() {
        return employeeService.getAvailableEmployees();
    }

    @PostMapping
    public EmployeeResponse create(@Valid @RequestBody EmployeeRequest request) {
        return employeeService.create(request);
    }

    @PostMapping(value = "/onboard", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public EmployeeResponse onboard(@ModelAttribute EmployeeOnboardRequest request) {
        return employeeService.onboard(request);
    }

    @PutMapping(value = "/{id}/onboard", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public EmployeeResponse onboardUpdate(@PathVariable Long id, @ModelAttribute EmployeeOnboardRequest request) {
        return employeeService.onboardUpdate(id, request);
    }

    @PutMapping("/{id}")
    public EmployeeResponse update(@PathVariable Long id, @Valid @RequestBody EmployeeRequest request) {
        return employeeService.update(id, request);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        employeeService.delete(id);
    }
}
