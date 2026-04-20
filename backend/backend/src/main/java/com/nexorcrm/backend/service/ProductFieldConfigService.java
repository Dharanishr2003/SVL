package com.nexorcrm.backend.service;

import com.nexorcrm.backend.dto.ProductFieldConfigRequest;
import com.nexorcrm.backend.dto.ProductFieldConfigResponse;
import com.nexorcrm.backend.entity.ProductFieldConfig;
import com.nexorcrm.backend.entity.ServiceType;
import com.nexorcrm.backend.repo.ProductFieldConfigRepository;
import com.nexorcrm.backend.repo.ServiceTypeRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ProductFieldConfigService {

    private final ProductFieldConfigRepository configRepository;
    private final ServiceTypeRepository serviceTypeRepository;

    public ProductFieldConfigService(ProductFieldConfigRepository configRepository, ServiceTypeRepository serviceTypeRepository) {
        this.configRepository = configRepository;
        this.serviceTypeRepository = serviceTypeRepository;
    }

    @Transactional(readOnly = true)
    public List<ProductFieldConfigResponse> getByServiceType(Long serviceTypeId) {
        if (!serviceTypeRepository.existsById(serviceTypeId)) {
            throw new EntityNotFoundException("ServiceType not found with id: " + serviceTypeId);
        }
        return configRepository.findByServiceTypeIdAndIsActiveTrueOrderByDisplayOrderAsc(serviceTypeId)
                .stream()
                .map(ProductFieldConfigResponse::new)
                .collect(Collectors.toList());
    }

    @Transactional
    public ProductFieldConfigResponse create(Long serviceTypeId, ProductFieldConfigRequest request) {
        ServiceType serviceType = serviceTypeRepository.findById(serviceTypeId)
                .orElseThrow(() -> new EntityNotFoundException("ServiceType not found with id: " + serviceTypeId));

        if (request.getFieldKey() == null || request.getFieldKey().trim().isEmpty()) {
            throw new IllegalArgumentException("Field key is required for creation");
        }

        int nextOrder = configRepository.findMaxDisplayOrderByServiceTypeId(serviceTypeId).orElse(0) + 1;

        ProductFieldConfig config = new ProductFieldConfig();
        config.setServiceType(serviceType);
        config.setFieldKey(request.getFieldKey());
        
        mapRequestToEntity(request, config);
        
        config.setDisplayOrder(nextOrder);
        config.setIsActive(true);
        config.setCreatedAt(LocalDateTime.now());
        config.setUpdatedAt(LocalDateTime.now());

        ProductFieldConfig saved = configRepository.save(config);
        return new ProductFieldConfigResponse(saved);
    }

    @Transactional
    public ProductFieldConfigResponse update(Long serviceTypeId, Long fieldId, ProductFieldConfigRequest request) {
        if (!serviceTypeRepository.existsById(serviceTypeId)) {
            throw new EntityNotFoundException("ServiceType not found with id: " + serviceTypeId);
        }

        ProductFieldConfig config = configRepository.findByIdAndServiceTypeIdAndIsActiveTrue(fieldId, serviceTypeId)
                .orElseThrow(() -> new EntityNotFoundException("Field configuration not found or does not belong to this ServiceType"));

        // Note: field_key remains untouched based on business rule 'locked after creation'
        mapRequestToEntity(request, config);
        config.setUpdatedAt(LocalDateTime.now());

        ProductFieldConfig saved = configRepository.save(config);
        return new ProductFieldConfigResponse(saved);
    }

    @Transactional
    public void delete(Long serviceTypeId, Long fieldId) {
        if (!serviceTypeRepository.existsById(serviceTypeId)) {
            throw new EntityNotFoundException("ServiceType not found with id: " + serviceTypeId);
        }

        ProductFieldConfig config = configRepository.findByIdAndServiceTypeIdAndIsActiveTrue(fieldId, serviceTypeId)
                .orElseThrow(() -> new EntityNotFoundException("Field configuration not found or does not belong to this ServiceType"));

        config.setIsActive(false);
        config.setUpdatedAt(LocalDateTime.now());
        configRepository.save(config);
    }

    @Transactional
    public void reorder(Long serviceTypeId, List<Long> orderedIds) {
        if (!serviceTypeRepository.existsById(serviceTypeId)) {
            throw new EntityNotFoundException("ServiceType not found with id: " + serviceTypeId);
        }

        List<ProductFieldConfig> configs = configRepository.findByServiceTypeIdAndIsActiveTrueOrderByDisplayOrderAsc(serviceTypeId);
        
        for (int i = 0; i < orderedIds.size(); i++) {
            final int order = i + 1; // capture as effectively final for lambda
            Long currentId = orderedIds.get(i);
            configs.stream()
                .filter(c -> c.getId().equals(currentId))
                .findFirst()
                .ifPresent(c -> {
                    c.setDisplayOrder(order);
                    c.setUpdatedAt(LocalDateTime.now());
                });
        }
        
        configRepository.saveAll(configs);
    }

    private void mapRequestToEntity(ProductFieldConfigRequest request, ProductFieldConfig config) {
        config.setLabel(request.getLabel());
        config.setFieldType(request.getFieldType());
        config.setOptions(request.getOptions());
        config.setIsRequired(request.getIsRequired() != null ? request.getIsRequired() : false);
        config.setPlaceholder(request.getPlaceholder());
        config.setAllowCustom(request.getAllowCustom() != null ? request.getAllowCustom() : false);
        config.setIsHidden(request.getIsHidden() != null ? request.getIsHidden() : false);
        config.setHasUnit(request.getHasUnit() != null ? request.getHasUnit() : false);
        config.setUnitOptions(request.getUnitOptions());
        config.setDefaultUnit(request.getDefaultUnit());
        config.setEnable3rdDimension(request.getEnable3rdDimension() != null ? request.getEnable3rdDimension() : false);
        config.setThirdDimensionLabel(request.getThirdDimensionLabel());
        config.setCustomDimensions(request.getCustomDimensions());
        config.setCustomDimensionUnit(request.getCustomDimensionUnit());
        config.setCustomSizeMode(request.getCustomSizeMode());
        config.setDependsOn(request.getDependsOn());
        config.setDependsOnValue(request.getDependsOnValue());
    }
}
