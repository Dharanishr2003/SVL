package com.nexorcrm.backend.service;

import com.nexorcrm.backend.dto.CreateUserGroupRequest;
import com.nexorcrm.backend.dto.UpdateUserGroupRequest;
import com.nexorcrm.backend.dto.UpdateUserGroupMemberPagesRequest;
import com.nexorcrm.backend.dto.UserGroupAssignableTeamResponse;
import com.nexorcrm.backend.dto.UserGroupAssignableUserResponse;
import com.nexorcrm.backend.dto.UserGroupMemberResponse;
import com.nexorcrm.backend.dto.UserGroupResponse;
import com.nexorcrm.backend.dto.UserGroupSummaryResponse;
import com.nexorcrm.backend.entity.ActivationStatus;
import com.nexorcrm.backend.entity.Role;
import com.nexorcrm.backend.entity.User;
import com.nexorcrm.backend.entity.UserGroup;
import com.nexorcrm.backend.entity.UserGroupMember;
import com.nexorcrm.backend.entity.UserGroupMemberScope;
import com.nexorcrm.backend.repo.UserGroupMemberRepository;
import com.nexorcrm.backend.repo.UserGroupRepository;
import com.nexorcrm.backend.repo.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import com.nexorcrm.backend.security.RolePermissionUtil;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@Transactional
public class UserGroupService {
    private record GroupScope(String institutionName,
                              String institutionCategory,
                              String institutionType,
                              String departmentName) {}

    private static final List<String> DEFAULT_PAGE_KEYS = List.of(
            // Dashboard
            "dashboard",
            "admin-dashboard",
            "employee-dashboard",
            "sales-dashboard",
            // CRM
            "leads",
            "rejected-leads",
            "deals",
            "design",
            "production",
            "contacts",
            "companies",
            "pipeline",
            "analytics",
            "activity",
            "quotation",
            "channel-partners",
            "lead-source",
            "budget-verifications",
            "payment-verifications",
            "invoices",
            // Operations
            "stocks",
            "stocks-dashboard",
            "stocks-item",
            "stocks-categories",
            "rrq",
            "rrq-overview",
            "rrq-type",
            "projects",
            "projects-list",
            "project-status",
            "project-type",
            "tasks",
            "task-board",
            // Recruitment
            "recruitment",
            "recruitment-jobs",
            "recruitment-candidates",
            "recruitment-referrals",
            // HRM
            "employees",
            "employees-list",
            "departments",
            "designations",
            "policy",
            "tickets",
            "holidays",
            "attendance",
            "leaves",
            "leaves-employee",
            "leave-settings",
            "attendance-admin",
            "attendance-employee",
            "timesheets",
            "schedule-timing",
            "shift-assignments",
            "overtime",
            "performance",
            "performance-indicator",
            "performance-appraisal",
            "goal-tracking",
            "goal-type",
            "training",
            "training-list",
            "trainers",
            "training-type",
            "promotion",
            "resignation",
            "termination",
            // Finance
            "sales",
            "estimates",
            "sales-invoices",
            "payments",
            "expenses",
            "provident-fund",
            "taxes",
            "accounting",
            "categories",
            "budgets",
            "budget-expenses",
            "budget-revenues",
            "payroll",
            "employee-salary",
            "payslip",
            "payroll-items",
            "accounts",
            "payment-verifications-page",
            "budget-verifications-page",
            "stock-requests",
            "vendor-management",
            "vendors",
            "brands",
            "vendor-types",
            // Reports
            "reports",
            "expenses-report",
            "invoice-report",
            "payment-report",
            "employee-report",
            "task-report",
            "user-report",
            "daily-report",
            "leave-report",
            "project-report",
            // Settings
            "settings",
            "settings-useradmin",
            "settings-group-access",
            "settings-usergroups",
            "settings-registration",
            "settings-session",
            "settings-user",
            "settings-security",
            "settings-security-settings",
            "settings-flow",
            "settings-logs",
            // Legacy keys
            "site-visits",
            "followup-leads",
            "import-leads",
            "opportunity",
            "customer",
            "report",
            // Compatibility aliases
            "shift-assignment"
    );
    private static final Set<String> ALLOWED_PAGE_KEYS = Set.copyOf(DEFAULT_PAGE_KEYS);

    private final UserGroupRepository userGroupRepository;
    private final UserGroupMemberRepository userGroupMemberRepository;
    private final UserRepository userRepository;
    private final AuditService auditService;

    public UserGroupService(UserGroupRepository userGroupRepository,
                            UserGroupMemberRepository userGroupMemberRepository,
                            UserRepository userRepository,
                            AuditService auditService) {
        this.userGroupRepository = userGroupRepository;
        this.userGroupMemberRepository = userGroupMemberRepository;
        this.userRepository = userRepository;
        this.auditService = auditService;
    }

    @Transactional(readOnly = true)
    public List<UserGroupResponse> listGroups(String actorPrincipal) {
        User actor = resolveActor(actorPrincipal);
        assertCanManageGroups(actor);

        if (actor.getRole() == Role.SUPER_ADMIN) {
            return userGroupRepository.findAllByOrderByGroupLevelAscNameAsc()
                    .stream()
                    .map(this::toResponse)
                    .toList();
        }

        assertActorHasDepartmentScope(actor);
        List<UserGroup> rows = userGroupRepository
                .findByInstitutionNameIgnoreCaseAndInstitutionCategoryIgnoreCaseAndInstitutionTypeIgnoreCaseAndDepartmentNameIgnoreCaseOrderByGroupLevelAscNameAsc(
                        actor.getInstitutionName(),
                        actor.getInstitutionCategory(),
                        actor.getInstitutionType(),
                        actor.getDepartmentName()
                );

        if (actor.getRole() == Role.MANAGER) {
            String actorTeamLower = normalizeLower(actor.getTeamName());
            rows = rows.stream()
                    .filter(group -> parseTeamNames(group).stream()
                            .map(this::normalizeLower)
                            .anyMatch(actorTeamLower::equals))
                    .toList();
        }
        return rows.stream().map(this::toResponse).toList();
    }

    public UserGroupResponse createGroup(CreateUserGroupRequest request, String actorPrincipal) {
        User actor = resolveActor(actorPrincipal);
        assertCanManageGroups(actor);

        String name = request.getName().trim();
        if (userGroupRepository.existsByNameIgnoreCase(name)) {
            throw new IllegalStateException("Group name already exists");
        }

        GroupScope targetScope = resolveScopeForCreate(actor, request);
        List<String> scopedTeams = resolveScopedTeamsForActor(actor, request.getTeamNames(), true, targetScope);

        UserGroup group = new UserGroup();
        group.setName(name);
        group.setGroupLevel(request.getGroupLevel());
        group.setSystemGroup(false);
        group.setMemberScope(UserGroupMemberScope.NONE);
        group.setInstitutionName(targetScope.institutionName());
        group.setInstitutionCategory(targetScope.institutionCategory());
        group.setInstitutionType(targetScope.institutionType());
        group.setDepartmentName(targetScope.departmentName());
        group.setTeamNamesCsv(String.join(",", scopedTeams));
        group.setPageKeysCsv(String.join(",", resolveGroupPageKeysForActor(actor, request.getPageKeys(), null)));

        UserGroup saved = userGroupRepository.save(group);
        auditService.log("GROUP_CREATE", "Created user group", actor.getEmail());
        return toResponse(saved);
    }

    public UserGroupResponse updateGroup(Long id, UpdateUserGroupRequest request, String actorPrincipal) {
        User actor = resolveActor(actorPrincipal);
        assertCanManageGroups(actor);

        UserGroup group = userGroupRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("User group not found"));
        assertCanAccessGroup(actor, group);

        String name = request.getName().trim();
        if (!group.getName().equalsIgnoreCase(name) && userGroupRepository.existsByNameIgnoreCase(name)) {
            throw new IllegalStateException("Group name already exists");
        }

        GroupScope targetScope = resolveScopeForUpdate(actor, request);
        List<String> scopedTeams = resolveScopedTeamsForActor(actor, request.getTeamNames(), true, targetScope);
        List<String> oldGroupPageKeys = parseTeamNamesCsv(group.getPageKeysCsv());
        List<String> resolvedGroupPageKeys = resolveGroupPageKeysForActor(actor, request.getPageKeys(), group);

        group.setName(name);
        group.setGroupLevel(request.getGroupLevel());
        group.setInstitutionName(targetScope.institutionName());
        group.setInstitutionCategory(targetScope.institutionCategory());
        group.setInstitutionType(targetScope.institutionType());
        group.setDepartmentName(targetScope.departmentName());
        group.setTeamNamesCsv(String.join(",", scopedTeams));
        group.setPageKeysCsv(String.join(",", resolvedGroupPageKeys));

        UserGroup saved = userGroupRepository.save(group);
        applyGroupPageVisibilityToMembers(saved, oldGroupPageKeys, resolvedGroupPageKeys);
        auditService.log("GROUP_UPDATE", "Updated user group", actor.getEmail());
        return toResponse(saved);
    }

    public void deleteGroup(Long id, String actorPrincipal) {
        User actor = resolveActor(actorPrincipal);
        assertCanManageGroups(actor);

        UserGroup group = userGroupRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("User group not found"));
        assertCanAccessGroup(actor, group);
        if (group.isSystemGroup()) {
            throw new AccessDeniedException("System groups cannot be deleted");
        }
        userGroupRepository.delete(group);
        auditService.log("GROUP_DELETE", "Deleted user group", actor.getEmail());
    }

    @Transactional(readOnly = true)
    public List<UserGroupAssignableTeamResponse> listAssignableTeams(String actorPrincipal,
                                                                     String institutionName,
                                                                     String institutionCategory,
                                                                     String institutionType,
                                                                     String departmentName) {
        User actor = resolveActor(actorPrincipal);
        assertCanManageGroups(actor);
        List<String> teams;
        if (actor.getRole() == Role.SUPER_ADMIN
                && StringUtils.hasText(institutionName)
                && StringUtils.hasText(institutionCategory)
                && StringUtils.hasText(institutionType)
                && StringUtils.hasText(departmentName)) {
            teams = getAvailableTeamsForScope(new GroupScope(
                    institutionName.trim(),
                    institutionCategory.trim(),
                    institutionType.trim(),
                    departmentName.trim()
            ));
        } else {
            teams = getAvailableTeamsForActor(actor);
        }
        return teams.stream().map(team -> {
            UserGroupAssignableTeamResponse response = new UserGroupAssignableTeamResponse();
            response.setTeamName(team);
            return response;
        }).toList();
    }

    @Transactional(readOnly = true)
    public List<String> listMyVisiblePageKeys(String actorPrincipal) {
        User actor = resolveActor(actorPrincipal);
        List<UserGroupMember> memberships = userGroupMemberRepository.findByUser_IdOrderByIdAsc(actor.getId());
        List<UserGroup> implicitSystemGroups = resolveImplicitSystemGroupsForActor(actor);
        if (memberships.isEmpty() && implicitSystemGroups.isEmpty()) {
            // No group override: keep default menu behavior.
            return DEFAULT_PAGE_KEYS;
        }
        Set<String> resolvedSet = new LinkedHashSet<>();

        memberships.stream()
                .flatMap(member -> {
                    List<String> memberKeys = parseTeamNamesCsv(member.getPageKeysCsv());
                    if (!memberKeys.isEmpty()) {
                        return memberKeys.stream();
                    }
                    UserGroup group = member.getGroup();
                    return parseTeamNamesCsv(group == null ? null : group.getPageKeysCsv()).stream();
                })
                .filter(ALLOWED_PAGE_KEYS::contains)
                .forEach(resolvedSet::add);

        implicitSystemGroups.stream()
                .flatMap(group -> parseTeamNamesCsv(group.getPageKeysCsv()).stream())
                .filter(ALLOWED_PAGE_KEYS::contains)
                .forEach(resolvedSet::add);

        List<String> resolved = resolvedSet.stream().sorted().toList();

        // Safety fallback: avoid locking users out on refresh due legacy/blank member page keys.
        return resolved.isEmpty() ? DEFAULT_PAGE_KEYS : resolved;
    }

    private List<UserGroup> resolveImplicitSystemGroupsForActor(User actor) {
        List<UserGroup> allGroups = userGroupRepository.findAllByOrderByGroupLevelAscNameAsc();
        return allGroups.stream()
                .filter(UserGroup::isSystemGroup)
                .filter(group -> appliesSystemGroupToActor(group, actor))
                .toList();
    }

    private boolean appliesSystemGroupToActor(UserGroup group, User actor) {
        UserGroupMemberScope scope = group.getMemberScope() == null ? UserGroupMemberScope.NONE : group.getMemberScope();
        if (scope == UserGroupMemberScope.ADMINS) {
            if (!(actor.getRole() == Role.ADMIN || actor.getRole() == Role.SUPER_ADMIN)) {
                return false;
            }
        } else if (scope == UserGroupMemberScope.MANAGERS) {
            if (actor.getRole() != Role.MANAGER) {
                return false;
            }
        } else {
            return false;
        }

        if (StringUtils.hasText(group.getInstitutionName())
                && !textEquals(group.getInstitutionName(), actor.getInstitutionName())) {
            return false;
        }
        if (StringUtils.hasText(group.getInstitutionCategory())
                && !textEquals(group.getInstitutionCategory(), actor.getInstitutionCategory())) {
            return false;
        }
        if (StringUtils.hasText(group.getInstitutionType())
                && !textEquals(group.getInstitutionType(), actor.getInstitutionType())) {
            return false;
        }
        if (StringUtils.hasText(group.getDepartmentName())
                && !textEquals(group.getDepartmentName(), actor.getDepartmentName())) {
            return false;
        }
        return true;
    }

    @Transactional(readOnly = true)
    public List<UserGroupAssignableUserResponse> listAssignableUsers(String actorPrincipal, Long groupId, List<String> teamNames) {
        User actor = resolveActor(actorPrincipal);
        assertCanManageGroups(actor);

        List<User> candidates;
        List<String> scopedTeams;
        if (groupId != null) {
            UserGroup group = userGroupRepository.findById(groupId)
                    .orElseThrow(() -> new EntityNotFoundException("User group not found"));
            assertCanAccessGroup(actor, group);
            if (actor.getRole() == Role.SUPER_ADMIN) {
                scopedTeams = parseTeamNames(group);
                if (scopedTeams.isEmpty()) {
                    return List.of();
                }
                List<String> normalizedTeamNames = scopedTeams.stream()
                        .map(this::normalizeLower)
                        .toList();
                if (StringUtils.hasText(group.getInstitutionName())
                        && StringUtils.hasText(group.getInstitutionCategory())
                        && StringUtils.hasText(group.getInstitutionType())
                        && StringUtils.hasText(group.getDepartmentName())) {
                    candidates = userRepository.findActiveByRoleInAndDepartmentScope(
                            List.of(Role.ADMIN, Role.MANAGER, Role.EMPLOYEE),
                            ActivationStatus.ACTIVE,
                            group.getInstitutionName(),
                            group.getInstitutionCategory(),
                            group.getInstitutionType(),
                            group.getDepartmentName()
                    ).stream()
                            .filter(u -> u.getRole() == Role.ADMIN
                                    || normalizedTeamNames.contains(normalizeLower(u.getTeamName())))
                            .toList();
                } else {
                    // Legacy groups may not have full institution scope stored.
                    candidates = userRepository.findActiveByRoleInAndTeamNameIn(
                            List.of(Role.ADMIN, Role.MANAGER, Role.EMPLOYEE),
                            ActivationStatus.ACTIVE,
                            normalizedTeamNames
                    );
                }
                return candidates.stream()
                        .map(this::toAssignableUserResponse)
                        .toList();
            }
            if (actor.getRole() == Role.ADMIN) {
                // Admin can add managers/employees from any team in own department.
                candidates = userRepository.findActiveByRoleInAndDepartmentScope(
                        List.of(Role.MANAGER, Role.EMPLOYEE),
                        ActivationStatus.ACTIVE,
                        actor.getInstitutionName(),
                        actor.getInstitutionCategory(),
                        actor.getInstitutionType(),
                        actor.getDepartmentName()
                );
                return candidates.stream()
                        .map(this::toAssignableUserResponse)
                        .toList();
            } else {
                scopedTeams = parseTeamNames(group);
            }
        } else {
            scopedTeams = resolveScopedTeamsForActor(actor, teamNames, false, null);
            if (actor.getRole() == Role.SUPER_ADMIN) {
                if (scopedTeams.isEmpty()) {
                    return List.of();
                }
                List<String> normalizedTeamNames = scopedTeams.stream()
                        .map(this::normalizeLower)
                        .toList();
                candidates = userRepository.findActiveByRoleInAndTeamNameIn(
                        List.of(Role.ADMIN, Role.MANAGER, Role.EMPLOYEE),
                        ActivationStatus.ACTIVE,
                        normalizedTeamNames
                );
                return candidates.stream()
                        .map(this::toAssignableUserResponse)
                        .toList();
            }
        }

        if (scopedTeams.isEmpty()) {
            return List.of();
        }

        List<String> normalizedTeamNames = scopedTeams.stream()
                .map(this::normalizeLower)
                .toList();

        candidates = userRepository.findActiveByRoleInAndDepartmentScopeAndTeamNameIn(
                List.of(Role.MANAGER, Role.EMPLOYEE),
                ActivationStatus.ACTIVE,
                actor.getInstitutionName(),
                actor.getInstitutionCategory(),
                actor.getInstitutionType(),
                actor.getDepartmentName(),
                normalizedTeamNames
        );
        return candidates.stream()
                .map(this::toAssignableUserResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<UserGroupSummaryResponse> listGroupsForUser(Long userId, String actorPrincipal) {
        User actor = resolveActor(actorPrincipal);
        User target = userRepository.findByIdAndIsDeletedFalse(userId)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));
        assertCanManageGroups(actor);
        assertCanViewUser(actor, target);

        List<UserGroupMember> memberships = userGroupMemberRepository.findByUser_IdOrderByIdAsc(userId);
        if (memberships.isEmpty()) {
            return List.of();
        }

        List<UserGroupSummaryResponse> rows = new ArrayList<>();
        for (UserGroupMember member : memberships) {
            UserGroup group = member.getGroup();
            assertCanAccessGroup(actor, group);
            rows.add(toSummaryResponse(group));
        }
        return rows;
    }

    @Transactional(readOnly = true)
    public List<UserGroupMemberResponse> listGroupMembers(Long id, String actorPrincipal) {
        User actor = resolveActor(actorPrincipal);
        assertCanManageGroups(actor);
        UserGroup group = userGroupRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("User group not found"));
        assertCanAccessGroup(actor, group);

        return userGroupMemberRepository.findByGroupOrderByUserUsernameAsc(group)
                .stream()
                .map(this::toMemberResponse)
                .toList();
    }

    public List<UserGroupMemberResponse> addGroupMember(Long id, Long userId, String actorPrincipal) {
        User actor = resolveActor(actorPrincipal);
        assertCanManageGroups(actor);
        UserGroup group = userGroupRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("User group not found"));
        assertCanAccessGroup(actor, group);

        if (group.isSystemGroup()
                && actor.getRole() != Role.SUPER_ADMIN
                && actor.getRole() != Role.ADMIN) {
            throw new AccessDeniedException("Cannot manually edit members of system groups");
        }
        User target = userRepository.findByIdAndIsDeletedFalse(userId)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));
        if (!target.isActive() && target.getActivationStatus() != ActivationStatus.ACTIVE) {
            throw new IllegalStateException("Only active users can be added");
        }
        boolean canSuperAdminAssignAdmin = actor.getRole() == Role.SUPER_ADMIN && target.getRole() == Role.ADMIN;
        if (target.getRole() != Role.MANAGER && target.getRole() != Role.EMPLOYEE && !canSuperAdminAssignAdmin) {
            throw new AccessDeniedException("Only admins, managers and employees can be added");
        }
        assertUserInsideActorScope(actor, target);
        if (actor.getRole() == Role.ADMIN) {
            appendTeamToGroupIfMissing(group, target.getTeamName());
        } else if (actor.getRole() == Role.SUPER_ADMIN && target.getRole() == Role.ADMIN) {
            assertUserInsideGroupDepartmentScope(group, target);
        } else {
            if (actor.getRole() == Role.SUPER_ADMIN) {
                assertUserInsideGroupDepartmentScope(group, target);
            }
            assertUserInsideGroupTeams(group, target);
        }

        if (!userGroupMemberRepository.existsByGroupAndUserId(group, userId)) {
            UserGroupMember member = new UserGroupMember();
            member.setGroup(group);
            member.setUser(target);
            member.setPageKeysCsv(group.getPageKeysCsv());
            userGroupMemberRepository.save(member);
            auditService.log("GROUP_MEMBER_ADD", "Added user to group", target.getEmail());
        }
        return listGroupMembers(id, actorPrincipal);
    }

    public List<UserGroupMemberResponse> removeGroupMember(Long id, Long userId, String actorPrincipal) {
        User actor = resolveActor(actorPrincipal);
        assertCanManageGroups(actor);
        UserGroup group = userGroupRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("User group not found"));
        assertCanAccessGroup(actor, group);

        if (group.isSystemGroup()
                && actor.getRole() != Role.SUPER_ADMIN
                && actor.getRole() != Role.ADMIN) {
            throw new AccessDeniedException("Cannot manually edit members of system groups");
        }
        userGroupMemberRepository.deleteByGroupAndUserId(group, userId);
        auditService.log("GROUP_MEMBER_REMOVE", "Removed user from group", actor.getEmail());
        return listGroupMembers(id, actorPrincipal);
    }

    public List<UserGroupMemberResponse> updateMemberPageVisibility(Long id,
                                                                    Long userId,
                                                                    UpdateUserGroupMemberPagesRequest request,
                                                                    String actorPrincipal) {
        User actor = resolveActor(actorPrincipal);
        assertCanManageGroups(actor);
        assertCanEditPageVisibility(actor);
        UserGroup group = userGroupRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("User group not found"));
        assertCanAccessGroup(actor, group);

        UserGroupMember member = userGroupMemberRepository.findByGroupAndUserId(group, userId)
                .orElseThrow(() -> new EntityNotFoundException("Group member not found"));
        List<String> pageKeys = sanitizeMemberPageKeysForGroup(group, request == null ? null : request.getPageKeys());
        member.setPageKeysCsv(String.join(",", pageKeys));
        userGroupMemberRepository.save(member);
        auditService.log("GROUP_MEMBER_PAGES_UPDATE", "Updated group member page visibility", actor.getEmail());
        return listGroupMembers(id, actorPrincipal);
    }

    private User resolveActor(String actorPrincipal) {
        if (!StringUtils.hasText(actorPrincipal)) {
            throw new AccessDeniedException("Unauthenticated actor");
        }
        if (actorPrincipal.contains("@")) {
            return userRepository.findByEmailAndIsDeletedFalse(actorPrincipal.trim().toLowerCase(Locale.ROOT))
                    .orElseThrow(() -> new EntityNotFoundException("Actor not found"));
        }
        return userRepository.findByUsernameAndIsDeletedFalse(actorPrincipal.trim())
                .orElseThrow(() -> new EntityNotFoundException("Actor not found"));
    }

    private void assertCanManageGroups(User actor) {
        if (actor.getRole() != Role.SUPER_ADMIN && actor.getRole() != Role.ADMIN && actor.getRole() != Role.MANAGER) {
            throw new AccessDeniedException("You do not have permission to manage user groups");
        }
    }

    private boolean canEditPageVisibility(User actor) {
        return actor.getRole() == Role.SUPER_ADMIN || actor.getRole() == Role.ADMIN;
    }

    private void assertCanEditPageVisibility(User actor) {
        if (!canEditPageVisibility(actor)) {
            throw new AccessDeniedException("Only admins can edit page visibility");
        }
    }

    private void assertCanAccessGroup(User actor, UserGroup group) {
        if (actor.getRole() == Role.SUPER_ADMIN) {
            return;
        }
        assertActorHasDepartmentScope(actor);
        if (!textEquals(actor.getInstitutionName(), group.getInstitutionName())
                || !textEquals(actor.getInstitutionCategory(), group.getInstitutionCategory())
                || !textEquals(actor.getInstitutionType(), group.getInstitutionType())
                || !textEquals(actor.getDepartmentName(), group.getDepartmentName())) {
            throw new AccessDeniedException("You do not have permission to access this group");
        }
        if (actor.getRole() == Role.MANAGER) {
            String actorTeamLower = normalizeLower(actor.getTeamName());
            boolean canSee = parseTeamNames(group).stream()
                    .map(this::normalizeLower)
                    .anyMatch(actorTeamLower::equals);
            if (!canSee) {
                throw new AccessDeniedException("You do not have permission to access this group");
            }
        }
    }

    private void assertActorHasDepartmentScope(User actor) {
        if (!StringUtils.hasText(actor.getInstitutionName())
                || !StringUtils.hasText(actor.getInstitutionCategory())
                || !StringUtils.hasText(actor.getInstitutionType())
                || !StringUtils.hasText(actor.getDepartmentName())) {
            throw new AccessDeniedException("Your account is missing department scope configuration");
        }
    }

    private void assertActorHasTeamScope(User actor) {
        assertActorHasDepartmentScope(actor);
        if (!StringUtils.hasText(actor.getTeamName())) {
            throw new AccessDeniedException("Your account is missing team scope configuration");
        }
    }

    private List<String> resolveScopedTeamsForActor(User actor,
                                                    List<String> requestedTeamNames,
                                                    boolean requireAtLeastOne,
                                                    GroupScope targetScope) {
        if (actor.getRole() == Role.SUPER_ADMIN) {
            List<String> sanitizedRequested = sanitizeTeamNames(requestedTeamNames);
            if (targetScope == null) {
                if (requireAtLeastOne && sanitizedRequested.isEmpty()) {
                    throw new IllegalStateException("At least one team must be selected");
                }
                return sanitizedRequested;
            }
            List<String> availableTeams = getAvailableTeamsForScope(targetScope);
            Map<String, String> availableByLower = availableTeams.stream()
                    .collect(Collectors.toMap(this::normalizeLower, team -> team, (a, b) -> a, LinkedHashMap::new));
            Set<String> dedup = new LinkedHashSet<>();
            for (String team : sanitizedRequested) {
                String canonical = availableByLower.get(normalizeLower(team));
                if (canonical != null) {
                    dedup.add(canonical);
                }
            }
            if (dedup.isEmpty() && requireAtLeastOne) {
                // Super admins can create role-based groups without a team list.
                return List.of();
            }
            return new ArrayList<>(dedup);
        }

        assertActorHasDepartmentScope(actor);
        List<String> availableTeams = getAvailableTeamsForActor(actor);
        Map<String, String> availableByLower = availableTeams.stream()
                .collect(Collectors.toMap(this::normalizeLower, team -> team, (a, b) -> a, LinkedHashMap::new));

        if (actor.getRole() == Role.MANAGER) {
            assertActorHasTeamScope(actor);
            return List.of(actor.getTeamName().trim());
        }

        List<String> sanitizedRequested = sanitizeTeamNames(requestedTeamNames);
        if (requireAtLeastOne && sanitizedRequested.isEmpty()) {
            throw new IllegalStateException("At least one team must be selected");
        }
        Set<String> dedup = new LinkedHashSet<>();
        for (String team : sanitizedRequested) {
            String lower = normalizeLower(team);
            String canonical = availableByLower.get(lower);
            if (canonical == null) {
                throw new AccessDeniedException("Selected team is outside your department scope: " + team);
            }
            dedup.add(canonical);
        }
        return new ArrayList<>(dedup);
    }

    private List<String> getAvailableTeamsForScope(GroupScope scope) {
        return userRepository.findDistinctTeamNamesByDepartmentScope(
                scope.institutionName(),
                scope.institutionCategory(),
                scope.institutionType(),
                scope.departmentName()
        ).stream().filter(StringUtils::hasText).map(String::trim).distinct().toList();
    }

    private List<String> getAvailableTeamsForActor(User actor) {
        if (actor.getRole() == Role.SUPER_ADMIN) {
            return userRepository.findDistinctTeamNames().stream()
                    .filter(StringUtils::hasText)
                    .map(String::trim)
                    .distinct()
                    .toList();
        }
        if (actor.getRole() == Role.MANAGER) {
            assertActorHasTeamScope(actor);
            return List.of(actor.getTeamName().trim());
        }
        assertActorHasDepartmentScope(actor);
        return userRepository.findDistinctTeamNamesByDepartmentScope(
                actor.getInstitutionName(),
                actor.getInstitutionCategory(),
                actor.getInstitutionType(),
                actor.getDepartmentName()
        ).stream().filter(StringUtils::hasText).map(String::trim).distinct().toList();
    }

    private void assertUserInsideActorScope(User actor, User target) {
        if (target.getRole() == Role.SUPER_ADMIN) {
            throw new AccessDeniedException("You do not have permission to assign this user");
        }
        if (actor.getRole() == Role.SUPER_ADMIN) {
            return;
        }
        if (target.getRole() == Role.ADMIN) {
            throw new AccessDeniedException("You do not have permission to assign this user");
        }
        if (!textEquals(actor.getInstitutionName(), target.getInstitutionName())
                || !textEquals(actor.getInstitutionCategory(), target.getInstitutionCategory())
                || !textEquals(actor.getInstitutionType(), target.getInstitutionType())
                || !textEquals(actor.getDepartmentName(), target.getDepartmentName())) {
            throw new AccessDeniedException("You do not have permission to assign this user");
        }
        if (actor.getRole() == Role.MANAGER && !textEquals(actor.getTeamName(), target.getTeamName())) {
            throw new AccessDeniedException("You do not have permission to assign this user");
        }
    }

    private void assertUserInsideGroupTeams(UserGroup group, User target) {
        String targetTeamLower = normalizeLower(target.getTeamName());
        boolean match = parseTeamNames(group).stream()
                .map(this::normalizeLower)
                .anyMatch(targetTeamLower::equals);
        if (!match) {
            throw new AccessDeniedException("Selected user is not in this group's teams");
        }
    }

    private void assertUserInsideGroupDepartmentScope(UserGroup group, User target) {
        if (!StringUtils.hasText(group.getInstitutionName())
                || !StringUtils.hasText(group.getInstitutionCategory())
                || !StringUtils.hasText(group.getInstitutionType())
                || !StringUtils.hasText(group.getDepartmentName())) {
            // Legacy group rows may not have scope columns populated.
            return;
        }
        if (!textEquals(group.getInstitutionName(), target.getInstitutionName())
                || !textEquals(group.getInstitutionCategory(), target.getInstitutionCategory())
                || !textEquals(group.getInstitutionType(), target.getInstitutionType())
                || !textEquals(group.getDepartmentName(), target.getDepartmentName())) {
            throw new AccessDeniedException("Selected user is outside this group's scope");
        }
    }

    private void assertCanViewUser(User actor, User target) {
        boolean canEdit = RolePermissionUtil.canEdit(
                actor.getRole(),
                actor.getId(),
                target.getRole(),
                target.getId()
        );
        if (!canEdit) {
            throw new AccessDeniedException("You do not have permission to view this user");
        }
        if (!canManageWithinOrgScope(actor, target)) {
            throw new AccessDeniedException("You do not have permission to view this user");
        }
    }

    private boolean canManageWithinOrgScope(User actor, User target) {
        if (actor.getId().equals(target.getId())) {
            return true;
        }
        if (actor.getRole() == Role.SUPER_ADMIN) {
            return true;
        }
        if (actor.getRole() == Role.ADMIN) {
            if (!hasDepartmentScope(target)) {
                return true;
            }
            return textEquals(actor.getInstitutionName(), target.getInstitutionName())
                    && textEquals(actor.getInstitutionCategory(), target.getInstitutionCategory())
                    && textEquals(actor.getInstitutionType(), target.getInstitutionType())
                    && textEquals(actor.getDepartmentName(), target.getDepartmentName());
        }
        if (actor.getRole() == Role.MANAGER) {
            if (!hasTeamScope(target)) {
                return true;
            }
            return textEquals(actor.getInstitutionName(), target.getInstitutionName())
                    && textEquals(actor.getInstitutionCategory(), target.getInstitutionCategory())
                    && textEquals(actor.getInstitutionType(), target.getInstitutionType())
                    && textEquals(actor.getDepartmentName(), target.getDepartmentName())
                    && textEquals(actor.getTeamName(), target.getTeamName());
        }
        return false;
    }

    private boolean hasDepartmentScope(User user) {
        return StringUtils.hasText(user.getInstitutionName())
                && StringUtils.hasText(user.getInstitutionCategory())
                && StringUtils.hasText(user.getInstitutionType())
                && StringUtils.hasText(user.getDepartmentName());
    }

    private boolean hasTeamScope(User user) {
        return hasDepartmentScope(user) && StringUtils.hasText(user.getTeamName());
    }

    private List<String> parseTeamNames(UserGroup group) {
        return parseTeamNamesCsv(group.getTeamNamesCsv());
    }

    private void appendTeamToGroupIfMissing(UserGroup group, String teamName) {
        if (!StringUtils.hasText(teamName)) return;
        String targetTeam = teamName.trim();
        List<String> teams = new ArrayList<>(parseTeamNames(group));
        boolean exists = teams.stream()
                .map(this::normalizeLower)
                .anyMatch(normalizeLower(targetTeam)::equals);
        if (exists) return;
        teams.add(targetTeam);
        group.setTeamNamesCsv(String.join(",", teams));
        userGroupRepository.save(group);
    }

    private List<String> parseTeamNamesCsv(String csv) {
        if (!StringUtils.hasText(csv)) return List.of();
        return java.util.Arrays.stream(csv.split(","))
                .map(String::trim)
                .filter(StringUtils::hasText)
                .distinct()
                .toList();
    }

    private List<String> sanitizeTeamNames(List<String> teamNames) {
        if (teamNames == null || teamNames.isEmpty()) return List.of();
        return teamNames.stream()
                .filter(StringUtils::hasText)
                .map(String::trim)
                .filter(StringUtils::hasText)
                .distinct()
                .toList();
    }

    private List<String> sanitizePageKeys(List<String> pageKeys) {
        if (pageKeys == null || pageKeys.isEmpty()) return List.of();
        return pageKeys.stream()
                .filter(StringUtils::hasText)
                .map(String::trim)
                .map(String::toLowerCase)
                .filter(ALLOWED_PAGE_KEYS::contains)
                .distinct()
                .toList();
    }

    private List<String> sanitizeMemberPageKeysForGroup(UserGroup group, List<String> requestedPageKeys) {
        List<String> sanitized = sanitizePageKeys(requestedPageKeys);
        Set<String> groupPageKeys = new LinkedHashSet<>(parseTeamNamesCsv(group.getPageKeysCsv()));
        List<String> filtered = sanitized.stream()
                .filter(groupPageKeys::contains)
                .toList();
        if (filtered.size() != sanitized.size()) {
            throw new IllegalStateException("Member visibility can only include pages selected on the group");
        }
        return filtered;
    }

    private void applyGroupPageVisibilityToMembers(UserGroup group, List<String> previousGroupPages, List<String> nextGroupPages) {
        List<UserGroupMember> members = userGroupMemberRepository.findByGroupOrderByUserUsernameAsc(group);
        if (members.isEmpty()) {
            return;
        }

        Set<String> previousSet = new LinkedHashSet<>(previousGroupPages);
        Set<String> nextSet = new LinkedHashSet<>(nextGroupPages);

        boolean changed = false;
        for (UserGroupMember member : members) {
            Set<String> memberSet = new LinkedHashSet<>(sanitizePageKeys(parseTeamNamesCsv(member.getPageKeysCsv())));
            Set<String> nextMemberSet = new LinkedHashSet<>();

            for (String key : memberSet) {
                if (nextSet.contains(key)) {
                    nextMemberSet.add(key);
                }
            }
            for (String key : nextGroupPages) {
                if (!previousSet.contains(key)) {
                    nextMemberSet.add(key);
                }
            }

            String nextCsv = String.join(",", nextMemberSet);
            String currentCsv = StringUtils.hasText(member.getPageKeysCsv()) ? member.getPageKeysCsv().trim() : "";
            if (!currentCsv.equals(nextCsv)) {
                member.setPageKeysCsv(nextCsv);
                changed = true;
            }
        }

        if (changed) {
            userGroupMemberRepository.saveAll(members);
        }
    }

    private List<String> resolveGroupPageKeysForActor(User actor, List<String> requestedPageKeys, UserGroup existingGroup) {
        if (canEditPageVisibility(actor)) {
            return sanitizePageKeys(requestedPageKeys);
        }
        if (existingGroup != null) {
            return parseTeamNamesCsv(existingGroup.getPageKeysCsv());
        }
        return DEFAULT_PAGE_KEYS;
    }

    private GroupScope resolveScopeForCreate(User actor, CreateUserGroupRequest request) {
        if (actor.getRole() == Role.SUPER_ADMIN) {
            return new GroupScope(
                    requiredScopeValue(request.getInstitutionName(), "Institution is required"),
                    requiredScopeValue(request.getInstitutionCategory(), "Institution Category is required"),
                    requiredScopeValue(request.getInstitutionType(), "Institution Type is required"),
                    requiredScopeValue(request.getDepartmentName(), "Department Name is required")
            );
        }
        assertActorHasDepartmentScope(actor);
        return new GroupScope(
                actor.getInstitutionName().trim(),
                actor.getInstitutionCategory().trim(),
                actor.getInstitutionType().trim(),
                actor.getDepartmentName().trim()
        );
    }

    private GroupScope resolveScopeForUpdate(User actor, UpdateUserGroupRequest request) {
        if (actor.getRole() == Role.SUPER_ADMIN) {
            return new GroupScope(
                    requiredScopeValue(request.getInstitutionName(), "Institution is required"),
                    requiredScopeValue(request.getInstitutionCategory(), "Institution Category is required"),
                    requiredScopeValue(request.getInstitutionType(), "Institution Type is required"),
                    requiredScopeValue(request.getDepartmentName(), "Department Name is required")
            );
        }
        assertActorHasDepartmentScope(actor);
        return new GroupScope(
                actor.getInstitutionName().trim(),
                actor.getInstitutionCategory().trim(),
                actor.getInstitutionType().trim(),
                actor.getDepartmentName().trim()
        );
    }

    private String requiredScopeValue(String value, String message) {
        if (!StringUtils.hasText(value)) {
            throw new IllegalStateException(message);
        }
        return value.trim();
    }

    private String normalizeLower(String value) {
        return StringUtils.hasText(value) ? value.trim().toLowerCase(Locale.ROOT) : "";
    }

    private boolean textEquals(String left, String right) {
        return normalizeLower(left).equals(normalizeLower(right));
    }

    private UserGroupResponse toResponse(UserGroup group) {
        UserGroupResponse response = new UserGroupResponse();
        response.setId(group.getId());
        response.setName(group.getName());
        response.setGroupLevel(group.getGroupLevel());
        response.setCanDelete(!group.isSystemGroup());
        response.setMembers(resolveMembers(group));
        response.setInstitutionName(group.getInstitutionName());
        response.setInstitutionCategory(group.getInstitutionCategory());
        response.setInstitutionType(group.getInstitutionType());
        response.setDepartmentName(group.getDepartmentName());
        response.setTeamNames(parseTeamNames(group));
        response.setPageKeys(parseTeamNamesCsv(group.getPageKeysCsv()));
        return response;
    }

    private long resolveMembers(UserGroup group) {
        if (group.getMemberScope() == UserGroupMemberScope.ADMINS) {
            return userRepository.countByRoleInAndActivationStatusAndIsDeletedFalse(
                    List.of(Role.SUPER_ADMIN, Role.ADMIN),
                    ActivationStatus.ACTIVE
            );
        }
        if (group.getMemberScope() == UserGroupMemberScope.MANAGERS) {
            return userRepository.countByRoleInAndActivationStatusAndIsDeletedFalse(
                    List.of(Role.MANAGER),
                    ActivationStatus.ACTIVE
            );
        }
        return userGroupMemberRepository.countByGroup(group);
    }

    private UserGroupAssignableUserResponse toAssignableUserResponse(User user) {
        UserGroupAssignableUserResponse response = new UserGroupAssignableUserResponse();
        response.setId(user.getId());
        response.setUsername(user.getUsername());
        response.setRole(user.getRole() == null ? null : user.getRole().name());
        return response;
    }

    private UserGroupMemberResponse toMemberResponse(UserGroupMember member) {
        UserGroupMemberResponse response = new UserGroupMemberResponse();
        response.setUserId(member.getUser().getId());
        response.setUsername(member.getUser().getUsername());
        response.setRole(member.getUser().getRole() == null ? null : member.getUser().getRole().name());
        response.setPageKeys(parseTeamNamesCsv(member.getPageKeysCsv()));
        return response;
    }

    private UserGroupSummaryResponse toSummaryResponse(UserGroup group) {
        UserGroupSummaryResponse response = new UserGroupSummaryResponse();
        response.setId(group.getId());
        response.setName(group.getName());
        response.setGroupLevel(group.getGroupLevel());
        return response;
    }
}
