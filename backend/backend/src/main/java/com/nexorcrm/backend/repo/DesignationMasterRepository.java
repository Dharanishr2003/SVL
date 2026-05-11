package com.nexorcrm.backend.repo;

import com.nexorcrm.backend.entity.DesignationMaster;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface DesignationMasterRepository extends JpaRepository<DesignationMaster, Long> {
    List<DesignationMaster> findByDeletedFalseOrderByIdDesc();
    List<DesignationMaster> findByDepartmentMasterIdAndDeletedFalseOrderByIdDesc(Long departmentMasterId);
    boolean existsByNameIgnoreCaseAndDepartmentIgnoreCaseAndDeletedFalse(String name, String department);
    boolean existsByNameIgnoreCaseAndDepartmentMasterIdAndDeletedFalse(String name, Long departmentMasterId);
    Optional<DesignationMaster> findByIdAndDeletedFalse(Long id);
    Optional<DesignationMaster> findByDepartmentMasterIdAndNameIgnoreCaseAndDeletedFalse(Long departmentMasterId, String name);
    Optional<DesignationMaster> findFirstByDepartmentMasterIdAndNameIgnoreCaseAndDeletedFalseOrderByIdAsc(Long departmentMasterId, String name);
}
