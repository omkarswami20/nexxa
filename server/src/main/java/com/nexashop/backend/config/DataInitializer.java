package com.nexashop.backend.config;

import com.nexashop.backend.entity.Admin;
import com.nexashop.backend.repository.AdminRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class DataInitializer {

    private static final Logger logger = LoggerFactory.getLogger(DataInitializer.class);
    
    private final AdminRepository adminRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(AdminRepository adminRepository, PasswordEncoder passwordEncoder) {
        this.adminRepository = adminRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Bean
    public CommandLineRunner initData() {
        return args -> {
            Admin admin = adminRepository.findByEmail("admin@nexashop.com").orElse(null);
            
            if (admin == null) {
                admin = new Admin();
                admin.setEmail("admin@nexashop.com");
                admin.setPassword(passwordEncoder.encode("admin123"));
                adminRepository.save(admin);
                logger.info("Default Admin User Created: admin@nexashop.com");
            } else {
                // Ensure password is correct even if user exists (resetting for dev convenience)
                admin.setPassword(passwordEncoder.encode("admin123"));
                adminRepository.save(admin);
                logger.info("Admin User Password Reset: admin@nexashop.com");
            }
        };
    }
}
