package com.nexorcrm.backend.repo;

import com.nexorcrm.backend.entity.UnitMaster;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface UnitMasterRepository extends JpaRepository<UnitMaster, Long> {
    List<UnitMaster> findByIsActiveTrueOrderByNameAsc();
    boolean existsByNameIgnoreCase(String name);
}
