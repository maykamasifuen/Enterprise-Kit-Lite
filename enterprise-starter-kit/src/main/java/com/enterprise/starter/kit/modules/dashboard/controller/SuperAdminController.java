package com.enterprise.starter.kit.modules.dashboard.controller;

import com.enterprise.starter.kit.modules.dashboard.dto.SystemStatsDTO;
import com.enterprise.starter.kit.modules.usermanagement.service.UserManagementService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Super-Admin-only endpoints for system-wide statistics and administration.
 */
@RestController
@RequestMapping("/api/admin/super")
@PreAuthorize("hasRole('SUPER_ADMIN')")
public class SuperAdminController {

    private final UserManagementService userManagementService;

    public SuperAdminController(UserManagementService userManagementService) {
        this.userManagementService = userManagementService;
    }

    /**
     * Returns system-wide statistics: total companies, users, invoices, roles and system time.
     */
    @GetMapping("/stats")
    public ResponseEntity<SystemStatsDTO> getSystemStats() {
        return ResponseEntity.ok(userManagementService.getSystemStats());
    }
}

