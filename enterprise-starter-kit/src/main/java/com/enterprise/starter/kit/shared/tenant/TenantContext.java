package com.enterprise.starter.kit.shared.tenant;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public final class TenantContext {
    private static final Logger log = LoggerFactory.getLogger(TenantContext.class);
    private static final ThreadLocal<String> CURRENT_TENANT = new ThreadLocal<>();

    private TenantContext() {}

    public static void setTenantId(String tenantId) {
        log.debug("Setting tenantId to: {}", tenantId);
        CURRENT_TENANT.set(tenantId);
    }

    public static String getTenantId() {
        return CURRENT_TENANT.get();
    }

    public static void clear() {
        log.debug("Clearing tenantId");
        CURRENT_TENANT.remove();
    }
}