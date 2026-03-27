package com.nexorcrm.backend.repo;

import com.nexorcrm.backend.entity.Institution;
import com.nexorcrm.backend.entity.InstitutionCategory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface InstitutionCategoryRepository extends JpaRepository<InstitutionCategory, Long> {
    List<InstitutionCategory> findByInstitutionAndIsDeletedFalseOrderByNameAsc(Institution institution);
    Optional<InstitutionCategory> findByIdAndIsDeletedFalse(Long id);
    boolean existsByInstitutionAndNameIgnoreCaseAndIsDeletedFalse(Institution institution, String name);
    Optional<InstitutionCategory> findByInstitutionAndNameIgnoreCaseAndIsDeletedFalse(Institution institution, String name);
}
