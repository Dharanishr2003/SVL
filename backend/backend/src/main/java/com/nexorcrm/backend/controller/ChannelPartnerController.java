package com.nexorcrm.backend.controller;

import com.nexorcrm.backend.dto.ApiMessageResponse;
import com.nexorcrm.backend.dto.ChannelPartnerMultipartRequest;
import com.nexorcrm.backend.dto.ChannelPartnerOwnerOptionResponse;
import com.nexorcrm.backend.dto.ChannelPartnerRequest;
import com.nexorcrm.backend.dto.ChannelPartnerResponse;
import com.nexorcrm.backend.dto.LeadResponse;
import com.nexorcrm.backend.dto.UpdateChannelPartnerOwnerRequest;
import com.nexorcrm.backend.service.ChannelPartnerService;
import com.nexorcrm.backend.service.LeadService;
import jakarta.validation.Valid;
import org.springframework.http.MediaType;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/channel-partners")
public class ChannelPartnerController {

    private final ChannelPartnerService channelPartnerService;
    private final LeadService leadService;

    public ChannelPartnerController(ChannelPartnerService channelPartnerService,
                                    LeadService leadService) {
        this.channelPartnerService = channelPartnerService;
        this.leadService = leadService;
    }

    @GetMapping
    public List<ChannelPartnerResponse> list(Authentication authentication) {
        return channelPartnerService.list(authentication.getName());
    }

    @GetMapping("/{id}")
    public ChannelPartnerResponse getById(@PathVariable("id") Long id,
                                          Authentication authentication) {
        return channelPartnerService.getById(id, authentication.getName());
    }

    @PostMapping
    public ChannelPartnerResponse create(@Valid @RequestBody ChannelPartnerRequest request,
                                         Authentication authentication) {
        return channelPartnerService.create(request, authentication.getName());
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ChannelPartnerResponse createMultipart(@Valid @ModelAttribute ChannelPartnerMultipartRequest request,
                                                  Authentication authentication) {
        return channelPartnerService.createMultipart(request, authentication.getName());
    }

    @PutMapping("/{id}")
    public ChannelPartnerResponse update(@PathVariable("id") Long id,
                                         @Valid @RequestBody ChannelPartnerRequest request,
                                         Authentication authentication) {
        return channelPartnerService.update(id, request, authentication.getName());
    }

    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ChannelPartnerResponse updateMultipart(@PathVariable("id") Long id,
                                                  @Valid @ModelAttribute ChannelPartnerMultipartRequest request,
                                                  Authentication authentication) {
        return channelPartnerService.updateMultipart(id, request, authentication.getName());
    }

    @GetMapping("/{id}/assignable-owners")
    public List<ChannelPartnerOwnerOptionResponse> listAssignableOwners(@PathVariable("id") Long id,
                                                                        Authentication authentication) {
        return channelPartnerService.listAssignableOwners(id, authentication.getName());
    }

    @GetMapping("/{id}/leads")
    public List<LeadResponse> listChannelPartnerLeads(@PathVariable("id") Long id,
                                                      Authentication authentication) {
        return leadService.listByChannelPartner(authentication.getName(), id);
    }

    @PatchMapping("/{id}/owner")
    public ChannelPartnerResponse updateOwner(@PathVariable("id") Long id,
                                              @Valid @RequestBody UpdateChannelPartnerOwnerRequest request,
                                              Authentication authentication) {
        return channelPartnerService.updateLeadOwner(id, request.getOwnerUserId(), authentication.getName());
    }

    @DeleteMapping("/{id}")
    public ApiMessageResponse delete(@PathVariable("id") Long id, Authentication authentication) {
        channelPartnerService.delete(id, authentication.getName());
        return new ApiMessageResponse("Channel partner deleted successfully");
    }
}
