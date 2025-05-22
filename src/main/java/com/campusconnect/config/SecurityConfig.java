package com.campusconnect.config;

import com.campusconnect.service.UserDetailsServiceImpl; // Will be created later
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity; // Import for @PreAuthorize
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true) // Enable @PreAuthorize, @PostAuthorize
public class SecurityConfig {

    private final UserDetailsServiceImpl userDetailsService;

    public SecurityConfig(UserDetailsServiceImpl userDetailsService) {
        this.userDetailsService = userDetailsService;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authenticationConfiguration) throws Exception {
        return authenticationConfiguration.getAuthenticationManager();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable()) // Consider enabling CSRF with proper handling for production
            .authorizeHttpRequests(authz -> authz
                .requestMatchers("/api/auth/signup", "/api/auth/signin").permitAll()
                // Role-based checks are now primarily handled by @PreAuthorize in controllers
                // Keep general rules here for defense in depth or for endpoints not using method security
                .requestMatchers("/api/profile/**").authenticated()
                .requestMatchers("/api/posts/**").authenticated()
                .requestMatchers("/api/comments/**").authenticated()
                .requestMatchers("/api/subjects/**").authenticated() // All subject routes require authentication
                .anyRequest().authenticated()
            )
            .userDetailsService(userDetailsService);
            // .formLogin(form -> form.loginPage("/login").permitAll()) // Example if using form login
            // .httpBasic(Customizer.withDefaults()); // Or use HTTP Basic

        return http.build();
    }
}
