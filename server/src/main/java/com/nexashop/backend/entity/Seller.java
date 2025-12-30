package com.nexashop.backend.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "sellers")
public class Seller {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    @Column(unique = true, nullable = false)
    private String email;

    @com.fasterxml.jackson.annotation.JsonIgnore
    private String password;

    private String storeName;

    @Column(nullable = false)
    private boolean emailVerified = false;

    private String mobile;

    @Column(nullable = false)
    private boolean mobileVerified = false;

    @Enumerated(EnumType.STRING)
    private SellerStatus status;

    public Seller() {
        this.status = SellerStatus.PENDING;
    }

    public Seller(String name, String email, String password, String storeName) {
        this.name = name;
        this.email = email;
        this.password = password;
        this.storeName = storeName;
        this.status = SellerStatus.PENDING;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getStoreName() {
        return storeName;
    }

    public void setStoreName(String storeName) {
        this.storeName = storeName;
    }

    public boolean isEmailVerified() {
        return emailVerified;
    }

    public void setEmailVerified(boolean emailVerified) {
        this.emailVerified = emailVerified;
    }

    public String getMobile() {
        return mobile;
    }

    public void setMobile(String mobile) {
        this.mobile = mobile;
    }

    public boolean isMobileVerified() {
        return mobileVerified;
    }

    public void setMobileVerified(boolean mobileVerified) {
        this.mobileVerified = mobileVerified;
    }

    public enum SellerStatus {
        PENDING,
        PENDING_ADMIN_APPROVAL,
        APPROVED,
        DENIED,
        ACTIVE
    }

    public SellerStatus getStatus() {
        return status;
    }

    public void setStatus(SellerStatus status) {
        this.status = status;
    }
}
