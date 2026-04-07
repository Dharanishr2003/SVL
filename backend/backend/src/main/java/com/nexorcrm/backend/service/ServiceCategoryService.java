package com.nexorcrm.backend.service;

import com.nexorcrm.backend.dto.ServiceCategoryRequest;
import com.nexorcrm.backend.dto.ServiceCategoryResponse;
import com.nexorcrm.backend.entity.ServiceCategory;
import com.nexorcrm.backend.repo.ServiceCategoryRepository;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ServiceCategoryService {

    private final ServiceCategoryRepository repository;

    public ServiceCategoryService(ServiceCategoryRepository repository) {
        this.repository = repository;
    }

    public List<ServiceCategoryResponse> list() {
        return repository.findByDeletedFalse()
                .stream()
                .map(ServiceCategoryResponse::new)
                .collect(Collectors.toList());
    }

    public ServiceCategoryResponse create(ServiceCategoryRequest request) {
        ServiceCategory entity = new ServiceCategory();
        entity.setName(request.getName());
        entity.setIsActive(request.getIsActive() != null ? request.getIsActive() : true);
        entity.setDeleted(false);
        ServiceCategory saved = repository.save(entity);
        return new ServiceCategoryResponse(saved);
    }

    public ServiceCategoryResponse update(Long id, ServiceCategoryRequest request) {
        ServiceCategory entity = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Service Category not found with id: " + id));
        entity.setName(request.getName());
        if (request.getIsActive() != null) {
            entity.setIsActive(request.getIsActive());
        }
        ServiceCategory updated = repository.save(entity);
        return new ServiceCategoryResponse(updated);
    }

    public void delete(Long id) {
        ServiceCategory entity = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Service Category not found with id: " + id));
        entity.setDeleted(true);
        repository.save(entity);
    }
}
