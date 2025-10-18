package com.enterprise.starter.kit.shared.exception;

import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;

/**
 * Lightweight unit test that validates the exception-to-response mapping without requiring Spring Test MVC.
 *
 * <p>This is intentionally framework-light to avoid classpath issues if spring-test artifacts are missing
 * from the build environment.
 */
class ExcelImportExceptionMappingUnitTest {

    @Test
    void illegalArgumentException_mapsToHttp400() {
        ApiExceptionHandler handler = new ApiExceptionHandler();

        var resp = handler.handleIllegalArgument(new IllegalArgumentException("bad excel"));

        assertEquals(HttpStatus.BAD_REQUEST, resp.getStatusCode());
        assertNotNull(resp.getBody());
        assertEquals(400, resp.getBody().get("status"));
        assertEquals("Bad Request", resp.getBody().get("error"));
    }
}

