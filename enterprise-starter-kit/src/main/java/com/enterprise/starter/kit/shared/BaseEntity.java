package com.enterprise.starter.kit.shared;

import java.time.Instant;
import com.enterprise.starter.kit.shared.tenant.TenantContext;
import jakarta.persistence.*;
import org.hibernate.annotations.Filter;
import org.hibernate.annotations.FilterDef;
import org.hibernate.annotations.ParamDef;
import org.springframework.data.annotation.CreatedBy;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedBy;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

/**
 * Abstract base entity — provides audit fields and multi-tenant isolation for all entities.
 *
 * <p>Note: Explicit accessors are used instead of Lombok {@code @Getter/@Setter}
 * because the Maven forked compiler on Java 25 does not reliably process
 * Lombok annotations on {@code @MappedSuperclass} abstract types.
 *
 * <ul>
 *   <li>{@code id} — auto-generated PK</li>
 *   <li>{@code createdAt}/{@code updatedAt} — JPA Auditing</li>
 *   <li>{@code createdBy}/{@code lastModifiedBy} — AuditorAware</li>
 *   <li>{@code tenantId} — set from {@link TenantContext} on first INSERT</li>
 * </ul>
 */
@MappedSuperclass
@EntityListeners(AuditingEntityListener.class)
@FilterDef(name = "tenantFilter", parameters = {@ParamDef(name = "tenantId", type = String.class)})
@Filter(name = "tenantFilter", condition = "tenant_id = :tenantId")
public abstract class BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @CreatedDate
    @Column(nullable = false, updatable = false)
    private Instant createdAt;

    @LastModifiedDate
    @Column(nullable = false)
    private Instant updatedAt;

    @CreatedBy
    @Column(updatable = false)
    private String createdBy;

    @LastModifiedBy
    private String lastModifiedBy;

    @Column(name = "tenant_id", nullable = false, updatable = false)
    private String tenantId;

    /** Automatically assigns the current tenant before the first INSERT. */
    @PrePersist
    public void handleTenant() {
        if (this.tenantId == null) {
            String ctx = TenantContext.getTenantId();
            this.tenantId = ctx != null ? ctx : "default";
        }
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }

    public String getCreatedBy() { return createdBy; }
    public void setCreatedBy(String createdBy) { this.createdBy = createdBy; }

    public String getLastModifiedBy() { return lastModifiedBy; }
    public void setLastModifiedBy(String lastModifiedBy) { this.lastModifiedBy = lastModifiedBy; }

    public String getTenantId() { return tenantId; }
    public void setTenantId(String tenantId) { this.tenantId = tenantId; }
}
