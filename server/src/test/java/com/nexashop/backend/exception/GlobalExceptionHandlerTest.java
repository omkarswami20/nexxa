package com.nexashop.backend.exception;

import com.nexashop.backend.dto.ErrorResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.web.context.request.WebRequest;

import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class GlobalExceptionHandlerTest {

    private GlobalExceptionHandler globalExceptionHandler;
    private WebRequest webRequest;

    @BeforeEach
    void setUp() {
        globalExceptionHandler = new GlobalExceptionHandler();
        webRequest = mock(WebRequest.class);
        when(webRequest.getDescription(false)).thenReturn("uri=/test");
    }

    @Test
    void testHandleVerificationRequiredException() {
        VerificationRequiredException ex = new VerificationRequiredException(
                "Verification required", false, false, "PENDING", "test@example.com", "1234567890");

        ResponseEntity<Map<String, Object>> response = globalExceptionHandler.handleVerificationRequiredException(ex,
                webRequest);

        assertEquals(HttpStatus.FORBIDDEN, response.getStatusCode());
        assertEquals("Forbidden", response.getBody().get("error"));
        assertEquals("Verification required", response.getBody().get("message"));
    }

    @Test
    void testHandleBadCredentialsException() {
        BadCredentialsException ex = new BadCredentialsException("Invalid credentials");

        ResponseEntity<ErrorResponse> response = globalExceptionHandler.handleBadCredentialsException(ex, webRequest);

        assertEquals(HttpStatus.UNAUTHORIZED, response.getStatusCode());
        assertEquals("Unauthorized", response.getBody().getError());
    }

    @Test
    void testHandleAccessDeniedException() {
        AccessDeniedException ex = new AccessDeniedException("Access denied");

        ResponseEntity<ErrorResponse> response = globalExceptionHandler.handleAccessDeniedException(ex, webRequest);

        assertEquals(HttpStatus.FORBIDDEN, response.getStatusCode());
        assertEquals("Forbidden", response.getBody().getError());
    }

    @Test
    void testHandleDataIntegrityViolationException_DuplicateEntry() {
        DataIntegrityViolationException ex = new DataIntegrityViolationException(
                "Duplicate entry 'test@example.com' for key 'email'");

        ResponseEntity<ErrorResponse> response = globalExceptionHandler.handleDataIntegrityViolationException(ex,
                webRequest);

        assertEquals(HttpStatus.CONFLICT, response.getStatusCode());
        assertEquals("Conflict", response.getBody().getError());
        assertEquals("Resource already exists", response.getBody().getMessage());
    }

    @Test
    void testHandleDataIntegrityViolationException_Other() {
        DataIntegrityViolationException ex = new DataIntegrityViolationException("Constraint violation");

        ResponseEntity<ErrorResponse> response = globalExceptionHandler.handleDataIntegrityViolationException(ex,
                webRequest);

        assertEquals(HttpStatus.CONFLICT, response.getStatusCode());
        assertEquals("Conflict", response.getBody().getError());
        assertEquals("Database error: Duplicate entry or constraint violation", response.getBody().getMessage());
    }
}
