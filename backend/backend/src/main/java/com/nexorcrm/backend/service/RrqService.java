package com.nexorcrm.backend.service;

import com.nexorcrm.backend.dto.RrqAssignedUserResponse;
import com.nexorcrm.backend.dto.RrqRequest;
import com.nexorcrm.backend.dto.RrqResponse;
import com.nexorcrm.backend.entity.Rrq;
import com.nexorcrm.backend.entity.RrqType;
import com.nexorcrm.backend.entity.Role;
import com.nexorcrm.backend.entity.User;
import com.nexorcrm.backend.repo.RrqRepository;
import com.nexorcrm.backend.repo.RrqTypeRepository;
import com.nexorcrm.backend.repo.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.*;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Service
@Transactional
public class RrqService {

    private final RrqRepository rrqRepository;
    private final RrqTypeRepository rrqTypeRepository;
    private final UserRepository userRepository;
    private final AuditService auditService;

    public RrqService(RrqRepository rrqRepository,
                      RrqTypeRepository rrqTypeRepository,
                      UserRepository userRepository,
                      AuditService auditService) {
        this.rrqRepository = rrqRepository;
        this.rrqTypeRepository = rrqTypeRepository;
        this.userRepository = userRepository;
        this.auditService = auditService;
    }

    @Transactional(readOnly = true)
    public List<RrqResponse> list(String actorPrincipal) {
        resolveActor(actorPrincipal);
        return rrqRepository.findByDeletedFalseOrderByCreatedAtDesc().stream().map(this::toResponse).toList();
    }

    public RrqResponse create(RrqRequest request, String actorPrincipal) {
        User actor = resolveActor(actorPrincipal);
        String name = request.getRrqName().trim();
        if (rrqRepository.existsByRrqNameIgnoreCaseAndDeletedFalse(name)) {
            throw new IllegalStateException("RRQ already exists");
        }

        RrqType rrqType = resolveRrqType(request.getRrqType());

        Rrq row = new Rrq();
        row.setRrqId("RRQ_" + UUID.randomUUID().toString().replace("-", "").substring(0, 14));
        row.setRrqName(name);
        row.setRrqType(rrqType);

        Rrq saved = rrqRepository.save(row);
        auditService.log("RRQ_CREATE", "Created RRQ", actor.getEmail());
        return toResponse(saved);
    }

    public RrqResponse update(Long id, RrqRequest request, String actorPrincipal) {
        User actor = resolveActor(actorPrincipal);
        Rrq row = rrqRepository.findByIdAndDeletedFalse(id)
                .orElseThrow(() -> new EntityNotFoundException("RRQ not found"));

        String name = request.getRrqName().trim();
        if (rrqRepository.existsByRrqNameIgnoreCaseAndDeletedFalseAndIdNot(name, id)) {
            throw new IllegalStateException("RRQ already exists");
        }

        RrqType rrqType = resolveRrqType(request.getRrqType());

        row.setRrqName(name);
        row.setRrqType(rrqType);

        Set<User> assignable = resolveAssignableUsers(actor, request.getAssignedUserIds());
        row.setAssignedUsers(assignable);

        Rrq saved = rrqRepository.save(row);
        auditService.log("RRQ_UPDATE", "Updated RRQ", actor.getEmail());
        return toResponse(saved);
    }

    public void delete(Long id, String actorPrincipal) {
        User actor = resolveActor(actorPrincipal);
        Rrq row = rrqRepository.findByIdAndDeletedFalse(id)
                .orElseThrow(() -> new EntityNotFoundException("RRQ not found"));

        row.setDeleted(true);
        rrqRepository.save(row);
        auditService.log("RRQ_DELETE", "Deleted RRQ", actor.getEmail());
    }

    private Set<User> resolveAssignableUsers(User actor, List<Long> assignedUserIds) {
        if (assignedUserIds == null || assignedUserIds.isEmpty()) return new HashSet<>();

        List<User> users = userRepository.findAllById(assignedUserIds).stream()
                .filter(u -> !u.isDeleted())
                .toList();

        if (users.size() != new HashSet<>(assignedUserIds).size()) {
            throw new EntityNotFoundException("One or more users not found");
        }

        if (actor.getRole() == Role.SUPER_ADMIN) {
            return new HashSet<>(users);
        }

        if (actor.getRole() == Role.ADMIN) {
            for (User u : users) {
                if (!Objects.equals(actor.getDepartmentName(), u.getDepartmentName())) {
                    throw new AccessDeniedException("Cannot assign users outside your department");
                }
            }
            return new HashSet<>(users);
        }

        if (actor.getRole() == Role.MANAGER) {
            for (User u : users) {
                if (!Objects.equals(actor.getTeamName(), u.getTeamName())) {
                    throw new AccessDeniedException("Cannot assign users outside your team");
                }
            }
            return new HashSet<>(users);
        }

        throw new AccessDeniedException("Insufficient permission");
    }

    private RrqType resolveRrqType(String rrqTypeValue) {
        String key = String.valueOf(rrqTypeValue).trim();
        return rrqTypeRepository.findByTypeNameIgnoreCaseAndDeletedFalse(key)
                .orElseThrow(() -> new EntityNotFoundException("RRQ type not found"));
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

    private RrqResponse toResponse(Rrq row) {
        RrqResponse res = new RrqResponse();
        res.setId(row.getId());
        res.setRrqId(row.getRrqId());
        res.setRrqName(row.getRrqName());
        res.setRrqType(row.getRrqType() != null ? row.getRrqType().getTypeName() : null);
        res.setCreatedDate(row.getCreatedAt());

        List<RrqAssignedUserResponse> assigned = row.getAssignedUsers().stream()
                .filter(u -> !u.isDeleted())
                .sorted(Comparator.comparing(User::getUsername, String.CASE_INSENSITIVE_ORDER))
                .map(u -> {
                    RrqAssignedUserResponse a = new RrqAssignedUserResponse();
                    a.setId(u.getId());
                    a.setUsername(u.getUsername());
                    String display = Stream.of(u.getFirstName(), u.getLastName())
                            .filter(Objects::nonNull)
                            .map(String::trim)
                            .filter(s -> !s.isEmpty())
                            .collect(Collectors.joining(" "));
                    a.setName(display.isEmpty() ? u.getUsername() : display);
                    return a;
                })
                .toList();
        res.setAssignedUsers(assigned);
        return res;
    }
}
