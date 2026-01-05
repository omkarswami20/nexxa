package com.nexashop.backend.service;

import com.nexashop.backend.dto.SellerLoginRequest;
import com.nexashop.backend.entity.Seller;
import com.nexashop.backend.exception.VerificationRequiredException;
import com.nexashop.backend.repository.SellerRepository;
import com.nexashop.backend.security.JwtUtils;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class SellerServiceTest {

    @Mock
    private SellerRepository sellerRepository;
    @Mock
    private EmailService emailService;
    @Mock
    private PasswordEncoder passwordEncoder;
    @Mock
    private JwtUtils jwtUtils;
    @Mock
    private RefreshTokenService refreshTokenService;
    @Mock
    private VerificationService verificationService;
    @Mock
    private OtpService otpService;

    @InjectMocks
    private SellerService sellerService;

    private Seller seller;

    @BeforeEach
    void setUp() {
        seller = new Seller();
        seller.setId(1L);
        seller.setEmail("seller@example.com");
        seller.setPassword("encodedPassword");
        seller.setName("Test Seller");
        seller.setMobile("1234567890");
        seller.setStatus(Seller.SellerStatus.PENDING); // Not ACTIVE
        seller.setEmailVerified(false);
        seller.setMobileVerified(false);
    }

    @Test
    void loginSeller_ShouldResendCodes_WhenVerificationIncomplete() {
        SellerLoginRequest request = new SellerLoginRequest();
        request.setEmail("seller@example.com");
        request.setPassword("password");

        when(sellerRepository.findByEmail(anyString())).thenReturn(Optional.of(seller));
        when(passwordEncoder.matches(anyString(), anyString())).thenReturn(true);
        when(verificationService.createToken(anyString(), anyString(), any())).thenReturn("token");

        assertThrows(VerificationRequiredException.class, () -> sellerService.loginSeller(request));

        // Verify email resend logic was triggered (createToken and sendEmail)
        verify(verificationService).createToken(eq("seller-email"), eq(seller.getEmail()), any());
        verify(emailService).sendSimpleEmail(eq(seller.getEmail()), anyString(), anyString());

        // Verify mobile OTP resend logic was triggered
        verify(otpService).sendOtpWithContext(eq(seller.getMobile()), eq("SELLER"), eq(60L));
    }
}
