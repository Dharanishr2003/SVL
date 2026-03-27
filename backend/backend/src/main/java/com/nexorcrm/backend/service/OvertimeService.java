package com.nexorcrm.backend.service;

import com.nexorcrm.backend.dto.OvertimeRequest;
import com.nexorcrm.backend.dto.OvertimeResponse;
import com.nexorcrm.backend.entity.Overtime;
import com.nexorcrm.backend.repo.EmployeeRepository;
import com.nexorcrm.backend.repo.OvertimeRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class OvertimeService {

    private final OvertimeRepository repository;
    private final EmployeeRepository employeeRepository;

    public OvertimeService(OvertimeRepository repository, EmployeeRepository employeeRepository) {
        this.repository = repository;
        this.employeeRepository = employeeRepository;
    }

    public List<OvertimeResponse> listAll() {
        return repository.findByDeletedFalseOrderByIdDesc()
                .stream().map(this::toResponse).toList();
    }

    public OvertimeResponse create(OvertimeRequest request) {
        Overtime o = new Overtime();
        apply(o, request);
        Overtime saved = repository.save(o);
        return toResponse(saved);
    }

    public OvertimeResponse update(Long id, OvertimeRequest request) {
        Overtime o = repository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Overtime not found"));
        if (Boolean.TRUE.equals(o.getDeleted())) {
            throw new EntityNotFoundException("Overtime not found");
        }
        apply(o, request);
        Overtime saved = repository.save(o);
        return toResponse(saved);
    }

    public void delete(Long id) {
        Overtime o = repository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Overtime not found"));
        o.setDeleted(true);
        repository.save(o);
    }

    private void apply(Overtime o, OvertimeRequest request) {
        o.setEmployeeId(request.getEmployeeId());
        o.setOvertimeDate(request.getOvertimeDate());
        o.setOvertimeHours(request.getOvertimeHours());
        o.setRemainingHours(request.getRemainingHours());
        o.setProjectName(request.getProjectName() != null ? request.getProjectName().trim() : null);
        o.setApprovedBy(request.getApprovedBy() != null ? request.getApprovedBy().trim() : null);
        o.setDescription(request.getDescription() != null ? request.getDescription().trim() : null);
        o.setStatus(request.getStatus() != null ? request.getStatus().trim() : "Pending");
    }

    private OvertimeResponse toResponse(Overtime o) {
        OvertimeResponse r = new OvertimeResponse();
        r.setId(o.getId());
        r.setEmployeeId(o.getEmployeeId());
        r.setOvertimeDate(o.getOvertimeDate());
        r.setOvertimeHours(o.getOvertimeHours());
        r.setRemainingHours(o.getRemainingHours());
        r.setProjectName(o.getProjectName());
        r.setApprovedBy(o.getApprovedBy());
        r.setDescription(o.getDescription());
        r.setStatus(o.getStatus());

        if (o.getEmployeeId() != null) {
            employeeRepository.findById(o.getEmployeeId()).ifPresent(emp -> {
                r.setEmployeeName(emp.getName());
                r.setEmployeeDept(emp.getDept());
            });
        }
        return r;
    }
}
