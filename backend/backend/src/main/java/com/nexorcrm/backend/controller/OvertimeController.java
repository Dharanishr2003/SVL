package com.nexorcrm.backend.controller;

import com.nexorcrm.backend.dto.OvertimeRequest;
import com.nexorcrm.backend.dto.OvertimeResponse;
import com.nexorcrm.backend.service.OvertimeService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/overtime")
public class OvertimeController {

    private final OvertimeService service;

    public OvertimeController(OvertimeService service) {
        this.service = service;
    }

    @GetMapping
    public List<OvertimeResponse> listAll() {
        return service.listAll();
    }

    @PostMapping
    public OvertimeResponse create(@Valid @RequestBody OvertimeRequest request) {
        return service.create(request);
    }

    @PutMapping("/{id}")
    public OvertimeResponse update(@PathVariable Long id, @Valid @RequestBody OvertimeRequest request) {
        return service.update(id, request);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        service.delete(id);
    }
}
