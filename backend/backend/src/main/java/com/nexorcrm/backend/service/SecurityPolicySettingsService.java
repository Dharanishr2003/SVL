package com.nexorcrm.backend.service;

import com.nexorcrm.backend.dto.SecurityPolicySettingsResponse;
import com.nexorcrm.backend.dto.SecurityPolicySettingsUpdateRequest;
import com.nexorcrm.backend.entity.SecurityPolicySettings;
import com.nexorcrm.backend.repo.SecurityPolicySettingsRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@Transactional
public class SecurityPolicySettingsService {

    private final SecurityPolicySettingsRepository repository;
    private final AuditService auditService;

    public SecurityPolicySettingsService(SecurityPolicySettingsRepository repository, AuditService auditService) {
        this.repository = repository;
        this.auditService = auditService;
    }

    @Transactional(readOnly = true)
    public SecurityPolicySettingsResponse getSettings() {
        SecurityPolicySettings settings = getOrCreateDefault();
        return toResponse(settings);
    }

    public SecurityPolicySettingsResponse updateSettings(SecurityPolicySettingsUpdateRequest request, String updatedBy) {
        SecurityPolicySettings settings = getOrCreateDefault();
        settings.setMinPasswordLength(request.getMinPasswordLength());
        settings.setRequireUppercase(request.getRequireUppercase());
        settings.setRequireLowercase(request.getRequireLowercase());
        settings.setRequireNumbers(request.getRequireNumbers());
        settings.setRequireSpecialChars(request.getRequireSpecialChars());
        settings.setMaxLoginAttempts(request.getMaxLoginAttempts());
        settings.setLockoutDurationMinutes(request.getLockoutDurationMinutes());
        settings.setPasswordExpiryDays(request.getPasswordExpiryDays());
        settings.setUpdatedAt(LocalDateTime.now());
        settings.setUpdatedBy(updatedBy);

        SecurityPolicySettings saved = repository.save(settings);
        auditService.log("SECURITY_POLICY_SETTINGS_UPDATE", "Updated security policy settings", updatedBy);

        return toResponse(saved);
    }

    private SecurityPolicySettings getOrCreateDefault() {
        return repository.findAll().stream().findFirst().orElseGet(() -> {
            SecurityPolicySettings defaultSettings = new SecurityPolicySettings();
            return repository.save(defaultSettings);
        });
    }

    private SecurityPolicySettingsResponse toResponse(SecurityPolicySettings settings) {
        SecurityPolicySettingsResponse response = new SecurityPolicySettingsResponse();
        response.setId(settings.getId());
        response.setMinPasswordLength(settings.getMinPasswordLength());
        response.setRequireUppercase(settings.getRequireUppercase());
        response.setRequireLowercase(settings.getRequireLowercase());
        response.setRequireNumbers(settings.getRequireNumbers());
        response.setRequireSpecialChars(settings.getRequireSpecialChars());
        response.setMaxLoginAttempts(settings.getMaxLoginAttempts());
        response.setLockoutDurationMinutes(settings.getLockoutDurationMinutes());
        response.setPasswordExpiryDays(settings.getPasswordExpiryDays());
        response.setUpdatedAt(settings.getUpdatedAt());
        response.setUpdatedBy(settings.getUpdatedBy());
        return response;
    }
}
