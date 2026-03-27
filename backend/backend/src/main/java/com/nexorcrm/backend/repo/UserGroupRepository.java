package com.nexorcrm.backend.repo;

import com.nexorcrm.backend.entity.UserGroup;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface UserGroupRepository extends JpaRepository<UserGroup, Long> {
    List<UserGroup> findAllByOrderByGroupLevelAscNameAsc();

    boolean existsByNameIgnoreCase(String name);

    List<UserGroup> findByInstitutionNameIgnoreCaseAndInstitutionCategoryIgnoreCaseAndInstitutionTypeIgnoreCaseAndDepartmentNameIgnoreCaseOrderByGroupLevelAscNameAsc(
            String institutionName,
            String institutionCategory,
            String institutionType,
            String departmentName
    );

    java.util.Optional<UserGroup> findByNameIgnoreCase(String name);
}
