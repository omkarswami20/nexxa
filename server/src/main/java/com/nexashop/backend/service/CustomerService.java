package com.nexashop.backend.service;

import com.nexashop.backend.dto.CustomerLoginRequest;
import com.nexashop.backend.dto.CustomerRegisterRequest;
import com.nexashop.backend.dto.LoginResponse;
import com.nexashop.backend.entity.Customer;
import com.nexashop.backend.exception.VerificationRequiredException;
import com.nexashop.backend.repository.CustomerRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.nexashop.backend.security.JwtUtils;

@Service
@Transactional
public class CustomerService {
    
    private static final Logger logger = LoggerFactory.getLogger(CustomerService.class);
    private final CustomerRepository customerRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtils jwtUtils;
    private final RefreshTokenService refreshTokenService;

    private final OtpService otpService;
    private final EmailService emailService;

    public CustomerService(CustomerRepository customerRepository,
                           PasswordEncoder passwordEncoder,
                           JwtUtils jwtUtils,
                           RefreshTokenService refreshTokenService,
                           OtpService otpService,
                           EmailService emailService) {
        this.customerRepository = customerRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtils = jwtUtils;
        this.refreshTokenService = refreshTokenService;
        this.otpService = otpService;
        this.emailService = emailService;
    }

    public Customer register(CustomerRegisterRequest req) {
        if (customerRepository.existsByEmail(req.getEmail())) {
            throw new IllegalArgumentException("Email already exists");
        }
        if (req.getMobile() != null && !req.getMobile().isBlank() && customerRepository.existsByMobile(req.getMobile())) {
            throw new IllegalArgumentException("Mobile already exists");
        }
        Customer c = new Customer();
        c.setName(req.getName());
        c.setEmail(req.getEmail());
        c.setPassword(passwordEncoder.encode(req.getPassword()));
        c.setEmailVerified(false); // Explicitly set to false on registration
        c.setMobileVerified(false); // Explicitly set to false on registration
        c.setAccountStatus(Customer.AccountStatus.PENDING); // Set to PENDING on registration
        if (req.getMobile() != null && !req.getMobile().isBlank()) {
            c.setMobile(req.getMobile());
        }
        Customer saved = customerRepository.save(c);
        // Trigger OTPs (2 minutes each)
        otpService.sendOtpWithContext(saved.getEmail(), "CUSTOMER_EMAIL", 120);
        if (saved.getMobile() != null && !saved.getMobile().isBlank()) {
            otpService.sendOtpWithContext(saved.getMobile(), "CUSTOMER_MOBILE", 120);
        }
        return saved;
    }

    public LoginResponse login(CustomerLoginRequest req) {
        Customer c = customerRepository.findByEmail(req.getEmail())
                .orElseThrow(() -> new BadCredentialsException("Invalid credentials"));
        if (!passwordEncoder.matches(req.getPassword(), c.getPassword())) {
            throw new BadCredentialsException("Invalid credentials");
        }
        
        // Check verification status
        boolean emailVerified = c.isEmailVerified();
        boolean mobileVerified = c.getMobile() == null || c.getMobile().isBlank() || c.isMobileVerified();
        String accountStatus = c.getAccountStatus().name();
        
        // If verification is incomplete or account is not active, throw VerificationRequiredException
        if (!emailVerified || !mobileVerified || c.getAccountStatus() != Customer.AccountStatus.ACTIVE) {
            throw new VerificationRequiredException(
                "Please complete verification to login",
                emailVerified,
                mobileVerified,
                accountStatus,
                c.getEmail(),
                c.getMobile() != null ? c.getMobile() : ""
            );
        }
        
        String token = jwtUtils.generateToken(c.getEmail(), "ROLE_CUSTOMER");
        var refresh = refreshTokenService.createRefreshToken(c.getEmail());
        return new LoginResponse(token, refresh.getToken());
    }

    public boolean verifyEmailOtp(String email, String otp) {
        boolean ok = otpService.verifyOtpWithContext(email, otp, "CUSTOMER_EMAIL");
        if (ok) {
            customerRepository.findByEmail(email).ifPresent(c -> {
                c.setEmailVerified(true);
                // If both email and mobile are verified, set account status to ACTIVE
                boolean mobileVerified = c.getMobile() == null || c.getMobile().isBlank() || c.isMobileVerified();
                if (mobileVerified) {
                    c.setAccountStatus(Customer.AccountStatus.ACTIVE);
                }
                customerRepository.save(c);
                checkAndSendWelcomeEmail(c);
            });
        }
        return ok;
    }

    public boolean verifyMobileOtp(String mobile, String otp) {
        boolean ok = otpService.verifyOtpWithContext(mobile, otp, "CUSTOMER_MOBILE");
        if (ok) {
            customerRepository.findByMobile(mobile).ifPresent(c -> {
                c.setMobileVerified(true);
                // If both email and mobile are verified, set account status to ACTIVE
                if (c.isEmailVerified()) {
                    c.setAccountStatus(Customer.AccountStatus.ACTIVE);
                }
                customerRepository.save(c);
                checkAndSendWelcomeEmail(c);
            });
        }
        return ok;
    }

    public void requestForgotPassword(String email) {
        // Send OTP to email
        otpService.sendOtpWithContext(email, "forgot-password", 120);
    }

    public boolean verifyForgotPassword(String email, String otp, String newPassword) {
        boolean ok = otpService.verifyOtpWithContext(email, otp, "forgot-password");
        if (ok) {
            customerRepository.findByEmail(email).ifPresent(c -> {
                c.setPassword(passwordEncoder.encode(newPassword));
                customerRepository.save(c);
            });
        }
        return ok;
    }

    public Customer getProfile(String email) {
        return customerRepository.findByEmail(email).orElseThrow(() -> new IllegalArgumentException("Customer not found"));
    }

    public Customer updateProfile(String email, String name, String mobile) {
        Customer c = customerRepository.findByEmail(email).orElseThrow(() -> new IllegalArgumentException("Customer not found"));
        if (name != null && !name.isBlank()) c.setName(name);
        if (mobile != null) c.setMobile(mobile);
        return customerRepository.save(c);
    }

    public boolean changePassword(String email, String oldPassword, String newPassword) {
        Customer c = customerRepository.findByEmail(email).orElseThrow(() -> new IllegalArgumentException("Customer not found"));
        if (!passwordEncoder.matches(oldPassword, c.getPassword())) return false;
        c.setPassword(passwordEncoder.encode(newPassword));
        customerRepository.save(c);
        return true;
    }
    public void resendOtp(String identifier, String type) {
        // type: "email" or "mobile"
        // identifier: email address or mobile number
        
        // Validation: Verify user exists
        if ("mobile".equalsIgnoreCase(type)) {
             customerRepository.findByMobile(identifier)
                 .orElseThrow(() -> new IllegalArgumentException("No customer found with this mobile number."));
             logger.info("Resending mobile OTP to: {}", identifier);
             otpService.sendOtpWithContext(identifier, "CUSTOMER_MOBILE", 120);
             logger.debug("Mobile OTP sent successfully to: {}", identifier);
        } else {
             // default to email
             customerRepository.findByEmail(identifier)
                 .orElseThrow(() -> new IllegalArgumentException("No customer found with this email."));
             logger.info("Resending email OTP to: {}", identifier);
             otpService.sendOtpWithContext(identifier, "CUSTOMER_EMAIL", 120);
             logger.debug("Email OTP sent successfully to: {}", identifier);
        }
    }


    private void checkAndSendWelcomeEmail(Customer c) {
        boolean emailVerified = c.isEmailVerified();
        boolean mobileVerified = c.getMobile() == null || c.getMobile().isBlank() || c.isMobileVerified();

        if (emailVerified && mobileVerified) {
            emailService.sendCustomerWelcomeEmail(c.getEmail(), c.getName());
        }
    }
}
