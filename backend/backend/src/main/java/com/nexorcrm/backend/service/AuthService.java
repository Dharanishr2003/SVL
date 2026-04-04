package com.nexorcrm.backend.service;

import com.nexorcrm.backend.config.JwtUtil;
import com.nexorcrm.backend.dto.ChangePasswordRequest;
import com.nexorcrm.backend.dto.CompleteProfileRequest;
import com.nexorcrm.backend.dto.ForceChangePasswordRequest;
import com.nexorcrm.backend.dto.LoginRequest;
import com.nexorcrm.backend.dto.LoginResponse;
import com.nexorcrm.backend.dto.MyProfileResponse;
import com.nexorcrm.backend.dto.UpdateMyProfileRequest;
import com.nexorcrm.backend.entity.ActivationStatus;
import com.nexorcrm.backend.entity.Employee;
import com.nexorcrm.backend.entity.RefreshToken;
import com.nexorcrm.backend.entity.User;
import com.nexorcrm.backend.repo.EmployeeRepository;
import com.nexorcrm.backend.repo.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@Transactional
public class AuthService {

    private final UserRepository userRepository;
    private final EmployeeRepository employeeRepository;
    private final JwtUtil jwtUtil;
    private final RefreshTokenService refreshTokenService;
    private final SecuritySettingsService securitySettingsService;
    private final AuditService auditService;
    private final HttpServletRequest request;
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    @Value("${app.upload-dir:uploads}")
    private String uploadDir;

    private static final List<String> ALLOWED_PHOTO_TYPES = List.of("image/jpeg", "image/png", "image/webp");
    private static final long MAX_PHOTO_SIZE = 2 * 1024 * 1024; // 2 MB

    public AuthService(UserRepository userRepository,
                       EmployeeRepository employeeRepository,
                       JwtUtil jwtUtil,
                       RefreshTokenService refreshTokenService,
                       SecuritySettingsService securitySettingsService,
                       AuditService auditService,
                       HttpServletRequest request) {
        this.userRepository = userRepository;
        this.employeeRepository = employeeRepository;
        this.jwtUtil = jwtUtil;
        this.refreshTokenService = refreshTokenService;
        this.securitySettingsService = securitySettingsService;
        this.auditService = auditService;
        this.request = request;
    }

    public LoginResponse login(LoginRequest request) {
        String identifier = request.getIdentifier().trim();
        String loginIp = resolveIpAddress();
        if (securitySettingsService.isIpBanned(loginIp)) {
            throw new AccessDeniedException("Login is blocked from this IP address");
        }
        User user = userRepository.findByUsernameAndIsDeletedFalse(identifier)
                .or(() -> userRepository.findByEmailIgnoreCaseAndIsDeletedFalse(identifier))
                .orElseThrow(() -> new BadCredentialsException("Invalid username/email or password"));

        if (user.isDeleted()) {
            throw new AccessDeniedException("This account has been deleted");
        }

        if (user.getActivationStatus() == ActivationStatus.PENDING) {
            throw new AccessDeniedException("Your account is awaiting admin activation");
        }

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new BadCredentialsException("Invalid username/email or password");
        }

        if (!user.isActive()) {
            throw new DisabledException("Account is deactivated");
        }

        user.setLastLoginAt(LocalDateTime.now());
        user.setLastActiveIp(loginIp);
        if (!StringUtils.hasText(user.getRegisteredIp())) {
            user.setRegisteredIp(loginIp);
        }
        userRepository.save(user);

        String accessToken = jwtUtil.generateAccessToken(user);
        RefreshToken refreshToken = refreshTokenService.createRefreshToken(user);

        auditService.logAsActor("LOGIN", user.getEmail(), "User login", user.getEmail());
        return toLoginResponse(user, accessToken, refreshToken.getToken());
    }

    public LoginResponse refreshToken(String refreshToken) {
        if (!StringUtils.hasText(refreshToken)) {
            throw new com.nexorcrm.backend.exception.TokenRefreshException();
        }
        RefreshToken verified = refreshTokenService.verifyRefreshToken(refreshToken);
        User user = verified.getUser();
        if (user.isDeleted()) {
            throw new AccessDeniedException("This account has been deleted");
        }
        if (user.getActivationStatus() == ActivationStatus.PENDING) {
            throw new AccessDeniedException("Your account is awaiting admin activation");
        }
        String accessToken = jwtUtil.generateAccessToken(user);
        return toLoginResponse(user, accessToken, refreshToken);
    }

    public String changePassword(String username, ChangePasswordRequest request) {
        User user = userRepository.findByUsernameAndIsDeletedFalse(username)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));

        if (!passwordEncoder.matches(request.getOldPassword(), user.getPasswordHash())) {
            throw new BadCredentialsException("Old password is incorrect");
        }

        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        user.setForcePasswordChange(false);
        userRepository.save(user);

        refreshTokenService.revokeAllUserTokens(user);
        auditService.log("PASSWORD_CHANGED", "User changed password", user.getEmail());
        return "Password changed successfully";
    }

    public String forceChangePassword(String principal, ForceChangePasswordRequest request) {
        User user = resolveCurrentUser(principal);
        String newPassword = request.getNewPassword().trim();
        String confirmPassword = request.getConfirmPassword().trim();

        if (!newPassword.equals(confirmPassword)) {
            throw new IllegalStateException("New password and confirm password do not match");
        }
        if (!user.isForcePasswordChange()) {
            throw new AccessDeniedException("Forced password change is not required");
        }

        user.setPasswordHash(passwordEncoder.encode(newPassword));
        user.setForcePasswordChange(false);
        userRepository.save(user);

        refreshTokenService.revokeAllUserTokens(user);
        auditService.log("FORCE_PASSWORD_CHANGED", "User changed forced temporary password", user.getEmail());
        return "Password changed successfully";
    }

    public String logout(String refreshToken, String principal) {
        if (StringUtils.hasText(refreshToken)) {
            refreshTokenService.revokeRefreshToken(refreshToken);
        }
        String targetUser = null;
        if (StringUtils.hasText(principal)) {
            try {
                targetUser = resolveCurrentUser(principal).getEmail();
            } catch (Exception ignored) {
                // Keep logout resilient even if principal cannot be resolved.
            }
        }
        auditService.logAsActor("LOGOUT", targetUser, "User logout", targetUser);
        return "Logged out successfully";
    }

    public String completeProfile(String principal, CompleteProfileRequest request) {
        User user = resolveCurrentUser(principal);
        String firstName = request.getFirstName() == null ? "" : request.getFirstName().trim();
        String lastName = request.getLastName() == null ? "" : request.getLastName().trim();

        if (!StringUtils.hasText(firstName) || !StringUtils.hasText(lastName)) {
            throw new IllegalStateException("First Name and Last Name are required");
        }

        user.setFirstName(firstName);
        user.setLastName(lastName);
        userRepository.save(user);
        auditService.log("PROFILE_COMPLETED", "Completed required profile fields", user.getEmail());
        return "Profile completed successfully";
    }

    private LoginResponse toLoginResponse(User user, String accessToken, String refreshToken) {
        LoginResponse response = new LoginResponse();
        response.setAccessToken(accessToken);
        response.setRefreshToken(refreshToken);
        response.setRole(user.getRole().name());
        response.setInstitution(user.getInstitutionName());
        response.setDepartmentName(user.getDepartmentName());
        response.setTeam(user.getTeamName());
        response.setForcePasswordChange(user.isForcePasswordChange());
        response.setProfileIncomplete(isProfileIncomplete(user));
        return response;
    }

    private boolean isProfileIncomplete(User user) {
        return !StringUtils.hasText(user.getFirstName()) || !StringUtils.hasText(user.getLastName());
    }

    public MyProfileResponse getMyProfile(String principal) {
        User user = resolveCurrentUser(principal);
        Employee emp = employeeRepository.findFirstByEmailIgnoreCaseAndDeletedFalse(user.getEmail()).orElse(null);
        return toMyProfileResponse(user, emp);
    }

    public MyProfileResponse updateMyProfile(String principal, UpdateMyProfileRequest req) {
        User user = resolveCurrentUser(principal);

        String firstName = req.getFirstName() == null ? null : req.getFirstName().trim();
        String lastName = req.getLastName() == null ? null : req.getLastName().trim();
        if (StringUtils.hasText(firstName)) {
            user.setFirstName(firstName);
        }
        if (StringUtils.hasText(lastName)) {
            user.setLastName(lastName);
        }
        userRepository.save(user);

        // Update phone/countryCode on linked employee record if it exists
        Employee emp = employeeRepository.findFirstByEmailIgnoreCaseAndDeletedFalse(user.getEmail()).orElse(null);
        if (emp != null) {
            if (req.getPhone() != null) {
                emp.setPhone(req.getPhone().trim().isEmpty() ? null : req.getPhone().trim());
            }
            if (req.getCountryCode() != null) {
                emp.setCountryCode(req.getCountryCode().trim().isEmpty() ? null : req.getCountryCode().trim());
            }
            employeeRepository.save(emp);
        }

        auditService.log("PROFILE_UPDATED", "User updated profile", user.getEmail());
        return toMyProfileResponse(user, emp);
    }

    public MyProfileResponse uploadProfilePhoto(String principal, MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Photo file is required");
        }
        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_PHOTO_TYPES.contains(contentType.toLowerCase())) {
            throw new IllegalArgumentException("Only JPEG, PNG, and WebP images are allowed");
        }
        if (file.getSize() > MAX_PHOTO_SIZE) {
            throw new IllegalArgumentException("Photo must be smaller than 2 MB");
        }

        User user = resolveCurrentUser(principal);

        try {
            Path dir = Path.of(uploadDir, "profile-photos");
            Files.createDirectories(dir);

            // Determine extension from content type
            String ext = switch (contentType.toLowerCase()) {
                case "image/png" -> ".png";
                case "image/webp" -> ".webp";
                default -> ".jpg";
            };
            String storedName = "profile_" + UUID.randomUUID().toString().replace("-", "") + ext;
            Path target = dir.resolve(storedName);
            Files.copy(file.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);

            // Delete old photo if it exists
            String oldPath = user.getProfilePhotoPath();
            if (StringUtils.hasText(oldPath)) {
                try {
                    Files.deleteIfExists(Path.of(oldPath));
                } catch (IOException ignored) {
                    // Best-effort deletion; don't fail the upload
                }
            }

            user.setProfilePhotoPath(target.toString());
            userRepository.save(user);
        } catch (IOException ex) {
            throw new RuntimeException("Profile photo upload failed", ex);
        }

        Employee emp = employeeRepository.findFirstByEmailIgnoreCaseAndDeletedFalse(user.getEmail()).orElse(null);
        auditService.log("PROFILE_PHOTO_UPLOADED", "User uploaded profile photo", user.getEmail());
        return toMyProfileResponse(user, emp);
    }

    private MyProfileResponse toMyProfileResponse(User user, Employee emp) {
        MyProfileResponse res = new MyProfileResponse();
        res.setId(user.getId());
        res.setUsername(user.getUsername());
        res.setEmail(user.getEmail());
        res.setFirstName(user.getFirstName());
        res.setLastName(user.getLastName());
        res.setRole(user.getRole() == null ? null : user.getRole().name());
        res.setActivationStatus(user.getActivationStatus() == null ? null : user.getActivationStatus().name());
        res.setActive(user.isActive());
        res.setCreatedAt(user.getCreatedAt());
        res.setLastLoginAt(user.getLastLoginAt());
        res.setRegisteredIp(user.getRegisteredIp());
        res.setLastActiveIp(user.getLastActiveIp());
        res.setInstitutionName(user.getInstitutionName());
        res.setDepartmentName(user.getDepartmentName());
        res.setTeamName(user.getTeamName());

        // Build photo URL from stored path
        if (StringUtils.hasText(user.getProfilePhotoPath())) {
            String pathStr = user.getProfilePhotoPath().replace("\\", "/");
            int uploadsIdx = pathStr.indexOf("uploads/");
            if (uploadsIdx >= 0) {
                res.setProfilePhotoUrl("/" + pathStr.substring(uploadsIdx));
            } else {
                res.setProfilePhotoUrl("/uploads/profile-photos/" + Path.of(user.getProfilePhotoPath()).getFileName());
            }
        }

        if (emp != null) {
            res.setEmployeeCode(emp.getEmployeeCode());
            res.setPhone(emp.getPhone());
            res.setCountryCode(emp.getCountryCode());
            res.setDesignation(emp.getDesignation());
            res.setJoinDate(emp.getJoinDate());
        }
        return res;
    }

    private User resolveCurrentUser(String principal) {
        if (!StringUtils.hasText(principal)) {
            throw new EntityNotFoundException("User not found");
        }
        if (principal.contains("@")) {
            return userRepository.findByEmailAndIsDeletedFalse(principal.trim().toLowerCase())
                    .orElseThrow(() -> new EntityNotFoundException("User not found"));
        }
        return userRepository.findByUsernameAndIsDeletedFalse(principal.trim())
                .orElseThrow(() -> new EntityNotFoundException("User not found"));
    }

    private String resolveIpAddress() {
        String forwarded = request.getHeader("X-Forwarded-For");
        if (StringUtils.hasText(forwarded)) {
            int comma = forwarded.indexOf(',');
            return comma > -1 ? forwarded.substring(0, comma).trim() : forwarded.trim();
        }
        return request.getRemoteAddr();
    }
}
