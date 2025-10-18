package com.enterprise.starter.kit.config;

import com.enterprise.starter.kit.shared.tenant.TenantContext;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Before;
import org.hibernate.Session;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;

/**
 * AOP aspect that enables the Hibernate multi-tenant filter before any service
 * method.
 *
 * <p>
 * Only activates when a tenantId is present in {@link TenantContext}.
 * Global / shared entities that do NOT carry a
 * {@code @FilterDef(name="tenantFilter")} annotation are silently skipped.
 */
@Aspect
@Component
public class TenantAspect {

    private static final Logger log = LoggerFactory.getLogger(TenantAspect.class);

    @PersistenceContext
    private EntityManager entityManager;

    @Before("execution(* com.enterprise.starter.kit.modules..service..*(..))")
    public void enableTenantFilter() {
        String tenantId = null;
        try {
            tenantId = TenantContext.getTenantId();
        } catch (Exception e) {
            log.warn("Could not get tenantId from TenantContext: {}", e.getMessage());
            return;
        }
        if (tenantId == null)
            return;

        try {
            Session session = entityManager.unwrap(Session.class);
            session.enableFilter("tenantFilter").setParameter("tenantId", tenantId);
            log.debug("Tenant filter enabled for tenantId={}", tenantId);
        } catch (Exception ex) {
            log.trace("Could not enable tenantFilter (entity may not define it): {}", ex.getMessage());
        }
    }
}