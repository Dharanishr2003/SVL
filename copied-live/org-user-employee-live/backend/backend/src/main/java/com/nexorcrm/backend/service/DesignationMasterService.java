package com.nexorcrm.backend.service;

import com.nexorcrm.backend.dto.DesignationMasterRequest;
import com.nexorcrm.backend.dto.DesignationMasterResponse;
import com.nexorcrm.backend.entity.DesignationMaster;
import com.nexorcrm.backend.repo.DesignationMasterRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.util.List;

@Service
public class DesignationMasterService {

    private final DesignationMasterRepository repository;

    public DesignationMasterService(DesignationMasterRepository repository) {
        this.repository = repository;
    }

    public List<DesignationMasterResponse> list(Long departmentMasterId) {
        var items = departmentMasterId == null
                ? repository.findByDeletedFalseOrderByIdDesc()
                : repository.findByDepartmentMasterIdAndDeletedFalseOrderByIdDesc(departmentMasterId);
        return items
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public DesignationMasterResponse create(DesignationMasterRequest request) {
        String name = normalize(request.getName());
        String dept = normalize(request.getDepartment());
        Long departmentMasterId = request.getDepartmentMasterId();

        if (departmentMasterId == null && dept.isBlank()) {
            throw new IllegalArgumentException("Department is required");
        }

        if (departmentMasterId != null) {
            if (repository.existsByNameIgnoreCaseAndDepartmentMasterIdAndDeletedFalse(name, departmentMasterId)) {
                throw new IllegalArgumentException("Designation already exists in this department");
            }
        } else {
            if (repository.existsByNameIgnoreCaseAndDepartmentIgnoreCaseAndDeletedFalse(name, dept)) {
                throw new IllegalArgumentException("Designation already exists in this department");
            }
        }

        DesignationMaster d = new DesignationMaster();
        d.setName(name);
        d.setDepartment(dept);
        d.setDepartmentMasterId(departmentMasterId);
        d.setStatus(normalizeStatus(request.getStatus()));
        d = repository.save(d);
        return toResponse(d);
    }

    public DesignationMasterResponse update(Long id, DesignationMasterRequest request) {
        DesignationMaster d = repository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Designation not found"));

        if (Boolean.TRUE.equals(d.getDeleted())) {
            throw new EntityNotFoundException("Designation not found");
        }

        String nextName = normalize(request.getName());
        String nextDept = normalize(request.getDepartment());
        Long nextDepartmentMasterId = request.getDepartmentMasterId();
        if (nextDepartmentMasterId == null && nextDept.isBlank()) {
            throw new IllegalArgumentException("Department is required");
        }

        boolean changedName = !nextName.equalsIgnoreCase(d.getName());
        boolean changedDeptId = (d.getDepartmentMasterId() == null && nextDepartmentMasterId != null)
                || (d.getDepartmentMasterId() != null && !d.getDepartmentMasterId().equals(nextDepartmentMasterId));
        boolean changedDeptText = !nextDept.equalsIgnoreCase(d.getDepartment());

        if (nextDepartmentMasterId != null) {
            if ((changedName || changedDeptId)
                    && repository.existsByNameIgnoreCaseAndDepartmentMasterIdAndDeletedFalse(nextName, nextDepartmentMasterId)) {
                throw new IllegalArgumentException("Designation already exists in this department");
            }
        } else {
            if ((changedName || changedDeptText)
                    && repository.existsByNameIgnoreCaseAndDepartmentIgnoreCaseAndDeletedFalse(nextName, nextDept)) {
                throw new IllegalArgumentException("Designation already exists in this department");
            }
        }

        d.setName(nextName);
        d.setDepartment(nextDept);
        d.setDepartmentMasterId(nextDepartmentMasterId);
        d.setStatus(normalizeStatus(request.getStatus()));
        d = repository.save(d);
        return toResponse(d);
    }

    public void delete(Long id) {
        DesignationMaster d = repository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Designation not found"));
        d.setDeleted(true);
        repository.save(d);
    }

    private String normalize(String value) {
        if (!StringUtils.hasText(value)) return "";
        return value.trim();
    }

    private String normalizeStatus(String status) {
        String s = (status == null ? "ACTIVE" : status).trim().toUpperCase();
        return "INACTIVE".equals(s) ? "INACTIVE" : "ACTIVE";
    }

    private DesignationMasterResponse toResponse(DesignationMaster d) {
        DesignationMasterResponse r = new DesignationMasterResponse();
        r.setId(d.getId());
        r.setName(d.getName());
        r.setDepartment(d.getDepartment());
        r.setDepartmentMasterId(d.getDepartmentMasterId());
        r.setStatus(d.getStatus());
        r.setEmployeeCount(0L);
        return r;
    }
}
