package com.campusconnect.controller;

import com.campusconnect.dto.LoginRequest;
import com.campusconnect.dto.SignUpRequest;
import com.campusconnect.model.User;
import com.campusconnect.service.AuthService;
import com.campusconnect.service.UserDetailsServiceImpl; // For AuthenticationManager
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import com.campusconnect.dto.UserLoginResponse; // Import UserLoginResponse
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails; // Import UserDetails
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthService authService;

    @Autowired
    private AuthenticationManager authenticationManager; // Autowire AuthenticationManager

    // We don't strictly need UserDetailsServiceImpl here if AuthenticationManager is correctly configured
    // and UserDetailsService is provided to Spring Security (which it is in SecurityConfig)

    @PostMapping("/signup")
    public ResponseEntity<?> registerUser(@RequestBody SignUpRequest signUpRequest) {
        try {
            User user = authService.registerUser(signUpRequest);
            return ResponseEntity.ok("User registered successfully! Username: " + user.getUsername());
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/signin")
    public ResponseEntity<?> authenticateUser(@RequestBody LoginRequest loginRequest) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.getUsername(), loginRequest.getPassword()));

        SecurityContextHolder.getContext().setAuthentication(authentication);

        // Retrieve UserDetails from the Authentication object
        UserDetails userDetails = (UserDetails) authentication.getPrincipal();

        // Create and return the UserLoginResponse
        UserLoginResponse loginResponse = new UserLoginResponse(
            userDetails.getUsername(),
            userDetails.getAuthorities()
        );
        
        return ResponseEntity.ok(loginResponse);
    }
}
