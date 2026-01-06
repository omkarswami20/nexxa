package com.nexashop.backend.dto;

import com.nexashop.backend.entity.Customer;
import java.time.Instant;

public class CustomerResponse {
    private Long id;
    private String name;
    private String email;
    private String mobile;
    private boolean emailVerified;
    private boolean mobileVerified;
    private String accountStatus;
    private Instant createdAt;
    private Instant updatedAt;

    public CustomerResponse() {
    }

    public CustomerResponse(Customer customer) {
        this.id = customer.getId();
        this.name = customer.getName();
        this.email = customer.getEmail();
        this.mobile = customer.getMobile();
        this.emailVerified = customer.isEmailVerified();
        this.mobileVerified = customer.isMobileVerified();
        this.accountStatus = customer.getAccountStatus() != null ? customer.getAccountStatus().name() : null;
        this.createdAt = customer.getCreatedAt();
        this.updatedAt = customer.getUpdatedAt();
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getMobile() { return mobile; }
    public void setMobile(String mobile) { this.mobile = mobile; }
    public boolean isEmailVerified() { return emailVerified; }
    public void setEmailVerified(boolean emailVerified) { this.emailVerified = emailVerified; }
    public boolean isMobileVerified() { return mobileVerified; }
    public void setMobileVerified(boolean mobileVerified) { this.mobileVerified = mobileVerified; }
    public String getAccountStatus() { return accountStatus; }
    public void setAccountStatus(String accountStatus) { this.accountStatus = accountStatus; }
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
}



