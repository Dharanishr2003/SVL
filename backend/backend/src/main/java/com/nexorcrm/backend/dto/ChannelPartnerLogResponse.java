package com.nexorcrm.backend.dto;

import java.time.LocalDateTime;

public class ChannelPartnerLogResponse {
    private Long id;
    private Long channelPartnerId;
    private String logEvent;
    private String logDetail;
    private String performedBy;
    private LocalDateTime createdDate;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getChannelPartnerId() {
        return channelPartnerId;
    }

    public void setChannelPartnerId(Long channelPartnerId) {
        this.channelPartnerId = channelPartnerId;
    }

    public String getLogEvent() {
        return logEvent;
    }

    public void setLogEvent(String logEvent) {
        this.logEvent = logEvent;
    }

    public String getLogDetail() {
        return logDetail;
    }

    public void setLogDetail(String logDetail) {
        this.logDetail = logDetail;
    }

    public String getPerformedBy() {
        return performedBy;
    }

    public void setPerformedBy(String performedBy) {
        this.performedBy = performedBy;
    }

    public LocalDateTime getCreatedDate() {
        return createdDate;
    }

    public void setCreatedDate(LocalDateTime createdDate) {
        this.createdDate = createdDate;
    }
}
