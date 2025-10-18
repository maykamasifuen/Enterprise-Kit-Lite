package com.enterprise.starter.kit.modules.dashboard.controller;

import com.enterprise.starter.kit.modules.dashboard.dto.DashboardStatsDTO;
import com.enterprise.starter.kit.modules.dashboard.dto.DashboardTrendsDTO;
import com.enterprise.starter.kit.modules.dashboard.service.DashboardService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

/**
 * REST controller for dashboard statistics.
 * Supports optional date-range filtering via {@code from} and {@code to} query parameters.
 */
@RestController
@RequestMapping("/api/dashboard")
@Tag(name = "Dashboard", description = "Dashboard statistics endpoints")
public class DashboardController {

    private final DashboardService dashboardService;

    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @GetMapping("/stats")
    @PreAuthorize("isAuthenticated()")
    @Operation(
            summary = "Get dashboard statistics",
            description = "Returns aggregate invoice stats for the current tenant. " +
                          "Optionally filter by date range using ?from=YYYY-MM-DD&to=YYYY-MM-DD")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Statistics retrieved successfully",
                    content = @Content(mediaType = "application/json",
                            schema = @Schema(implementation = DashboardStatsDTO.class))),
            @ApiResponse(responseCode = "401", description = "Unauthorized", content = @Content),
            @ApiResponse(responseCode = "500", description = "Internal server error", content = @Content)
    })
    public ResponseEntity<DashboardStatsDTO> getStats(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {

        DashboardStatsDTO stats = (from != null && to != null)
                ? dashboardService.getStatsByDateRange(from, to)
                : dashboardService.getStats();
        return ResponseEntity.ok(stats);
    }

    @GetMapping("/trends")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Get monthly revenue trends",
               description = "Returns monthly paid revenue and invoice count for the last N months (default 6).")
    public ResponseEntity<DashboardTrendsDTO> getTrends(
            @RequestParam(defaultValue = "6") int months,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        return ResponseEntity.ok(dashboardService.getTrends(Math.max(1, Math.min(months, 24))));
    }
}
