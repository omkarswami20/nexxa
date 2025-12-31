package com.nexashop.backend.service;

import com.nexashop.backend.dto.CustomerLoginRequest;
import com.nexashop.backend.dto.CustomerRegisterRequest;
import com.nexashop.backend.entity.Customer;
import com.nexashop.backend.exception.VerificationRequiredException;
import com.nexashop.backend.repository.CustomerRepository;
import com.nexashop.backend.security.JwtUtils;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CustomerServiceTest {

    @Mock
    private CustomerRepository customerRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtUtils jwtUtils;

    @Mock
    private RefreshTokenService refreshTokenService;

    @Mock
    private OtpService otpService;

    @Mock
    private EmailService emailService;

    @InjectMocks
    private CustomerService customerService;

    private CustomerRegisterRequest registerRequest;
    private Customer customer;

    @BeforeEach
    void setUp() {
        registerRequest = new CustomerRegisterRequest();
        registerRequest.setName("Test User");
        registerRequest.setEmail("test@example.com");
        registerRequest.setPassword("password123");
        registerRequest.setMobile("1234567890");

        customer = new Customer();
        customer.setId(1L);
        customer.setName("Test User");
        customer.setEmail("test@example.com");
        customer.setPassword("encodedPassword");
        customer.setMobile("1234567890");
        customer.setEmailVerified(true);
        customer.setMobileVerified(true);
        customer.setAccountStatus(Customer.AccountStatus.ACTIVE);
    }

    @Test
    void testRegisterCustomer_Success() {
        when(customerRepository.existsByEmail(anyString())).thenReturn(false);
        when(customerRepository.existsByMobile(anyString())).thenReturn(false);
        when(passwordEncoder.encode(anyString())).thenReturn("encodedPassword");
        when(customerRepository.save(any(Customer.class))).thenReturn(customer);

        Customer result = customerService.register(registerRequest);

        assertNotNull(result);
        assertEquals("test@example.com", result.getEmail());
        verify(customerRepository, times(1)).save(any(Customer.class));
        verify(otpService, times(2)).sendOtpWithContext(anyString(), anyString(), anyLong());
    }

    @Test
    void testRegisterCustomer_EmailAlreadyExists() {
        when(customerRepository.existsByEmail(anyString())).thenReturn(true);

        assertThrows(IllegalArgumentException.class, () -> {
            customerService.register(registerRequest);
        });

        verify(customerRepository, never()).save(any(Customer.class));
    }

    @Test
    void testLoginCustomer_Success() {
        CustomerLoginRequest loginRequest = new CustomerLoginRequest();
        loginRequest.setEmail("test@example.com");
        loginRequest.setPassword("password123");
        
        when(customerRepository.findByEmail(anyString())).thenReturn(Optional.of(customer));
        when(passwordEncoder.matches(anyString(), anyString())).thenReturn(true);
        when(jwtUtils.generateToken(anyString(), anyString())).thenReturn("jwtToken");
        when(refreshTokenService.createRefreshToken(anyString())).thenReturn(any());

        var result = customerService.login(loginRequest);

        assertNotNull(result);
        verify(jwtUtils, times(1)).generateToken(anyString(), eq("ROLE_CUSTOMER"));
    }

    @Test
    void testLoginCustomer_InvalidCredentials() {
        CustomerLoginRequest loginRequest = new CustomerLoginRequest();
        loginRequest.setEmail("test@example.com");
        loginRequest.setPassword("wrongpassword");
        
        when(customerRepository.findByEmail(anyString())).thenReturn(Optional.empty());

        assertThrows(BadCredentialsException.class, () -> {
            customerService.login(loginRequest);
        });
    }

    @Test
    void testLoginCustomer_VerificationRequired() {
        CustomerLoginRequest loginRequest = new CustomerLoginRequest();
        loginRequest.setEmail("test@example.com");
        loginRequest.setPassword("password123");
        
        customer.setEmailVerified(false);
        when(customerRepository.findByEmail(anyString())).thenReturn(Optional.of(customer));
        when(passwordEncoder.matches(anyString(), anyString())).thenReturn(true);

        assertThrows(VerificationRequiredException.class, () -> {
            customerService.login(loginRequest);
        });
    }
}

