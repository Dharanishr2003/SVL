package com.nexorcrm.backend.service;

import com.nexorcrm.backend.dto.*;
import com.nexorcrm.backend.entity.*;
import com.nexorcrm.backend.repo.*;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.List;
import java.util.Locale;

@Service
@Transactional
public class OrgHierarchyService {

    private final InstitutionRepository institutionRepository;
    private final InstitutionCategoryRepository categoryRepository;
    private final InstitutionTypeRepository typeRepository;
    private final DepartmentRepository departmentRepository;
    private final TeamRepository teamRepository;
    private final UserRepository userRepository;

    public OrgHierarchyService(
            InstitutionRepository institutionRepository,
            InstitutionCategoryRepository categoryRepository,
            InstitutionTypeRepository typeRepository,
            DepartmentRepository departmentRepository,
            TeamRepository teamRepository,
            UserRepository userRepository
    ) {
        this.institutionRepository = institutionRepository;
        this.categoryRepository = categoryRepository;
        this.typeRepository = typeRepository;
        this.departmentRepository = departmentRepository;
        this.teamRepository = teamRepository;
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public List<OrgOptionResponse> listInstitutions() {
        return institutionRepository.findByIsDeletedFalseOrderByNameAsc().stream()
                .map(i -> new OrgOptionResponse(i.getId(), i.getName(), i.getStatus()))
                .toList();
    }

    public OrgOptionResponse addInstitution(CreateInstitutionRequest req, String actor) {
        assertCanManage(actor);
        String name = req.getName().trim();
        if (institutionRepository.existsByNameIgnoreCaseAndIsDeletedFalse(name)) {
            throw new IllegalStateException("Institution already exists");
        }
        Institution i = new Institution();
        i.setName(name);
        i.setEmail(trimOrNull(req.getEmail()));
        i.setPhone(trimOrNull(req.getPhone()));
        i.setAddress(trimOrNull(req.getAddress()));
        i.setStatus(status(req.getStatus()));
        Institution saved = institutionRepository.save(i);
        return new OrgOptionResponse(saved.getId(), saved.getName(), saved.getStatus());
    }

    @Transactional(readOnly = true)
    public List<OrgOptionResponse> listCategories(Long institutionId) {
        Institution inst = institutionRepository.findByIdAndIsDeletedFalse(institutionId)
                .orElseThrow(() -> new EntityNotFoundException("Institution not found"));
        return categoryRepository.findByInstitutionAndIsDeletedFalseOrderByNameAsc(inst).stream()
                .map(c -> new OrgOptionResponse(c.getId(), c.getName(), c.getStatus()))
                .toList();
    }

    public OrgOptionResponse addCategory(CreateInstitutionCategoryRequest req, String actor) {
        assertCanManage(actor);
        Institution inst = institutionRepository.findByIdAndIsDeletedFalse(req.getInstitutionId())
                .orElseThrow(() -> new EntityNotFoundException("Institution not found"));
        String name = req.getName().trim();
        if (categoryRepository.existsByInstitutionAndNameIgnoreCaseAndIsDeletedFalse(inst, name)) {
            throw new IllegalStateException("Institution category already exists");
        }
        InstitutionCategory c = new InstitutionCategory();
        c.setInstitution(inst);
        c.setName(name);
        c.setStatus(status(req.getStatus()));
        InstitutionCategory saved = categoryRepository.save(c);
        return new OrgOptionResponse(saved.getId(), saved.getName(), saved.getStatus());
    }

    @Transactional(readOnly = true)
    public List<OrgOptionResponse> listTypes(Long institutionId, Long categoryId) {
        Institution inst = institutionRepository.findByIdAndIsDeletedFalse(institutionId)
                .orElseThrow(() -> new EntityNotFoundException("Institution not found"));
        InstitutionCategory cat = categoryRepository.findByIdAndIsDeletedFalse(categoryId)
                .orElseThrow(() -> new EntityNotFoundException("Category not found"));
        return typeRepository.findByInstitutionAndCategoryAndIsDeletedFalseOrderByNameAsc(inst, cat).stream()
                .map(t -> new OrgOptionResponse(t.getId(), t.getName(), t.getStatus()))
                .toList();
    }

    public OrgOptionResponse addType(CreateInstitutionTypeRequest req, String actor) {
        assertCanManage(actor);
        Institution inst = institutionRepository.findByIdAndIsDeletedFalse(req.getInstitutionId())
                .orElseThrow(() -> new EntityNotFoundException("Institution not found"));
        InstitutionCategory cat = categoryRepository.findByIdAndIsDeletedFalse(req.getCategoryId())
                .orElseThrow(() -> new EntityNotFoundException("Category not found"));
        String name = req.getName().trim();
        if (typeRepository.existsByInstitutionAndCategoryAndNameIgnoreCaseAndIsDeletedFalse(inst, cat, name)) {
            throw new IllegalStateException("Institution type already exists");
        }
        InstitutionType t = new InstitutionType();
        t.setInstitution(inst);
        t.setCategory(cat);
        t.setName(name);
        t.setStatus(status(req.getStatus()));
        InstitutionType saved = typeRepository.save(t);
        return new OrgOptionResponse(saved.getId(), saved.getName(), saved.getStatus());
    }

    @Transactional(readOnly = true)
    public List<OrgOptionResponse> listDepartments(Long institutionId, Long categoryId, Long typeId) {
        Institution inst = institutionRepository.findByIdAndIsDeletedFalse(institutionId)
                .orElseThrow(() -> new EntityNotFoundException("Institution not found"));
        InstitutionCategory cat = categoryRepository.findByIdAndIsDeletedFalse(categoryId)
                .orElseThrow(() -> new EntityNotFoundException("Category not found"));
        InstitutionType type = typeRepository.findByIdAndIsDeletedFalse(typeId)
                .orElseThrow(() -> new EntityNotFoundException("Type not found"));
        return departmentRepository.findByInstitutionAndCategoryAndTypeAndIsDeletedFalseOrderByNameAsc(inst, cat, type).stream()
                .map(d -> new OrgOptionResponse(d.getId(), d.getName(), d.getStatus()))
                .toList();
    }

    public OrgOptionResponse addDepartment(CreateDepartmentRequest req, String actor) {
        assertCanManage(actor);
        Institution inst = institutionRepository.findByIdAndIsDeletedFalse(req.getInstitutionId())
                .orElseThrow(() -> new EntityNotFoundException("Institution not found"));
        InstitutionCategory cat = categoryRepository.findByIdAndIsDeletedFalse(req.getCategoryId())
                .orElseThrow(() -> new EntityNotFoundException("Category not found"));
        InstitutionType type = typeRepository.findByIdAndIsDeletedFalse(req.getTypeId())
                .orElseThrow(() -> new EntityNotFoundException("Type not found"));
        String name = req.getName().trim();
        if (departmentRepository.existsByInstitutionAndCategoryAndTypeAndNameIgnoreCaseAndIsDeletedFalse(inst, cat, type, name)) {
            throw new IllegalStateException("Department already exists");
        }
        Department d = new Department();
        d.setInstitution(inst);
        d.setCategory(cat);
        d.setType(type);
        d.setName(name);
        d.setStatus(status(req.getStatus()));
        Department saved = departmentRepository.save(d);
        return new OrgOptionResponse(saved.getId(), saved.getName(), saved.getStatus());
    }

    @Transactional(readOnly = true)
    public List<OrgOptionResponse> listTeams(Long institutionId, Long categoryId, Long typeId, Long departmentId) {
        Institution inst = institutionRepository.findByIdAndIsDeletedFalse(institutionId)
                .orElseThrow(() -> new EntityNotFoundException("Institution not found"));
        InstitutionCategory cat = categoryRepository.findByIdAndIsDeletedFalse(categoryId)
                .orElseThrow(() -> new EntityNotFoundException("Category not found"));
        InstitutionType type = typeRepository.findByIdAndIsDeletedFalse(typeId)
                .orElseThrow(() -> new EntityNotFoundException("Type not found"));
        Department dept = departmentRepository.findByIdAndIsDeletedFalse(departmentId)
                .orElseThrow(() -> new EntityNotFoundException("Department not found"));
        return teamRepository.findByInstitutionAndCategoryAndTypeAndDepartmentAndIsDeletedFalseOrderByNameAsc(inst, cat, type, dept).stream()
                .map(t -> new OrgOptionResponse(t.getId(), t.getName(), t.getStatus()))
                .toList();
    }

    public OrgOptionResponse addTeam(CreateTeamRequest req, String actor) {
        assertCanManage(actor);
        Institution inst = institutionRepository.findByIdAndIsDeletedFalse(req.getInstitutionId())
                .orElseThrow(() -> new EntityNotFoundException("Institution not found"));
        InstitutionCategory cat = categoryRepository.findByIdAndIsDeletedFalse(req.getCategoryId())
                .orElseThrow(() -> new EntityNotFoundException("Category not found"));
        InstitutionType type = typeRepository.findByIdAndIsDeletedFalse(req.getTypeId())
                .orElseThrow(() -> new EntityNotFoundException("Type not found"));
        Department dept = departmentRepository.findByIdAndIsDeletedFalse(req.getDepartmentId())
                .orElseThrow(() -> new EntityNotFoundException("Department not found"));
        String name = req.getName().trim();
        if (teamRepository.existsByInstitutionAndCategoryAndTypeAndDepartmentAndNameIgnoreCaseAndIsDeletedFalse(inst, cat, type, dept, name)) {
            throw new IllegalStateException("Team already exists");
        }
        Team t = new Team();
        t.setInstitution(inst);
        t.setCategory(cat);
        t.setType(type);
        t.setDepartment(dept);
        t.setName(name);
        t.setStatus(status(req.getStatus()));
        Team saved = teamRepository.save(t);
        return new OrgOptionResponse(saved.getId(), saved.getName(), saved.getStatus());
    }

    @Transactional(readOnly = true)
    public OrgSelectionResponse getUserOrgSelection(Long userId, String actorPrincipal) {
        User actor = resolveActor(actorPrincipal);
        User target = userRepository.findByIdAndIsDeletedFalse(userId)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));

        if (!canViewUser(actor, target)) {
            throw new AccessDeniedException("You do not have permission to view this user");
        }

        OrgSelectionResponse response = new OrgSelectionResponse();

        String institutionName = target.getInstitutionName();
        String categoryName = target.getInstitutionCategory();
        String typeName = target.getInstitutionType();
        String departmentName = target.getDepartmentName();
        String teamName = target.getTeamName();

        response.setInstitutionName(institutionName);
        response.setCategoryName(categoryName);
        response.setTypeName(typeName);
        response.setDepartmentName(departmentName);
        response.setTeamName(teamName);

        if (!StringUtils.hasText(institutionName)) {
            return response;
        }

        Institution inst = institutionRepository
                .findByNameIgnoreCaseAndIsDeletedFalse(institutionName.trim())
                .orElse(null);
        if (inst == null) {
            return response;
        }
        response.setInstitutionId(inst.getId());

        if (!StringUtils.hasText(categoryName)) {
            return response;
        }
        InstitutionCategory category = categoryRepository
                .findByInstitutionAndNameIgnoreCaseAndIsDeletedFalse(inst, categoryName.trim())
                .orElse(null);
        if (category == null) {
            return response;
        }
        response.setCategoryId(category.getId());

        if (!StringUtils.hasText(typeName)) {
            return response;
        }
        InstitutionType type = typeRepository
                .findByInstitutionAndCategoryAndNameIgnoreCaseAndIsDeletedFalse(inst, category, typeName.trim())
                .orElse(null);
        if (type == null) {
            return response;
        }
        response.setTypeId(type.getId());

        if (!StringUtils.hasText(departmentName)) {
            return response;
        }
        Department department = departmentRepository
                .findByInstitutionAndCategoryAndTypeAndNameIgnoreCaseAndIsDeletedFalse(
                        inst, category, type, departmentName.trim())
                .orElse(null);
        if (department == null) {
            return response;
        }
        response.setDepartmentId(department.getId());

        if (!StringUtils.hasText(teamName)) {
            return response;
        }
        Team team = teamRepository
                .findByInstitutionAndCategoryAndTypeAndDepartmentAndNameIgnoreCaseAndIsDeletedFalse(
                        inst, category, type, department, teamName.trim())
                .orElse(null);
        if (team == null) {
            return response;
        }
        response.setTeamId(team.getId());

        return response;
    }

    private void assertCanManage(String actorPrincipal) {
        User actor = resolveActor(actorPrincipal);
        if (actor.getRole() != Role.SUPER_ADMIN && actor.getRole() != Role.ADMIN) {
            throw new AccessDeniedException("You do not have permission to manage org hierarchy");
        }
    }

    private User resolveActor(String actorPrincipal) {
        if (!StringUtils.hasText(actorPrincipal)) throw new AccessDeniedException("Unauthenticated actor");
        if (actorPrincipal.contains("@")) {
            return userRepository.findByEmailAndIsDeletedFalse(actorPrincipal.trim().toLowerCase(Locale.ROOT))
                    .orElseThrow(() -> new EntityNotFoundException("Actor not found"));
        }
        return userRepository.findByUsernameAndIsDeletedFalse(actorPrincipal.trim())
                .orElseThrow(() -> new EntityNotFoundException("Actor not found"));
    }

    private String status(String value) {
        String v = StringUtils.hasText(value) ? value.trim().toUpperCase(Locale.ROOT) : "ACTIVE";
        return ("INACTIVE".equals(v)) ? "INACTIVE" : "ACTIVE";
    }

    private String trimOrNull(String value) {
        return StringUtils.hasText(value) ? value.trim() : null;
    }

    private boolean canViewUser(User actor, User target) {
        if (actor == null || target == null) {
            return false;
        }
        if (actor.getId() != null && actor.getId().equals(target.getId())) {
            return true;
        }
        Role actorRole = actor.getRole();
        if (actorRole == Role.SUPER_ADMIN) {
            return true;
        }
        if (actorRole == Role.ADMIN) {
            String actorType = safeLower(actor.getInstitutionType());
            String targetType = safeLower(target.getInstitutionType());
            return !actorType.isEmpty() && actorType.equals(targetType);
        }
        if (actorRole == Role.MANAGER) {
            String actorTeam = safeLower(actor.getTeamName());
            String targetTeam = safeLower(target.getTeamName());
            return target.getRole() == Role.EMPLOYEE
                    && !actorTeam.isEmpty()
                    && actorTeam.equals(targetTeam);
        }
        return false;
    }

    private String safeLower(String value) {
        return StringUtils.hasText(value) ? value.trim().toLowerCase(Locale.ROOT) : "";
    }
}
