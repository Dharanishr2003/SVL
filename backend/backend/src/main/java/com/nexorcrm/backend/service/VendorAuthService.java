package com.nexorcrm.backend.service;

import com.nexorcrm.backend.dto.VendorLoginRequest;
import com.nexorcrm.backend.dto.VendorLoginResponse;
import com.nexorcrm.backend.entity.Vendor;
import com.nexorcrm.backend.repo.VendorRepository;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

@Service
@Transactional(readOnly = true)
public class VendorAuthService {

    private final VendorRepository vendorRepository;
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    public VendorAuthService(VendorRepository vendorRepository) {
        this.vendorRepository = vendorRepository;
    }

    public VendorLoginResponse login(VendorLoginRequest request) {
        String identifier = request.getIdentifier().trim();
        Vendor vendor = vendorRepository.findByUsernameIgnoreCaseAndDeletedFalse(identifier)
                .or(() -> vendorRepository.findByOfficialEmailIgnoreCaseAndDeletedFalse(identifier))
                .orElseThrow(() -> new BadCredentialsException("Invalid vendor username/email or password"));

        if (!StringUtils.hasText(vendor.getPasswordHash())
                || !passwordEncoder.matches(request.getPassword(), vendor.getPasswordHash())) {
            throw new BadCredentialsException("Invalid vendor username/email or password");
        }

        if ("inactive".equalsIgnoreCase(vendor.getStatus())) {
            throw new BadCredentialsException("Vendor account is inactive");
        }

        VendorLoginResponse response = new VendorLoginResponse();
        response.setVendorId(vendor.getId());
        response.setVendorName(vendor.getVendorName());
        response.setUsername(vendor.getUsername());
        response.setOfficialEmail(vendor.getOfficialEmail());
        response.setStatus(vendor.getStatus());
        return response;
    }
}
