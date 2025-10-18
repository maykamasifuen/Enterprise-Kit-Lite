package com.enterprise.starter.kit.modules.settings.controller;

import com.enterprise.starter.kit.modules.settings.dto.TenantSettingsDto;
import com.enterprise.starter.kit.modules.settings.service.TenantSettingsService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

/**
 * REST endpoints for tenant application settings.
 *
 * <p>Both ADMIN and SUPER_ADMIN can read/write settings for their own tenant.
 * Settings are persisted server-side in the {@code companies} table.
 */
@RestController
@RequestMapping("/api/settings")
@PreAuthorize("hasAnyRole('ADMIN','SUPER_ADMIN')")
public class TenantSettingsController {

    private final TenantSettingsService settingsService;

    public TenantSettingsController(TenantSettingsService settingsService) {
        this.settingsService = settingsService;
    }

    @GetMapping
    public ResponseEntity<TenantSettingsDto> getSettings() {
        return ResponseEntity.ok(settingsService.getSettings());
    }

    @PutMapping
    public ResponseEntity<TenantSettingsDto> updateSettings(@RequestBody TenantSettingsDto dto) {
        return ResponseEntity.ok(settingsService.updateSettings(dto));
    }
}

