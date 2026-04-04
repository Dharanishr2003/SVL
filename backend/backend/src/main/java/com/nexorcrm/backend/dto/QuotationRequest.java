package com.nexorcrm.backend.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

public class QuotationRequest {
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
}
