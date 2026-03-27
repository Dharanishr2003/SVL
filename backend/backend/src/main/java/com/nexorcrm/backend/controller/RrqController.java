package com.nexorcrm.backend.controller;

import com.nexorcrm.backend.dto.ApiMessageResponse;
import com.nexorcrm.backend.dto.RrqRequest;
import com.nexorcrm.backend.dto.RrqResponse;
import com.nexorcrm.backend.service.RrqService;
import jakarta.validation.Valid;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/rrq")
public class RrqController {

    private final RrqService rrqService;

    public RrqController(RrqService rrqService) {
        this.rrqService = rrqService;
    }

    @GetMapping
    public List<RrqResponse> list(Authentication authentication) {
        return rrqService.list(authentication.getName());
    }

    @PostMapping
    public RrqResponse create(@Valid @RequestBody RrqRequest request, Authentication authentication) {
        return rrqService.create(request, authentication.getName());
    }

    @PutMapping("/{id}")
    public RrqResponse update(@PathVariable("id") Long id,
                              @Valid @RequestBody RrqRequest request,
                              Authentication authentication) {
        return rrqService.update(id, request, authentication.getName());
    }

    @DeleteMapping("/{id}")
    public ApiMessageResponse delete(@PathVariable("id") Long id, Authentication authentication) {
        rrqService.delete(id, authentication.getName());
        return new ApiMessageResponse("RRQ deleted successfully");
    }
}
