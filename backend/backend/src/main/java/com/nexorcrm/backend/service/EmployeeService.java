package com.nexorcrm.backend.service;

import com.nexorcrm.backend.dto.EmployeeRequest;
import com.nexorcrm.backend.dto.EmployeeResponse;
import com.nexorcrm.backend.dto.EmployeeOnboardRequest;
import com.nexorcrm.backend.entity.DepartmentMaster;
import com.nexorcrm.backend.entity.DesignationMaster;
import com.nexorcrm.backend.entity.Employee;
import com.nexorcrm.backend.repo.DepartmentMasterRepository;
import com.nexorcrm.backend.repo.EmployeeRepository;
import com.nexorcrm.backend.repo.DesignationMasterRepository;
import com.nexorcrm.backend.repo.UserRepository;
import com.nexorcrm.backend.util.PhoneValidationUtil;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class EmployeeService {

    private final EmployeeRepository employeeRepository;
    private final UserRepository userRepository;
    private final DepartmentMasterRepository departmentMasterRepository;
    private final DesignationMasterRepository designationMasterRepository;

    @Value("${app.upload-dir:uploads}")
    private String uploadDir;

    public EmployeeService(
            EmployeeRepository employeeRepository,
            UserRepository userRepository,
            DepartmentMasterRepository departmentMasterRepository,
            DesignationMasterRepository designationMasterRepository
    ) {
        this.employeeRepository = employeeRepository;
        this.userRepository = userRepository;
        this.departmentMasterRepository = departmentMasterRepository;
        this.designationMasterRepository = designationMasterRepository;
    }

    public List<EmployeeResponse> list() {
        return employeeRepository.findByDeletedFalseOrderByIdDesc()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public List<EmployeeResponse> getAvailableEmployees() {
        try {
            // Only active users should block an employee from appearing in the dropdown.
            Set<String> userEmails = userRepository.findByIsDeletedFalse()
                    .stream()
                    .filter(user -> user.getEmail() != null && !user.getEmail().trim().isEmpty())
                    .map(user -> user.getEmail().toLowerCase().trim())
                    .collect(Collectors.toSet());

            // Get all non-deleted employees and filter out those with existing user accounts
            return employeeRepository.findByDeletedFalseOrderByIdDesc()
                    .stream()
                    .filter(emp -> emp.getEmail() != null && !emp.getEmail().trim().isEmpty())
                    .filter(emp -> !userEmails.contains(emp.getEmail().toLowerCase().trim()))
                    .map(this::toResponse)
                    .toList();
        } catch (Exception e) {
            e.printStackTrace();
            // Return empty list on error instead of throwing, to prevent HTML error pages
            return List.of();
        }
    }

    public EmployeeResponse create(EmployeeRequest request) {
        validatePhoneNumber(request);
        Employee e = new Employee();
        apply(e, request);
        e = employeeRepository.save(e);

        if (e.getEmployeeCode() == null || e.getEmployeeCode().isBlank()) {
            e.setEmployeeCode(String.format("Emp-%03d", e.getId()));
            e = employeeRepository.save(e);
        }

        return toResponse(e);
    }

    public EmployeeResponse update(Long id, EmployeeRequest request) {
        validatePhoneNumber(request);
        Employee e = employeeRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Employee not found"));
        if (Boolean.TRUE.equals(e.getDeleted())) {
            throw new EntityNotFoundException("Employee not found");
        }

        apply(e, request);
        return toResponse(employeeRepository.save(e));
    }

    public EmployeeResponse onboard(EmployeeOnboardRequest request) {
        Employee e = new Employee();
        applyOnboard(e, request);
        e = employeeRepository.save(e);

        if (e.getEmployeeCode() == null || e.getEmployeeCode().isBlank()) {
            e.setEmployeeCode(String.format("Emp-%03d", e.getId()));
            e = employeeRepository.save(e);
        }

        applyOnboardFiles(e, request);
        e = employeeRepository.save(e);
        return toResponse(e);
    }

    public EmployeeResponse onboardUpdate(Long id, EmployeeOnboardRequest request) {
        Employee e = employeeRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Employee not found"));
        if (Boolean.TRUE.equals(e.getDeleted())) {
            throw new EntityNotFoundException("Employee not found");
        }

        applyOnboard(e, request);
        applyOnboardFilesUpdate(e, request);
        e = employeeRepository.save(e);
        return toResponse(e);
    }

    public void delete(Long id) {
        Employee e = employeeRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Employee not found"));
        e.setDeleted(true);
        employeeRepository.save(e);
    }

    private void validatePhoneNumber(EmployeeRequest request) {
        if (request.getPhone() != null && !request.getPhone().isBlank()) {
            String countryCode = request.getCountryCode();
            String errorMessage = PhoneValidationUtil.validatePhoneNumber(request.getPhone(), countryCode);
            if (!errorMessage.isEmpty()) {
                throw new IllegalArgumentException(errorMessage);
            }
        }
    }

    private void apply(Employee e, EmployeeRequest r) {
        e.setName(r.getName());
        e.setEmail(r.getEmail());
        
        // Set and normalize country code
        String countryCode = r.getCountryCode();
        e.setCountryCode(PhoneValidationUtil.ensureCountryCodeValue(countryCode));
        
        e.setPhone(r.getPhone());
        e.setDept(r.getDept());
        e.setInstitution(trimToNull(r.getInstitution()));
        e.setDepartmentName(firstNonBlank(r.getUserDepartmentName(), r.getDepartmentName()));
        e.setTeam(trimToNull(r.getTeam()));
        e.setDesignation(r.getDesignation());
        e.setHeadOfficeId(r.getHeadOfficeId());
        e.setBranchId(r.getBranchId());
        e.setDepartmentMasterId(r.getDepartmentMasterId());
        e.setDesignationMasterId(r.getDesignationMasterId());
        e.setEmployeeIdNumber(trimToNull(r.getEmployeeIdNumber()));
        e.setFatherName(trimToNull(r.getFatherName()));
        e.setMotherName(trimToNull(r.getMotherName()));
        e.setPersonalContactNumber(trimToNull(r.getPersonalContactNumber()));
        e.setAlternateContactNumber(trimToNull(r.getAlternateContactNumber()));
        e.setLocation(trimToNull(r.getLocation()));
        e.setPinCode(trimToNull(r.getPinCode()));
        e.setState(trimToNull(r.getState()));
        e.setCurrentAddress(trimToNull(r.getCurrentAddress()));
        e.setPermanentAddress(trimToNull(r.getPermanentAddress()));
        e.setPersonalEmail(trimToNull(r.getPersonalEmail()));
        e.setOfficialEmail(trimToNull(r.getOfficialEmail()));
        e.setDateOfBirth(r.getDateOfBirth());
        e.setMaritalStatus(trimToNull(r.getMaritalStatus()));
        e.setSpouseName(trimToNull(r.getSpouseName()));
        e.setBloodGroup(trimToNull(r.getBloodGroup()));
        e.setPanCardNo(trimToNull(r.getPanCardNo()));
        e.setAadharCardNo(trimToNull(r.getAadharCardNo()));
        e.setBankAccountHolderName(trimToNull(r.getBankAccountHolderName()));
        e.setBankAccountNumber(trimToNull(r.getBankAccountNumber()));
        e.setIfscCode(trimToNull(r.getIfscCode()));
        e.setBankAndBranch(trimToNull(r.getBankAndBranch()));
        e.setEmploymentDetails1(trimToNull(r.getEmploymentDetails1()));
        e.setEmploymentDetails2(trimToNull(r.getEmploymentDetails2()));
        e.setGraduationDetails(trimToNull(r.getGraduationDetails()));
        e.setHscMarkAndYear(trimToNull(r.getHscMarkAndYear()));
        e.setSslcMarkAndYear(trimToNull(r.getSslcMarkAndYear()));
        e.setEmergencyContactName1(trimToNull(r.getEmergencyContactName1()));
        e.setEmergencyContactRelation1(trimToNull(r.getEmergencyContactRelation1()));
        e.setEmergencyContactPhone1(trimToNull(r.getEmergencyContactPhone1()));
        e.setEmergencyContactName2(trimToNull(r.getEmergencyContactName2()));
        e.setEmergencyContactRelation2(trimToNull(r.getEmergencyContactRelation2()));
        e.setEmergencyContactPhone2(trimToNull(r.getEmergencyContactPhone2()));
        e.setFriendRefName1(trimToNull(r.getFriendRefName1()));
        e.setFriendRefContact1(trimToNull(r.getFriendRefContact1()));
        e.setFriendRefName2(trimToNull(r.getFriendRefName2()));
        e.setFriendRefContact2(trimToNull(r.getFriendRefContact2()));
        e.setBranchToJoin(trimToNull(r.getBranchToJoin()));
        e.setPlatformSource(trimToNull(r.getPlatformSource()));
        e.setPfUan(trimToNull(r.getPfUan()));
        e.setEsiNo(trimToNull(r.getEsiNo()));
        e.setDeclarationDate(r.getDeclarationDate());
        e.setDeclarationPlace(trimToNull(r.getDeclarationPlace()));
        e.setCandidatePhotoPath(trimToNull(r.getCandidatePhotoPath()));
        e.setAadharCardPath(trimToNull(r.getAadharCardPath()));
        e.setPanCardPath(trimToNull(r.getPanCardPath()));
        e.setBankPassbookPath(trimToNull(r.getBankPassbookPath()));
        e.setExperienceCertificatePath(trimToNull(r.getExperienceCertificatePath()));
        e.setGraduationCertificatePath(trimToNull(r.getGraduationCertificatePath()));
        e.setGraduationMarksheetPath(trimToNull(r.getGraduationMarksheetPath()));
        e.setHscMarksheetPath(trimToNull(r.getHscMarksheetPath()));
        e.setSslcMarksheetPath(trimToNull(r.getSslcMarksheetPath()));
        e.setCommunityCertificatePath(trimToNull(r.getCommunityCertificatePath()));
        e.setJoinDate(r.getJoinDate());
        e.setStatus(normalizeStatus(r.getStatus()));
        e.setImg((r.getImg() == null || r.getImg().isBlank()) ? "assets/img/users/user-32.jpg" : r.getImg());
    }

    private void applyOnboard(Employee e, EmployeeOnboardRequest r) {
        e.setName(trimToNull(r.getNameInCaps()) == null ? "" : r.getNameInCaps().trim().toUpperCase());
        e.setDesignation(trimToNull(r.getDesignation()));
        e.setEmployeeIdNumber(trimToNull(r.getEmployeeIdNumber()));
        e.setFatherName(trimToNull(r.getFatherName()));
        e.setMotherName(trimToNull(r.getMotherName()));
        e.setPersonalContactNumber(trimToNull(r.getPersonalContactNumber()));
        e.setAlternateContactNumber(trimToNull(r.getAlternateContactNumber()));
        e.setLocation(trimToNull(r.getLocation()));
        e.setPinCode(trimToNull(r.getPinCode()));
        e.setState(trimToNull(r.getState()));
        e.setCurrentAddress(trimToNull(r.getCurrentAddress()));
        e.setPermanentAddress(trimToNull(r.getPermanentAddress()));
        e.setPersonalEmail(trimToNull(r.getPersonalEmail()));
        e.setOfficialEmail(trimToNull(r.getOfficialEmail()));
        e.setDateOfBirth(r.getDateOfBirth());
        e.setJoinDate(r.getDateOfJoining());
        e.setMaritalStatus(trimToNull(r.getMaritalStatus()));
        e.setSpouseName(trimToNull(r.getSpouseName()));
        e.setBloodGroup(trimToNull(r.getBloodGroup()));
        e.setPanCardNo(trimToNull(r.getPanCardNo()));
        e.setAadharCardNo(trimToNull(r.getAadharCardNo()));
        e.setBankAccountHolderName(trimToNull(r.getBankAccountHolderName()));
        e.setBankAccountNumber(trimToNull(r.getBankAccountNumber()));
        e.setIfscCode(trimToNull(r.getIfscCode()));
        e.setBankAndBranch(trimToNull(r.getBankAndBranch()));
        e.setEmploymentDetails1(trimToNull(r.getEmploymentDetails1()));
        e.setEmploymentDetails2(trimToNull(r.getEmploymentDetails2()));
        e.setGraduationDetails(trimToNull(r.getGraduationDetails()));
        e.setHscMarkAndYear(trimToNull(r.getHscMarkAndYear()));
        e.setSslcMarkAndYear(trimToNull(r.getSslcMarkAndYear()));
        e.setEmergencyContactName1(trimToNull(r.getEmergencyContactName1()));
        e.setEmergencyContactRelation1(trimToNull(r.getEmergencyContactRelation1()));
        e.setEmergencyContactPhone1(trimToNull(r.getEmergencyContactPhone1()));
        e.setEmergencyContactName2(trimToNull(r.getEmergencyContactName2()));
        e.setEmergencyContactRelation2(trimToNull(r.getEmergencyContactRelation2()));
        e.setEmergencyContactPhone2(trimToNull(r.getEmergencyContactPhone2()));
        e.setFriendRefName1(trimToNull(r.getFriendRefName1()));
        e.setFriendRefContact1(trimToNull(r.getFriendRefContact1()));
        e.setFriendRefName2(trimToNull(r.getFriendRefName2()));
        e.setFriendRefContact2(trimToNull(r.getFriendRefContact2()));
        e.setBranchToJoin(trimToNull(r.getBranchToJoin()));
        e.setPlatformSource(trimToNull(r.getPlatformSource()));
        e.setPfUan(trimToNull(r.getPfUan()));
        e.setEsiNo(trimToNull(r.getEsiNo()));
        e.setDeclarationDate(r.getDeclarationDate());
        e.setDeclarationPlace(trimToNull(r.getDeclarationPlace()));
        e.setHeadOfficeId(r.getHeadOfficeId());
        e.setBranchId(r.getBranchId());
        e.setDepartmentMasterId(r.getDepartmentMasterId());
        e.setDesignationMasterId(r.getDesignationMasterId());

        // Derive display fields used by listings/legacy UI.
        if (r.getDepartmentMasterId() != null) {
            DepartmentMaster dept = departmentMasterRepository.findById(r.getDepartmentMasterId()).orElse(null);
            if (dept != null && Boolean.FALSE.equals(dept.getDeleted())) {
                e.setDepartmentName(dept.getName());
                // keep dept (legacy) aligned for existing screens
                e.setDept(dept.getName());
            }
        }

        if (r.getDesignationMasterId() != null) {
            DesignationMaster desig = designationMasterRepository.findById(r.getDesignationMasterId()).orElse(null);
            if (desig != null && Boolean.FALSE.equals(desig.getDeleted())) {
                e.setDesignation(desig.getName());
            }
        }

        e.setStatus("ACTIVE");
        if (e.getImg() == null || e.getImg().isBlank()) {
            e.setImg("assets/img/users/user-32.jpg");
        }
    }

    private void applyOnboardFiles(Employee e, EmployeeOnboardRequest r) {
        Long employeeId = e.getId();
        if (employeeId == null) {
            return;
        }
        e.setCandidatePhotoPath(saveEmployeeFile(employeeId, "candidate-photo", r.getCandidatePhoto()));
        e.setAadharCardPath(saveEmployeeFile(employeeId, "aadhar-card", r.getUploadCandidateAadharCard()));
        e.setPanCardPath(saveEmployeeFile(employeeId, "pan-card", r.getUploadCandidatePanCard()));
        e.setBankPassbookPath(saveEmployeeFile(employeeId, "bank-passbook", r.getUploadBankPassBookCopy()));
        e.setExperienceCertificatePath(saveEmployeeFile(employeeId, "experience-certificate", r.getUploadExperienceCertificate()));
        e.setGraduationCertificatePath(saveEmployeeFile(employeeId, "graduation-certificate", r.getUploadGraduationCertificate()));
        e.setGraduationMarksheetPath(saveEmployeeFile(employeeId, "graduation-marksheet", r.getUploadGraduationMarksheet()));
        e.setHscMarksheetPath(saveEmployeeFile(employeeId, "hsc-marksheet", r.getUploadHscMarkSheet()));
        e.setSslcMarksheetPath(saveEmployeeFile(employeeId, "sslc-marksheet", r.getUploadSslcMarkSheet()));
        e.setCommunityCertificatePath(saveEmployeeFile(employeeId, "community-certificate", r.getUploadCommunityCertificate()));
    }

    private void applyOnboardFilesUpdate(Employee e, EmployeeOnboardRequest r) {
        Long employeeId = e.getId();
        if (employeeId == null) {
            return;
        }
        String candidatePhotoPath = saveEmployeeFile(employeeId, "candidate-photo", r.getCandidatePhoto());
        if (candidatePhotoPath != null) e.setCandidatePhotoPath(candidatePhotoPath);

        String aadharCardPath = saveEmployeeFile(employeeId, "aadhar-card", r.getUploadCandidateAadharCard());
        if (aadharCardPath != null) e.setAadharCardPath(aadharCardPath);

        String panCardPath = saveEmployeeFile(employeeId, "pan-card", r.getUploadCandidatePanCard());
        if (panCardPath != null) e.setPanCardPath(panCardPath);

        String bankPassbookPath = saveEmployeeFile(employeeId, "bank-passbook", r.getUploadBankPassBookCopy());
        if (bankPassbookPath != null) e.setBankPassbookPath(bankPassbookPath);

        String expCertPath = saveEmployeeFile(employeeId, "experience-certificate", r.getUploadExperienceCertificate());
        if (expCertPath != null) e.setExperienceCertificatePath(expCertPath);

        String gradCertPath = saveEmployeeFile(employeeId, "graduation-certificate", r.getUploadGraduationCertificate());
        if (gradCertPath != null) e.setGraduationCertificatePath(gradCertPath);

        String gradMarkPath = saveEmployeeFile(employeeId, "graduation-marksheet", r.getUploadGraduationMarksheet());
        if (gradMarkPath != null) e.setGraduationMarksheetPath(gradMarkPath);

        String hscMarkPath = saveEmployeeFile(employeeId, "hsc-marksheet", r.getUploadHscMarkSheet());
        if (hscMarkPath != null) e.setHscMarksheetPath(hscMarkPath);

        String sslcMarkPath = saveEmployeeFile(employeeId, "sslc-marksheet", r.getUploadSslcMarkSheet());
        if (sslcMarkPath != null) e.setSslcMarksheetPath(sslcMarkPath);

        String commCertPath = saveEmployeeFile(employeeId, "community-certificate", r.getUploadCommunityCertificate());
        if (commCertPath != null) e.setCommunityCertificatePath(commCertPath);
    }

    private String saveEmployeeFile(Long employeeId, String kind, MultipartFile file) {
        if (file == null || file.isEmpty()) {
            return null;
        }
        try {
            Path dir = Path.of(uploadDir, "employees", String.valueOf(employeeId), kind).toAbsolutePath().normalize();
            Files.createDirectories(dir);
            String originalName = file.getOriginalFilename();
            String safeName = originalName == null ? "file" : Path.of(originalName).getFileName().toString();
            String storedName = UUID.randomUUID() + "_" + safeName;
            Path target = dir.resolve(storedName).normalize();
            if (!target.startsWith(dir)) {
                throw new IllegalStateException("Invalid upload path");
            }
            Files.copy(file.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);
            return Path.of("uploads", "employees", String.valueOf(employeeId), kind, storedName)
                    .toString()
                    .replace("\\", "/");
        } catch (IOException ex) {
            throw new RuntimeException("Failed to upload employee document", ex);
        }
    }

    private String normalizeStatus(String status) {
        String s = String.valueOf(status == null ? "ACTIVE" : status).trim().toUpperCase();
        return s.equals("INACTIVE") ? "INACTIVE" : "ACTIVE";
    }

    private EmployeeResponse toResponse(Employee e) {
        EmployeeResponse r = new EmployeeResponse();
        r.setId(e.getId());
        r.setEmployeeCode(e.getEmployeeCode());
        r.setName(e.getName());
        r.setEmail(e.getEmail());
        r.setCountryCode(e.getCountryCode());
        r.setPhone(e.getPhone());
        r.setDept(e.getDept());
        r.setInstitution(e.getInstitution());
        r.setDepartmentName(e.getDepartmentName());
        r.setTeam(e.getTeam());
        r.setDesignation(e.getDesignation());
        r.setHeadOfficeId(e.getHeadOfficeId());
        r.setBranchId(e.getBranchId());
        r.setDepartmentMasterId(e.getDepartmentMasterId());
        r.setDesignationMasterId(e.getDesignationMasterId());
        r.setEmployeeIdNumber(e.getEmployeeIdNumber());
        r.setFatherName(e.getFatherName());
        r.setMotherName(e.getMotherName());
        r.setPersonalContactNumber(e.getPersonalContactNumber());
        r.setAlternateContactNumber(e.getAlternateContactNumber());
        r.setLocation(e.getLocation());
        r.setPinCode(e.getPinCode());
        r.setState(e.getState());
        r.setCurrentAddress(e.getCurrentAddress());
        r.setPermanentAddress(e.getPermanentAddress());
        r.setPersonalEmail(e.getPersonalEmail());
        r.setOfficialEmail(e.getOfficialEmail());
        r.setDateOfBirth(e.getDateOfBirth());
        r.setMaritalStatus(e.getMaritalStatus());
        r.setSpouseName(e.getSpouseName());
        r.setBloodGroup(e.getBloodGroup());
        r.setPanCardNo(e.getPanCardNo());
        r.setAadharCardNo(e.getAadharCardNo());
        r.setBankAccountHolderName(e.getBankAccountHolderName());
        r.setBankAccountNumber(e.getBankAccountNumber());
        r.setIfscCode(e.getIfscCode());
        r.setBankAndBranch(e.getBankAndBranch());
        r.setEmploymentDetails1(e.getEmploymentDetails1());
        r.setEmploymentDetails2(e.getEmploymentDetails2());
        r.setGraduationDetails(e.getGraduationDetails());
        r.setHscMarkAndYear(e.getHscMarkAndYear());
        r.setSslcMarkAndYear(e.getSslcMarkAndYear());
        r.setEmergencyContactName1(e.getEmergencyContactName1());
        r.setEmergencyContactRelation1(e.getEmergencyContactRelation1());
        r.setEmergencyContactPhone1(e.getEmergencyContactPhone1());
        r.setEmergencyContactName2(e.getEmergencyContactName2());
        r.setEmergencyContactRelation2(e.getEmergencyContactRelation2());
        r.setEmergencyContactPhone2(e.getEmergencyContactPhone2());
        r.setFriendRefName1(e.getFriendRefName1());
        r.setFriendRefContact1(e.getFriendRefContact1());
        r.setFriendRefName2(e.getFriendRefName2());
        r.setFriendRefContact2(e.getFriendRefContact2());
        r.setBranchToJoin(e.getBranchToJoin());
        r.setPlatformSource(e.getPlatformSource());
        r.setPfUan(e.getPfUan());
        r.setEsiNo(e.getEsiNo());
        r.setDeclarationDate(e.getDeclarationDate());
        r.setDeclarationPlace(e.getDeclarationPlace());
        r.setCandidatePhotoPath(e.getCandidatePhotoPath());
        r.setAadharCardPath(e.getAadharCardPath());
        r.setPanCardPath(e.getPanCardPath());
        r.setBankPassbookPath(e.getBankPassbookPath());
        r.setExperienceCertificatePath(e.getExperienceCertificatePath());
        r.setGraduationCertificatePath(e.getGraduationCertificatePath());
        r.setGraduationMarksheetPath(e.getGraduationMarksheetPath());
        r.setHscMarksheetPath(e.getHscMarksheetPath());
        r.setSslcMarksheetPath(e.getSslcMarksheetPath());
        r.setCommunityCertificatePath(e.getCommunityCertificatePath());
        r.setJoinDate(e.getJoinDate());
        r.setStatus(e.getStatus());
        r.setImg(e.getImg());
        return r;
    }

    private String firstNonBlank(String first, String second) {
        String firstValue = trimToNull(first);
        return firstValue != null ? firstValue : trimToNull(second);
    }

    private String trimToNull(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }
}
