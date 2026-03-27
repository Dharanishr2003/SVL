package com.nexorcrm.backend.service;

import com.nexorcrm.backend.dto.RrqTypeRequest;
import com.nexorcrm.backend.dto.RrqTypeResponse;
import com.nexorcrm.backend.entity.RrqType;
import com.nexorcrm.backend.entity.User;
import com.nexorcrm.backend.repo.RrqTypeRepository;
import com.nexorcrm.backend.repo.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.List;
import java.util.Locale;
import java.util.UUID;

@Service
@Transactional
public class RrqTypeService {

    private final RrqTypeRepository rrqTypeRepository;
    private final UserRepository userRepository;
    private final AuditService auditService;

    public RrqTypeService(RrqTypeRepository rrqTypeRepository,
                          UserRepository userRepository,
                          AuditService auditService) {
        this.rrqTypeRepository = rrqTypeRepository;
        this.userRepository = userRepository;
        this.auditService = auditService;
    }

    @Transactional(readOnly = true)
    public List<RrqTypeResponse> list(String actorPrincipal) {
        resolveActor(actorPrincipal);
        return rrqTypeRepository.findByDeletedFalseOrderByCreatedAtDesc().stream().map(this::toResponse).toList();
    }

    public RrqTypeResponse create(RrqTypeRequest request, String actorPrincipal) {
        User actor = resolveActor(actorPrincipal);
        String value = request.getRrqType().trim();
        if (rrqTypeRepository.existsByTypeNameIgnoreCaseAndDeletedFalse(value)) {
            throw new IllegalStateException("RRQ type already exists");
        }

        RrqType row = new RrqType();
        row.setTypeId("RRQT_" + UUID.randomUUID().toString().replace("-", "").substring(0, 14));
        row.setTypeName(value);

        RrqType saved = rrqTypeRepository.save(row);
        auditService.log("RRQ_TYPE_CREATE", "Created RRQ type", actor.getEmail());
        return toResponse(saved);
    }

    public RrqTypeResponse update(Long id, RrqTypeRequest request, String actorPrincipal) {
        User actor = resolveActor(actorPrincipal);
        RrqType row = rrqTypeRepository.findByIdAndDeletedFalse(id)
                .orElseThrow(() -> new EntityNotFoundException("RRQ type not found"));

        String value = request.getRrqType().trim();
        if (rrqTypeRepository.existsByTypeNameIgnoreCaseAndDeletedFalseAndIdNot(value, id)) {
            throw new IllegalStateException("RRQ type already exists");
        }

        row.setTypeName(value);
        RrqType saved = rrqTypeRepository.save(row);
        auditService.log("RRQ_TYPE_UPDATE", "Updated RRQ type", actor.getEmail());
        return toResponse(saved);
    }

    public void delete(Long id, String actorPrincipal) {
        User actor = resolveActor(actorPrincipal);
        RrqType row = rrqTypeRepository.findByIdAndDeletedFalse(id)
                .orElseThrow(() -> new EntityNotFoundException("RRQ type not found"));

        row.setDeleted(true);
        rrqTypeRepository.save(row);
        auditService.log("RRQ_TYPE_DELETE", "Deleted RRQ type", actor.getEmail());
    }

    private User resolveActor(String actorPrincipal) {
        if (!StringUtils.hasText(actorPrincipal)) throw new AccessDeniedException("Unauthenticated actor");
        if (actorPrincipal.contains("@")) {
            return userRepository.findByEmailAndIsDeletedFalse(actorPrincipal.trim().toLowerCase(Locale.ROOT))
                    .orElseThrow(() -> new EntityNotFoundException("Actor not found"));
        }
        return userRepository.findByUsernameAndIsDeletedFalse(actorPrincipal.trim())
                .orElseThrow(() -> new EntityNotFoundException("Actor not found"));
    }

    private RrqTypeResponse toResponse(RrqType row) {
        RrqTypeResponse res = new RrqTypeResponse();
        res.setId(row.getId());
        res.setTypeId(row.getTypeId());
        res.setRrqType(row.getTypeName());
        res.setCreatedDate(row.getCreatedAt());
        return res;
    }
}
