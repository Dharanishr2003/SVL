package com.nexorcrm.backend.repo;

import com.nexorcrm.backend.entity.DimensionMaster;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface DimensionMasterRepository extends JpaRepository<DimensionMaster, Long> {
    List<DimensionMaster> findByIsActiveTrueOrderByNameAsc();
    boolean existsByNameIgnoreCase(String name);
}
