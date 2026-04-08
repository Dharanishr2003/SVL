package com.nexorcrm.backend.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Lob;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "quotations")
public class Quotation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "quotation_number", length = 120)
    private String quotationNumber;

    @Column(name = "quotation_date")
    private LocalDate quotationDate;

    @Column(name = "customer_name", length = 255)
    private String customerName;

    @Column(name = "party_mode", length = 40)
    private String partyMode;

    @Lob
    @Column(name = "selected_lead_json", columnDefinition = "text")
    private String selectedLeadJson;

    @Lob
    @Column(name = "line_items_json", columnDefinition = "text")
    private String lineItemsJson;

    @Lob
    @Column(name = "totals_json", columnDefinition = "text")
    private String totalsJson;

    @Column(name = "discount_pct", precision = 10, scale = 2)
    private BigDecimal discountPct;

    @Column(name = "cgst_pct", precision = 10, scale = 2)
    private BigDecimal cgstPct;

    @Column(name = "sgst_pct", precision = 10, scale = 2)
    private BigDecimal sgstPct;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 40)
    private QuotationStatus status = QuotationStatus.DRAFT;

    @Column(name = "verification_requested_at")
    private LocalDateTime verificationRequestedAt;

    @Column(name = "verification_requested_by_id")
    private Long verificationRequestedById;

    @Column(name = "verification_requested_by_name", length = 255)
    private String verificationRequestedByName;

    @Column(name = "verification_requested_by_role", length = 40)
    private String verificationRequestedByRole;

    @Lob
    @Column(name = "verification_request_notes", columnDefinition = "text")
    private String verificationRequestNotes;

    @Column(name = "approved_at")
    private LocalDateTime approvedAt;

    @Column(name = "approved_by_id")
    private Long approvedById;

    @Column(name = "approved_by_name", length = 255)
    private String approvedByName;

    @Column(name = "approved_by_role", length = 40)
    private String approvedByRole;

    @Lob
    @Column(name = "approval_notes", columnDefinition = "text")
    private String approvalNotes;

    @Column(name = "sent_at")
    private LocalDateTime sentAt;

    @Column(name = "sent_by_name", length = 255)
    private String sentByName;

    @Column(name = "negotiating_at")
    private LocalDateTime negotiatingAt;

    @Column(name = "negotiating_by_name", length = 255)
    private String negotiatingByName;

    @Lob
    @Column(name = "negotiating_notes", columnDefinition = "text")
    private String negotiatingNotes;

    @Column(name = "rejected_at")
    private LocalDateTime rejectedAt;

    @Column(name = "rejected_by_name", length = 255)
    private String rejectedByName;

    @Lob
    @Column(name = "rejection_notes", columnDefinition = "text")
    private String rejectionNotes;

    @Column(name = "accepted_at")
    private LocalDateTime acceptedAt;

    @Column(name = "accepted_by_name", length = 255)
    private String acceptedByName;

    @Lob
    @Column(name = "acceptance_notes", columnDefinition = "text")
    private String acceptanceNotes;

    @Column(name = "created_by_id", nullable = false)
    private Long createdById;

    @Column(name = "created_by_name", length = 255)
    private String createdByName;

    @Column(name = "created_by_email", length = 255)
    private String createdByEmail;

    @Column(name = "created_by_role", length = 40)
    private String createdByRole;

    @Column(name = "created_by_team", length = 160)
    private String createdByTeam;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    void onCreate() {
        LocalDateTime now = LocalDateTime.now();
        if (createdAt == null) {
            createdAt = now;
        }
        updatedAt = now;
    }

    @PreUpdate
    void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public Long getId() {
        return id;
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

    public String getSelectedLeadJson() {
        return selectedLeadJson;
    }

    public void setSelectedLeadJson(String selectedLeadJson) {
        this.selectedLeadJson = selectedLeadJson;
    }

    public String getLineItemsJson() {
        return lineItemsJson;
    }

    public void setLineItemsJson(String lineItemsJson) {
        this.lineItemsJson = lineItemsJson;
    }

    public String getTotalsJson() {
        return totalsJson;
    }

    public void setTotalsJson(String totalsJson) {
        this.totalsJson = totalsJson;
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

    public QuotationStatus getStatus() {
        return status;
    }

    public void setStatus(QuotationStatus status) {
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

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
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
