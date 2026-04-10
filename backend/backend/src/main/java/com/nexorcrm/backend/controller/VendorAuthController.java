package com.nexorcrm.backend.controller;

import com.nexorcrm.backend.dto.VendorLoginRequest;
import com.nexorcrm.backend.dto.VendorLoginResponse;
import com.nexorcrm.backend.service.VendorAuthService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/vendor-auth")
public class VendorAuthController {

    private final VendorAuthService vendorAuthService;

    public VendorAuthController(VendorAuthService vendorAuthService) {
        this.vendorAuthService = vendorAuthService;
    }

    @PostMapping("/login")
    public ResponseEntity<VendorLoginResponse> login(@Valid @RequestBody VendorLoginRequest request) {
        return ResponseEntity.ok(vendorAuthService.login(request));
    }
}
