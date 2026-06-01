package com.nexorcrm.backend.service;

import com.nexorcrm.backend.dto.QuotationActionRequest;
import com.nexorcrm.backend.dto.QuotationItemRequest;
import com.nexorcrm.backend.dto.QuotationItemResponse;
import com.nexorcrm.backend.dto.QuotationRequest;
import com.nexorcrm.backend.dto.QuotationResponse;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.nexorcrm.backend.entity.Quotation;
import com.nexorcrm.backend.entity.Role;
import com.nexorcrm.backend.entity.User;
import com.nexorcrm.backend.entity.QuotationItem;
import com.nexorcrm.backend.entity.Lead;
import com.nexorcrm.backend.repo.QuotationRepository;
import com.nexorcrm.backend.repo.LeadRepository;
import com.nexorcrm.backend.repo.UserRepository;
import org.springframework.security.access.AccessDeniedException;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.util.StringUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.time.Year;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Optional;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
@Transactional
public class QuotationService {

    private final QuotationRepository quotationRepository;
    private final LeadRepository leadRepository;
    private final UserRepository userRepository;
    private final ObjectMapper objectMapper;

    public QuotationService(
            QuotationRepository quotationRepository,
            LeadRepository leadRepository,
            UserRepository userRepository,
            ObjectMapper objectMapper) {
        this.quotationRepository = quotationRepository;
        this.leadRepository = leadRepository;
        this.userRepository = userRepository;
        this.objectMapper = objectMapper;
    }

    public QuotationResponse createQuotation(QuotationRequest request) {
        Quotation quotation = new Quotation();
        quotation.setLeadId(request.getLeadId());
        quotation.setClientName(request.getClientName());
        quotation.setClientMobile(request.getClientMobile());
        quotation.setClientEmail(request.getClientEmail());
        quotation.setClientCompany(request.getClientCompany());
        quotation.setNotes(request.getNotes());
        quotation.setValidityDate(request.getValidityDate());
        String requestedStatus = normalizeStatus(request.getStatus());
        quotation.setStatus(requestedStatus != null ? requestedStatus : "DRAFT");
        quotation.setIncludeDesignFee(Boolean.TRUE.equals(request.getIncludeDesignFee()));
        quotation.setDesignFeeAmount(resolveDesignFeeAmount(request));
        if (request.getCreatedById() != null) quotation.setCreatedById(request.getCreatedById());
        if (request.getCreatedByName() != null) quotation.setCreatedByName(request.getCreatedByName());
        if (request.getCreatedByEmail() != null) quotation.setCreatedByEmail(request.getCreatedByEmail());
        if (request.getCreatedByRole() != null) quotation.setCreatedByRole(request.getCreatedByRole());
        if (request.getCreatedByTeam() != null) quotation.setCreatedByTeam(request.getCreatedByTeam());

        BigDecimal discountPercent = clampNonNegativePercent(request.getDiscountPercent());
        BigDecimal gstPercent = resolveGstPercent(request);
        quotation.setDiscountPercent(discountPercent);
        quotation.setGstPercent(gstPercent);
        quotation.setCgstPercent(scalePercent(request.getCgstPct()));
        quotation.setSgstPercent(scalePercent(request.getSgstPct()));
        quotation.setIgstPercent(scalePercent(request.getIgstPct()));
        quotation.setGstRowsJson(writeGstRowsJson(request.getGstRows()));

        Long seq = quotationRepository.nextQuotationSeq();
        quotation.setQuotationNumber("QT-" + Year.now().getValue() + "-" + seq);

        List<QuotationItem> items = new ArrayList<>();
        if (request.getItems() != null) {
            for (int i = 0; i < request.getItems().size(); i++) {
                QuotationItemRequest ir = request.getItems().get(i);
                QuotationItem item = new QuotationItem();
                item.setQuotation(quotation);
                item.setRequirementId(ir.getRequirementId());
                item.setProductName(ir.getProductName());
                item.setSpecsSummary(ir.getSpecsSummary());
                item.setSpecsJson(ir.getSpecsJson());
                item.setQuantity(ir.getQuantity() != null ? ir.getQuantity() : 1);
                item.setUnitPrice(ir.getUnitPrice() != null ? ir.getUnitPrice() : BigDecimal.ZERO);
                BigDecimal lineTotal = item.getUnitPrice()
                        .multiply(BigDecimal.valueOf(item.getQuantity()));
                item.setLineTotal(lineTotal);
                item.setSortOrder(i);
                items.add(item);
            }
        }
        quotation.setItems(items);
        recomputeTotals(quotation, discountPercent, gstPercent);

        applyApprovalMetadata(quotation, quotation.getStatus(), request);

        Quotation saved = quotationRepository.save(quotation);
        return toResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<QuotationResponse> getQuotationsByLead(Long leadId) {
        return quotationRepository.findByLeadIdOrderByCreatedAtDesc(leadId)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public QuotationResponse getQuotationById(Long id) {
        Quotation quotation = quotationRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Quotation not found"));
        return toResponse(quotation);
    }

    private QuotationResponse toResponse(Quotation q) {
        QuotationResponse r = new QuotationResponse();
        r.setId(q.getId());
        r.setLeadId(q.getLeadId());
        r.setQuotationNumber(q.getQuotationNumber());
        r.setClientName(q.getClientName());
        r.setClientMobile(q.getClientMobile());
        r.setClientEmail(q.getClientEmail());
        r.setClientCompany(q.getClientCompany());
        r.setSubtotal(q.getSubtotal());
        r.setDiscountPercent(q.getDiscountPercent());
        r.setGstPercent(q.getGstPercent());
        r.setGstPctTotal(q.getGstPercent());
        r.setCgstPct(q.getCgstPercent());
        r.setSgstPct(q.getSgstPercent());
        r.setIgstPct(q.getIgstPercent());
        r.setIncludeDesignFee(q.isIncludeDesignFee());
        r.setDesignFeeAmount(q.getDesignFeeAmount());
        r.setGrandTotal(q.getGrandTotal());
        r.setNotes(q.getNotes());
        r.setValidityDate(q.getValidityDate());
        r.setStatus(q.getStatus());
        r.setCreatedAt(q.getCreatedAt());
        r.setUpdatedAt(q.getUpdatedAt());
        r.setCreatedById(q.getCreatedById());
        r.setCreatedByName(q.getCreatedByName());
        r.setCreatedByEmail(q.getCreatedByEmail());
        r.setCreatedByRole(q.getCreatedByRole());
        r.setCreatedByTeam(q.getCreatedByTeam());
        r.setVerificationRequestedAt(q.getVerificationRequestedAt());
        r.setVerificationRequestedById(q.getVerificationRequestedById());
        r.setVerificationRequestedByName(q.getVerificationRequestedByName());
        r.setVerificationRequestedByRole(q.getVerificationRequestedByRole());
        r.setVerificationRequestNotes(q.getVerificationRequestNotes());
        r.setApprovedAt(q.getApprovedAt());
        r.setApprovedById(q.getApprovedById());
        r.setApprovedByName(q.getApprovedByName());
        r.setApprovedByRole(q.getApprovedByRole());
        r.setApprovalNotes(q.getApprovalNotes());
        r.setGstRows(readGstRows(q.getGstRowsJson()));
        r.setItems(q.getItems().stream().map(this::toItemResponse).collect(Collectors.toList()));
        return r;
    }

    private QuotationItemResponse toItemResponse(QuotationItem item) {
        QuotationItemResponse r = new QuotationItemResponse();
        r.setId(item.getId());
        r.setRequirementId(item.getRequirementId());
        r.setProductName(item.getProductName());
        r.setSpecsSummary(item.getSpecsSummary());
        r.setSpecsJson(item.getSpecsJson());
        r.setQuantity(item.getQuantity());
        r.setUnitPrice(item.getUnitPrice());
        r.setLineTotal(item.getLineTotal());
        r.setSortOrder(item.getSortOrder());
        return r;
    }

    @Transactional(readOnly = true)
    public List<QuotationResponse> getAllQuotations(String actorPrincipal) {
        User actor = resolveActor(actorPrincipal);
        List<Quotation> quotations = quotationRepository.findAllByOrderByCreatedAtDesc();
        if (actor != null) {
            if (actor.getRole() == Role.EMPLOYEE) {
                quotations = loadQuotationsForEmployee(actor);
            } else if (actor.getRole() == Role.TEAM_LEAD || actor.getRole() == Role.MANAGER) {
                quotations = quotations.stream()
                        .filter(quotation -> isVisibleToActor(actor, quotation))
                        .collect(Collectors.toList());
            }
        }
        return quotations
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<QuotationResponse> getAllQuotations() {
        return quotationRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public QuotationResponse updateQuotation(Long id, QuotationRequest request) {
        Quotation q = quotationRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Quotation not found: " + id));

        q.setClientName(request.getClientName());
        q.setClientMobile(request.getClientMobile());
        q.setClientEmail(request.getClientEmail());
        q.setClientCompany(request.getClientCompany());
        q.setNotes(request.getNotes());
        q.setValidityDate(request.getValidityDate());
        q.setIncludeDesignFee(Boolean.TRUE.equals(request.getIncludeDesignFee()));
        q.setDesignFeeAmount(resolveDesignFeeAmount(request));

        String requestedStatus = normalizeStatus(request.getStatus());
        if (requestedStatus != null) {
            q.setStatus(requestedStatus);
            applyApprovalMetadata(q, requestedStatus, request);
        }

        if (request.getDiscountPercent() != null) q.setDiscountPercent(clampNonNegativePercent(request.getDiscountPercent()));
        q.setGstPercent(resolveGstPercent(request));
        q.setCgstPercent(scalePercent(request.getCgstPct()));
        q.setSgstPercent(scalePercent(request.getSgstPct()));
        q.setIgstPercent(scalePercent(request.getIgstPct()));
        q.setGstRowsJson(writeGstRowsJson(request.getGstRows()));

        if (request.getItems() != null) {
            q.getItems().clear();
            for (int i = 0; i < request.getItems().size(); i++) {
                QuotationItemRequest ir = request.getItems().get(i);
                QuotationItem item = new QuotationItem();
                item.setQuotation(q);
                item.setRequirementId(ir.getRequirementId());
                item.setProductName(ir.getProductName());
                item.setSpecsSummary(ir.getSpecsSummary());
                item.setSpecsJson(ir.getSpecsJson());
                item.setQuantity(ir.getQuantity() != null ? ir.getQuantity() : 1);
                item.setUnitPrice(ir.getUnitPrice() != null ? ir.getUnitPrice() : BigDecimal.ZERO);
                BigDecimal lineTotal = item.getUnitPrice()
                        .multiply(BigDecimal.valueOf(item.getQuantity()));
                item.setLineTotal(lineTotal);
                item.setSortOrder(i);
                q.getItems().add(item);
            }
        }

        recomputeTotals(q, q.getDiscountPercent(), q.getGstPercent());

        return toResponse(quotationRepository.save(q));
    }

    private String normalizeStatus(String status) {
        if (status == null || status.isBlank()) {
            return null;
        }
        return status.trim().toUpperCase(Locale.ROOT);
    }

    private void applyApprovalMetadata(Quotation quotation, String status, QuotationRequest request) {
        if (!"APPROVED".equals(status)) {
            quotation.setApprovedAt(null);
            quotation.setApprovedById(null);
            quotation.setApprovedByName(null);
            quotation.setApprovedByRole(null);
            quotation.setApprovalNotes(null);
            return;
        }

        quotation.setApprovedAt(LocalDateTime.now());
        quotation.setApprovedById(request.getCreatedById());
        quotation.setApprovedByName(request.getCreatedByName());
        quotation.setApprovedByRole(request.getCreatedByRole());
        quotation.setApprovalNotes(request.getNotes());
    }

    private BigDecimal resolveGstPercent(QuotationRequest request) {
        if (request.getGstPctTotal() != null) {
            return scalePercent(request.getGstPctTotal());
        }
        if (request.getGstPercent() != null) {
            return scalePercent(request.getGstPercent());
        }
        return scalePercent(request.getCgstPct())
                .add(scalePercent(request.getSgstPct()))
                .add(scalePercent(request.getIgstPct()));
    }

    private BigDecimal scalePercent(BigDecimal value) {
        return value == null ? BigDecimal.ZERO : value.setScale(2, RoundingMode.HALF_UP);
    }

    private void recomputeTotals(Quotation quotation, BigDecimal discountPercent, BigDecimal gstPercent) {
        BigDecimal itemsSubtotal = quotation.getItems() == null
                ? BigDecimal.ZERO
                : quotation.getItems().stream()
                .map(item -> item.getLineTotal() == null ? BigDecimal.ZERO : item.getLineTotal())
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal designFee = quotation.isIncludeDesignFee()
                ? scaleMoney(quotation.getDesignFeeAmount())
                : BigDecimal.ZERO;
        BigDecimal subtotal = itemsSubtotal.add(designFee);
        quotation.setSubtotal(subtotal);

        BigDecimal discount = clampNonNegativePercent(discountPercent);
        BigDecimal gst = gstPercent == null ? BigDecimal.ZERO : gstPercent;
        BigDecimal afterDiscount = subtotal.multiply(
                BigDecimal.ONE.subtract(discount.divide(new BigDecimal("100"), 10, RoundingMode.HALF_UP))
        );
        BigDecimal grandTotal = afterDiscount.multiply(
                BigDecimal.ONE.add(gst.divide(new BigDecimal("100"), 10, RoundingMode.HALF_UP))
        ).setScale(2, RoundingMode.HALF_UP);
        quotation.setGrandTotal(grandTotal);
    }

    private BigDecimal resolveDesignFeeAmount(QuotationRequest request) {
        if (!Boolean.TRUE.equals(request.getIncludeDesignFee())) {
            return BigDecimal.ZERO;
        }
        return scaleMoney(request.getDesignFeeAmount());
    }

    private BigDecimal clampNonNegativePercent(BigDecimal value) {
        if (value == null) {
            return BigDecimal.ZERO;
        }
        BigDecimal scaled = value.setScale(2, RoundingMode.HALF_UP);
        return scaled.compareTo(BigDecimal.ZERO) < 0 ? BigDecimal.ZERO : scaled;
    }

    private BigDecimal scaleMoney(BigDecimal value) {
        return value == null ? BigDecimal.ZERO : value.setScale(2, RoundingMode.HALF_UP);
    }

    private List<Quotation> loadQuotationsForEmployee(User actor) {
        // Collect all lead IDs assigned to this employee (via ownerUserId)
        List<Long> myLeadIds = new ArrayList<>();
        if (actor.getId() != null) {
            leadRepository.findByDeletedFalseAndOwnerUserIdOrderByCreatedAtDesc(actor.getId())
                    .forEach(lead -> myLeadIds.add(lead.getId()));
        }

        // Quotations the employee created themselves
        List<Quotation> ownQuotations = quotationRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .filter(quotation -> isOwnedByActor(actor, quotation))
                .collect(Collectors.toList());

        // Quotations on this employee's leads (created by team lead / manager / admin / super admin)
        List<Quotation> leadQuotations = myLeadIds.isEmpty()
                ? new ArrayList<>()
                : quotationRepository.findByLeadIdInOrderByCreatedAtDesc(myLeadIds);

        // Merge and deduplicate by quotation ID
        java.util.Map<Long, Quotation> merged = new java.util.LinkedHashMap<>();
        for (Quotation q : ownQuotations) {
            if (q.getId() != null) merged.put(q.getId(), q);
        }
        for (Quotation q : leadQuotations) {
            if (q.getId() != null) merged.putIfAbsent(q.getId(), q);
        }

        List<Quotation> quotations = new ArrayList<>(merged.values());
        quotations.sort((left, right) -> {
            LocalDateTime leftCreated = left.getCreatedAt();
            LocalDateTime rightCreated = right.getCreatedAt();
            if (leftCreated == null && rightCreated == null) return 0;
            if (leftCreated == null) return 1;
            if (rightCreated == null) return -1;
            return rightCreated.compareTo(leftCreated);
        });
        return quotations;
    }

    private boolean isVisibleToActor(User actor, Quotation quotation) {
        if (actor == null || quotation == null || actor.getRole() == null) {
            return false;
        }
        if (actor.getRole() == Role.ADMIN || actor.getRole() == Role.SUPER_ADMIN) {
            return true;
        }
        User leadOwner = resolveLeadOwner(quotation);
        if (leadOwner != null) {
            if (actor.getRole() == Role.EMPLOYEE) {
                return Objects.equals(actor.getId(), leadOwner.getId()) || isOwnedByActor(actor, quotation);
            }
            if (actor.getRole() == Role.TEAM_LEAD) {
                return matchesScope(leadOwner.getInstitutionName(), actor.getInstitutionName())
                        && matchesScope(leadOwner.getDepartmentName(), actor.getDepartmentName())
                        && matchesScope(leadOwner.getTeamName(), actor.getTeamName());
            }
            if (actor.getRole() == Role.MANAGER) {
                return matchesScope(leadOwner.getInstitutionName(), actor.getInstitutionName())
                        && matchesScope(leadOwner.getDepartmentName(), actor.getDepartmentName());
            }
        }

        User creator = resolveQuotationCreator(quotation);
        if (creator != null) {
            if (actor.getRole() == Role.EMPLOYEE) {
                return isOwnedByActor(actor, quotation);
            }
            if (actor.getRole() == Role.TEAM_LEAD) {
                return matchesScope(creator.getInstitutionName(), actor.getInstitutionName())
                        && matchesScope(creator.getDepartmentName(), actor.getDepartmentName())
                        && matchesScope(creator.getTeamName(), actor.getTeamName());
            }
            if (actor.getRole() == Role.MANAGER) {
                return matchesScope(creator.getInstitutionName(), actor.getInstitutionName())
                        && matchesScope(creator.getDepartmentName(), actor.getDepartmentName());
            }
        }

        return isOwnedByActor(actor, quotation);
    }

    private boolean isOwnedByActor(User actor, Quotation quotation) {
        if (actor.getId() != null && quotation.getCreatedById() != null) {
            return actor.getId().equals(quotation.getCreatedById());
        }
        if (StringUtils.hasText(actor.getEmail()) && StringUtils.hasText(quotation.getCreatedByEmail())) {
            return actor.getEmail().trim().equalsIgnoreCase(quotation.getCreatedByEmail().trim());
        }
        String actorFullName = String.join(" ",
                StringUtils.hasText(actor.getFirstName()) ? actor.getFirstName().trim() : "",
                StringUtils.hasText(actor.getLastName()) ? actor.getLastName().trim() : "").trim();
        if (StringUtils.hasText(actorFullName) && StringUtils.hasText(quotation.getCreatedByName())) {
            return actorFullName.equalsIgnoreCase(quotation.getCreatedByName().trim());
        }
        if (StringUtils.hasText(actor.getUsername()) && StringUtils.hasText(quotation.getCreatedByName())) {
            return actor.getUsername().trim().equalsIgnoreCase(quotation.getCreatedByName().trim());
        }
        return false;
    }

    private User resolveQuotationCreator(Quotation quotation) {
        if (quotation == null) {
            return null;
        }
        if (quotation.getCreatedById() != null) {
            return userRepository.findByIdAndIsDeletedFalse(quotation.getCreatedById()).orElse(null);
        }
        if (StringUtils.hasText(quotation.getCreatedByEmail())) {
            return userRepository.findByEmailIgnoreCaseAndIsDeletedFalse(quotation.getCreatedByEmail().trim()).orElse(null);
        }
        return null;
    }

    private User resolveLeadOwner(Quotation quotation) {
        if (quotation == null || quotation.getLeadId() == null) {
            return null;
        }
        Lead lead = leadRepository.findByIdAndDeletedFalse(quotation.getLeadId()).orElse(null);
        if (lead == null || lead.getOwnerUserId() == null) {
            return null;
        }
        return userRepository.findByIdAndIsDeletedFalse(lead.getOwnerUserId()).orElse(null);
    }

    private boolean matchesScope(String left, String right) {
        return StringUtils.hasText(left)
                && StringUtils.hasText(right)
                && left.trim().equalsIgnoreCase(right.trim());
    }

    private User resolveActor(String actorPrincipal) {
        if (!StringUtils.hasText(actorPrincipal)) {
            throw new AccessDeniedException("Unauthenticated actor");
        }
        String principal = actorPrincipal.trim();
        Optional<User> user = principal.contains("@")
                ? userRepository.findByEmailAndIsDeletedFalse(principal.toLowerCase(Locale.ROOT))
                : userRepository.findByUsernameAndIsDeletedFalse(principal);
        if (user.isEmpty() && principal.contains("@")) {
            user = userRepository.findByEmailIgnoreCaseAndIsDeletedFalse(principal);
        }
        return user.orElseThrow(() -> new AccessDeniedException("Actor not found"));
    }

    private String writeGstRowsJson(List<QuotationRequest.GstRowRequest> gstRows) {
        try {
            return objectMapper.writeValueAsString(gstRows == null ? List.of() : gstRows);
        } catch (JsonProcessingException ex) {
            throw new IllegalArgumentException("Unable to serialize GST rows", ex);
        }
    }

    private List<QuotationResponse.GstRowResponse> readGstRows(String gstRowsJson) {
        try {
            List<QuotationRequest.GstRowRequest> rows = objectMapper.readValue(
                    gstRowsJson == null || gstRowsJson.isBlank() ? "[]" : gstRowsJson,
                    new TypeReference<List<QuotationRequest.GstRowRequest>>() {}
            );
            return rows.stream().map(row -> {
                QuotationResponse.GstRowResponse response = new QuotationResponse.GstRowResponse();
                response.setGstMasterId(row.getGstMasterId());
                response.setTaxName(row.getTaxName());
                response.setTaxPercent(row.getTaxPercent());
                return response;
            }).toList();
        } catch (JsonProcessingException ex) {
            return List.of();
        }
    }

    public void deleteQuotation(Long id) {
        if (!quotationRepository.existsById(id)) {
            throw new EntityNotFoundException("Quotation not found: " + id);
        }
        quotationRepository.deleteById(id);
    }

    public QuotationResponse sendForVerification(Long id, QuotationActionRequest req) {
        Quotation q = quotationRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Quotation not found: " + id));
        q.setStatus("VERIFICATION_PENDING");
        q.setVerificationRequestedAt(LocalDateTime.now());
        if (req != null) {
            q.setVerificationRequestedById(req.getActorId());
            q.setVerificationRequestedByName(req.getActorName());
            q.setVerificationRequestedByRole(req.getActorRole());
            q.setVerificationRequestNotes(req.getNotes());
        }
        return toResponse(quotationRepository.save(q));
    }

    public QuotationResponse approveQuotation(Long id, QuotationActionRequest req) {
        Quotation q = quotationRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Quotation not found: " + id));
        q.setStatus("APPROVED");
        q.setApprovedAt(LocalDateTime.now());
        if (req != null) {
            q.setApprovedById(req.getActorId());
            q.setApprovedByName(req.getActorName());
            q.setApprovedByRole(req.getActorRole());
            q.setApprovalNotes(req.getNotes());
        }
        return toResponse(quotationRepository.save(q));
    }

    public QuotationResponse markSent(Long id) {
        Quotation q = quotationRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Quotation not found: " + id));
        q.setStatus("QUOTATION_SENT");
        return toResponse(quotationRepository.save(q));
    }

    public QuotationResponse markNegotiating(Long id, QuotationActionRequest req) {
        Quotation q = quotationRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Quotation not found: " + id));
        q.setStatus("NEGOTIATING");
        if (req != null && req.getNotes() != null) q.setApprovalNotes(req.getNotes());
        return toResponse(quotationRepository.save(q));
    }

    public QuotationResponse markRejected(Long id, QuotationActionRequest req) {
        Quotation q = quotationRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Quotation not found: " + id));
        q.setStatus("QUOTATION_REJECTED");
        if (req != null && req.getNotes() != null) q.setApprovalNotes(req.getNotes());
        return toResponse(quotationRepository.save(q));
    }

    public QuotationResponse markAccepted(Long id, QuotationActionRequest req) {
        Quotation q = quotationRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Quotation not found: " + id));
        q.setStatus("QUOTATION_ACCEPTED");
        if (req != null && req.getNotes() != null) q.setApprovalNotes(req.getNotes());
        return toResponse(quotationRepository.save(q));
    }
}
