package com.nexorcrm.backend.repo;

import com.nexorcrm.backend.entity.DesignationMaster;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface DesignationMasterRepository extends JpaRepository<DesignationMaster, Long> {
    List<DesignationMaster> findByDeletedFalseOrderByIdDesc();
    List<DesignationMaster> findByDepartmentMasterIdAndDeletedFalseOrderByIdDesc(Long departmentMasterId);
    boolean existsByNameIgnoreCaseAndDepartmentIgnoreCaseAndDeletedFalse(String name, String department);
    boolean existsByNameIgnoreCaseAndDepartmentMasterIdAndDeletedFalse(String name, Long departmentMasterId);
}
