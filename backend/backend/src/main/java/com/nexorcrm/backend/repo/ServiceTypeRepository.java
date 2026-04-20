package com.nexorcrm.backend.repo;

import com.nexorcrm.backend.entity.ServiceType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ServiceTypeRepository extends JpaRepository<ServiceType, Long> {
    List<ServiceType> findByDeletedFalse();
    boolean existsByFieldConfigKeyIgnoreCaseAndDeletedFalse(String fieldConfigKey);
    boolean existsByFieldConfigKeyIgnoreCaseAndDeletedFalseAndIdNot(String fieldConfigKey, Long id);
}
