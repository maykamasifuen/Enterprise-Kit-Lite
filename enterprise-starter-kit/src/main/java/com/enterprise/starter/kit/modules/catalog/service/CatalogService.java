package com.enterprise.starter.kit.modules.catalog.service;

import com.enterprise.starter.kit.modules.catalog.dto.CatalogItemRequest;
import com.enterprise.starter.kit.modules.catalog.dto.CatalogItemResponse;
import com.enterprise.starter.kit.modules.catalog.entity.CatalogItem;
import com.enterprise.starter.kit.modules.catalog.repository.CatalogItemRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class CatalogService {

    private final CatalogItemRepository repository;

    public CatalogService(CatalogItemRepository repository) {
        this.repository = repository;
    }

    @Transactional(readOnly = true)
    public List<CatalogItemResponse> getAll() {
        return repository.findAll().stream().map(CatalogItemResponse::from).toList();
    }

    @Transactional(readOnly = true)
    public List<CatalogItemResponse> getActive() {
        return repository.findByIsActiveTrue().stream().map(CatalogItemResponse::from).toList();
    }

    @Transactional(readOnly = true)
    public CatalogItemResponse getById(Long id) {
        return CatalogItemResponse.from(findOrThrow(id));
    }

    @Transactional
    public CatalogItemResponse create(CatalogItemRequest req) {
        CatalogItem item = new CatalogItem();
        mapRequest(req, item);
        return CatalogItemResponse.from(repository.save(item));
    }

    @Transactional
    public CatalogItemResponse update(Long id, CatalogItemRequest req) {
        CatalogItem item = findOrThrow(id);
        mapRequest(req, item);
        return CatalogItemResponse.from(repository.save(item));
    }

    @Transactional
    public void delete(Long id) {
        if (!repository.existsById(id)) throw new IllegalArgumentException("Catalog item not found: " + id);
        repository.deleteById(id);
    }

    private CatalogItem findOrThrow(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Catalog item not found: " + id));
    }

    private void mapRequest(CatalogItemRequest req, CatalogItem item) {
        item.setName(req.name());
        item.setDescription(req.description());
        item.setUnitPrice(req.unitPrice());
        item.setUnit(req.unit());
        item.setIsActive(req.isActive() != null ? req.isActive() : true);
    }
}

