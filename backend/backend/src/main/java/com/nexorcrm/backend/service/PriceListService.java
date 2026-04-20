package com.nexorcrm.backend.service;

import com.nexorcrm.backend.dto.PriceListEntryRequest;
import com.nexorcrm.backend.dto.PriceListEntryResponse;
import com.nexorcrm.backend.entity.PriceListEntry;
import com.nexorcrm.backend.repo.PriceListEntryRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class PriceListService {

    private final PriceListEntryRepository repo;

    public PriceListService(PriceListEntryRepository repo) {
        this.repo = repo;
    }

    @Transactional(readOnly = true)
    public List<PriceListEntryResponse> list() {
        return repo.findAllByOrderByIdDesc().stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public PriceListEntryResponse getById(Long id) {
        PriceListEntry entry = repo.findById(id)
            .orElseThrow(() -> new EntityNotFoundException("Price list entry not found"));
        return toResponse(entry);
    }

    @Transactional
    public PriceListEntryResponse create(PriceListEntryRequest req) {
        PriceListEntry entry = new PriceListEntry();
        entry.setCategoryId(req.getCategoryId());
        entry.setTypeId(req.getTypeId());
        entry.setSubtypeId(req.getSubtypeId());
        entry.setTypeName(req.getTypeName());
        entry.setSubtypeName(req.getSubtypeName());
        entry.setVariantFields(req.getVariantFields());
        entry.setQuantitySlabs(req.getQuantitySlabs());
        entry = repo.save(entry);
        return toResponse(entry);
    }

    @Transactional
    public PriceListEntryResponse update(Long id, PriceListEntryRequest req) {
        PriceListEntry entry = repo.findById(id)
            .orElseThrow(() -> new EntityNotFoundException("Price list entry not found"));
        entry.setCategoryId(req.getCategoryId());
        entry.setTypeId(req.getTypeId());
        entry.setSubtypeId(req.getSubtypeId());
        entry.setTypeName(req.getTypeName());
        entry.setSubtypeName(req.getSubtypeName());
        entry.setVariantFields(req.getVariantFields());
        entry.setQuantitySlabs(req.getQuantitySlabs());
        entry = repo.save(entry);
        return toResponse(entry);
    }

    @Transactional
    public void delete(Long id) {
        if (!repo.existsById(id)) {
            throw new EntityNotFoundException("Price list entry not found");
        }
        repo.deleteById(id);
    }

    private PriceListEntryResponse toResponse(PriceListEntry entry) {
        PriceListEntryResponse resp = new PriceListEntryResponse();
        resp.setId(entry.getId());
        resp.setCategoryId(entry.getCategoryId());
        resp.setTypeId(entry.getTypeId());
        resp.setSubtypeId(entry.getSubtypeId());
        resp.setTypeName(entry.getTypeName());
        resp.setSubtypeName(entry.getSubtypeName());
        resp.setVariantFields(entry.getVariantFields());
        resp.setQuantitySlabs(entry.getQuantitySlabs());
        return resp;
    }
}
