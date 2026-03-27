package com.nexorcrm.backend.service;

import com.nexorcrm.backend.dto.ChannelPartnerLogResponse;
import com.nexorcrm.backend.entity.ChannelPartnerLog;
import com.nexorcrm.backend.entity.User;
import com.nexorcrm.backend.repo.ChannelPartnerLogRepository;
import com.nexorcrm.backend.repo.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.List;
import java.util.Locale;

@Service
@Transactional
public class ChannelPartnerLogService {

    private final ChannelPartnerLogRepository channelPartnerLogRepository;
    private final UserRepository userRepository;

    public ChannelPartnerLogService(ChannelPartnerLogRepository channelPartnerLogRepository,
                                    UserRepository userRepository) {
        this.channelPartnerLogRepository = channelPartnerLogRepository;
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public List<ChannelPartnerLogResponse> listTop10(Long channelPartnerId, String actorPrincipal) {
        resolveActor(actorPrincipal);
        return channelPartnerLogRepository.findTop10ByChannelPartnerIdOrderByCreatedAtDesc(channelPartnerId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public void log(Long channelPartnerId, String event, String detail, String performedBy) {
        ChannelPartnerLog row = new ChannelPartnerLog();
        row.setChannelPartnerId(channelPartnerId);
        row.setLogEvent(event);
        row.setLogDetail(detail);
        row.setPerformedBy(performedBy);
        channelPartnerLogRepository.save(row);
    }

    private User resolveActor(String actorPrincipal) {
        if (!StringUtils.hasText(actorPrincipal)) {
            throw new AccessDeniedException("Unauthenticated actor");
        }

        if (actorPrincipal.contains("@")) {
            return userRepository.findByEmailAndIsDeletedFalse(actorPrincipal.trim().toLowerCase(Locale.ROOT))
                    .orElseThrow(() -> new EntityNotFoundException("Actor not found"));
        }

        return userRepository.findByUsernameAndIsDeletedFalse(actorPrincipal.trim())
                .orElseThrow(() -> new EntityNotFoundException("Actor not found"));
    }

    private ChannelPartnerLogResponse toResponse(ChannelPartnerLog row) {
        ChannelPartnerLogResponse res = new ChannelPartnerLogResponse();
        res.setId(row.getId());
        res.setChannelPartnerId(row.getChannelPartnerId());
        res.setLogEvent(row.getLogEvent());
        res.setLogDetail(row.getLogDetail());
        res.setPerformedBy(row.getPerformedBy());
        res.setCreatedDate(row.getCreatedAt());
        return res;
    }
}
