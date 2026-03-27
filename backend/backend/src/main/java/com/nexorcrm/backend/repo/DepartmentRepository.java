package com.nexorcrm.backend.repo;

import com.nexorcrm.backend.entity.Department;
import com.nexorcrm.backend.entity.Institution;
import com.nexorcrm.backend.entity.InstitutionCategory;
import com.nexorcrm.backend.entity.InstitutionType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface DepartmentRepository extends JpaRepository<Department, Long> {
    List<Department> findByInstitutionAndCategoryAndTypeAndIsDeletedFalseOrderByNameAsc(Institution institution, InstitutionCategory category, InstitutionType type);
    Optional<Department> findByIdAndIsDeletedFalse(Long id);
    boolean existsByInstitutionAndCategoryAndTypeAndNameIgnoreCaseAndIsDeletedFalse(Institution institution, InstitutionCategory category, InstitutionType type, String name);
    Optional<Department> findByInstitutionAndCategoryAndTypeAndNameIgnoreCaseAndIsDeletedFalse(Institution institution, InstitutionCategory category, InstitutionType type, String name);
}
