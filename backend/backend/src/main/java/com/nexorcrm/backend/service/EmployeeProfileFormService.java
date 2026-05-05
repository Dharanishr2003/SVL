package com.nexorcrm.backend.service;

import com.nexorcrm.backend.dto.*;
import com.nexorcrm.backend.entity.*;
import com.nexorcrm.backend.entity.EmailTemplateKey;
import com.nexorcrm.backend.repo.EmployeeDocumentRepository;
import com.nexorcrm.backend.repo.EmployeeProfileFieldVerificationRepository;
import com.nexorcrm.backend.repo.EmployeeProfileTokenRepository;
import com.nexorcrm.backend.repo.EmployeeRepository;
import com.nexorcrm.backend.repo.HeadOfficeMasterRepository;
import com.nexorcrm.backend.repo.BranchMasterRepository;
import com.nexorcrm.backend.repo.DepartmentMasterRepository;
import com.nexorcrm.backend.repo.DesignationMasterRepository;
import com.nexorcrm.backend.entity.HeadOfficeMaster;
import com.nexorcrm.backend.entity.BranchMaster;
import com.nexorcrm.backend.entity.DepartmentMaster;
import com.nexorcrm.backend.entity.DesignationMaster;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.multipart.MultipartHttpServletRequest;
import org.springframework.web.server.ResponseStatusException;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.net.URI;
import java.nio.charset.StandardCharsets;
import java.security.SecureRandom;
import java.time.format.DateTimeFormatter;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class EmployeeProfileFormService {

    private static final String HMAC_ALG = "HmacSHA256";
    private static final SecureRandom SECURE_RANDOM = new SecureRandom();

    private static final Set<EmployeePublicFieldKey> EXCLUDED_PUBLIC_FIELDS = EnumSet.of(
            EmployeePublicFieldKey.INSTITUTION,
            EmployeePublicFieldKey.DEPARTMENT_NAME,
            EmployeePublicFieldKey.TEAM,
            EmployeePublicFieldKey.DESIGNATION,
            EmployeePublicFieldKey.STATUS
    );

    private final EmployeeRepository employeeRepository;
    private final EmployeeProfileTokenRepository tokenRepository;
    private final EmployeeProfileFieldVerificationRepository fieldVerificationRepository;
    private final EmployeeDocumentRepository documentRepository;
    private final HeadOfficeMasterRepository headOfficeMasterRepository;
    private final BranchMasterRepository branchMasterRepository;
    private final DepartmentMasterRepository departmentMasterRepository;
    private final DesignationMasterRepository designationMasterRepository;
    private final EmailNotificationService emailNotificationService;
    private final EmailTemplateService emailTemplateService;
    private final UploadStorageService uploadStorageService;

    @Value("${app.employee-form.token-secret:${EMPLOYEE_FORM_TOKEN_SECRET:change-me}}")
    private String tokenSecret;

    @Value("${app.employee-form.token-ttl-days:${EMPLOYEE_FORM_TOKEN_TTL_DAYS:7}}")
    private int tokenTtlDays;

    @Value("${app.employee-form.public-base-url:${EMPLOYEE_FORM_PUBLIC_BASE_URL:http://127.0.0.1:5173/employee-form}}")
    private String publicBaseUrl;

    @Value("${app.mail.from-name:SVL}")
    private String mailFromName;

    @Value("${app.employee-form.required-fields:DATE_OF_BIRTH,GENDER,CURRENT_ADDRESS,AADHAAR_NUMBER,PAN_NUMBER,BANK_ACCOUNT_HOLDER_NAME,BANK_ACCOUNT_NUMBER,BANK_IFSC,BANK_NAME_BRANCH}")
    private String requiredFieldsConfig;

    @Value("${app.employee-form.required-docs:PHOTO,RESUME,CERTIFICATE}")
    private String requiredDocsConfig;

    public EmployeeProfileFormService(
            EmployeeRepository employeeRepository,
            EmployeeProfileTokenRepository tokenRepository,
            EmployeeProfileFieldVerificationRepository fieldVerificationRepository,
            EmployeeDocumentRepository documentRepository,
            HeadOfficeMasterRepository headOfficeMasterRepository,
            BranchMasterRepository branchMasterRepository,
            DepartmentMasterRepository departmentMasterRepository,
            DesignationMasterRepository designationMasterRepository,
            EmailNotificationService emailNotificationService,
            EmailTemplateService emailTemplateService,
            UploadStorageService uploadStorageService
    ) {
        this.employeeRepository = employeeRepository;
        this.tokenRepository = tokenRepository;
        this.fieldVerificationRepository = fieldVerificationRepository;
        this.documentRepository = documentRepository;
        this.headOfficeMasterRepository = headOfficeMasterRepository;
        this.branchMasterRepository = branchMasterRepository;
        this.departmentMasterRepository = departmentMasterRepository;
        this.designationMasterRepository = designationMasterRepository;
        this.emailNotificationService = emailNotificationService;
        this.emailTemplateService = emailTemplateService;
        this.uploadStorageService = uploadStorageService;
    }

    @Transactional
    public EmployeeFormLinkResponse generateFormLink(Long employeeId, EmployeeTokenScope scope) {
        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new EntityNotFoundException("Employee not found"));

        LocalDateTime now = LocalDateTime.now();
        tokenRepository.revokeActiveTokens(employeeId, now);

        String token = generateToken();
        String tokenHash = hmacHash(tokenSecret, token);

        EmployeeProfileToken row = new EmployeeProfileToken();
        row.setEmployeeId(employeeId);
        row.setTokenHash(tokenHash);
        row.setScope(scope == null ? EmployeeTokenScope.MISSING_FIELDS : scope);
        row.setCreatedAt(now);
        row.setExpiresAt(now.plusDays(Math.max(1, tokenTtlDays)));
        tokenRepository.save(row);

        String publicUrl = buildPublicUrl(token);
        if (StringUtils.hasText(employee.getEmail())) {
            String subject = "Complete your employee profile";
            String body = "Please complete your profile using this secure link (valid for "
                    + Math.max(1, tokenTtlDays) + " days):\n\n" + publicUrl;
            emailNotificationService.notifyIfAllowed(employee.getEmail(), subject, body);
        }

        EmployeeFormLinkResponse res = new EmployeeFormLinkResponse();
        res.setEmployeeId(employeeId);
        res.setScope(row.getScope());
        res.setExpiresAt(row.getExpiresAt());
        res.setPublicUrl(publicUrl);
        return res;
    }

    /**
     * Generates a fresh public profile-completion link and emails it as part of the Offer Letter template.
     * Email is sent as plain text (template body is stored text).
     */
    @Transactional
    public EmployeeFormLinkResponse sendOfferLetterEmail(Long employeeId) {
        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new EntityNotFoundException("Employee not found"));

        // If an active unused token exists, the offer letter (with link) is already sent and still pending submission.
        LocalDateTime now = LocalDateTime.now();
        tokenRepository.findTopByEmployeeIdAndScopeAndRevokedAtIsNullAndUsedAtIsNullAndExpiresAtAfterOrderByCreatedAtDesc(
                employeeId,
                EmployeeTokenScope.MISSING_FIELDS,
                now
        ).ifPresent(existing -> {
            String expiry = existing.getExpiresAt() == null
                    ? ""
                    : existing.getExpiresAt().toLocalDate().format(DateTimeFormatter.ISO_LOCAL_DATE);
            String msg = expiry.isBlank()
                    ? "Offer letter already sent."
                    : "Offer letter already sent. Link valid until " + expiry + ".";
            throw new ResponseStatusException(HttpStatus.CONFLICT, msg);
        });

        tokenRepository.revokeActiveTokens(employeeId, now);

        String token = generateToken();
        String tokenHash = hmacHash(tokenSecret, token);

        EmployeeProfileToken row = new EmployeeProfileToken();
        row.setEmployeeId(employeeId);
        row.setTokenHash(tokenHash);
        row.setScope(EmployeeTokenScope.MISSING_FIELDS);
        row.setCreatedAt(now);
        row.setExpiresAt(now.plusDays(Math.max(1, tokenTtlDays)));
        tokenRepository.save(row);

        String publicUrl = buildPublicUrl(token);

        if (StringUtils.hasText(employee.getEmail())) {
            var template = emailTemplateService.getOne(EmailTemplateKey.OFFER_LETTER_TEMPLATE.getKey());
            String subjectTemplate = template == null ? null : template.getSubject();
            String bodyTemplate = template == null ? null : template.getBody();

            String subject = renderOfferLetterText(subjectTemplate, employee, publicUrl, row.getExpiresAt());
            String body = renderOfferLetterText(bodyTemplate, employee, publicUrl, row.getExpiresAt());

            // Admin-triggered email: bypass cooldown.
            emailNotificationService.notifyNowIfEnabled(employee.getEmail(), subject, body);
        }

        EmployeeFormLinkResponse res = new EmployeeFormLinkResponse();
        res.setEmployeeId(employeeId);
        res.setScope(row.getScope());
        res.setExpiresAt(row.getExpiresAt());
        res.setPublicUrl(publicUrl);
        return res;
    }

    /**
     * Resends the offer letter email by revoking existing active tokens and generating a new link.
     */
    @Transactional
    public EmployeeFormLinkResponse resendOfferLetterEmail(Long employeeId) {
        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new EntityNotFoundException("Employee not found"));

        LocalDateTime now = LocalDateTime.now();
        tokenRepository.revokeActiveTokens(employeeId, now);

        String token = generateToken();
        String tokenHash = hmacHash(tokenSecret, token);

        EmployeeProfileToken row = new EmployeeProfileToken();
        row.setEmployeeId(employeeId);
        row.setTokenHash(tokenHash);
        row.setScope(EmployeeTokenScope.MISSING_FIELDS);
        row.setCreatedAt(now);
        row.setExpiresAt(now.plusDays(Math.max(1, tokenTtlDays)));
        tokenRepository.save(row);

        String publicUrl = buildPublicUrl(token);

        if (StringUtils.hasText(employee.getEmail())) {
            var template = emailTemplateService.getOne(EmailTemplateKey.OFFER_LETTER_TEMPLATE.getKey());
            String subjectTemplate = template == null ? null : template.getSubject();
            String bodyTemplate = template == null ? null : template.getBody();

            String subject = renderOfferLetterText(subjectTemplate, employee, publicUrl, row.getExpiresAt());
            String body = renderOfferLetterText(bodyTemplate, employee, publicUrl, row.getExpiresAt());
            emailNotificationService.notifyNowIfEnabled(employee.getEmail(), subject, body);
        }

        EmployeeFormLinkResponse res = new EmployeeFormLinkResponse();
        res.setEmployeeId(employeeId);
        res.setScope(row.getScope());
        res.setExpiresAt(row.getExpiresAt());
        res.setPublicUrl(publicUrl);
        return res;
    }

    private String renderOfferLetterText(String templateText, Employee employee, String profileCompletionUrl, LocalDateTime expiresAt) {
        String text = templateText == null ? "" : templateText;
        String employeeName = employee == null ? "" : String.valueOf(employee.getName() == null ? "" : employee.getName());
        String designation = employee == null ? "" : String.valueOf(employee.getDesignation() == null ? "" : employee.getDesignation());
        String companyName = StringUtils.hasText(mailFromName) ? mailFromName : "SVL";
        String expiry = expiresAt == null ? "" : expiresAt.toLocalDate().format(DateTimeFormatter.ISO_LOCAL_DATE);

        text = text.replace("{{employee_name}}", employeeName);
        text = text.replace("{{designation}}", designation);
        text = text.replace("{{company_name}}", companyName);
        text = text.replace("[Profile Completion Link]", profileCompletionUrl == null ? "" : profileCompletionUrl);
        text = text.replace("[Expiry Date]", expiry);
        return text;
    }

    @Transactional(readOnly = true)
    public PublicEmployeeFormResponse getPublicForm(String token) {
        TokenContext ctx = requireValidToken(token);
        Employee employee = employeeRepository.findById(ctx.employeeId())
                .orElseThrow(() -> new EntityNotFoundException("Employee not found"));

        Map<String, EmployeeProfileFieldVerification> verifications = fieldVerificationRepository.findByEmployeeId(employee.getId())
                .stream()
                .collect(Collectors.toMap(EmployeeProfileFieldVerification::getFieldKey, v -> v, (a, b) -> a));

        List<EmployeeDocument> docs = documentRepository.findByEmployeeId(employee.getId());
        Map<EmployeeDocumentType, List<EmployeeDocument>> docsByType = docs.stream()
                .collect(Collectors.groupingBy(EmployeeDocument::getDocType));

        PublicEmployeeFormResponse res = new PublicEmployeeFormResponse();
        res.setEmployeeId(employee.getId());
        res.setName(employee.getName());
        res.setEmailMasked(maskEmail(employee.getEmail()));
        res.setPhoneMasked(maskPhone(employee.getPhone()));
        res.setScope(ctx.scope());
        res.setExpiresAt(ctx.expiresAt());

        if (ctx.scope() == EmployeeTokenScope.REJECTED_FIELDS) {
            for (EmployeePublicFieldKey fk : rejectedScalarKeys(verifications)) {
                res.getFields().add(toPublicFieldDto(employee, fk, verifications.get(fk.getKey())));
            }
            for (EmployeeDocumentType dt : rejectedUploadTypes(docsByType)) {
                res.getUploads().add(toPublicUploadDto(dt, docsByType.getOrDefault(dt, List.of())));
            }
        } else {
            for (EmployeePublicFieldKey fk : EmployeePublicFieldKey.values()) {
                if (EXCLUDED_PUBLIC_FIELDS.contains(fk)) continue;
                res.getFields().add(toPublicFieldDto(employee, fk, verifications.get(fk.getKey())));
            }
            for (EmployeeDocumentType dt : EmployeeDocumentType.values()) {
                res.getUploads().add(toPublicUploadDto(dt, docsByType.getOrDefault(dt, List.of())));
            }
        }

        // Always include read-only org/master names for context
        addOrgNameFields(res, employee);

        return res;
    }

    private void addOrgNameFields(PublicEmployeeFormResponse res, Employee employee) {
        if (res == null || employee == null) return;
        String headOfficeName = employee.getHeadOfficeId() == null ? "" : headOfficeMasterRepository.findById(employee.getHeadOfficeId())
                .map(HeadOfficeMaster::getName).orElse("");
        String branchName = employee.getBranchId() == null ? "" : branchMasterRepository.findById(employee.getBranchId())
                .map(BranchMaster::getName).orElse("");
        String deptName = employee.getDepartmentMasterId() == null ? "" : departmentMasterRepository.findById(employee.getDepartmentMasterId())
                .map(DepartmentMaster::getName).orElse("");
        String desigName = employee.getDesignationMasterId() == null ? "" : designationMasterRepository.findById(employee.getDesignationMasterId())
                .map(DesignationMaster::getName).orElse("");

        // Put org fields at top (insert in front)
        List<PublicEmployeeFormFieldDto> out = new ArrayList<>();
        out.add(readOnlyTextField("HEAD_OFFICE_NAME", "Head Office", headOfficeName));
        out.add(readOnlyTextField("BRANCH_NAME", "Branch", branchName));
        out.add(readOnlyTextField("DEPARTMENT_MASTER_NAME", "Department", deptName));
        out.add(readOnlyTextField("DESIGNATION_MASTER_NAME", "Designation", desigName));
        out.addAll(res.getFields());
        res.setFields(out);
    }

    private static PublicEmployeeFormFieldDto readOnlyTextField(String key, String label, String value) {
        PublicEmployeeFormFieldDto dto = new PublicEmployeeFormFieldDto();
        dto.setFieldKey(key);
        dto.setLabel(label);
        dto.setInputType(EmployeePublicFieldInputType.TEXT);
        dto.setEditable(false);
        dto.setCurrentValue(value == null ? "" : value);
        dto.setStatus(null);
        dto.setRemarks(null);
        return dto;
    }

    @Transactional
    public Map<String, Object> submitPublicForm(String token, MultipartHttpServletRequest request) {
        TokenContext ctx = requireValidToken(token);
        Employee employee = employeeRepository.findById(ctx.employeeId())
                .orElseThrow(() -> new EntityNotFoundException("Employee not found"));

        ApplyResult result = applySubmittedFieldsAndDocs(employee, request);
        if (result.changedAny) {
            employee.setProfileStatus(EmployeeProfileStatus.PENDING_VERIFICATION);
            employee.setProfileStatusUpdatedAt(LocalDateTime.now());
            employeeRepository.save(employee);
        }

        ctx.row().setUsedAt(LocalDateTime.now());
        tokenRepository.save(ctx.row());

        return Map.of(
                "employeeId", employee.getId(),
                "profileStatus", employee.getProfileStatus().name()
        );
    }

    @Transactional(readOnly = true)
    public EmployeeVerificationResponse getVerification(Long employeeId) {
        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new EntityNotFoundException("Employee not found"));

        Map<String, EmployeeProfileFieldVerification> verifications = fieldVerificationRepository.findByEmployeeId(employeeId)
                .stream()
                .collect(Collectors.toMap(EmployeeProfileFieldVerification::getFieldKey, v -> v, (a, b) -> a));

        EmployeeVerificationResponse res = new EmployeeVerificationResponse();
        res.setEmployeeId(employeeId);
        res.setProfileStatus(employee.getProfileStatus());

        for (EmployeePublicFieldKey fk : EmployeePublicFieldKey.values()) {
            if (EXCLUDED_PUBLIC_FIELDS.contains(fk)) continue;
            EmployeeProfileFieldVerification v = verifications.get(fk.getKey());
            EmployeeVerificationFieldDto dto = new EmployeeVerificationFieldDto();
            dto.setFieldKey(fk.getKey());
            dto.setValuePreview(fk.getValue(employee));
            dto.setStatus(v == null ? null : v.getStatus());
            dto.setRemarks(v == null ? null : v.getRemarks());
            dto.setUpdatedAt(v == null ? null : v.getUpdatedAt());
            res.getFields().add(dto);
        }

        List<EmployeeDocument> docs = documentRepository.findByEmployeeId(employeeId);
        docs.sort(Comparator.comparing(EmployeeDocument::getUploadedAt, Comparator.nullsLast(Comparator.naturalOrder())).reversed());
        for (EmployeeDocument d : docs) {
            EmployeeVerificationDocumentDto dto = new EmployeeVerificationDocumentDto();
            dto.setId(d.getId());
            dto.setDocType(d.getDocType());
            dto.setFileUrl("/" + normalizeUploadPath(d.getFilePath()));
            dto.setOriginalFilename(d.getOriginalFilename());
            dto.setStatus(d.getStatus());
            dto.setRemarks(d.getRemarks());
            dto.setUploadedAt(d.getUploadedAt());
            res.getDocuments().add(dto);
        }

        return res;
    }

    @Transactional
    public EmployeeVerificationResponse verify(Long employeeId, VerifyEmployeeFieldsRequest request) {
        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new EntityNotFoundException("Employee not found"));

        LocalDateTime now = LocalDateTime.now();

        if (request != null && request.getFieldDecisions() != null) {
            for (FieldDecisionDto decision : request.getFieldDecisions()) {
                if (!StringUtils.hasText(decision.getFieldKey())) {
                    continue;
                }
                EmployeePublicFieldKey fk = EmployeePublicFieldKey.fromKey(decision.getFieldKey());
                if (fk == null) {
                    continue;
                }

                EmployeeProfileFieldVerification row = fieldVerificationRepository
                        .findFirstByEmployeeIdAndFieldKey(employeeId, fk.getKey())
                        .orElseGet(() -> {
                            EmployeeProfileFieldVerification v = new EmployeeProfileFieldVerification();
                            v.setEmployeeId(employeeId);
                            v.setFieldKey(fk.getKey());
                            v.setStatus(VerificationStatus.PENDING);
                            return v;
                        });

                VerificationStatus status = parseDecisionStatus(decision.getDecision());
                row.setStatus(status);
                row.setRemarks(status == VerificationStatus.REJECTED ? trimToNull(decision.getRemarks()) : null);
                row.setUpdatedAt(now);
                fieldVerificationRepository.save(row);
            }
        }

        if (request != null && request.getDocumentDecisions() != null) {
            for (DocumentDecisionDto decision : request.getDocumentDecisions()) {
                if (decision.getDocumentId() == null) {
                    continue;
                }
                EmployeeDocument doc = documentRepository.findById(decision.getDocumentId())
                        .orElseThrow(() -> new EntityNotFoundException("Document not found"));
                if (!Objects.equals(doc.getEmployeeId(), employeeId)) {
                    throw new EntityNotFoundException("Document not found");
                }

                VerificationStatus status = parseDecisionStatus(decision.getDecision());
                doc.setStatus(status);
                doc.setRemarks(status == VerificationStatus.REJECTED ? trimToNull(decision.getRemarks()) : null);
                doc.setVerifiedAt(now);
                documentRepository.save(doc);
            }
        }

        recomputeEmployeeProfileStatus(employee);
        employeeRepository.save(employee);
        return getVerification(employeeId);
    }

    @Transactional
    public EmployeeFormLinkResponse resendRejectedLink(Long employeeId) {
        EmployeeVerificationResponse verification = getVerification(employeeId);

        boolean anyRejectedField = verification.getFields().stream().anyMatch(f -> f.getStatus() == VerificationStatus.REJECTED);
        boolean anyRejectedDoc = verification.getDocuments().stream().anyMatch(d -> d.getStatus() == VerificationStatus.REJECTED);
        if (!anyRejectedField && !anyRejectedDoc) {
            throw new IllegalStateException("No rejected fields");
        }

        return generateFormLink(employeeId, EmployeeTokenScope.REJECTED_FIELDS);
    }

    private ApplyResult applySubmittedFieldsAndDocs(Employee employee, MultipartHttpServletRequest request) {
        if (request == null) {
            return new ApplyResult(false);
        }

        boolean changed = false;
        LocalDateTime now = LocalDateTime.now();

        Map<String, String[]> params = request.getParameterMap();
        for (Map.Entry<String, String[]> entry : params.entrySet()) {
            String name = entry.getKey();
            if (name == null || !name.startsWith("field_")) continue;
            String key = name.substring("field_".length());
            EmployeePublicFieldKey fk = EmployeePublicFieldKey.fromKey(key);
            if (fk == null) continue;
            if (EXCLUDED_PUBLIC_FIELDS.contains(fk)) continue;
            if (!fk.isEditable()) continue;

            String value = (entry.getValue() != null && entry.getValue().length > 0) ? entry.getValue()[0] : null;
            if (!StringUtils.hasText(value)) continue;

            fk.applyValue(employee, value);
            upsertPendingVerification(employee.getId(), fk.getKey(), now);
            changed = true;
        }

        var fileMap = request.getMultiFileMap();
        if (fileMap != null) {
            for (String partName : fileMap.keySet()) {
                if (partName == null || !partName.startsWith("doc_")) continue;
                String typeKey = partName.substring("doc_".length());
                EmployeeDocumentType dt;
                try {
                    dt = EmployeeDocumentType.valueOf(typeKey.trim().toUpperCase(Locale.ROOT));
                } catch (Exception ex) {
                    continue;
                }
                List<MultipartFile> files = fileMap.get(partName);
                if (files == null) continue;
                for (MultipartFile file : files) {
                    if (file == null || file.isEmpty()) continue;
                    String relativePath = uploadStorageService.storeEmployeePublicFormUpload(
                            employee.getId(),
                            dt.name().toLowerCase(Locale.ROOT),
                            file
                    );
                    EmployeeDocument doc = new EmployeeDocument();
                    doc.setEmployeeId(employee.getId());
                    doc.setDocType(dt);
                    doc.setFilePath(relativePath);
                    doc.setOriginalFilename(file.getOriginalFilename());
                    doc.setContentType(file.getContentType());
                    doc.setSizeBytes(file.getSize());
                    doc.setStatus(VerificationStatus.PENDING);
                    doc.setRemarks(null);
                    doc.setUploadedAt(LocalDateTime.now());
                    documentRepository.save(doc);

                    applyLegacyEmployeePath(employee, dt, relativePath);
                    changed = true;
                }
            }
        }

        if (changed) {
            employeeRepository.save(employee);
        }

        return new ApplyResult(changed);
    }

    private record ApplyResult(boolean changedAny) {}

    private void upsertPendingVerification(Long employeeId, String key, LocalDateTime now) {
        EmployeeProfileFieldVerification row = fieldVerificationRepository
                .findFirstByEmployeeIdAndFieldKey(employeeId, key)
                .orElseGet(() -> {
                    EmployeeProfileFieldVerification v = new EmployeeProfileFieldVerification();
                    v.setEmployeeId(employeeId);
                    v.setFieldKey(key);
                    return v;
                });
        row.setStatus(VerificationStatus.PENDING);
        row.setRemarks(null);
        row.setUpdatedAt(now);
        fieldVerificationRepository.save(row);
    }

    private void applyLegacyEmployeePath(Employee employee, EmployeeDocumentType dt, String relativePath) {
        if (employee == null || dt == null) return;
        switch (dt) {
            case PHOTO, CANDIDATE_PHOTO -> employee.setCandidatePhotoPath(relativePath);
            case AADHAAR_CARD -> employee.setAadharCardPath(relativePath);
            case PAN_CARD -> employee.setPanCardPath(relativePath);
            case BANK_PASSBOOK -> employee.setBankPassbookPath(relativePath);
            case EXPERIENCE_CERTIFICATE -> employee.setExperienceCertificatePath(relativePath);
            case GRADUATION_CERTIFICATE -> employee.setGraduationCertificatePath(relativePath);
            case GRADUATION_MARKSHEET -> employee.setGraduationMarksheetPath(relativePath);
            case HSC_MARKSHEET -> employee.setHscMarksheetPath(relativePath);
            case SSLC_MARKSHEET -> employee.setSslcMarksheetPath(relativePath);
            case COMMUNITY_CERTIFICATE -> employee.setCommunityCertificatePath(relativePath);
            default -> {
            }
        }
    }

    private void recomputeEmployeeProfileStatus(Employee employee) {
        Map<String, EmployeeProfileFieldVerification> verifications = fieldVerificationRepository.findByEmployeeId(employee.getId())
                .stream()
                .collect(Collectors.toMap(EmployeeProfileFieldVerification::getFieldKey, v -> v, (a, b) -> a));

        List<EmployeeDocument> docs = documentRepository.findByEmployeeId(employee.getId());
        Map<EmployeeDocumentType, List<EmployeeDocument>> docsByType = docs.stream().collect(Collectors.groupingBy(EmployeeDocument::getDocType));

        List<String> requiredFields = parseCsv(requiredFieldsConfig);
        List<EmployeeDocumentType> requiredDocs = parseDocCsv(requiredDocsConfig);

        boolean allScalarApproved = requiredFields.stream()
                .allMatch(k -> verifications.get(k) != null && verifications.get(k).getStatus() == VerificationStatus.APPROVED);

        boolean allDocsApproved = requiredDocs.stream().allMatch(dt -> {
            if (dt == EmployeeDocumentType.CERTIFICATE) {
                return anyApproved(docsByType.getOrDefault(dt, List.of()));
            }
            return latestApproved(docsByType.getOrDefault(dt, List.of()));
        });

        EmployeeProfileStatus newStatus = (allScalarApproved && allDocsApproved)
                ? EmployeeProfileStatus.VERIFIED
                : EmployeeProfileStatus.PENDING_VERIFICATION;

        if (employee.getProfileStatus() != newStatus) {
            employee.setProfileStatus(newStatus);
            employee.setProfileStatusUpdatedAt(LocalDateTime.now());
        }
    }

    private boolean latestApproved(List<EmployeeDocument> docs) {
        return docs.stream()
                .max(Comparator.comparing(EmployeeDocument::getUploadedAt, Comparator.nullsLast(Comparator.naturalOrder())))
                .map(d -> d.getStatus() == VerificationStatus.APPROVED)
                .orElse(false);
    }

    private boolean anyApproved(List<EmployeeDocument> docs) {
        return docs.stream().anyMatch(d -> d.getStatus() == VerificationStatus.APPROVED);
    }

    private Set<EmployeePublicFieldKey> rejectedScalarKeys(Map<String, EmployeeProfileFieldVerification> verifications) {
        return verifications.values().stream()
                .filter(v -> v.getStatus() == VerificationStatus.REJECTED)
                .map(v -> EmployeePublicFieldKey.fromKey(v.getFieldKey()))
                .filter(Objects::nonNull)
                .filter(fk -> !EXCLUDED_PUBLIC_FIELDS.contains(fk))
                .collect(Collectors.toCollection(LinkedHashSet::new));
    }

    private Set<EmployeeDocumentType> rejectedUploadTypes(Map<EmployeeDocumentType, List<EmployeeDocument>> docsByType) {
        Set<EmployeeDocumentType> rejected = new LinkedHashSet<>();
        for (EmployeeDocumentType t : docsByType.keySet()) {
            List<EmployeeDocument> docs = docsByType.getOrDefault(t, List.of());
            if (t == EmployeeDocumentType.CERTIFICATE) {
                if (docs.stream().anyMatch(d -> d.getStatus() == VerificationStatus.REJECTED)) {
                    rejected.add(t);
                }
            } else {
                Optional<EmployeeDocument> latest = docs.stream()
                        .max(Comparator.comparing(EmployeeDocument::getUploadedAt, Comparator.nullsLast(Comparator.naturalOrder())));
                if (latest.isPresent() && latest.get().getStatus() == VerificationStatus.REJECTED) {
                    rejected.add(t);
                }
            }
        }
        return rejected;
    }

    private PublicEmployeeFormFieldDto toPublicFieldDto(Employee employee, EmployeePublicFieldKey fk, EmployeeProfileFieldVerification v) {
        PublicEmployeeFormFieldDto dto = new PublicEmployeeFormFieldDto();
        dto.setFieldKey(fk.getKey());
        dto.setLabel(fk.getLabel());
        dto.setInputType(fk.getInputType());
        dto.setEditable(fk.isEditable());
        dto.setCurrentValue(fk.getValue(employee));
        dto.setStatus(v == null ? null : v.getStatus());
        dto.setRemarks(v == null ? null : v.getRemarks());
        return dto;
    }

    private PublicEmployeeFormUploadDto toPublicUploadDto(EmployeeDocumentType dt, List<EmployeeDocument> docs) {
        PublicEmployeeFormUploadDto dto = new PublicEmployeeFormUploadDto();
        dto.setDocType(dt);
        dto.setLabel(prettyDocLabel(dt));
        UploadStatus status = currentUploadStatus(docs, dt);
        dto.setStatus(status.status());
        dto.setRemarks(status.remarks());
        return dto;
    }

    private UploadStatus currentUploadStatus(List<EmployeeDocument> docs, EmployeeDocumentType type) {
        if (docs == null || docs.isEmpty()) {
            return new UploadStatus(null, null);
        }
        if (type == EmployeeDocumentType.CERTIFICATE) {
            EmployeeDocument rejected = docs.stream().filter(d -> d.getStatus() == VerificationStatus.REJECTED)
                    .max(Comparator.comparing(EmployeeDocument::getUploadedAt, Comparator.nullsLast(Comparator.naturalOrder())))
                    .orElse(null);
            if (rejected != null) {
                return new UploadStatus(VerificationStatus.REJECTED, rejected.getRemarks());
            }
            EmployeeDocument pending = docs.stream().filter(d -> d.getStatus() == VerificationStatus.PENDING)
                    .max(Comparator.comparing(EmployeeDocument::getUploadedAt, Comparator.nullsLast(Comparator.naturalOrder())))
                    .orElse(null);
            if (pending != null) {
                return new UploadStatus(VerificationStatus.PENDING, pending.getRemarks());
            }
            return new UploadStatus(null, null);
        }

        EmployeeDocument latest = docs.stream()
                .max(Comparator.comparing(EmployeeDocument::getUploadedAt, Comparator.nullsLast(Comparator.naturalOrder())))
                .orElse(null);
        if (latest == null) {
            return new UploadStatus(null, null);
        }
        return new UploadStatus(latest.getStatus(), latest.getRemarks());
    }

    private record UploadStatus(VerificationStatus status, String remarks) {}

    private static String prettyDocLabel(EmployeeDocumentType dt) {
        return switch (dt) {
            case PHOTO -> "Photo";
            case RESUME -> "Resume";
            case CERTIFICATE -> "Certificate";
            case CANDIDATE_PHOTO -> "Candidate Photo";
            case AADHAAR_CARD -> "Aadhaar Card";
            case PAN_CARD -> "PAN Card";
            case BANK_PASSBOOK -> "Bank Passbook";
            case EXPERIENCE_CERTIFICATE -> "Experience Certificate";
            case GRADUATION_CERTIFICATE -> "Graduation Certificate";
            case GRADUATION_MARKSHEET -> "Graduation Marksheet";
            case HSC_MARKSHEET -> "HSC Marksheet";
            case SSLC_MARKSHEET -> "SSLC Marksheet";
            case COMMUNITY_CERTIFICATE -> "Community Certificate";
        };
    }

    private TokenContext requireValidToken(String token) {
        if (!StringUtils.hasText(token)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Invalid token");
        }
        String hash = hmacHash(tokenSecret, token.trim());
        EmployeeProfileToken row = tokenRepository.findFirstByTokenHash(hash)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Invalid token"));

        LocalDateTime now = LocalDateTime.now();
        if (row.getRevokedAt() != null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Invalid token");
        }
        if (row.getExpiresAt() == null || !row.getExpiresAt().isAfter(now)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Invalid token");
        }

        return new TokenContext(row.getEmployeeId(), row.getScope(), row.getExpiresAt(), row);
    }

    private record TokenContext(Long employeeId, EmployeeTokenScope scope, LocalDateTime expiresAt, EmployeeProfileToken row) {}

    private String buildPublicUrl(String token) {
        String base = normalizePublicBaseUrl(String.valueOf(publicBaseUrl == null ? "" : publicBaseUrl).trim());
        if (base.endsWith("/")) {
            return base + token;
        }
        return base + "/" + token;
    }

    /**
     * Some environments/browsers resolve "localhost" differently (IPv6 ::1 vs IPv4 127.0.0.1).
     * To avoid "works in Edge but not in Chrome" issues during local development, rewrite
     * localhost URLs to 127.0.0.1 when generating public links.
     *
     * For production, set EMPLOYEE_FORM_PUBLIC_BASE_URL to your real public domain.
     */
    private static String normalizePublicBaseUrl(String baseUrl) {
        if (!StringUtils.hasText(baseUrl)) return "";
        try {
            URI uri = URI.create(baseUrl.trim());
            if ("localhost".equalsIgnoreCase(uri.getHost())) {
                URI fixed = new URI(
                        uri.getScheme(),
                        uri.getUserInfo(),
                        "127.0.0.1",
                        uri.getPort(),
                        uri.getPath(),
                        uri.getQuery(),
                        uri.getFragment()
                );
                return fixed.toString();
            }
        } catch (Exception ignored) {
            // Keep original baseUrl if parsing fails.
        }
        return baseUrl.trim();
    }

    private static String generateToken() {
        byte[] bytes = new byte[32];
        SECURE_RANDOM.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    private static String hmacHash(String secret, String token) {
        try {
            Mac mac = Mac.getInstance(HMAC_ALG);
            mac.init(new SecretKeySpec(String.valueOf(secret).getBytes(StandardCharsets.UTF_8), HMAC_ALG));
            byte[] digest = mac.doFinal(String.valueOf(token).getBytes(StandardCharsets.UTF_8));
            return bytesToHex(digest);
        } catch (Exception e) {
            throw new IllegalStateException("Failed to hash token", e);
        }
    }

    private static String bytesToHex(byte[] bytes) {
        StringBuilder sb = new StringBuilder(bytes.length * 2);
        for (byte b : bytes) {
            sb.append(String.format("%02x", b));
        }
        return sb.toString();
    }

    private static String normalizeUploadPath(String filePath) {
        String p = String.valueOf(filePath == null ? "" : filePath).replace("\\", "/");
        return p.replaceFirst("^/+", "");
    }

    private static String maskEmail(String email) {
        if (!StringUtils.hasText(email)) {
            return null;
        }
        String e = email.trim();
        int at = e.indexOf('@');
        if (at <= 1) {
            return "***" + (at >= 0 ? e.substring(at) : "");
        }
        String domain = at >= 0 ? e.substring(at) : "";
        return e.charAt(0) + "***" + domain;
    }

    private static String maskPhone(String phone) {
        if (!StringUtils.hasText(phone)) {
            return null;
        }
        String p = phone.replaceAll("\\s+", "");
        if (p.length() <= 4) {
            return "****";
        }
        return "****" + p.substring(p.length() - 4);
    }

    private static VerificationStatus parseDecisionStatus(String decision) {
        String d = String.valueOf(decision == null ? "" : decision).trim().toUpperCase(Locale.ROOT);
        return d.equals("APPROVE") || d.equals("APPROVED") ? VerificationStatus.APPROVED : VerificationStatus.REJECTED;
    }

    private static List<String> parseCsv(String csv) {
        if (!StringUtils.hasText(csv)) return List.of();
        return Arrays.stream(csv.split(","))
                .map(String::trim)
                .filter(StringUtils::hasText)
                .map(s -> s.toUpperCase(Locale.ROOT))
                .toList();
    }

    private static List<EmployeeDocumentType> parseDocCsv(String csv) {
        List<String> keys = parseCsv(csv);
        List<EmployeeDocumentType> out = new ArrayList<>();
        for (String k : keys) {
            try {
                out.add(EmployeeDocumentType.valueOf(k));
            } catch (Exception ignored) {
            }
        }
        return out;
    }

    private static String trimToNull(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }
}
