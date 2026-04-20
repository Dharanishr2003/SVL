package com.nexorcrm.backend.controller;

import com.nexorcrm.backend.dto.PriceListEntryRequest;
import com.nexorcrm.backend.dto.PriceListEntryResponse;
import com.nexorcrm.backend.service.PriceListService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/price-list")
public class PriceListController {

    private final PriceListService service;

    public PriceListController(PriceListService service) {
        this.service = service;
    }

    @GetMapping
    public List<PriceListEntryResponse> list() {
        return service.list();
    }

    @GetMapping("/{id}")
    public PriceListEntryResponse getById(@PathVariable Long id) {
        return service.getById(id);
    }

    @PostMapping
    public PriceListEntryResponse create(@Valid @RequestBody PriceListEntryRequest req) {
        return service.create(req);
    }

    @PutMapping("/{id}")
    public PriceListEntryResponse update(@PathVariable Long id, @Valid @RequestBody PriceListEntryRequest req) {
        return service.update(id, req);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        service.delete(id);
    }
}
