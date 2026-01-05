package com.nexashop.backend.exception;

import com.nexashop.backend.dto.ErrorResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.WebRequest;

import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

        private static final Logger logger = LoggerFactory.getLogger(GlobalExceptionHandler.class);

        @ExceptionHandler(IllegalArgumentException.class)
        public ResponseEntity<ErrorResponse> handleIllegalArgumentException(
                        IllegalArgumentException ex, WebRequest request) {
                logger.error("Illegal argument: {}", ex.getMessage());
                ErrorResponse errorResponse = new ErrorResponse(
                                HttpStatus.BAD_REQUEST.value(),
                                "Bad Request",
                                ex.getMessage(),
                                request.getDescription(false).replace("uri=", ""));
                return new ResponseEntity<>(errorResponse, HttpStatus.BAD_REQUEST);
        }

        @ExceptionHandler(IllegalStateException.class)
        public ResponseEntity<ErrorResponse> handleIllegalStateException(
                        IllegalStateException ex, WebRequest request) {
                logger.error("Illegal state: {}", ex.getMessage());
                ErrorResponse errorResponse = new ErrorResponse(
                                HttpStatus.BAD_REQUEST.value(),
                                "Bad Request",
                                ex.getMessage(),
                                request.getDescription(false).replace("uri=", ""));
                return new ResponseEntity<>(errorResponse, HttpStatus.BAD_REQUEST);
        }

        @ExceptionHandler(MethodArgumentNotValidException.class)
        public ResponseEntity<Map<String, Object>> handleValidationExceptions(
                        MethodArgumentNotValidException ex, WebRequest request) {
                logger.error("Validation error: {}", ex.getMessage());
                Map<String, String> errors = new HashMap<>();
                ex.getBindingResult().getAllErrors().forEach((error) -> {
                        String fieldName = ((FieldError) error).getField();
                        String errorMessage = error.getDefaultMessage();
                        errors.put(fieldName, errorMessage);
                });

                Map<String, Object> response = new HashMap<>();
                response.put("timestamp", java.time.LocalDateTime.now());
                response.put("status", HttpStatus.BAD_REQUEST.value());
                response.put("error", "Validation Failed");
                response.put("message", "Invalid input data");
                response.put("errors", errors);
                response.put("path", request.getDescription(false).replace("uri=", ""));

                return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
        }

        @ExceptionHandler(VerificationRequiredException.class)
        public ResponseEntity<Map<String, Object>> handleVerificationRequiredException(
                        VerificationRequiredException ex, WebRequest request) {
                logger.warn("Verification required: {}", ex.getMessage());
                Map<String, Object> response = new HashMap<>();
                response.put("timestamp", java.time.LocalDateTime.now());
                response.put("status", HttpStatus.FORBIDDEN.value());
                response.put("error", "VERIFICATION_REQUIRED");
                response.put("message", ex.getMessage());
                response.put("emailVerified", ex.isEmailVerified());
                response.put("mobileVerified", ex.isMobileVerified());
                response.put("accountStatus", ex.getAccountStatus());
                response.put("email", ex.getEmail());
                response.put("mobile", ex.getMobile());
                response.put("path", request.getDescription(false).replace("uri=", ""));
                return new ResponseEntity<>(response, HttpStatus.FORBIDDEN);
        }

        @ExceptionHandler(BadCredentialsException.class)
        public ResponseEntity<ErrorResponse> handleBadCredentialsException(
                        BadCredentialsException ex, WebRequest request) {
                logger.warn("Bad credentials: {}", ex.getMessage());
                ErrorResponse errorResponse = new ErrorResponse(
                                HttpStatus.UNAUTHORIZED.value(),
                                "Unauthorized",
                                "Invalid username or password",
                                request.getDescription(false).replace("uri=", ""));
                return new ResponseEntity<>(errorResponse, HttpStatus.UNAUTHORIZED);
        }

        @ExceptionHandler(AccessDeniedException.class)
        public ResponseEntity<ErrorResponse> handleAccessDeniedException(
                        AccessDeniedException ex, WebRequest request) {
                logger.warn("Access denied: {}", ex.getMessage());
                ErrorResponse errorResponse = new ErrorResponse(
                                HttpStatus.FORBIDDEN.value(),
                                "Forbidden",
                                "You do not have permission to access this resource",
                                request.getDescription(false).replace("uri=", ""));
                return new ResponseEntity<>(errorResponse, HttpStatus.FORBIDDEN);
        }

        @ExceptionHandler({ io.jsonwebtoken.security.SignatureException.class,
                        io.jsonwebtoken.MalformedJwtException.class,
                        io.jsonwebtoken.ExpiredJwtException.class })
        public ResponseEntity<ErrorResponse> handleJwtExceptions(
                        RuntimeException ex, WebRequest request) {
                logger.warn("JWT error: {}", ex.getMessage());
                ErrorResponse errorResponse = new ErrorResponse(
                                HttpStatus.UNAUTHORIZED.value(),
                                "Unauthorized",
                                "Invalid or expired token",
                                request.getDescription(false).replace("uri=", ""));
                return new ResponseEntity<>(errorResponse, HttpStatus.UNAUTHORIZED);
        }

        @ExceptionHandler(DataIntegrityViolationException.class)
        public ResponseEntity<ErrorResponse> handleDataIntegrityViolationException(
                        DataIntegrityViolationException ex, WebRequest request) {
                logger.error("Data integrity violation: {}", ex.getMessage());
                String message = "Database error: Duplicate entry or constraint violation";
                if (ex.getMessage().contains("Duplicate entry")) {
                        message = "Resource already exists";
                }
                ErrorResponse errorResponse = new ErrorResponse(
                                HttpStatus.CONFLICT.value(),
                                "Conflict",
                                message,
                                request.getDescription(false).replace("uri=", ""));
                return new ResponseEntity<>(errorResponse, HttpStatus.CONFLICT);
        }

        @ExceptionHandler(RuntimeException.class)
        public ResponseEntity<ErrorResponse> handleRuntimeException(
                        RuntimeException ex, WebRequest request) {
                logger.error("Runtime error: {}", ex.getMessage(), ex);
                String message = ex.getMessage() != null ? ex.getMessage()
                                : "An unexpected error occurred. Please try again later.";
                ErrorResponse errorResponse = new ErrorResponse(
                                HttpStatus.INTERNAL_SERVER_ERROR.value(),
                                "Internal Server Error",
                                message,
                                request.getDescription(false).replace("uri=", ""));
                return new ResponseEntity<>(errorResponse, HttpStatus.INTERNAL_SERVER_ERROR);
        }

        @ExceptionHandler(Exception.class)
        public ResponseEntity<ErrorResponse> handleGenericException(
                        Exception ex, WebRequest request) {
                logger.error("Unexpected error: ", ex);
                String message = ex.getMessage() != null ? ex.getMessage()
                                : "An unexpected error occurred. Please try again later.";
                ErrorResponse errorResponse = new ErrorResponse(
                                HttpStatus.INTERNAL_SERVER_ERROR.value(),
                                "Internal Server Error",
                                message,
                                request.getDescription(false).replace("uri=", ""));
                return new ResponseEntity<>(errorResponse, HttpStatus.INTERNAL_SERVER_ERROR);
        }
}
