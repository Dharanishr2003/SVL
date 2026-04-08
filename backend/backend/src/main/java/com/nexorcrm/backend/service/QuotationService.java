package com.nexorcrm.backend.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.nexorcrm.backend.dto.QuotationActionRequest;
import com.nexorcrm.backend.dto.QuotationRequest;
import com.nexorcrm.backend.dto.QuotationResponse;
import com.nexorcrm.backend.entity.Quotation;
import com.nexorcrm.backend.entity.QuotationStatus;
import com.nexorcrm.backend.entity.Role;
import com.nexorcrm.backend.entity.User;
import com.nexorcrm.backend.repo.QuotationRepository;
import com.nexorcrm.backend.repo.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Locale;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
@Transactional
public class QuotationService {

    private final QuotationRepository quotationRepository;
    private final UserRepository userRepository;
    private final ObjectMapper objectMapper;

    public QuotationService(
            QuotationRepository quotationRepository,
            UserRepository userRepository,
            ObjectMapper objectMapper
    ) {
        this.quotationRepository = quotationRepository;
        this.userRepository = userRepository;
        this.objectMapper = objectMapper;
    }

    @Transactional(readOnly = true)
    public List<QuotationResponse> list(String principal) {
        User actor = resolveActor(principal);
        List<Quotation> allRows = quotationRepository.findAllByOrderByCreatedAtDesc();
        return allRows.stream()
                .filter(quotation -> canView(quotation, actor))
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public QuotationResponse getById(Long id, String principal) {
        User actor = resolveActor(principal);
        Quotation quotation = quotationRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Quotation not found"));
        if (!canView(quotation, actor)) {
            throw new AccessDeniedException("You do not have permission to view this quotation");
        }
        return toResponse(quotation);
    }

    public QuotationResponse create(QuotationRequest request, String principal) {
        User actor = resolveActor(principal);
        Quotation quotation = new Quotation();
        applyEditableFields(quotation, request);

        quotation.setQuotationNumber(resolveQuotationNumber(request.getQuotationNumber()));
        quotation.setQuotationDate(request.getQuotationDate() != null ? request.getQuotationDate() : LocalDate.now());
        quotation.setStatus(QuotationStatus.DRAFT);
        quotation.setCreatedById(actor.getId());
        quotation.setCreatedByName(resolveDisplayName(actor));
        quotation.setCreatedByEmail(actor.getEmail());
        quotation.setCreatedByRole(actor.getRole() != null ? actor.getRole().name() : null);
        quotation.setCreatedByTeam(actor.getTeamName());

        Quotation saved = quotationRepository.save(quotation);
        return toResponse(saved);
    }

    public QuotationResponse update(Long id, QuotationRequest request, String principal) {
        User actor = resolveActor(principal);
        Quotation quotation = quotationRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Quotation not found"));
        if (!canEdit(quotation, actor)) {
            throw new AccessDeniedException("You do not have permission to edit this quotation");
        }

        applyEditableFields(quotation, request);
        if (StringUtils.hasText(request.getQuotationNumber())) {
            quotation.setQuotationNumber(request.getQuotationNumber().trim());
        }
        if (request.getQuotationDate() != null) {
            quotation.setQuotationDate(request.getQuotationDate());
        }

        Quotation saved = quotationRepository.save(quotation);
        return toResponse(saved);
    }

    public QuotationResponse sendForVerification(Long id, QuotationActionRequest request, String principal) {
        User actor = resolveActor(principal);
        Quotation quotation = quotationRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Quotation not found"));

        if (actor.getRole() != Role.EMPLOYEE || !Objects.equals(actor.getId(), quotation.getCreatedById())) {
            throw new AccessDeniedException("Only the owning employee can send verification");
        }
        if (quotation.getStatus() != QuotationStatus.DRAFT && quotation.getStatus() != QuotationStatus.NEGOTIATING) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Only draft or negotiating quotations can be sent for verification");
        }

        LocalDateTime now = LocalDateTime.now();
        quotation.setStatus(QuotationStatus.VERIFICATION_PENDING);
        quotation.setVerificationRequestedAt(now);
        quotation.setVerificationRequestedById(actor.getId());
        quotation.setVerificationRequestedByName(resolveDisplayName(actor));
        quotation.setVerificationRequestedByRole(actor.getRole().name());
        quotation.setVerificationRequestNotes(trimToNull(request != null ? request.getNotes() : null));

        quotation.setApprovedAt(null);
        quotation.setApprovedById(null);
        quotation.setApprovedByName(null);
        quotation.setApprovedByRole(null);
        quotation.setApprovalNotes(null);

        return toResponse(quotationRepository.save(quotation));
    }

    public QuotationResponse approve(Long id, QuotationActionRequest request, String principal) {
        User actor = resolveActor(principal);
        Quotation quotation = quotationRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Quotation not found"));

        if (!canApprove(quotation, actor)) {
            throw new AccessDeniedException("You do not have permission to approve this quotation");
        }
        if (quotation.getStatus() != QuotationStatus.VERIFICATION_PENDING) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Only verification pending quotations can be approved");
        }

        LocalDateTime now = LocalDateTime.now();
        quotation.setStatus(QuotationStatus.APPROVED);
        quotation.setApprovedAt(now);
        quotation.setApprovedById(actor.getId());
        quotation.setApprovedByName(resolveDisplayName(actor));
        quotation.setApprovedByRole(actor.getRole().name());
        quotation.setApprovalNotes(trimToNull(request != null ? request.getNotes() : null));

        return toResponse(quotationRepository.save(quotation));
    }

    public QuotationResponse markSent(Long id, String principal) {
        User actor = resolveActor(principal);
        Quotation quotation = quotationRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Quotation not found"));

        if (actor.getRole() != Role.EMPLOYEE || !Objects.equals(actor.getId(), quotation.getCreatedById())) {
            throw new AccessDeniedException("Only the owning employee can mark this quotation as sent");
        }
        if (quotation.getStatus() != QuotationStatus.APPROVED) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Only approved quotations can be marked as sent");
        }

        quotation.setStatus(QuotationStatus.QUOTATION_SENT);
        quotation.setSentAt(LocalDateTime.now());
        quotation.setSentByName(resolveDisplayName(actor));
        return toResponse(quotationRepository.save(quotation));
    }

    public QuotationResponse markNegotiating(Long id, QuotationActionRequest request, String principal) {
        User actor = resolveActor(principal);
        Quotation quotation = quotationRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Quotation not found"));

        if (actor.getRole() != Role.EMPLOYEE || !Objects.equals(actor.getId(), quotation.getCreatedById())) {
            throw new AccessDeniedException("Only the owning employee can mark this quotation as negotiating");
        }
        if (quotation.getStatus() != QuotationStatus.QUOTATION_SENT) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Only sent quotations can be marked as negotiating");
        }
        String notes = request != null ? trimToNull(request.getNotes()) : null;
        if (notes == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Negotiating notes are required");
        }

        quotation.setStatus(QuotationStatus.NEGOTIATING);
        quotation.setNegotiatingAt(LocalDateTime.now());
        quotation.setNegotiatingByName(resolveDisplayName(actor));
        quotation.setNegotiatingNotes(notes);
        return toResponse(quotationRepository.save(quotation));
    }

    public QuotationResponse markRejected(Long id, QuotationActionRequest request, String principal) {
        User actor = resolveActor(principal);
        Quotation quotation = quotationRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Quotation not found"));

        if (actor.getRole() != Role.EMPLOYEE || !Objects.equals(actor.getId(), quotation.getCreatedById())) {
            throw new AccessDeniedException("Only the owning employee can mark this quotation as rejected");
        }
        if (quotation.getStatus() != QuotationStatus.QUOTATION_SENT) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Only sent quotations can be marked as rejected");
        }
        String notes = request != null ? trimToNull(request.getNotes()) : null;
        if (notes == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Rejection notes are required");
        }

        quotation.setStatus(QuotationStatus.QUOTATION_REJECTED);
        quotation.setRejectedAt(LocalDateTime.now());
        quotation.setRejectedByName(resolveDisplayName(actor));
        quotation.setRejectionNotes(notes);
        return toResponse(quotationRepository.save(quotation));
    }

    public QuotationResponse markAccepted(Long id, QuotationActionRequest request, String principal) {
        User actor = resolveActor(principal);
        Quotation quotation = quotationRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Quotation not found"));

        if (actor.getRole() != Role.EMPLOYEE || !Objects.equals(actor.getId(), quotation.getCreatedById())) {
            throw new AccessDeniedException("Only the owning employee can mark this quotation as accepted");
        }
        if (quotation.getStatus() != QuotationStatus.QUOTATION_SENT) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Only sent quotations can be marked as accepted");
        }

        quotation.setStatus(QuotationStatus.QUOTATION_ACCEPTED);
        quotation.setAcceptedAt(LocalDateTime.now());
        quotation.setAcceptedByName(resolveDisplayName(actor));
        quotation.setAcceptanceNotes(request != null ? trimToNull(request.getNotes()) : null);
        return toResponse(quotationRepository.save(quotation));
    }

    private boolean canView(Quotation quotation, User actor) {
        if (actor == null) {
            return false;
        }

        if (Objects.equals(quotation.getCreatedById(), actor.getId())) {
            return true;
        }

        QuotationStatus status = quotation.getStatus() != null ? quotation.getStatus() : QuotationStatus.DRAFT;
        if (actor.getRole() == Role.TEAM_LEAD) {
            return (status == QuotationStatus.VERIFICATION_PENDING
                    || status == QuotationStatus.APPROVED
                    || status == QuotationStatus.QUOTATION_SENT
                    || status == QuotationStatus.NEGOTIATING
                    || status == QuotationStatus.QUOTATION_REJECTED
                    || status == QuotationStatus.QUOTATION_ACCEPTED)
                    && isEmployeeOwnedBySameTeam(quotation, actor);
        }

        if (actor.getRole() == Role.MANAGER || actor.getRole() == Role.ADMIN || actor.getRole() == Role.SUPER_ADMIN) {
            return status == QuotationStatus.VERIFICATION_PENDING
                    || status == QuotationStatus.APPROVED
                    || status == QuotationStatus.QUOTATION_SENT
                    || status == QuotationStatus.NEGOTIATING
                    || status == QuotationStatus.QUOTATION_REJECTED
                    || status == QuotationStatus.QUOTATION_ACCEPTED;
        }

        return false;
    }

    private boolean canEdit(Quotation quotation, User actor) {
        if (actor == null) {
            return false;
        }
        if (!canView(quotation, actor)) {
            return false;
        }
        if (actor.getRole() == Role.EMPLOYEE) {
            return Objects.equals(quotation.getCreatedById(), actor.getId())
                    && (quotation.getStatus() == QuotationStatus.DRAFT
                        || quotation.getStatus() == QuotationStatus.NEGOTIATING);
        }
        return true;
    }

    private boolean canApprove(Quotation quotation, User actor) {
        if (actor == null || quotation.getStatus() != QuotationStatus.VERIFICATION_PENDING) {
            return false;
        }
        if (actor.getRole() == Role.MANAGER || actor.getRole() == Role.ADMIN || actor.getRole() == Role.SUPER_ADMIN) {
            return true;
        }
        return actor.getRole() == Role.TEAM_LEAD && isEmployeeOwnedBySameTeam(quotation, actor);
    }

    private boolean isEmployeeOwnedBySameTeam(Quotation quotation, User actor) {
        String createdByRole = normalize(quotation.getCreatedByRole());
        String createdByTeam = normalize(quotation.getCreatedByTeam());
        String actorTeam = normalize(actor.getTeamName());
        return "EMPLOYEE".equals(createdByRole)
                && StringUtils.hasText(createdByTeam)
                && createdByTeam.equals(actorTeam);
    }

    private void applyEditableFields(Quotation quotation, QuotationRequest request) {
        quotation.setCustomerName(trimToNull(request.getCustomerName()));
        quotation.setPartyMode(trimToNull(request.getPartyMode()));
        quotation.setSelectedLeadJson(writeJson(request.getSelectedLead()));
        quotation.setLineItemsJson(writeJson(request.getLineItems()));
        quotation.setTotalsJson(writeJson(request.getTotals()));
        quotation.setDiscountPct(request.getDiscountPct());
        quotation.setCgstPct(request.getCgstPct());
        quotation.setSgstPct(request.getSgstPct());
    }

    private QuotationResponse toResponse(Quotation quotation) {
        QuotationResponse response = new QuotationResponse();
        response.setId(quotation.getId());
        response.setQuotationNumber(quotation.getQuotationNumber());
        response.setQuotationDate(quotation.getQuotationDate());
        response.setCustomerName(quotation.getCustomerName());
        response.setPartyMode(quotation.getPartyMode());
        response.setSelectedLead(readJson(quotation.getSelectedLeadJson()));
        response.setLineItems(readJson(quotation.getLineItemsJson()));
        response.setTotals(readJson(quotation.getTotalsJson()));
        response.setDiscountPct(quotation.getDiscountPct());
        response.setCgstPct(quotation.getCgstPct());
        response.setSgstPct(quotation.getSgstPct());
        response.setStatus(quotation.getStatus() != null ? quotation.getStatus().name() : QuotationStatus.DRAFT.name());
        response.setVerificationRequestedAt(quotation.getVerificationRequestedAt());
        response.setVerificationRequestedById(quotation.getVerificationRequestedById());
        response.setVerificationRequestedByName(quotation.getVerificationRequestedByName());
        response.setVerificationRequestedByRole(quotation.getVerificationRequestedByRole());
        response.setVerificationRequestNotes(quotation.getVerificationRequestNotes());
        response.setApprovedAt(quotation.getApprovedAt());
        response.setApprovedById(quotation.getApprovedById());
        response.setApprovedByName(quotation.getApprovedByName());
        response.setApprovedByRole(quotation.getApprovedByRole());
        response.setApprovalNotes(quotation.getApprovalNotes());
        response.setCreatedById(quotation.getCreatedById());
        response.setCreatedByName(quotation.getCreatedByName());
        response.setCreatedByEmail(quotation.getCreatedByEmail());
        response.setCreatedByRole(quotation.getCreatedByRole());
        response.setCreatedByTeam(quotation.getCreatedByTeam());
        response.setCreatedAt(quotation.getCreatedAt());
        response.setUpdatedAt(quotation.getUpdatedAt());
        response.setSentAt(quotation.getSentAt());
        response.setSentByName(quotation.getSentByName());
        response.setNegotiatingAt(quotation.getNegotiatingAt());
        response.setNegotiatingByName(quotation.getNegotiatingByName());
        response.setNegotiatingNotes(quotation.getNegotiatingNotes());
        response.setRejectedAt(quotation.getRejectedAt());
        response.setRejectedByName(quotation.getRejectedByName());
        response.setRejectionNotes(quotation.getRejectionNotes());
        response.setAcceptedAt(quotation.getAcceptedAt());
        response.setAcceptedByName(quotation.getAcceptedByName());
        response.setAcceptanceNotes(quotation.getAcceptanceNotes());
        return response;
    }

    private User resolveActor(String principal) {
        if (!StringUtils.hasText(principal)) {
            throw new AccessDeniedException("Authentication required");
        }
        return userRepository.findByUsernameIgnoreCaseAndIsDeletedFalse(principal.trim())
                .or(() -> userRepository.findByEmailIgnoreCaseAndIsDeletedFalse(principal.trim()))
                .orElseThrow(() -> new AccessDeniedException("Authenticated user not found"));
    }

    private String writeJson(Object value) {
        if (value == null) {
            return null;
        }
        try {
            return objectMapper.writeValueAsString(value);
        } catch (JsonProcessingException ex) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid quotation payload");
        }
    }

    private Object readJson(String value) {
        if (!StringUtils.hasText(value)) {
            return null;
        }
        try {
            return objectMapper.readValue(value, Object.class);
        } catch (JsonProcessingException ex) {
            return null;
        }
    }

    private String resolveQuotationNumber(String requestedNumber) {
        if (StringUtils.hasText(requestedNumber)) {
            return requestedNumber.trim();
        }
        return "QT-" + System.currentTimeMillis();
    }

    private String resolveDisplayName(User user) {
        if (user == null) {
            return null;
        }
        String first = trimToNull(user.getFirstName());
        String last = trimToNull(user.getLastName());
        if (first != null && last != null) {
            return first + " " + last;
        }
        if (first != null) {
            return first;
        }
        if (last != null) {
            return last;
        }
        if (StringUtils.hasText(user.getUsername())) {
            return user.getUsername().trim();
        }
        return trimToNull(user.getEmail());
    }

    private String trimToNull(String value) {
        if (!StringUtils.hasText(value)) {
            return null;
        }
        return value.trim();
    }

    public void delete(Long id, String principal) {
        User actor = resolveActor(principal);
        Quotation quotation = quotationRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Quotation not found"));

        if (actor.getRole() != Role.SUPER_ADMIN) {
            throw new AccessDeniedException("Only super admins can delete quotations");
        }

        quotationRepository.deleteById(id);
    }

    private String normalize(String value) {
        if (!StringUtils.hasText(value)) {
            return "";
        }
        return value.trim().toUpperCase(Locale.ROOT);
    }
}
