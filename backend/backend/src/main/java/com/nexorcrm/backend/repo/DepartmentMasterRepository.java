package com.nexorcrm.backend.repo;

import com.nexorcrm.backend.entity.DepartmentMaster;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface DepartmentMasterRepository extends JpaRepository<DepartmentMaster, Long> {
    List<DepartmentMaster> findByDeletedFalseOrderByIdDesc();
    boolean existsByNameIgnoreCaseAndDeletedFalse(String name);
}
