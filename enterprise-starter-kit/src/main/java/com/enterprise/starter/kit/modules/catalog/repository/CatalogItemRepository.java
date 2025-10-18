package com.enterprise.starter.kit.modules.catalog.repository;

import com.enterprise.starter.kit.modules.catalog.entity.CatalogItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CatalogItemRepository extends JpaRepository<CatalogItem, Long> {
    List<CatalogItem> findByIsActiveTrue();
    boolean existsByName(String name);
}

