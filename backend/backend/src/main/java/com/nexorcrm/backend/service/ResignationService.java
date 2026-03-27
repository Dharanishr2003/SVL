package com.nexorcrm.backend.service;

import com.nexorcrm.backend.dto.ResignationRequest;
import com.nexorcrm.backend.dto.ResignationResponse;
import com.nexorcrm.backend.entity.Resignation;
import com.nexorcrm.backend.repo.ResignationRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@Transactional
public class ResignationService {

    private final ResignationRepository resignationRepository;
    private final com.nexorcrm.backend.repo.EmployeeRepository employeeRepository;

    public ResignationService(ResignationRepository resignationRepository,
                              com.nexorcrm.backend.repo.EmployeeRepository employeeRepository) {
        this.resignationRepository = resignationRepository;
        this.employeeRepository = employeeRepository;
    }

    @Transactional(readOnly = true)
    public List<ResignationResponse> list() {
        return resignationRepository.findByDeletedFalseOrderByCreatedAtDesc()
                .stream().map(this::toResponse).toList();
    }

    public ResignationResponse create(ResignationRequest request) {
        Resignation row = new Resignation();
        apply(row, request);
        return toResponse(resignationRepository.save(row));
    }

    public ResignationResponse update(Long id, ResignationRequest request) {
        Resignation row = resignationRepository.findByIdAndDeletedFalse(id)
                .orElseThrow(() -> new EntityNotFoundException("Resignation not found"));
        apply(row, request);
        return toResponse(resignationRepository.save(row));
    }

    public void delete(Long id) {
        Resignation row = resignationRepository.findByIdAndDeletedFalse(id)
                .orElseThrow(() -> new EntityNotFoundException("Resignation not found"));
        row.setDeleted(true);
        resignationRepository.save(row);
    }

    @Scheduled(cron = "0 15 0 * * *")
    public void deactivateResignedEmployees() {
        LocalDate today = LocalDate.now();
        List<Resignation> resignations = resignationRepository
                .findByDeletedFalseAndResignationDateLessThanEqual(today);
        if (resignations.isEmpty()) return;
        for (Resignation resignation : resignations) {
            Long employeeId = resignation.getEmployeeId();
            if (employeeId == null) continue;
            employeeRepository.findById(employeeId).ifPresent((emp) -> {
                if (!Boolean.TRUE.equals(emp.getDeleted())) {
                    emp.setStatus("INACTIVE");
                    employeeRepository.save(emp);
                }
            });
        }
    }

    private void apply(Resignation row, ResignationRequest request) {
        row.setEmployeeId(request.getEmployeeId());
        row.setEmployeeName(request.getEmployeeName().trim());
        row.setDepartment(request.getDepartment().trim());
        row.setReason(request.getReason().trim());
        row.setNoticeDate(request.getNoticeDate());
        row.setResignationDate(request.getResignationDate());
    }

    private ResignationResponse toResponse(Resignation row) {
        ResignationResponse res = new ResignationResponse();
        res.setId(row.getId());
        res.setEmployeeId(row.getEmployeeId());
        res.setEmployeeName(row.getEmployeeName());
        res.setDepartment(row.getDepartment());
        res.setReason(row.getReason());
        res.setNoticeDate(row.getNoticeDate());
        res.setResignationDate(row.getResignationDate());
        res.setCreatedDate(row.getCreatedAt());
        return res;
    }
}
