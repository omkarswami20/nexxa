package com.nexashop.backend.service;

import com.nexashop.backend.dto.AdminLoginRequest;
import com.nexashop.backend.dto.LoginResponse;
import com.nexashop.backend.entity.RefreshToken;
import com.nexashop.backend.security.JwtUtils;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.stereotype.Service;

@Service
public class AdminAuthService {

    private final JwtUtils jwtUtils;
    private final RefreshTokenService refreshTokenService;
    private final com.nexashop.backend.repository.AdminRepository adminRepository;
    private final org.springframework.security.crypto.password.PasswordEncoder passwordEncoder;

    public AdminAuthService(JwtUtils jwtUtils, RefreshTokenService refreshTokenService, 
                            com.nexashop.backend.repository.AdminRepository adminRepository,
                            org.springframework.security.crypto.password.PasswordEncoder passwordEncoder) {
        this.jwtUtils = jwtUtils;
        this.refreshTokenService = refreshTokenService;
        this.adminRepository = adminRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public LoginResponse login(AdminLoginRequest request) {
        com.nexashop.backend.entity.Admin admin = adminRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new BadCredentialsException("Invalid Credentials"));

        if (!passwordEncoder.matches(request.getPassword(), admin.getPassword())) {
            throw new BadCredentialsException("Invalid Credentials");
        }

        String token = jwtUtils.generateToken(request.getEmail(), "ROLE_ADMIN");
        RefreshToken refreshToken = refreshTokenService.createRefreshToken(request.getEmail());
        return new LoginResponse(token, refreshToken.getToken());
    }
}
