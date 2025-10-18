package com.enterprise.starter.kit.shared;

/**
 * Centralized role/permission constants to avoid scattered hardcoded strings.
 */
public final class Permission {

    private Permission() {}

    public static final String SUPER_ADMIN  = "SUPER_ADMIN";
    public static final String ADMIN        = "ADMIN";
    public static final String USER         = "USER";

    // Spring Security prefixed variants
    public static final String ROLE_SUPER_ADMIN = "ROLE_SUPER_ADMIN";
    public static final String ROLE_ADMIN       = "ROLE_ADMIN";
    public static final String ROLE_USER        = "ROLE_USER";
}

