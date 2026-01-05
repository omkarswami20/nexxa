package com.nexashop.backend.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.FORBIDDEN)
public class VerificationRequiredException extends RuntimeException {
    private final boolean emailVerified;
    private final boolean mobileVerified;
    private final String accountStatus;
    private final String email;
    private final String mobile;

    public VerificationRequiredException(String message, boolean emailVerified, boolean mobileVerified,
            String accountStatus, String email, String mobile) {
        super(message);
        this.emailVerified = emailVerified;
        this.mobileVerified = mobileVerified;
        this.accountStatus = accountStatus;
        this.email = email;
        this.mobile = mobile;
    }

    public boolean isEmailVerified() {
        return emailVerified;
    }

    public boolean isMobileVerified() {
        return mobileVerified;
    }

    public String getAccountStatus() {
        return accountStatus;
    }

    public String getEmail() {
        return email;
    }

    public String getMobile() {
        return mobile;
    }
}
