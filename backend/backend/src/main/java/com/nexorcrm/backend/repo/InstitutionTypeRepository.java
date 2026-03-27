package com.nexorcrm.backend.repo;

import com.nexorcrm.backend.entity.Institution;
import com.nexorcrm.backend.entity.InstitutionCategory;
import com.nexorcrm.backend.entity.InstitutionType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface InstitutionTypeRepository extends JpaRepository<InstitutionType, Long> {
    List<InstitutionType> findByInstitutionAndCategoryAndIsDeletedFalseOrderByNameAsc(Institution institution, InstitutionCategory category);
    Optional<InstitutionType> findByIdAndIsDeletedFalse(Long id);
    boolean existsByInstitutionAndCategoryAndNameIgnoreCaseAndIsDeletedFalse(Institution institution, InstitutionCategory category, String name);
    Optional<InstitutionType> findByInstitutionAndCategoryAndNameIgnoreCaseAndIsDeletedFalse(Institution institution, InstitutionCategory category, String name);
}
