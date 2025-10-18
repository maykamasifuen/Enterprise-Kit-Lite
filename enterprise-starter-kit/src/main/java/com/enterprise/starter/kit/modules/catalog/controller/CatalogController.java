package com.enterprise.starter.kit.modules.catalog.controller;

import com.enterprise.starter.kit.modules.catalog.dto.CatalogItemRequest;
import com.enterprise.starter.kit.modules.catalog.dto.CatalogItemResponse;
import com.enterprise.starter.kit.modules.catalog.service.CatalogService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/catalog")
@PreAuthorize("isAuthenticated()")
@Tag(name = "Catalog", description = "Product/service catalog for reusable invoice line items")
public class CatalogController {

    private final CatalogService service;

    public CatalogController(CatalogService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<List<CatalogItemResponse>> getAll() {
        return ResponseEntity.ok(service.getAll());
    }

    @GetMapping("/active")
    public ResponseEntity<List<CatalogItemResponse>> getActive() {
        return ResponseEntity.ok(service.getActive());
    }

    @GetMapping("/{id}")
    public ResponseEntity<CatalogItemResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(service.getById(id));
    }

    @PostMapping
    public ResponseEntity<CatalogItemResponse> create(@Valid @RequestBody CatalogItemRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.create(req));
    }

    @PutMapping("/{id}")
    public ResponseEntity<CatalogItemResponse> update(@PathVariable Long id,
                                                       @Valid @RequestBody CatalogItemRequest req) {
        return ResponseEntity.ok(service.update(id, req));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}

