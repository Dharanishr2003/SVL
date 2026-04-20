package com.nexorcrm.backend.dto;

import java.math.BigDecimal;

public class QuotationItemRequest {
    private Long requirementId;
    private String productName;
    private String specsSummary;
    private String specsJson;
    private Integer quantity;
    private BigDecimal unitPrice;

    public Long getRequirementId() { return requirementId; }
    public void setRequirementId(Long requirementId) { this.requirementId = requirementId; }
    public String getProductName() { return productName; }
    public void setProductName(String productName) { this.productName = productName; }
    public String getSpecsSummary() { return specsSummary; }
    public void setSpecsSummary(String specsSummary) { this.specsSummary = specsSummary; }
    public String getSpecsJson() { return specsJson; }
    public void setSpecsJson(String specsJson) { this.specsJson = specsJson; }
    public Integer getQuantity() { return quantity; }
    public void setQuantity(Integer quantity) { this.quantity = quantity; }
    public BigDecimal getUnitPrice() { return unitPrice; }
    public void setUnitPrice(BigDecimal unitPrice) { this.unitPrice = unitPrice; }
}
