package com.nexorcrm.backend.service;

import com.nexorcrm.backend.dto.ChannelPartnerMultipartRequest;
import com.nexorcrm.backend.dto.ChannelPartnerOwnerOptionResponse;
import com.nexorcrm.backend.dto.ChannelPartnerRequest;
import com.nexorcrm.backend.dto.ChannelPartnerResponse;
import com.nexorcrm.backend.entity.ActivationStatus;
import com.nexorcrm.backend.entity.ChannelPartner;
import com.nexorcrm.backend.entity.Role;
import com.nexorcrm.backend.entity.User;
import com.nexorcrm.backend.repo.ChannelPartnerRepository;
import com.nexorcrm.backend.repo.UserRepository;
import com.nexorcrm.backend.security.RolePermissionUtil;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.Locale;
import java.util.UUID;

@Service
@Transactional
public class ChannelPartnerService {

    private final ChannelPartnerRepository channelPartnerRepository;
    private final UserRepository userRepository;
    private final AuditService auditService;
    private final ChannelPartnerLogService channelPartnerLogService;

    public ChannelPartnerService(ChannelPartnerRepository channelPartnerRepository,
                                 UserRepository userRepository,
                                 AuditService auditService,
                                 ChannelPartnerLogService channelPartnerLogService) {
        this.channelPartnerRepository = channelPartnerRepository;
        this.userRepository = userRepository;
        this.auditService = auditService;
        this.channelPartnerLogService = channelPartnerLogService;
    }

    @Transactional(readOnly = true)
    public List<ChannelPartnerResponse> list(String actorPrincipal) {
        resolveActor(actorPrincipal);
        return channelPartnerRepository.findByDeletedFalseOrderByCreatedAtDesc()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public ChannelPartnerResponse getById(Long id, String actorPrincipal) {
        resolveActor(actorPrincipal);
        ChannelPartner row = findChannelPartner(id);
        return toResponse(row);
    }

    public ChannelPartnerResponse create(ChannelPartnerRequest request, String actorPrincipal) {
        User actor = assertManageAllowed(actorPrincipal);

        ChannelPartner row = new ChannelPartner();
        row.setCpId(generateCpId());
        row.setLeadOwnerUserId(actor.getId());
        row.setLeadOwnerUsername(actor.getUsername());
        applyRequest(row, request);

        ChannelPartner saved = channelPartnerRepository.save(row);
        channelPartnerLogService.log(saved.getId(), "ChannelPartners Created", saved.getStatus(), actor.getUsername());
        auditService.log("CHANNEL_PARTNER_CREATE", "Created channel partner", actor.getEmail());
        return toResponse(saved);
    }

    public ChannelPartnerResponse createMultipart(ChannelPartnerMultipartRequest request, String actorPrincipal) {
        User actor = assertManageAllowed(actorPrincipal);

        ChannelPartner row = new ChannelPartner();
        row.setCpId(generateCpId());
        row.setLeadOwnerUserId(actor.getId());
        row.setLeadOwnerUsername(actor.getUsername());
        applyMultipartRequest(row, request);

        ChannelPartner saved = channelPartnerRepository.save(row);
        channelPartnerLogService.log(saved.getId(), "ChannelPartners Created", saved.getStatus(), actor.getUsername());
        auditService.log("CHANNEL_PARTNER_CREATE", "Created channel partner", actor.getEmail());
        return toResponse(saved);
    }

    public ChannelPartnerResponse update(Long id, ChannelPartnerRequest request, String actorPrincipal) {
        User actor = assertManageAllowed(actorPrincipal);

        ChannelPartner row = findChannelPartner(id);
        applyRequest(row, request);

        ChannelPartner saved = channelPartnerRepository.save(row);
        channelPartnerLogService.log(saved.getId(), "ChannelPartners Updated", saved.getStatus(), actor.getUsername());
        auditService.log("CHANNEL_PARTNER_UPDATE", "Updated channel partner", actor.getEmail());
        return toResponse(saved);
    }

    public ChannelPartnerResponse updateMultipart(Long id, ChannelPartnerMultipartRequest request, String actorPrincipal) {
        User actor = assertManageAllowed(actorPrincipal);

        ChannelPartner row = findChannelPartner(id);
        applyMultipartRequest(row, request);

        ChannelPartner saved = channelPartnerRepository.save(row);
        channelPartnerLogService.log(saved.getId(), "ChannelPartners Updated", saved.getStatus(), actor.getUsername());
        auditService.log("CHANNEL_PARTNER_UPDATE", "Updated channel partner", actor.getEmail());
        return toResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<ChannelPartnerOwnerOptionResponse> listAssignableOwners(Long channelPartnerId, String actorPrincipal) {
        User actor = assertManageAllowed(actorPrincipal);
        findChannelPartner(channelPartnerId);

        List<User> candidates = userRepository.findByRoleInAndActivationStatusAndIsDeletedFalseOrderByUsernameAsc(
                RolePermissionUtil.getVisibleRoles(actor.getRole()),
                ActivationStatus.ACTIVE
        );

        return candidates.stream()
                .filter(User::isActive)
                .filter(candidate -> canAssignOwner(actor, candidate))
                .map(this::toOwnerOptionResponse)
                .toList();
    }

    public ChannelPartnerResponse updateLeadOwner(Long channelPartnerId, Long ownerUserId, String actorPrincipal) {
        User actor = assertManageAllowed(actorPrincipal);
        ChannelPartner row = findChannelPartner(channelPartnerId);
        User owner = userRepository.findByIdAndIsDeletedFalse(ownerUserId)
                .orElseThrow(() -> new EntityNotFoundException("Owner user not found"));

        if (!owner.isActive() || owner.getActivationStatus() != ActivationStatus.ACTIVE) {
            throw new IllegalStateException("Selected owner must be an active user");
        }
        if (!canAssignOwner(actor, owner)) {
            throw new AccessDeniedException("You do not have permission to assign this owner");
        }

        row.setLeadOwnerUserId(owner.getId());
        row.setLeadOwnerUsername(owner.getUsername());
        ChannelPartner saved = channelPartnerRepository.save(row);

        channelPartnerLogService.log(saved.getId(), "ChannelPartners Owner Updated", owner.getUsername(), actor.getUsername());
        auditService.log("CHANNEL_PARTNER_OWNER_CHANGE", "Changed channel partner owner", actor.getEmail());
        return toResponse(saved);
    }

    public void delete(Long id, String actorPrincipal) {
        User actor = assertManageAllowed(actorPrincipal);
        ChannelPartner row = findChannelPartner(id);

        row.setDeleted(true);
        channelPartnerRepository.save(row);
        channelPartnerLogService.log(row.getId(), "ChannelPartners Deleted", row.getStatus(), actor.getUsername());
        auditService.log("CHANNEL_PARTNER_DELETE", "Deleted channel partner", actor.getEmail());
    }

    private boolean canAssignOwner(User actor, User candidate) {
        boolean self = actor.getId().equals(candidate.getId());
        boolean strictlyBelow = RolePermissionUtil.isStrictlyHigher(actor.getRole(), candidate.getRole());
        if (!self && !strictlyBelow) {
            return false;
        }
        return canManageWithinOrgScope(actor, candidate);
    }

    private void applyRequest(ChannelPartner row, ChannelPartnerRequest req) {
        row.setChannelPartnerType(trim(req.getChannelPartnerType()));
        row.setCompanyName(req.getCompanyName().trim());
        row.setPartnerName(req.getPartnerName().trim());
        row.setMobile(req.getMobile().trim());
        row.setOfficeLandlineNumber(trim(req.getOfficeLandlineNumber()));
        row.setEmailAddress(req.getEmailAddress().trim().toLowerCase(Locale.ROOT));
        row.setCompanyRegistrationNumber(trim(req.getCompanyRegistrationNumber()));
        row.setRegisteredAddress(trim(req.getRegisteredAddress()));
        row.setCommunicationAddress(trim(req.getCommunicationAddress()));
        row.setMessage(trim(req.getMessage()));
        row.setWebsiteUrl(trim(req.getWebsiteUrl()));
        row.setAadhaarNumber(trim(req.getAadhaarNumber()));
        row.setAadhaarCopyName(trim(req.getAadhaarCopyName()));
        row.setPanCompany(trim(req.getPanCompany()));
        row.setPanCopyName(trim(req.getPanCopyName()));
        row.setGstRegistrationNumber(trim(req.getGstRegistrationNumber()));
        row.setGstCopyName(trim(req.getGstCopyName()));
        row.setReraRegistrationNumber(trim(req.getReraRegistrationNumber()));
        row.setReraCopyName(trim(req.getReraCopyName()));
        row.setBeneficiaryBankName(trim(req.getBeneficiaryBankName()));
        row.setBankAccountNo(trim(req.getBankAccountNo()));
        row.setBeneficiaryName(trim(req.getBeneficiaryName()));
        row.setIfscCode(trim(req.getIfscCode()));
        row.setStatus(StringUtils.hasText(req.getStatus()) ? req.getStatus().trim() : "Registered");
    }

    private void applyMultipartRequest(ChannelPartner row, ChannelPartnerMultipartRequest req) {
        String existingAadhaar = row.getAadhaarCopyName();
        String existingPan = row.getPanCopyName();
        String existingGst = row.getGstCopyName();
        String existingRera = row.getReraCopyName();

        ChannelPartnerRequest base = new ChannelPartnerRequest();
        base.setChannelPartnerType(req.getChannelPartnerType());
        base.setCompanyName(req.getCompanyName());
        base.setPartnerName(req.getPartnerName());
        base.setMobile(req.getMobile());
        base.setOfficeLandlineNumber(req.getOfficeLandlineNumber());
        base.setEmailAddress(req.getEmailAddress());
        base.setCompanyRegistrationNumber(req.getCompanyRegistrationNumber());
        base.setRegisteredAddress(req.getRegisteredAddress());
        base.setCommunicationAddress(req.getCommunicationAddress());
        base.setMessage(req.getMessage());
        base.setWebsiteUrl(req.getWebsiteUrl());
        base.setAadhaarNumber(req.getAadhaarNumber());
        base.setPanCompany(req.getPanCompany());
        base.setGstRegistrationNumber(req.getGstRegistrationNumber());
        base.setReraRegistrationNumber(req.getReraRegistrationNumber());
        base.setBeneficiaryBankName(req.getBeneficiaryBankName());
        base.setBankAccountNo(req.getBankAccountNo());
        base.setBeneficiaryName(req.getBeneficiaryName());
        base.setIfscCode(req.getIfscCode());
        base.setStatus(req.getStatus());
        applyRequest(row, base);

        String aadhaarName = storeFile(req.getAadhaarCopy(), "aadhaar");
        if (aadhaarName != null) row.setAadhaarCopyName(aadhaarName);
        else row.setAadhaarCopyName(existingAadhaar);
        String panName = storeFile(req.getPanCopy(), "pan");
        if (panName != null) row.setPanCopyName(panName);
        else row.setPanCopyName(existingPan);
        String gstName = storeFile(req.getGstCopy(), "gst");
        if (gstName != null) row.setGstCopyName(gstName);
        else row.setGstCopyName(existingGst);
        String reraName = storeFile(req.getReraCopy(), "rera");
        if (reraName != null) row.setReraCopyName(reraName);
        else row.setReraCopyName(existingRera);
    }

    private String storeFile(MultipartFile file, String prefix) {
        if (file == null || file.isEmpty()) return null;
        try {
            String original = file.getOriginalFilename();
            String ext = null;
            if (StringUtils.hasText(original) && original.contains(".")) {
                ext = original.substring(original.lastIndexOf('.') + 1);
            }
            String name = prefix + "_" + UUID.randomUUID().toString().replace("-", "");
            if (StringUtils.hasText(ext)) name += "." + ext.toLowerCase(Locale.ROOT);
            Path dir = Paths.get("uploads", "channel-partners");
            Files.createDirectories(dir);
            Path target = dir.resolve(name);
            Files.copy(file.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);
            return name;
        } catch (Exception ex) {
            return null;
        }
    }

    private User assertManageAllowed(String actorPrincipal) {
        User actor = resolveActor(actorPrincipal);
        if (actor.getRole() != Role.SUPER_ADMIN && actor.getRole() != Role.ADMIN && actor.getRole() != Role.MANAGER) {
            throw new AccessDeniedException("You do not have permission to manage channel partners");
        }
        return actor;
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

    private ChannelPartner findChannelPartner(Long id) {
        return channelPartnerRepository.findByIdAndDeletedFalse(id)
                .orElseThrow(() -> new EntityNotFoundException("Channel partner not found"));
    }

    private String generateCpId() {
        return "CP_" + UUID.randomUUID().toString().replace("-", "").substring(0, 12).toUpperCase(Locale.ROOT);
    }

    private String trim(String value) {
        if (!StringUtils.hasText(value)) return null;
        return value.trim();
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

    private boolean textEquals(String a, String b) {
        return normalizeNullable(a) != null && normalizeNullable(a).equalsIgnoreCase(StringUtils.hasText(b) ? b.trim() : "");
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

    private String normalizeNullable(String value) {
        if (!StringUtils.hasText(value)) {
            return null;
        }
        return value.trim();
    }

    private ChannelPartnerOwnerOptionResponse toOwnerOptionResponse(User user) {
        ChannelPartnerOwnerOptionResponse res = new ChannelPartnerOwnerOptionResponse();
        res.setId(user.getId());
        res.setUsername(user.getUsername());
        res.setRole(user.getRole() == null ? null : user.getRole().name());
        return res;
    }

    private ChannelPartnerResponse toResponse(ChannelPartner row) {
        ChannelPartnerResponse res = new ChannelPartnerResponse();
        res.setId(row.getId());
        res.setCpId(row.getCpId());
        res.setChannelPartnerType(row.getChannelPartnerType());
        res.setCompanyName(row.getCompanyName());
        res.setPartnerName(row.getPartnerName());
        res.setMobile(row.getMobile());
        res.setOfficeLandlineNumber(row.getOfficeLandlineNumber());
        res.setEmailAddress(row.getEmailAddress());
        res.setCompanyRegistrationNumber(row.getCompanyRegistrationNumber());
        res.setRegisteredAddress(row.getRegisteredAddress());
        res.setCommunicationAddress(row.getCommunicationAddress());
        res.setMessage(row.getMessage());
        res.setWebsiteUrl(row.getWebsiteUrl());
        res.setAadhaarNumber(row.getAadhaarNumber());
        res.setAadhaarCopyName(row.getAadhaarCopyName());
        res.setPanCompany(row.getPanCompany());
        res.setPanCopyName(row.getPanCopyName());
        res.setGstRegistrationNumber(row.getGstRegistrationNumber());
        res.setGstCopyName(row.getGstCopyName());
        res.setReraRegistrationNumber(row.getReraRegistrationNumber());
        res.setReraCopyName(row.getReraCopyName());
        res.setBeneficiaryBankName(row.getBeneficiaryBankName());
        res.setBankAccountNo(row.getBankAccountNo());
        res.setBeneficiaryName(row.getBeneficiaryName());
        res.setIfscCode(row.getIfscCode());
        res.setStatus(row.getStatus());
        res.setLeadOwnerUserId(row.getLeadOwnerUserId());
        res.setLeadOwnerUsername(row.getLeadOwnerUsername());
        res.setCreatedDate(row.getCreatedAt());
        return res;
    }
}
