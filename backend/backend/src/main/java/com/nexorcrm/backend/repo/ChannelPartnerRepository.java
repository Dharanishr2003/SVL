package com.nexorcrm.backend.repo;

import com.nexorcrm.backend.entity.ChannelPartner;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ChannelPartnerRepository extends JpaRepository<ChannelPartner, Long> {
    List<ChannelPartner> findByDeletedFalseOrderByCreatedAtDesc();
    Optional<ChannelPartner> findByIdAndDeletedFalse(Long id);
}
