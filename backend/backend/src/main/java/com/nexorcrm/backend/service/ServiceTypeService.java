package com.nexorcrm.backend.service;

import com.nexorcrm.backend.dto.ServiceTypeRequest;
import com.nexorcrm.backend.dto.ServiceTypeResponse;
import com.nexorcrm.backend.entity.ServiceType;
import com.nexorcrm.backend.entity.ServiceCategory;
import com.nexorcrm.backend.repo.ServiceTypeRepository;
import com.nexorcrm.backend.repo.ServiceCategoryRepository;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ServiceTypeService {

    private final ServiceTypeRepository repository;
    private final ServiceCategoryRepository categoryRepository;

    public ServiceTypeService(ServiceTypeRepository repository, ServiceCategoryRepository categoryRepository) {
        this.repository = repository;
        this.categoryRepository = categoryRepository;
    }

    public List<ServiceTypeResponse> list() {
        return repository.findByDeletedFalse()
                .stream()
                .map(ServiceTypeResponse::new)
                .collect(Collectors.toList());
    }

    public ServiceTypeResponse create(ServiceTypeRequest request) {
        ServiceCategory category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new RuntimeException("Service Category not found with id: " + request.getCategoryId()));
        ServiceType parent = null;
        if (request.getParentId() != null) {
            parent = repository.findById(request.getParentId())
                    .orElseThrow(() -> new RuntimeException("Parent Service Type not found with id: " + request.getParentId()));
            if (!parent.getCategory().getId().equals(request.getCategoryId())) {
                throw new RuntimeException("Parent Service Type must belong to the same category");
            }
        }

        ServiceType entity = new ServiceType();
        entity.setName(request.getName());
        entity.setCategory(category);
        entity.setParent(parent);
        entity.setDeleted(false);

        ServiceType saved = repository.save(entity);
        return new ServiceTypeResponse(saved);
    }

    public ServiceTypeResponse update(Long id, ServiceTypeRequest request) {
        ServiceType entity = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Service Type not found with id: " + id));

        ServiceCategory category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new RuntimeException("Service Category not found with id: " + request.getCategoryId()));
        ServiceType parent = null;
        if (request.getParentId() != null) {
            parent = repository.findById(request.getParentId())
                    .orElseThrow(() -> new RuntimeException("Parent Service Type not found with id: " + request.getParentId()));
            if (!parent.getCategory().getId().equals(request.getCategoryId())) {
                throw new RuntimeException("Parent Service Type must belong to the same category");
            }
        }

        entity.setName(request.getName());
        entity.setCategory(category);
        entity.setParent(parent);

        ServiceType updated = repository.save(entity);
        return new ServiceTypeResponse(updated);
    }

    public void delete(Long id) {
        ServiceType entity = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Service Type not found with id: " + id));
        entity.setDeleted(true);
        repository.save(entity);
    }
}
