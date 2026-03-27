package com.nexorcrm.backend.repo;

import com.nexorcrm.backend.entity.Role;
import com.nexorcrm.backend.entity.ActivationStatus;
import com.nexorcrm.backend.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    boolean existsByRole(Role role);
    boolean existsByUsername(String username);
    boolean existsByEmail(String email);
    boolean existsByUsernameIgnoreCaseAndIsDeletedFalse(String username);
    boolean existsByEmailIgnoreCaseAndIsDeletedFalse(String email);

    List<User> findByIsDeletedFalse();

    Optional<User> findByEmail(String email);

    Optional<User> findByUsername(String username);

    Optional<User> findByUsernameIgnoreCaseAndIsDeletedFalse(String username);

    Optional<User> findByEmailIgnoreCaseAndIsDeletedFalse(String email);

    Optional<User> findByEmailAndIsDeletedFalse(String email);

    Optional<User> findByUsernameAndIsDeletedFalse(String username);

    Optional<User> findByIdAndIsDeletedFalse(Long id);

    Optional<User> findByRole(Role role);

    Page<User> findByRoleInAndIsDeletedFalse(List<Role> roles, Pageable pageable);

    Page<User> findByRoleInAndActivationStatusAndIsDeletedFalse(List<Role> roles, ActivationStatus activationStatus, Pageable pageable);

    long countByRoleInAndActivationStatusAndIsDeletedFalse(List<Role> roles, ActivationStatus activationStatus);

    List<User> findByRoleInAndActivationStatusAndIsDeletedFalseOrderByUsernameAsc(List<Role> roles, ActivationStatus activationStatus);

    @Query("""
            SELECT DISTINCT u.teamName
            FROM User u
            WHERE u.isDeleted = false
              AND u.teamName IS NOT NULL
              AND trim(u.teamName) <> ''
            ORDER BY u.teamName ASC
            """)
    List<String> findDistinctTeamNames();

    @Query("""
            SELECT DISTINCT u.teamName
            FROM User u
            WHERE u.isDeleted = false
              AND u.teamName IS NOT NULL
              AND trim(u.teamName) <> ''
              AND lower(coalesce(u.institutionName, '')) = lower(:institutionName)
              AND lower(coalesce(u.institutionCategory, '')) = lower(:institutionCategory)
              AND lower(coalesce(u.institutionType, '')) = lower(:institutionType)
              AND lower(coalesce(u.departmentName, '')) = lower(:departmentName)
            ORDER BY u.teamName ASC
            """)
    List<String> findDistinctTeamNamesByDepartmentScope(
            @Param("institutionName") String institutionName,
            @Param("institutionCategory") String institutionCategory,
            @Param("institutionType") String institutionType,
            @Param("departmentName") String departmentName
    );

    @Query("""
            SELECT u
            FROM User u
            WHERE u.isDeleted = false
              AND u.activationStatus = :activationStatus
              AND u.role IN :roles
              AND lower(coalesce(u.institutionName, '')) = lower(:institutionName)
              AND lower(coalesce(u.institutionCategory, '')) = lower(:institutionCategory)
              AND lower(coalesce(u.institutionType, '')) = lower(:institutionType)
              AND lower(coalesce(u.departmentName, '')) = lower(:departmentName)
              AND lower(coalesce(u.teamName, '')) IN :teamNamesLower
            ORDER BY lower(u.username) ASC, u.id ASC
            """)
    List<User> findActiveByRoleInAndDepartmentScopeAndTeamNameIn(
            @Param("roles") List<Role> roles,
            @Param("activationStatus") ActivationStatus activationStatus,
            @Param("institutionName") String institutionName,
            @Param("institutionCategory") String institutionCategory,
            @Param("institutionType") String institutionType,
            @Param("departmentName") String departmentName,
            @Param("teamNamesLower") List<String> teamNamesLower
    );

    @Query("""
            SELECT u
            FROM User u
            WHERE u.isDeleted = false
              AND u.activationStatus = :activationStatus
              AND u.role IN :roles
              AND lower(coalesce(u.institutionName, '')) = lower(:institutionName)
              AND lower(coalesce(u.institutionCategory, '')) = lower(:institutionCategory)
              AND lower(coalesce(u.institutionType, '')) = lower(:institutionType)
              AND lower(coalesce(u.departmentName, '')) = lower(:departmentName)
            ORDER BY lower(u.username) ASC, u.id ASC
            """)
    List<User> findActiveByRoleInAndDepartmentScope(
            @Param("roles") List<Role> roles,
            @Param("activationStatus") ActivationStatus activationStatus,
            @Param("institutionName") String institutionName,
            @Param("institutionCategory") String institutionCategory,
            @Param("institutionType") String institutionType,
            @Param("departmentName") String departmentName
    );

    @Query("""
            SELECT u
            FROM User u
            WHERE u.isDeleted = false
              AND u.activationStatus = :activationStatus
              AND u.role IN :roles
              AND lower(coalesce(u.teamName, '')) IN :teamNamesLower
            ORDER BY lower(u.username) ASC, u.id ASC
            """)
    List<User> findActiveByRoleInAndTeamNameIn(
            @Param("roles") List<Role> roles,
            @Param("activationStatus") ActivationStatus activationStatus,
            @Param("teamNamesLower") List<String> teamNamesLower
    );

    boolean existsByRoleAndInstitutionNameIgnoreCaseAndInstitutionCategoryIgnoreCaseAndInstitutionTypeIgnoreCaseAndDepartmentNameIgnoreCaseAndIsDeletedFalse(
            Role role,
            String institutionName,
            String institutionCategory,
            String institutionType,
            String departmentName
    );

    boolean existsByRoleAndIdNotAndInstitutionNameIgnoreCaseAndInstitutionCategoryIgnoreCaseAndInstitutionTypeIgnoreCaseAndDepartmentNameIgnoreCaseAndIsDeletedFalse(
            Role role,
            Long id,
            String institutionName,
            String institutionCategory,
            String institutionType,
            String departmentName
    );

    boolean existsByRoleAndActivationStatusAndInstitutionNameIgnoreCaseAndInstitutionCategoryIgnoreCaseAndInstitutionTypeIgnoreCaseAndDepartmentNameIgnoreCaseAndIsDeletedFalse(
            Role role,
            ActivationStatus activationStatus,
            String institutionName,
            String institutionCategory,
            String institutionType,
            String departmentName
    );

    boolean existsByRoleAndIdNotAndActivationStatusAndInstitutionNameIgnoreCaseAndInstitutionCategoryIgnoreCaseAndInstitutionTypeIgnoreCaseAndDepartmentNameIgnoreCaseAndIsDeletedFalse(
            Role role,
            Long id,
            ActivationStatus activationStatus,
            String institutionName,
            String institutionCategory,
            String institutionType,
            String departmentName
    );

    boolean existsByRoleAndInstitutionNameIgnoreCaseAndInstitutionCategoryIgnoreCaseAndInstitutionTypeIgnoreCaseAndDepartmentNameIgnoreCaseAndTeamNameIgnoreCaseAndIsDeletedFalse(
            Role role,
            String institutionName,
            String institutionCategory,
            String institutionType,
            String departmentName,
            String teamName
    );

    boolean existsByRoleAndIdNotAndInstitutionNameIgnoreCaseAndInstitutionCategoryIgnoreCaseAndInstitutionTypeIgnoreCaseAndDepartmentNameIgnoreCaseAndTeamNameIgnoreCaseAndIsDeletedFalse(
            Role role,
            Long id,
            String institutionName,
            String institutionCategory,
            String institutionType,
            String departmentName,
            String teamName
    );

    boolean existsByRoleAndActivationStatusAndInstitutionNameIgnoreCaseAndInstitutionCategoryIgnoreCaseAndInstitutionTypeIgnoreCaseAndDepartmentNameIgnoreCaseAndTeamNameIgnoreCaseAndIsDeletedFalse(
            Role role,
            ActivationStatus activationStatus,
            String institutionName,
            String institutionCategory,
            String institutionType,
            String departmentName,
            String teamName
    );

    boolean existsByRoleAndIdNotAndActivationStatusAndInstitutionNameIgnoreCaseAndInstitutionCategoryIgnoreCaseAndInstitutionTypeIgnoreCaseAndDepartmentNameIgnoreCaseAndTeamNameIgnoreCaseAndIsDeletedFalse(
            Role role,
            Long id,
            ActivationStatus activationStatus,
            String institutionName,
            String institutionCategory,
            String institutionType,
            String departmentName,
            String teamName
    );

    @Query("""
            SELECT count(u)
            FROM User u
            WHERE u.isDeleted = false
              AND u.activationStatus = com.nexorcrm.backend.entity.ActivationStatus.ACTIVE
              AND u.role = com.nexorcrm.backend.entity.Role.MANAGER
              AND lower(trim(coalesce(u.institutionName, ''))) = lower(trim(:institutionName))
              AND lower(trim(coalesce(u.institutionCategory, ''))) = lower(trim(:institutionCategory))
              AND lower(trim(coalesce(u.institutionType, ''))) = lower(trim(:institutionType))
              AND lower(trim(coalesce(u.departmentName, ''))) = lower(trim(:departmentName))
              AND lower(trim(coalesce(u.teamName, ''))) = lower(trim(:teamName))
            """)
    long countActiveManagersInScope(
            @Param("institutionName") String institutionName,
            @Param("institutionCategory") String institutionCategory,
            @Param("institutionType") String institutionType,
            @Param("departmentName") String departmentName,
            @Param("teamName") String teamName
    );

    @Query("""
            SELECT count(u)
            FROM User u
            WHERE u.isDeleted = false
              AND u.activationStatus = com.nexorcrm.backend.entity.ActivationStatus.ACTIVE
              AND u.role = com.nexorcrm.backend.entity.Role.MANAGER
              AND u.id <> :excludeUserId
              AND lower(trim(coalesce(u.institutionName, ''))) = lower(trim(:institutionName))
              AND lower(trim(coalesce(u.institutionCategory, ''))) = lower(trim(:institutionCategory))
              AND lower(trim(coalesce(u.institutionType, ''))) = lower(trim(:institutionType))
              AND lower(trim(coalesce(u.departmentName, ''))) = lower(trim(:departmentName))
              AND lower(trim(coalesce(u.teamName, ''))) = lower(trim(:teamName))
            """)
    long countActiveManagersInScopeExcludingUser(
            @Param("excludeUserId") Long excludeUserId,
            @Param("institutionName") String institutionName,
            @Param("institutionCategory") String institutionCategory,
            @Param("institutionType") String institutionType,
            @Param("departmentName") String departmentName,
            @Param("teamName") String teamName
    );

    @Query(
            value = """
                    SELECT u FROM User u
                    WHERE u.role IN :roles
                      AND u.activationStatus IN :activationStatuses
                      AND u.isDeleted = false
                    ORDER BY CASE u.role
                        WHEN com.nexorcrm.backend.entity.Role.SUPER_ADMIN THEN 1
                        WHEN com.nexorcrm.backend.entity.Role.ADMIN THEN 2
                        WHEN com.nexorcrm.backend.entity.Role.MANAGER THEN 3
                        WHEN com.nexorcrm.backend.entity.Role.EMPLOYEE THEN 4
                        ELSE 99
                    END,
                    lower(u.username) ASC,
                    u.id ASC
                    """,
            countQuery = """
                    SELECT COUNT(u) FROM User u
                    WHERE u.role IN :roles
                      AND u.activationStatus IN :activationStatuses
                      AND u.isDeleted = false
                    """
    )
    Page<User> findByRoleInAndActivationStatusInAndIsDeletedFalseOrderByRoleHierarchy(
            @Param("roles") List<Role> roles,
            @Param("activationStatuses") List<ActivationStatus> activationStatuses,
            Pageable pageable
    );

    @Query(
            value = """
                    SELECT u FROM User u
                    WHERE u.role IN :roles
                      AND u.activationStatus IN :activationStatuses
                      AND u.isDeleted = false
                      AND lower(coalesce(u.institutionName, '')) = lower(:institutionName)
                      AND lower(coalesce(u.institutionCategory, '')) = lower(:institutionCategory)
                      AND lower(coalesce(u.institutionType, '')) = lower(:institutionType)
                      AND lower(coalesce(u.departmentName, '')) = lower(:departmentName)
                    ORDER BY CASE u.role
                        WHEN com.nexorcrm.backend.entity.Role.SUPER_ADMIN THEN 1
                        WHEN com.nexorcrm.backend.entity.Role.ADMIN THEN 2
                        WHEN com.nexorcrm.backend.entity.Role.MANAGER THEN 3
                        WHEN com.nexorcrm.backend.entity.Role.EMPLOYEE THEN 4
                        ELSE 99
                    END,
                    lower(u.username) ASC,
                    u.id ASC
                    """,
            countQuery = """
                    SELECT COUNT(u) FROM User u
                    WHERE u.role IN :roles
                      AND u.activationStatus IN :activationStatuses
                      AND u.isDeleted = false
                      AND lower(coalesce(u.institutionName, '')) = lower(:institutionName)
                      AND lower(coalesce(u.institutionCategory, '')) = lower(:institutionCategory)
                      AND lower(coalesce(u.institutionType, '')) = lower(:institutionType)
                      AND lower(coalesce(u.departmentName, '')) = lower(:departmentName)
                    """
    )
    Page<User> findByRoleInAndActivationStatusInAndDepartmentScopeOrderByRoleHierarchy(
            @Param("roles") List<Role> roles,
            @Param("activationStatuses") List<ActivationStatus> activationStatuses,
            @Param("institutionName") String institutionName,
            @Param("institutionCategory") String institutionCategory,
            @Param("institutionType") String institutionType,
            @Param("departmentName") String departmentName,
            Pageable pageable
    );

    @Query(
            value = """
                    SELECT u FROM User u
                    WHERE u.role IN :roles
                      AND u.activationStatus IN :activationStatuses
                      AND u.isDeleted = false
                      AND lower(coalesce(u.institutionName, '')) = lower(:institutionName)
                      AND lower(coalesce(u.institutionCategory, '')) = lower(:institutionCategory)
                      AND lower(coalesce(u.institutionType, '')) = lower(:institutionType)
                      AND lower(coalesce(u.departmentName, '')) = lower(:departmentName)
                      AND lower(coalesce(u.teamName, '')) = lower(:teamName)
                    ORDER BY CASE u.role
                        WHEN com.nexorcrm.backend.entity.Role.SUPER_ADMIN THEN 1
                        WHEN com.nexorcrm.backend.entity.Role.ADMIN THEN 2
                        WHEN com.nexorcrm.backend.entity.Role.MANAGER THEN 3
                        WHEN com.nexorcrm.backend.entity.Role.EMPLOYEE THEN 4
                        ELSE 99
                    END,
                    lower(u.username) ASC,
                    u.id ASC
                    """,
            countQuery = """
                    SELECT COUNT(u) FROM User u
                    WHERE u.role IN :roles
                      AND u.activationStatus IN :activationStatuses
                      AND u.isDeleted = false
                      AND lower(coalesce(u.institutionName, '')) = lower(:institutionName)
                      AND lower(coalesce(u.institutionCategory, '')) = lower(:institutionCategory)
                      AND lower(coalesce(u.institutionType, '')) = lower(:institutionType)
                      AND lower(coalesce(u.departmentName, '')) = lower(:departmentName)
                      AND lower(coalesce(u.teamName, '')) = lower(:teamName)
                    """
    )
    Page<User> findByRoleInAndActivationStatusInAndTeamScopeOrderByRoleHierarchy(
            @Param("roles") List<Role> roles,
            @Param("activationStatuses") List<ActivationStatus> activationStatuses,
            @Param("institutionName") String institutionName,
            @Param("institutionCategory") String institutionCategory,
            @Param("institutionType") String institutionType,
            @Param("departmentName") String departmentName,
            @Param("teamName") String teamName,
            Pageable pageable
    );
}
