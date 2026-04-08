package com.nexorcrm.backend.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public class QuotationResponse {
    private Long id;
    private String quotationNumber;
    private LocalDate quotationDate;
    private String customerName;
    private String partyMode;
    private Object selectedLead;
    private Object lineItems;
    private Object totals;
    private BigDecimal discountPct;
    private BigDecimal cgstPct;
    private BigDecimal sgstPct;
    private String status;
    private LocalDateTime verificationRequestedAt;
    private Long verificationRequestedById;
    private String verificationRequestedByName;
    private String verificationRequestedByRole;
    private String verificationRequestNotes;
    private LocalDateTime approvedAt;
    private Long approvedById;
    private String approvedByName;
    private String approvedByRole;
    private String approvalNotes;
    private LocalDateTime sentAt;
    private String sentByName;
    private LocalDateTime negotiatingAt;
    private String negotiatingByName;
    private String negotiatingNotes;
    private LocalDateTime rejectedAt;
    private String rejectedByName;
    private String rejectionNotes;
    private LocalDateTime acceptedAt;
    private String acceptedByName;
    private String acceptanceNotes;
    private Long createdById;
    private String createdByName;
    private String createdByEmail;
    private String createdByRole;
    private String createdByTeam;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getQuotationNumber() {
        return quotationNumber;
    }

    public void setQuotationNumber(String quotationNumber) {
        this.quotationNumber = quotationNumber;
    }

    public LocalDate getQuotationDate() {
        return quotationDate;
    }

    public void setQuotationDate(LocalDate quotationDate) {
        this.quotationDate = quotationDate;
    }

    public String getCustomerName() {
        return customerName;
    }

    public void setCustomerName(String customerName) {
        this.customerName = customerName;
    }

    public String getPartyMode() {
        return partyMode;
    }

    public void setPartyMode(String partyMode) {
        this.partyMode = partyMode;
    }

    public Object getSelectedLead() {
        return selectedLead;
    }

    public void setSelectedLead(Object selectedLead) {
        this.selectedLead = selectedLead;
    }

    public Object getLineItems() {
        return lineItems;
    }

    public void setLineItems(Object lineItems) {
        this.lineItems = lineItems;
    }

    public Object getTotals() {
        return totals;
    }

    public void setTotals(Object totals) {
        this.totals = totals;
    }

    public BigDecimal getDiscountPct() {
        return discountPct;
    }

    public void setDiscountPct(BigDecimal discountPct) {
        this.discountPct = discountPct;
    }

    public BigDecimal getCgstPct() {
        return cgstPct;
    }

    public void setCgstPct(BigDecimal cgstPct) {
        this.cgstPct = cgstPct;
    }

    public BigDecimal getSgstPct() {
        return sgstPct;
    }

    public void setSgstPct(BigDecimal sgstPct) {
        this.sgstPct = sgstPct;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public LocalDateTime getVerificationRequestedAt() {
        return verificationRequestedAt;
    }

    public void setVerificationRequestedAt(LocalDateTime verificationRequestedAt) {
        this.verificationRequestedAt = verificationRequestedAt;
    }

    public Long getVerificationRequestedById() {
        return verificationRequestedById;
    }

    public void setVerificationRequestedById(Long verificationRequestedById) {
        this.verificationRequestedById = verificationRequestedById;
    }

    public String getVerificationRequestedByName() {
        return verificationRequestedByName;
    }

    public void setVerificationRequestedByName(String verificationRequestedByName) {
        this.verificationRequestedByName = verificationRequestedByName;
    }

    public String getVerificationRequestedByRole() {
        return verificationRequestedByRole;
    }

    public void setVerificationRequestedByRole(String verificationRequestedByRole) {
        this.verificationRequestedByRole = verificationRequestedByRole;
    }

    public String getVerificationRequestNotes() {
        return verificationRequestNotes;
    }

    public void setVerificationRequestNotes(String verificationRequestNotes) {
        this.verificationRequestNotes = verificationRequestNotes;
    }

    public LocalDateTime getApprovedAt() {
        return approvedAt;
    }

    public void setApprovedAt(LocalDateTime approvedAt) {
        this.approvedAt = approvedAt;
    }

    public Long getApprovedById() {
        return approvedById;
    }

    public void setApprovedById(Long approvedById) {
        this.approvedById = approvedById;
    }

    public String getApprovedByName() {
        return approvedByName;
    }

    public void setApprovedByName(String approvedByName) {
        this.approvedByName = approvedByName;
    }

    public String getApprovedByRole() {
        return approvedByRole;
    }

    public void setApprovedByRole(String approvedByRole) {
        this.approvedByRole = approvedByRole;
    }

    public String getApprovalNotes() {
        return approvalNotes;
    }

    public void setApprovalNotes(String approvalNotes) {
        this.approvalNotes = approvalNotes;
    }

    public Long getCreatedById() {
        return createdById;
    }

    public void setCreatedById(Long createdById) {
        this.createdById = createdById;
    }

    public String getCreatedByName() {
        return createdByName;
    }

    public void setCreatedByName(String createdByName) {
        this.createdByName = createdByName;
    }

    public String getCreatedByEmail() {
        return createdByEmail;
    }

    public void setCreatedByEmail(String createdByEmail) {
        this.createdByEmail = createdByEmail;
    }

    public String getCreatedByRole() {
        return createdByRole;
    }

    public void setCreatedByRole(String createdByRole) {
        this.createdByRole = createdByRole;
    }

    public String getCreatedByTeam() {
        return createdByTeam;
    }

    public void setCreatedByTeam(String createdByTeam) {
        this.createdByTeam = createdByTeam;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    public LocalDateTime getSentAt() { return sentAt; }
    public void setSentAt(LocalDateTime sentAt) { this.sentAt = sentAt; }

    public String getSentByName() { return sentByName; }
    public void setSentByName(String sentByName) { this.sentByName = sentByName; }

    public LocalDateTime getNegotiatingAt() { return negotiatingAt; }
    public void setNegotiatingAt(LocalDateTime negotiatingAt) { this.negotiatingAt = negotiatingAt; }

    public String getNegotiatingByName() { return negotiatingByName; }
    public void setNegotiatingByName(String negotiatingByName) { this.negotiatingByName = negotiatingByName; }

    public String getNegotiatingNotes() { return negotiatingNotes; }
    public void setNegotiatingNotes(String negotiatingNotes) { this.negotiatingNotes = negotiatingNotes; }

    public LocalDateTime getRejectedAt() { return rejectedAt; }
    public void setRejectedAt(LocalDateTime rejectedAt) { this.rejectedAt = rejectedAt; }

    public String getRejectedByName() { return rejectedByName; }
    public void setRejectedByName(String rejectedByName) { this.rejectedByName = rejectedByName; }

    public String getRejectionNotes() { return rejectionNotes; }
    public void setRejectionNotes(String rejectionNotes) { this.rejectionNotes = rejectionNotes; }

    public LocalDateTime getAcceptedAt() { return acceptedAt; }
    public void setAcceptedAt(LocalDateTime acceptedAt) { this.acceptedAt = acceptedAt; }

    public String getAcceptedByName() { return acceptedByName; }
    public void setAcceptedByName(String acceptedByName) { this.acceptedByName = acceptedByName; }

    public String getAcceptanceNotes() { return acceptanceNotes; }
    public void setAcceptanceNotes(String acceptanceNotes) { this.acceptanceNotes = acceptanceNotes; }
}
