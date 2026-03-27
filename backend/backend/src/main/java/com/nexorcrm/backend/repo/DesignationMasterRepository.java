package com.nexorcrm.backend.repo;

import com.nexorcrm.backend.entity.DesignationMaster;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface DesignationMasterRepository extends JpaRepository<DesignationMaster, Long> {
    List<DesignationMaster> findByDeletedFalseOrderByIdDesc();
    boolean existsByNameIgnoreCaseAndDepartmentIgnoreCaseAndDeletedFalse(String name, String department);
}
