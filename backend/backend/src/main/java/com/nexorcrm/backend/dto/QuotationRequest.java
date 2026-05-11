package com.nexorcrm.backend.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public class QuotationRequest {
    public static class GstRowRequest {
        private Long gstMasterId;
        private String taxName;
        private BigDecimal taxPercent;

        public Long getGstMasterId() { return gstMasterId; }
        public void setGstMasterId(Long gstMasterId) { this.gstMasterId = gstMasterId; }
        public String getTaxName() { return taxName; }
        public void setTaxName(String taxName) { this.taxName = taxName; }
        public BigDecimal getTaxPercent() { return taxPercent; }
        public void setTaxPercent(BigDecimal taxPercent) { this.taxPercent = taxPercent; }
    }

    private Long leadId;
    private String clientName;
    private String clientMobile;
    private String clientEmail;
    private String clientCompany;
    private BigDecimal discountPercent;
    private BigDecimal gstPercent;
    private BigDecimal gstPctTotal;
    private BigDecimal cgstPct;
    private BigDecimal sgstPct;
    private BigDecimal igstPct;
    private String notes;
    private LocalDate validityDate;
    private String status;
    private List<QuotationItemRequest> items;
    private List<GstRowRequest> gstRows;

    public Long getLeadId() { return leadId; }
    public void setLeadId(Long leadId) { this.leadId = leadId; }
    public String getClientName() { return clientName; }
    public void setClientName(String clientName) { this.clientName = clientName; }
    public String getClientMobile() { return clientMobile; }
    public void setClientMobile(String clientMobile) { this.clientMobile = clientMobile; }
    public String getClientEmail() { return clientEmail; }
    public void setClientEmail(String clientEmail) { this.clientEmail = clientEmail; }
    public String getClientCompany() { return clientCompany; }
    public void setClientCompany(String clientCompany) { this.clientCompany = clientCompany; }
    public BigDecimal getDiscountPercent() { return discountPercent; }
    public void setDiscountPercent(BigDecimal discountPercent) { this.discountPercent = discountPercent; }
    public BigDecimal getGstPercent() { return gstPercent; }
    public void setGstPercent(BigDecimal gstPercent) { this.gstPercent = gstPercent; }
    public BigDecimal getGstPctTotal() { return gstPctTotal; }
    public void setGstPctTotal(BigDecimal gstPctTotal) { this.gstPctTotal = gstPctTotal; }
    public BigDecimal getCgstPct() { return cgstPct; }
    public void setCgstPct(BigDecimal cgstPct) { this.cgstPct = cgstPct; }
    public BigDecimal getSgstPct() { return sgstPct; }
    public void setSgstPct(BigDecimal sgstPct) { this.sgstPct = sgstPct; }
    public BigDecimal getIgstPct() { return igstPct; }
    public void setIgstPct(BigDecimal igstPct) { this.igstPct = igstPct; }
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
    public LocalDate getValidityDate() { return validityDate; }
    public void setValidityDate(LocalDate validityDate) { this.validityDate = validityDate; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public List<QuotationItemRequest> getItems() { return items; }
    public void setItems(List<QuotationItemRequest> items) { this.items = items; }
    public List<GstRowRequest> getGstRows() { return gstRows; }
    public void setGstRows(List<GstRowRequest> gstRows) { this.gstRows = gstRows; }

    private Long createdById;
    private String createdByName;
    private String createdByEmail;
    private String createdByRole;
    private String createdByTeam;

    public Long getCreatedById() { return createdById; }
    public void setCreatedById(Long createdById) { this.createdById = createdById; }
    public String getCreatedByName() { return createdByName; }
    public void setCreatedByName(String createdByName) { this.createdByName = createdByName; }
    public String getCreatedByEmail() { return createdByEmail; }
    public void setCreatedByEmail(String createdByEmail) { this.createdByEmail = createdByEmail; }
    public String getCreatedByRole() { return createdByRole; }
    public void setCreatedByRole(String createdByRole) { this.createdByRole = createdByRole; }
    public String getCreatedByTeam() { return createdByTeam; }
    public void setCreatedByTeam(String createdByTeam) { this.createdByTeam = createdByTeam; }
}
