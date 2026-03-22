package com.nexashop.backend.config;

import com.nexashop.backend.security.JwtAuthenticationFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    public SecurityConfig(JwtAuthenticationFilter jwtAuthenticationFilter) {
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .csrf(csrf -> csrf.disable()) // Disable CSRF for stateless APIs
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(org.springframework.http.HttpMethod.OPTIONS, "/**").permitAll() // Explicitly
                                                                                                         // allow
                                                                                                         // OPTIONS
                        // Public endpoints (v1)
                        .requestMatchers("/api/v1/auth/login/**", "/api/v1/auth/register/**").permitAll()
                        .requestMatchers("/api/v1/auth/refresh-token").permitAll()
                        .requestMatchers("/api/v1/otp/**").permitAll()
                        .requestMatchers("/api/v1/customers/otp/verify-email", "/api/v1/customers/otp/verify-mobile")
                        .permitAll()
                        .requestMatchers("/api/v1/customers/resend-otp").permitAll()
                        .requestMatchers("/api/v1/customers/forgot-password/**").permitAll()
                        .requestMatchers("/api/v1/sellers/verify").permitAll()
                        .requestMatchers("/api/v1/sellers/mobile/**", "/api/v1/seller/mobile/**").permitAll()
                        // Customer-only authenticated endpoints (v1)
                        .requestMatchers("/api/v1/cart/**").hasAuthority("ROLE_CUSTOMER")
                        .requestMatchers("/api/v1/orders/checkout").hasAuthority("ROLE_CUSTOMER")
                        .requestMatchers("/api/v1/orders/**").hasAuthority("ROLE_CUSTOMER")
                        // Seller-only authenticated endpoints (v1)
                        .requestMatchers("/api/v1/products/seller", "/api/v1/products/seller/**").hasAuthority("ROLE_SELLER")
                        .requestMatchers("/api/v1/seller/orders/**").hasAuthority("ROLE_SELLER")
                        // Public resources
                        .requestMatchers("/error").permitAll()
                        .requestMatchers(org.springframework.http.HttpMethod.GET, "/api/v1/products/**").permitAll()
                        .requestMatchers(org.springframework.http.HttpMethod.GET, "/api/v1/categories/**").permitAll() // Allow
                                                                                                                       // categories
                        .requestMatchers(org.springframework.http.HttpMethod.GET, "/api/v1/zipcode/**").permitAll() // Zip code lookup
                        .requestMatchers(org.springframework.http.HttpMethod.GET, "/uploads/**").permitAll()
                        .requestMatchers("/swagger-ui/**", "/v3/api-docs/**").permitAll()
                        .anyRequest().authenticated())
                .sessionManagement(session -> session
                        .sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration
                .setAllowedOrigins(List.of("http://localhost:5173", "http://localhost:3000", "http://127.0.0.1:5173"));
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS", "HEAD", "PATCH"));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setAllowCredentials(true);
        configuration.setExposedHeaders(List.of("Authorization"));

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
