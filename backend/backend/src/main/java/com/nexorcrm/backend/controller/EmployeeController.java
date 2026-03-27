package com.nexorcrm.backend.controller;

import com.nexorcrm.backend.dto.EmployeeRequest;
import com.nexorcrm.backend.dto.EmployeeResponse;
import com.nexorcrm.backend.service.EmployeeService;
import jakarta.validation.Valid;
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
    public List<EmployeeResponse> list() {
        return employeeService.list();
    }

    @GetMapping("/available")
    public List<EmployeeResponse> getAvailableEmployees() {
        return employeeService.getAvailableEmployees();
    }

    @PostMapping
    public EmployeeResponse create(@Valid @RequestBody EmployeeRequest request) {
        return employeeService.create(request);
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
