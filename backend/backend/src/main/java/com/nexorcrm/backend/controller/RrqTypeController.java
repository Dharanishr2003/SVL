package com.nexorcrm.backend.controller;

import com.nexorcrm.backend.dto.ApiMessageResponse;
import com.nexorcrm.backend.dto.RrqTypeRequest;
import com.nexorcrm.backend.dto.RrqTypeResponse;
import com.nexorcrm.backend.service.RrqTypeService;
import jakarta.validation.Valid;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/rrq-types")
public class RrqTypeController {

    private final RrqTypeService rrqTypeService;

    public RrqTypeController(RrqTypeService rrqTypeService) {
        this.rrqTypeService = rrqTypeService;
    }

    @GetMapping
    public List<RrqTypeResponse> list(Authentication authentication) {
        return rrqTypeService.list(authentication.getName());
    }

    @PostMapping
    public RrqTypeResponse create(@Valid @RequestBody RrqTypeRequest request, Authentication authentication) {
        return rrqTypeService.create(request, authentication.getName());
    }

    @PutMapping("/{id}")
    public RrqTypeResponse update(@PathVariable("id") Long id,
                                  @Valid @RequestBody RrqTypeRequest request,
                                  Authentication authentication) {
        return rrqTypeService.update(id, request, authentication.getName());
    }

    @DeleteMapping("/{id}")
    public ApiMessageResponse delete(@PathVariable("id") Long id, Authentication authentication) {
        rrqTypeService.delete(id, authentication.getName());
        return new ApiMessageResponse("RRQ type deleted successfully");
    }
}
