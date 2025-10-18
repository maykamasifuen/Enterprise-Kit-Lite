package com.enterprise.starter.kit.modules.usermanagement.service;

import com.enterprise.starter.kit.modules.auth.entity.Role;
import com.enterprise.starter.kit.modules.auth.entity.User;
import com.enterprise.starter.kit.modules.auth.repository.RoleRepository;
import com.enterprise.starter.kit.modules.auth.repository.UserRepository;
import com.enterprise.starter.kit.modules.dashboard.dto.SystemStatsDTO;
import com.enterprise.starter.kit.modules.invoices.repository.InvoiceRepository;
import com.enterprise.starter.kit.modules.tenant.repository.CompanyRepository;
import com.enterprise.starter.kit.modules.usermanagement.dto.CreateUserRequest;
import com.enterprise.starter.kit.modules.usermanagement.dto.UpdateUserRequest;
import com.enterprise.starter.kit.modules.usermanagement.dto.UserResponse;
import com.enterprise.starter.kit.shared.Permission;
import com.enterprise.starter.kit.shared.tenant.TenantContext;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@Transactional
public class UserManagementService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final CompanyRepository companyRepository;
    private final InvoiceRepository invoiceRepository;

    public UserManagementService(UserRepository userRepository,
                                  RoleRepository roleRepository,
                                  PasswordEncoder passwordEncoder,
                                  CompanyRepository companyRepository,
                                  InvoiceRepository invoiceRepository) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
        this.companyRepository = companyRepository;
        this.invoiceRepository = invoiceRepository;
    }

    // ─── helpers ─────────────────────────────────────────────────────────────

    private String getCallerUsername() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null) return null;
        Object principal = auth.getPrincipal();
        return principal instanceof UserDetails ud ? ud.getUsername() : principal.toString();
    }

    private boolean callerIsSuperAdmin() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null) return false;
        return auth.getAuthorities().stream()
                .anyMatch(a -> Permission.ROLE_SUPER_ADMIN.equals(a.getAuthority()));
    }

    private void guardAgainstAdminModifyingPrivileged(User target) {
        if (callerIsSuperAdmin()) return;
        boolean targetIsPrivileged = target.getRoles().stream()
                .anyMatch(r -> Permission.SUPER_ADMIN.equals(r.getName())
                             || Permission.ADMIN.equals(r.getName()));
        if (targetIsPrivileged) {
            throw new SecurityException("ADMIN cannot modify another ADMIN or SUPER_ADMIN");
        }
    }

    // ─── queries ─────────────────────────────────────────────────────────────

    public Page<UserResponse> getUsersForTenant(Pageable pageable) {
        String tenantId = TenantContext.getTenantId();
        if (tenantId == null) tenantId = "default";
        return userRepository.findByTenantId(tenantId, pageable).map(UserResponse::fromEntity);
    }

    public Page<UserResponse> getAllUsers(Pageable pageable) {
        return userRepository.findAll(pageable).map(UserResponse::fromEntity);
    }

    public Page<UserResponse> getUsersByTenantId(String tenantId, Pageable pageable) {
        return userRepository.findByTenantId(tenantId, pageable).map(UserResponse::fromEntity);
    }

    public UserResponse getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));
        return UserResponse.fromEntity(user);
    }

    public UserResponse getCurrentUserProfile() {
        String username = getCallerUsername();
        if (username == null) throw new SecurityException("Not authenticated");
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));
        return UserResponse.fromEntity(user);
    }

    public SystemStatsDTO getSystemStats() {
        long totalCompanies  = companyRepository.count();
        long activeCompanies = companyRepository.findByIsActive(true, Pageable.unpaged()).getTotalElements();
        long totalUsers      = userRepository.count();
        long activeUsers     = userRepository.findAll().stream()
                                .filter(User::getIsActive).count();
        long totalInvoices   = invoiceRepository.count();
        long totalRoles      = roleRepository.count();

        return new SystemStatsDTO(totalCompanies, activeCompanies, totalUsers, activeUsers,
                                  totalInvoices, totalRoles, Instant.now());
    }

    // ─── mutations ───────────────────────────────────────────────────────────

    public UserResponse createUser(CreateUserRequest request) {
        if (userRepository.existsByUsername(request.username())) {
            throw new IllegalArgumentException("Username already exists");
        }
        if (userRepository.existsByEmail(request.email())) {
            throw new IllegalArgumentException("Email already exists");
        }

        User user = new User();
        user.setUsername(request.username());
        user.setEmail(request.email());
        user.setPassword(passwordEncoder.encode(request.password()));
        user.setFullName(request.fullName());
        user.setPhoneNumber(request.phoneNumber());
        user.setPreferredLanguage(request.preferredLanguage() != null ? request.preferredLanguage() : "en");
        user.setIsActive(true);

        String tenantId = TenantContext.getTenantId();
        if (tenantId != null) user.setTenantId(tenantId);

        Set<Role> roles = new HashSet<>();
        if (request.roles() != null && !request.roles().isEmpty()) {
            for (String roleName : request.roles()) {
                if (Permission.SUPER_ADMIN.equals(roleName) && !callerIsSuperAdmin()) {
                    throw new SecurityException("Cannot assign SUPER_ADMIN role");
                }
                Role role = roleRepository.findByName(roleName)
                        .orElseThrow(() -> new IllegalArgumentException("Role not found: " + roleName));
                roles.add(role);
            }
        } else {
            Role userRole = roleRepository.findByName(Permission.USER)
                    .orElseThrow(() -> new RuntimeException("USER role not found"));
            roles.add(userRole);
        }
        user.setRoles(roles);

        return UserResponse.fromEntity(userRepository.save(user));
    }

    public UserResponse updateUser(Long userId, UpdateUserRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));

        guardAgainstAdminModifyingPrivileged(user);

        if (request.fullName() != null)         user.setFullName(request.fullName());
        if (request.phoneNumber() != null)       user.setPhoneNumber(request.phoneNumber());
        if (request.preferredLanguage() != null) user.setPreferredLanguage(request.preferredLanguage());
        if (request.isActive() != null)          user.setIsActive(request.isActive());
        if (request.email() != null && !request.email().equals(user.getEmail())) {
            if (userRepository.existsByEmail(request.email())) {
                throw new IllegalArgumentException("Email already in use");
            }
            user.setEmail(request.email());
        }

        return UserResponse.fromEntity(userRepository.save(user));
    }

    public UserResponse toggleUserStatus(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));

        guardAgainstAdminModifyingPrivileged(user);

        user.setIsActive(!user.getIsActive());
        return UserResponse.fromEntity(userRepository.save(user));
    }

    public UserResponse updateUserRoles(Long userId, Set<String> roleNames) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));

        guardAgainstAdminModifyingPrivileged(user);

        Set<Role> roles = new HashSet<>();
        for (String roleName : roleNames) {
            if (Permission.SUPER_ADMIN.equals(roleName) && !callerIsSuperAdmin()) {
                throw new SecurityException("Cannot assign SUPER_ADMIN role");
            }
            Role role = roleRepository.findByName(roleName)
                    .orElseThrow(() -> new IllegalArgumentException("Role not found: " + roleName));
            roles.add(role);
        }
        user.setRoles(roles);

        return UserResponse.fromEntity(userRepository.save(user));
    }

    public void deleteUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));
        guardAgainstAdminModifyingPrivileged(user);
        userRepository.deleteById(userId);
    }

    public List<String> getAvailableRoles(boolean includeSuperAdmin) {
        return roleRepository.findAll().stream()
                .map(Role::getName)
                .filter(name -> includeSuperAdmin || !Permission.SUPER_ADMIN.equals(name))
                .collect(Collectors.toList());
    }

    public void resetUserPassword(Long userId, String newPassword) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));
        guardAgainstAdminModifyingPrivileged(user);
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }
}
