package com.nexorcrm.backend.service;

import com.nexorcrm.backend.dto.DepartmentPermissionResponse;
import com.nexorcrm.backend.dto.DesignationPermissionResponse;
import com.nexorcrm.backend.entity.BranchMaster;
import com.nexorcrm.backend.entity.DepartmentMaster;
import com.nexorcrm.backend.entity.DesignationMaster;
import com.nexorcrm.backend.entity.Employee;
import com.nexorcrm.backend.entity.Role;
import com.nexorcrm.backend.entity.RoleScopePagePermission;
import com.nexorcrm.backend.entity.User;
import com.nexorcrm.backend.repo.BranchMasterRepository;
import com.nexorcrm.backend.repo.DepartmentMasterRepository;
import com.nexorcrm.backend.repo.DesignationMasterRepository;
import com.nexorcrm.backend.repo.EmployeeRepository;
import com.nexorcrm.backend.repo.RoleScopePagePermissionRepository;
import com.nexorcrm.backend.repo.UserRepository;
import jakarta.annotation.PostConstruct;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@Transactional
public class PageAccessService {

    private static final String GLOBAL_SCOPE_TYPE = "GLOBAL";
    private static final String DEPARTMENT_SCOPE_TYPE = "DEPARTMENT";
    private static final String DESIGNATION_SCOPE_TYPE = "DESIGNATION";

    private final RoleScopePagePermissionRepository permissionRepository;
    private final UserRepository userRepository;
    private final EmployeeRepository employeeRepository;
    private final DepartmentMasterRepository departmentMasterRepository;
    private final DesignationMasterRepository designationMasterRepository;
    private final BranchMasterRepository branchMasterRepository;

    public PageAccessService(
            RoleScopePagePermissionRepository permissionRepository,
            UserRepository userRepository,
            EmployeeRepository employeeRepository,
            DepartmentMasterRepository departmentMasterRepository,
            DesignationMasterRepository designationMasterRepository,
            BranchMasterRepository branchMasterRepository
    ) {
        this.permissionRepository = permissionRepository;
        this.userRepository = userRepository;
        this.employeeRepository = employeeRepository;
        this.departmentMasterRepository = departmentMasterRepository;
        this.designationMasterRepository = designationMasterRepository;
        this.branchMasterRepository = branchMasterRepository;
    }

    @PostConstruct
    public void initializeDefaults() {
        seedDefaultsIfNeeded();
    }

    @Transactional(readOnly = true)
    public List<String> getUserPageKeys(String username) {
        User user = resolveUser(username);
        Role role = user.getRole();
        if (role == Role.SUPER_ADMIN || role == Role.ADMIN) {
            return resolveKeys(role, GLOBAL_SCOPE_TYPE, null);
        }

        Employee employee = resolveEmployeeForUser(user);
        if (employee == null) {
            return defaultKeys();
        }

        if (role == Role.MANAGER) {
            Long departmentId = employee.getDepartmentMasterId();
            if (departmentId == null) {
                return defaultKeys();
            }
            return resolveKeys(role, DEPARTMENT_SCOPE_TYPE, departmentId);
        }

        if (role == Role.TEAM_LEAD || role == Role.EMPLOYEE) {
            Long designationId = employee.getDesignationMasterId();
            if (designationId == null) {
                return defaultKeys();
            }
            return resolveKeys(role, DESIGNATION_SCOPE_TYPE, designationId);
        }

        return defaultKeys();
    }

    @Transactional(readOnly = true)
    public List<DepartmentPermissionResponse> listDepartmentPermissions() {
        Map<Long, String> branchNames = branchMasterRepository.findAll().stream()
                .filter(branch -> branch != null && Boolean.FALSE.equals(branch.getDeleted()))
                .collect(Collectors.toMap(BranchMaster::getId, BranchMaster::getName, (a, b) -> a, LinkedHashMap::new));

        List<DepartmentMaster> departments = departmentMasterRepository.findByDeletedFalseOrderByIdDesc();
        return departments.stream()
                .map(department -> {
                    DepartmentPermissionResponse response = new DepartmentPermissionResponse();
                    response.setId(department.getId());
                    response.setName(department.getName());
                    response.setBranchId(department.getBranchId());
                    response.setBranchName(branchNames.getOrDefault(department.getBranchId(), ""));
                    response.setPageKeys(resolveKeys(Role.MANAGER, DEPARTMENT_SCOPE_TYPE, department.getId()));
                    return response;
                })
                .toList();
    }

    @Transactional(readOnly = true)
    public List<DesignationPermissionResponse> listDesignationPermissions(Role role) {
        Role safeRole = role == null ? Role.EMPLOYEE : role;
        Map<Long, String> departmentNames = departmentMasterRepository.findByDeletedFalseOrderByIdDesc().stream()
                .collect(Collectors.toMap(DepartmentMaster::getId, DepartmentMaster::getName, (a, b) -> a, LinkedHashMap::new));
        List<DesignationMaster> designations = designationMasterRepository.findByDeletedFalseOrderByIdDesc();
        return designations.stream()
                .map(designation -> {
                    DesignationPermissionResponse response = new DesignationPermissionResponse();
                    response.setId(designation.getId());
                    response.setName(designation.getName());
                    response.setDepartmentId(designation.getDepartmentMasterId());
                    response.setDepartmentName(departmentNames.getOrDefault(designation.getDepartmentMasterId(), designation.getDepartment()));
                    response.setPageKeys(resolveKeys(safeRole, DESIGNATION_SCOPE_TYPE, designation.getId()));
                    return response;
                })
                .toList();
    }

    public List<String> saveDepartmentPermissions(Long departmentId, List<String> pageKeys) {
        return savePermissions(Role.MANAGER, DEPARTMENT_SCOPE_TYPE, departmentId, pageKeys);
    }

    public List<String> listGlobalPermissions(Role role) {
        if (role != Role.SUPER_ADMIN && role != Role.ADMIN) {
            throw new IllegalStateException("Global permissions can only be loaded for SUPER_ADMIN or ADMIN");
        }
        return resolveKeys(role, GLOBAL_SCOPE_TYPE, null);
    }

    public List<String> saveGlobalPermissions(Role role, List<String> pageKeys) {
        if (role != Role.SUPER_ADMIN && role != Role.ADMIN) {
            throw new IllegalStateException("Global permissions can only be saved for SUPER_ADMIN or ADMIN");
        }
        return savePermissions(role, GLOBAL_SCOPE_TYPE, null, pageKeys);
    }

    public List<String> saveDesignationPermissions(Role role, Long designationId, List<String> pageKeys) {
        if (role != Role.TEAM_LEAD && role != Role.EMPLOYEE) {
            throw new IllegalStateException("Designation permissions can only be saved for TEAM_LEAD or EMPLOYEE");
        }
        return savePermissions(role, DESIGNATION_SCOPE_TYPE, designationId, pageKeys);
    }

    public void seedDefaultsIfNeeded() {
        seedGlobal(Role.SUPER_ADMIN);
        seedGlobal(Role.ADMIN);
    }

    private void seedGlobal(Role role) {
        List<String> defaults = defaultKeys();
        permissionRepository.findByRoleAndScopeTypeAndScopeId(role, GLOBAL_SCOPE_TYPE, null)
                .ifPresentOrElse(existing -> {
                    List<String> current = parseKeys(existing);
                    Set<String> merged = new LinkedHashSet<>(current);
                    merged.addAll(defaults);
                    String mergedCsv = String.join(",", merged);
                    if (!Objects.equals(existing.getPageKeysCsv(), mergedCsv)) {
                        existing.setPageKeysCsv(mergedCsv);
                        permissionRepository.save(existing);
                    }
                }, () -> {
                    RoleScopePagePermission permission = new RoleScopePagePermission();
                    permission.setRole(role);
                    permission.setScopeType(GLOBAL_SCOPE_TYPE);
                    permission.setScopeId(null);
                    permission.setPageKeysCsv(String.join(",", defaults));
                    permissionRepository.save(permission);
                });
    }

    private List<String> savePermissions(Role role, String scopeType, Long scopeId, List<String> pageKeys) {
        if (!GLOBAL_SCOPE_TYPE.equals(scopeType) && scopeId == null) {
            throw new IllegalStateException("Scope id is required");
        }
        List<String> sanitized = sanitizeKeys(pageKeys);
        RoleScopePagePermission permission = permissionRepository
                .findByRoleAndScopeTypeAndScopeId(role, scopeType, scopeId)
                .orElseGet(RoleScopePagePermission::new);
        permission.setRole(role);
        permission.setScopeType(scopeType);
        permission.setScopeId(scopeId);
        permission.setPageKeysCsv(String.join(",", sanitized));
        permissionRepository.save(permission);
        return sanitized;
    }

    private List<String> resolveKeys(Role role, String scopeType, Long scopeId) {
        if (role == null) {
            return defaultKeys();
        }
        if (scopeId == null) {
            return permissionRepository.findByRoleAndScopeTypeAndScopeId(role, scopeType, null)
                    .map(this::parseKeys)
                    .filter(keys -> !keys.isEmpty())
                    .orElseGet(this::defaultKeys);
        }
        return permissionRepository.findByRoleAndScopeTypeAndScopeId(role, scopeType, scopeId)
                .map(this::parseKeys)
                .filter(keys -> !keys.isEmpty())
                .orElseGet(this::defaultKeys);
    }

    private List<String> parseKeys(RoleScopePagePermission permission) {
        if (permission == null || !StringUtils.hasText(permission.getPageKeysCsv())) {
            return List.of();
        }
        return Arrays.stream(permission.getPageKeysCsv().split(","))
                .map(String::trim)
                .map(String::toLowerCase)
                .filter(StringUtils::hasText)
                .distinct()
                .toList();
    }

    private List<String> sanitizeKeys(List<String> pageKeys) {
        if (pageKeys == null || pageKeys.isEmpty()) {
            return List.of();
        }
        Set<String> dedup = new LinkedHashSet<>();
        Set<String> allowed = defaultKeys().stream().collect(Collectors.toSet());
        for (String key : pageKeys) {
            String normalized = String.valueOf(key == null ? "" : key).trim().toLowerCase(Locale.ROOT);
            if (StringUtils.hasText(normalized) && allowed.contains(normalized)) {
                dedup.add(normalized);
            }
        }
        return new ArrayList<>(dedup);
    }

    private List<String> defaultKeys() {
        return UserGroupService.DEFAULT_PAGE_KEYS.stream()
                .map(key -> String.valueOf(key).trim().toLowerCase(Locale.ROOT))
                .filter(StringUtils::hasText)
                .distinct()
                .toList();
    }

    private User resolveUser(String username) {
        if (!StringUtils.hasText(username)) {
            throw new AccessDeniedException("Unauthenticated actor");
        }
        String normalized = username.trim();
        return normalized.contains("@")
                ? userRepository.findByEmailAndIsDeletedFalse(normalized.toLowerCase(Locale.ROOT))
                        .orElseThrow(() -> new EntityNotFoundException("User not found"))
                : userRepository.findByUsernameAndIsDeletedFalse(normalized)
                        .orElseThrow(() -> new EntityNotFoundException("User not found"));
    }

    private Employee resolveEmployeeForUser(User user) {
        if (user == null || !StringUtils.hasText(user.getEmail())) {
            return null;
        }
        return employeeRepository.findFirstByEmailIgnoreCaseAndDeletedFalse(user.getEmail().trim())
                .orElse(null);
    }
}
