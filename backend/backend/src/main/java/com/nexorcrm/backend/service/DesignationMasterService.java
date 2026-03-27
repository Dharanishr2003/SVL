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

    public List<DesignationMasterResponse> list() {
        return repository.findByDeletedFalseOrderByIdDesc()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public DesignationMasterResponse create(DesignationMasterRequest request) {
        String name = normalize(request.getName());
        String dept = normalize(request.getDepartment());

        if (repository.existsByNameIgnoreCaseAndDepartmentIgnoreCaseAndDeletedFalse(name, dept)) {
            throw new IllegalArgumentException("Designation already exists in this department");
        }

        DesignationMaster d = new DesignationMaster();
        d.setName(name);
        d.setDepartment(dept);
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

        d.setName(normalize(request.getName()));
        d.setDepartment(normalize(request.getDepartment()));
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
        r.setStatus(d.getStatus());
        r.setEmployeeCount(0L);
        return r;
    }
}
