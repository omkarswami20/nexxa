package com.nexashop.backend.service;

import com.nexashop.backend.dto.CustomerLoginRequest;
import com.nexashop.backend.dto.CustomerRegisterRequest;
import com.nexashop.backend.dto.LoginResponse;
import com.nexashop.backend.entity.Customer;
import com.nexashop.backend.repository.CustomerRepository;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.nexashop.backend.security.JwtUtils;

@Service
@Transactional
public class CustomerService {
    private final CustomerRepository customerRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtils jwtUtils;
    private final RefreshTokenService refreshTokenService;
    private final OtpService otpService;

    public CustomerService(CustomerRepository customerRepository,
                           PasswordEncoder passwordEncoder,
                           JwtUtils jwtUtils,
                           RefreshTokenService refreshTokenService,
                           OtpService otpService) {
        this.customerRepository = customerRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtils = jwtUtils;
        this.refreshTokenService = refreshTokenService;
        this.otpService = otpService;
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
        if (req.getMobile() != null && !req.getMobile().isBlank()) {
            c.setMobile(req.getMobile());
        }
        Customer saved = customerRepository.save(c);
        // Trigger OTPs (2 minutes each)
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
        if (!c.isEmailVerified()) {
            throw new BadCredentialsException("Email not verified");
        }
        // If mobile provided, require verification
        if (c.getMobile() != null && !c.getMobile().isBlank() && !c.isMobileVerified()) {
            throw new BadCredentialsException("Mobile not verified");
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
                customerRepository.save(c);
            });
        }
        return ok;
    }

    public boolean verifyMobileOtp(String mobile, String otp) {
        boolean ok = otpService.verifyOtpWithContext(mobile, otp, "CUSTOMER_MOBILE");
        if (ok) {
            customerRepository.findByMobile(mobile).ifPresent(c -> {
                c.setMobileVerified(true);
                customerRepository.save(c);
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
}
