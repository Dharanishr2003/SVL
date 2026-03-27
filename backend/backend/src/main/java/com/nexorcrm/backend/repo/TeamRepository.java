package com.nexorcrm.backend.repo;

import com.nexorcrm.backend.entity.*;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface TeamRepository extends JpaRepository<Team, Long> {
    List<Team> findByInstitutionAndCategoryAndTypeAndDepartmentAndIsDeletedFalseOrderByNameAsc(
            Institution institution, InstitutionCategory category, InstitutionType type, Department department);
    Optional<Team> findByIdAndIsDeletedFalse(Long id);
    boolean existsByInstitutionAndCategoryAndTypeAndDepartmentAndNameIgnoreCaseAndIsDeletedFalse(
            Institution institution, InstitutionCategory category, InstitutionType type, Department department, String name);
    Optional<Team> findByInstitutionAndCategoryAndTypeAndDepartmentAndNameIgnoreCaseAndIsDeletedFalse(
            Institution institution, InstitutionCategory category, InstitutionType type, Department department, String name);
}
