package com.nexorcrm.backend.repo;

import com.nexorcrm.backend.entity.ServiceCategory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ServiceCategoryRepository extends JpaRepository<ServiceCategory, Long> {
    List<ServiceCategory> findByDeletedFalse();
}
