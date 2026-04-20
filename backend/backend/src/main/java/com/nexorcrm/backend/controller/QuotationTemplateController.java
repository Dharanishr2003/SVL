package com.nexorcrm.backend.controller;

import com.nexorcrm.backend.service.QuotationTemplateService;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/quotation-template")
public class QuotationTemplateController {

    private final QuotationTemplateService service;

    public QuotationTemplateController(QuotationTemplateService service) {
        this.service = service;
    }

    @GetMapping
    public Map<String, Object> get() {
        return service.get();
    }

    @PostMapping
    public Map<String, Object> save(@RequestBody Map<String, Object> payload) {
        return service.save(payload);
    }
}
