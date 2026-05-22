package com.nexorcrm.backend.service;

import com.nexorcrm.backend.dto.DepartmentMasterRequest;
import com.nexorcrm.backend.dto.DepartmentMasterResponse;
import com.nexorcrm.backend.entity.DepartmentMaster;
import com.nexorcrm.backend.repo.DepartmentMasterRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.util.List;

@Service
public class DepartmentMasterService {

    private final DepartmentMasterRepository repository;

    public DepartmentMasterService(DepartmentMasterRepository repository) {
        this.repository = repository;
    }

    public List<DepartmentMasterResponse> list(Long branchId) {
        var items = branchId == null
                ? repository.findByDeletedFalseOrderByIdDesc()
                : repository.findByBranchIdAndDeletedFalseOrderByIdDesc(branchId);
        return items
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public DepartmentMasterResponse create(DepartmentMasterRequest request) {
        String name = normalizeName(request.getName());
        Long branchId = request.getBranchId();
        if (branchId == null) {
            if (repository.existsByNameIgnoreCaseAndDeletedFalse(name)) {
                throw new IllegalArgumentException("Department already exists");
            }
        } else {
            if (repository.existsByBranchIdAndNameIgnoreCaseAndDeletedFalse(branchId, name)) {
                throw new IllegalArgumentException("Department already exists for this branch");
            }
        }

        DepartmentMaster d = new DepartmentMaster();
        d.setName(name);
        d.setBranchId(branchId);
        d.setStatus(normalizeStatus(request.getStatus()));
        d = repository.save(d);
        return toResponse(d);
    }

    public DepartmentMasterResponse update(Long id, DepartmentMasterRequest request) {
        DepartmentMaster d = repository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Department not found"));

        if (Boolean.TRUE.equals(d.getDeleted())) {
            throw new EntityNotFoundException("Department not found");
        }

        Long branchId = request.getBranchId();
        String nextName = normalizeName(request.getName());
        if (branchId == null) {
            if (!nextName.equalsIgnoreCase(d.getName())
                    && repository.existsByNameIgnoreCaseAndDeletedFalse(nextName)) {
                throw new IllegalArgumentException("Department already exists");
            }
        } else {
            boolean changedScope = d.getBranchId() == null || !branchId.equals(d.getBranchId());
            boolean changedName = !nextName.equalsIgnoreCase(d.getName());
            if ((changedScope || changedName)
                    && repository.existsByBranchIdAndNameIgnoreCaseAndDeletedFalse(branchId, nextName)) {
                throw new IllegalArgumentException("Department already exists for this branch");
            }
        }

        d.setName(nextName);
        d.setBranchId(branchId);
        d.setStatus(normalizeStatus(request.getStatus()));
        d = repository.save(d);
        return toResponse(d);
    }

    public void delete(Long id) {
        DepartmentMaster d = repository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Department not found"));
        d.setDeleted(true);
        repository.save(d);
    }

    private String normalizeName(String name) {
        if (!StringUtils.hasText(name)) return "";
        return name.trim();
    }

    private String normalizeStatus(String status) {
        String s = (status == null ? "ACTIVE" : status).trim().toUpperCase();
        return "INACTIVE".equals(s) ? "INACTIVE" : "ACTIVE";
    }

    private DepartmentMasterResponse toResponse(DepartmentMaster d) {
        DepartmentMasterResponse r = new DepartmentMasterResponse();
        r.setId(d.getId());
        r.setName(d.getName());
        r.setBranchId(d.getBranchId());
        r.setStatus(d.getStatus());
        r.setEmployeeCount(0L); // keep for frontend compatibility
        return r;
    }
}
