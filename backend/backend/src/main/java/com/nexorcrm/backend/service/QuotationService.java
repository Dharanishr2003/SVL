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
import com.nexorcrm.backend.entity.QuotationItem;
import com.nexorcrm.backend.repo.QuotationRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.time.Year;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.stream.Collectors;

@Service
@Transactional
public class QuotationService {

    private final QuotationRepository quotationRepository;
    private final ObjectMapper objectMapper;

    public QuotationService(QuotationRepository quotationRepository, ObjectMapper objectMapper) {
        this.quotationRepository = quotationRepository;
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
        if (request.getCreatedById() != null) quotation.setCreatedById(request.getCreatedById());
        if (request.getCreatedByName() != null) quotation.setCreatedByName(request.getCreatedByName());
        if (request.getCreatedByEmail() != null) quotation.setCreatedByEmail(request.getCreatedByEmail());
        if (request.getCreatedByRole() != null) quotation.setCreatedByRole(request.getCreatedByRole());
        if (request.getCreatedByTeam() != null) quotation.setCreatedByTeam(request.getCreatedByTeam());

        BigDecimal discountPercent = request.getDiscountPercent() != null
                ? request.getDiscountPercent() : BigDecimal.ZERO;
        BigDecimal gstPercent = resolveGstPercent(request);
        quotation.setDiscountPercent(discountPercent);
        quotation.setGstPercent(gstPercent);
        quotation.setCgstPercent(scalePercent(request.getCgstPct()));
        quotation.setSgstPercent(scalePercent(request.getSgstPct()));
        quotation.setIgstPercent(scalePercent(request.getIgstPct()));
        quotation.setGstRowsJson(writeGstRowsJson(request.getGstRows()));

        Long seq = quotationRepository.nextQuotationSeq();
        quotation.setQuotationNumber("QT-" + Year.now().getValue() + "-" + seq);

        BigDecimal subtotal = BigDecimal.ZERO;
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
                subtotal = subtotal.add(lineTotal);
            }
        }
        quotation.setItems(items);
        quotation.setSubtotal(subtotal);

        BigDecimal afterDiscount = subtotal.multiply(
                BigDecimal.ONE.subtract(discountPercent.divide(new BigDecimal("100"), 10, RoundingMode.HALF_UP))
        );
        BigDecimal grandTotal = afterDiscount.multiply(
                BigDecimal.ONE.add(gstPercent.divide(new BigDecimal("100"), 10, RoundingMode.HALF_UP))
        ).setScale(2, RoundingMode.HALF_UP);
        quotation.setGrandTotal(grandTotal);

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

        String requestedStatus = normalizeStatus(request.getStatus());
        if (requestedStatus != null) {
            q.setStatus(requestedStatus);
            applyApprovalMetadata(q, requestedStatus, request);
        }

        if (request.getDiscountPercent() != null) q.setDiscountPercent(request.getDiscountPercent());
        q.setGstPercent(resolveGstPercent(request));
        q.setCgstPercent(scalePercent(request.getCgstPct()));
        q.setSgstPercent(scalePercent(request.getSgstPct()));
        q.setIgstPercent(scalePercent(request.getIgstPct()));
        q.setGstRowsJson(writeGstRowsJson(request.getGstRows()));

        if (request.getItems() != null) {
            q.getItems().clear();
            BigDecimal subtotal = BigDecimal.ZERO;
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
                subtotal = subtotal.add(lineTotal);
            }
            q.setSubtotal(subtotal);
            BigDecimal afterDiscount = subtotal.multiply(
                    BigDecimal.ONE.subtract(q.getDiscountPercent()
                            .divide(new BigDecimal("100"), 10, RoundingMode.HALF_UP)));
            BigDecimal grandTotal = afterDiscount.multiply(
                    BigDecimal.ONE.add(q.getGstPercent()
                            .divide(new BigDecimal("100"), 10, RoundingMode.HALF_UP)))
                    .setScale(2, RoundingMode.HALF_UP);
            q.setGrandTotal(grandTotal);
        }

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
