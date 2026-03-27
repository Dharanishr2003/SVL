package com.nexorcrm.backend.entity;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "channel_partner_logs")
public class ChannelPartnerLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "channel_partner_id", nullable = false)
    private Long channelPartnerId;

    @Column(name = "log_event", nullable = false, length = 160)
    private String logEvent;

    @Column(name = "log_detail", nullable = false, length = 255)
    private String logDetail;

    @Column(name = "performed_by", length = 190)
    private String performedBy;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @PrePersist
    void onCreate() {
        if (createdAt == null) createdAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public Long getChannelPartnerId() { return channelPartnerId; }
    public void setChannelPartnerId(Long channelPartnerId) { this.channelPartnerId = channelPartnerId; }
    public String getLogEvent() { return logEvent; }
    public void setLogEvent(String logEvent) { this.logEvent = logEvent; }
    public String getLogDetail() { return logDetail; }
    public void setLogDetail(String logDetail) { this.logDetail = logDetail; }
    public String getPerformedBy() { return performedBy; }
    public void setPerformedBy(String performedBy) { this.performedBy = performedBy; }
    public LocalDateTime getCreatedAt() { return createdAt; }
}
