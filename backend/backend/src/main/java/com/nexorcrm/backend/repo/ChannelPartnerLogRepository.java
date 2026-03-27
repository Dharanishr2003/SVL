package com.nexorcrm.backend.repo;

import com.nexorcrm.backend.entity.ChannelPartnerLog;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ChannelPartnerLogRepository extends JpaRepository<ChannelPartnerLog, Long> {
    List<ChannelPartnerLog> findTop10ByChannelPartnerIdOrderByCreatedAtDesc(Long channelPartnerId);
}
