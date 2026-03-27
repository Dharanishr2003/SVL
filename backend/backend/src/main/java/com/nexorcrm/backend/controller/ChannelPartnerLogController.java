package com.nexorcrm.backend.controller;

import com.nexorcrm.backend.dto.ChannelPartnerLogResponse;
import com.nexorcrm.backend.service.ChannelPartnerLogService;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/channel-partners")
public class ChannelPartnerLogController {

    private final ChannelPartnerLogService channelPartnerLogService;

    public ChannelPartnerLogController(ChannelPartnerLogService channelPartnerLogService) {
        this.channelPartnerLogService = channelPartnerLogService;
    }

    @GetMapping("/{id}/logs")
    public List<ChannelPartnerLogResponse> listLogs(@PathVariable("id") Long id,
                                                    Authentication authentication) {
        return channelPartnerLogService.listTop10(id, authentication.getName());
    }
}
