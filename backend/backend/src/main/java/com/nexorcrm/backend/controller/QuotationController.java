package com.nexorcrm.backend.controller;

import com.nexorcrm.backend.dto.QuotationActionRequest;
import com.nexorcrm.backend.dto.QuotationRequest;
import com.nexorcrm.backend.dto.QuotationResponse;
import com.nexorcrm.backend.service.QuotationService;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/quotations")
public class QuotationController {

    private final QuotationService quotationService;

    public QuotationController(QuotationService quotationService) {
        this.quotationService = quotationService;
    }

    @GetMapping
    public List<QuotationResponse> list(Authentication authentication) {
        String principal = authentication != null ? authentication.getName() : null;
        return quotationService.list(principal);
    }

    @GetMapping("/{id}")
    public QuotationResponse getById(@PathVariable Long id, Authentication authentication) {
        String principal = authentication != null ? authentication.getName() : null;
        return quotationService.getById(id, principal);
    }

    @PostMapping
    public QuotationResponse create(@RequestBody QuotationRequest request, Authentication authentication) {
        String principal = authentication != null ? authentication.getName() : null;
        return quotationService.create(request, principal);
    }

    @PutMapping("/{id}")
    public QuotationResponse update(
            @PathVariable Long id,
            @RequestBody QuotationRequest request,
            Authentication authentication
    ) {
        String principal = authentication != null ? authentication.getName() : null;
        return quotationService.update(id, request, principal);
    }

    @PostMapping("/{id}/verify")
    public QuotationResponse sendForVerification(
            @PathVariable Long id,
            @RequestBody(required = false) QuotationActionRequest request,
            Authentication authentication
    ) {
        String principal = authentication != null ? authentication.getName() : null;
        return quotationService.sendForVerification(id, request, principal);
    }

    @PostMapping("/{id}/approve")
    public QuotationResponse approve(
            @PathVariable Long id,
            @RequestBody(required = false) QuotationActionRequest request,
            Authentication authentication
    ) {
        String principal = authentication != null ? authentication.getName() : null;
        return quotationService.approve(id, request, principal);
    }

    @PostMapping("/{id}/mark-sent")
    public QuotationResponse markSent(
            @PathVariable Long id,
            Authentication authentication
    ) {
        String principal = authentication != null ? authentication.getName() : null;
        return quotationService.markSent(id, principal);
    }

    @PostMapping("/{id}/mark-negotiating")
    public QuotationResponse markNegotiating(
            @PathVariable Long id,
            @RequestBody(required = false) QuotationActionRequest request,
            Authentication authentication
    ) {
        String principal = authentication != null ? authentication.getName() : null;
        return quotationService.markNegotiating(id, request, principal);
    }

    @PostMapping("/{id}/mark-rejected")
    public QuotationResponse markRejected(
            @PathVariable Long id,
            @RequestBody(required = false) QuotationActionRequest request,
            Authentication authentication
    ) {
        String principal = authentication != null ? authentication.getName() : null;
        return quotationService.markRejected(id, request, principal);
    }

    @PostMapping("/{id}/mark-accepted")
    public QuotationResponse markAccepted(
            @PathVariable Long id,
            @RequestBody(required = false) QuotationActionRequest request,
            Authentication authentication
    ) {
        String principal = authentication != null ? authentication.getName() : null;
        return quotationService.markAccepted(id, request, principal);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id, Authentication authentication) {
        String principal = authentication != null ? authentication.getName() : null;
        quotationService.delete(id, principal);
    }
}
