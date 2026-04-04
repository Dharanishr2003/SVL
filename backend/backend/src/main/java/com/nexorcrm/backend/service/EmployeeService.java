package com.nexorcrm.backend.service;

import com.nexorcrm.backend.dto.EmployeeRequest;
import com.nexorcrm.backend.dto.EmployeeResponse;
import com.nexorcrm.backend.entity.Employee;
import com.nexorcrm.backend.repo.EmployeeRepository;
import com.nexorcrm.backend.repo.UserRepository;
import com.nexorcrm.backend.util.PhoneValidationUtil;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class EmployeeService {

    private final EmployeeRepository employeeRepository;
    private final UserRepository userRepository;

    public EmployeeService(EmployeeRepository employeeRepository, UserRepository userRepository) {
        this.employeeRepository = employeeRepository;
        this.userRepository = userRepository;
    }

    public List<EmployeeResponse> list() {
        return employeeRepository.findByDeletedFalseOrderByIdDesc()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public List<EmployeeResponse> getAvailableEmployees() {
        try {
            // Only active users should block an employee from appearing in the dropdown.
            Set<String> userEmails = userRepository.findByIsDeletedFalse()
                    .stream()
                    .filter(user -> user.getEmail() != null && !user.getEmail().trim().isEmpty())
                    .map(user -> user.getEmail().toLowerCase().trim())
                    .collect(Collectors.toSet());

            // Get all non-deleted employees and filter out those with existing user accounts
            return employeeRepository.findByDeletedFalseOrderByIdDesc()
                    .stream()
                    .filter(emp -> emp.getEmail() != null && !emp.getEmail().trim().isEmpty())
                    .filter(emp -> !userEmails.contains(emp.getEmail().toLowerCase().trim()))
                    .map(this::toResponse)
                    .toList();
        } catch (Exception e) {
            e.printStackTrace();
            // Return empty list on error instead of throwing, to prevent HTML error pages
            return List.of();
        }
    }

    public EmployeeResponse create(EmployeeRequest request) {
        validatePhoneNumber(request);
        Employee e = new Employee();
        apply(e, request);
        e = employeeRepository.save(e);

        if (e.getEmployeeCode() == null || e.getEmployeeCode().isBlank()) {
            e.setEmployeeCode(String.format("Emp-%03d", e.getId()));
            e = employeeRepository.save(e);
        }

        return toResponse(e);
    }

    public EmployeeResponse update(Long id, EmployeeRequest request) {
        validatePhoneNumber(request);
        Employee e = employeeRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Employee not found"));
        if (Boolean.TRUE.equals(e.getDeleted())) {
            throw new EntityNotFoundException("Employee not found");
        }

        apply(e, request);
        return toResponse(employeeRepository.save(e));
    }

    public void delete(Long id) {
        Employee e = employeeRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Employee not found"));
        e.setDeleted(true);
        employeeRepository.save(e);
    }

    private void validatePhoneNumber(EmployeeRequest request) {
        if (request.getPhone() != null && !request.getPhone().isBlank()) {
            String countryCode = request.getCountryCode();
            String errorMessage = PhoneValidationUtil.validatePhoneNumber(request.getPhone(), countryCode);
            if (!errorMessage.isEmpty()) {
                throw new IllegalArgumentException(errorMessage);
            }
        }
    }

    private void apply(Employee e, EmployeeRequest r) {
        e.setName(r.getName());
        e.setEmail(r.getEmail());
        
        // Set and normalize country code
        String countryCode = r.getCountryCode();
        e.setCountryCode(PhoneValidationUtil.ensureCountryCodeValue(countryCode));
        
        e.setPhone(r.getPhone());
        e.setDept(r.getDept());
        e.setInstitution(trimToNull(r.getInstitution()));
        e.setDepartmentName(firstNonBlank(r.getUserDepartmentName(), r.getDepartmentName()));
        e.setTeam(trimToNull(r.getTeam()));
        e.setDesignation(r.getDesignation());
        e.setJoinDate(r.getJoinDate());
        e.setStatus(normalizeStatus(r.getStatus()));
        e.setImg((r.getImg() == null || r.getImg().isBlank()) ? "assets/img/users/user-32.jpg" : r.getImg());
    }

    private String normalizeStatus(String status) {
        String s = String.valueOf(status == null ? "ACTIVE" : status).trim().toUpperCase();
        return s.equals("INACTIVE") ? "INACTIVE" : "ACTIVE";
    }

    private EmployeeResponse toResponse(Employee e) {
        EmployeeResponse r = new EmployeeResponse();
        r.setId(e.getId());
        r.setEmployeeCode(e.getEmployeeCode());
        r.setName(e.getName());
        r.setEmail(e.getEmail());
        r.setCountryCode(e.getCountryCode());
        r.setPhone(e.getPhone());
        r.setDept(e.getDept());
        r.setInstitution(e.getInstitution());
        r.setDepartmentName(e.getDepartmentName());
        r.setTeam(e.getTeam());
        r.setDesignation(e.getDesignation());
        r.setJoinDate(e.getJoinDate());
        r.setStatus(e.getStatus());
        r.setImg(e.getImg());
        return r;
    }

    private String firstNonBlank(String first, String second) {
        String firstValue = trimToNull(first);
        return firstValue != null ? firstValue : trimToNull(second);
    }

    private String trimToNull(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }
}
