package com.enterprise.starter.kit.modules.tenant.repository;

import com.enterprise.starter.kit.modules.tenant.entity.Company;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CompanyRepository extends JpaRepository<Company, Long> {

    Optional<Company> findByTenantId(String tenantId);

    boolean existsByTenantId(String tenantId);

    Page<Company> findByIsActive(Boolean isActive, Pageable pageable);

    @Query("SELECT c FROM Company c WHERE " +
            "LOWER(c.name) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
            "LOWER(c.tenantId) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
            "LOWER(c.email) LIKE LOWER(CONCAT('%', :query, '%'))")
    Page<Company> search(@Param("query") String query, Pageable pageable);

    @Query("SELECT COUNT(c) FROM Company c WHERE c.isActive = true")
    long countActiveCompanies();
}
