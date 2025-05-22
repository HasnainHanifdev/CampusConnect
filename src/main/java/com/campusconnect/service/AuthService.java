package com.campusconnect.service;

import com.campusconnect.dto.SignUpRequest;
import com.campusconnect.model.User;
import com.campusconnect.model.Profile; // Import Profile
import com.campusconnect.repository.UserRepository;
import com.campusconnect.repository.ProfileRepository; // Import ProfileRepository
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProfileRepository profileRepository; // Autowire ProfileRepository

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Transactional
    public User registerUser(SignUpRequest signUpRequest) {
        if (userRepository.existsByUsername(signUpRequest.getUsername())) {
            throw new RuntimeException("Error: Username is already taken!");
        }

        if (userRepository.existsByEmail(signUpRequest.getEmail())) {
            throw new RuntimeException("Error: Email is already in use!");
        }

        // Create new user's account
        User user = new User(
                signUpRequest.getUsername(),
                signUpRequest.getEmail(),
                passwordEncoder.encode(signUpRequest.getPassword()),
                signUpRequest.getRole()
        );

        User savedUser = userRepository.save(user);

        // Create a basic profile for the new user
        // For simplicity, we'll assume firstName and lastName can be derived or set later
        // Or, you might want to add firstName and lastName to SignUpRequest
        Profile profile = new Profile(savedUser, signUpRequest.getUsername(), ""); // Using username as a placeholder for firstName, empty lastName
        profileRepository.save(profile);


        return savedUser;
    }

    // authenticateUser method would typically involve Spring Security's AuthenticationManager
    // and potentially JWT generation if that's the chosen auth mechanism.
    // For now, Spring Security will handle the core authentication via UserDetailsService.
    // This method could be expanded later if custom logic or token generation is needed.
}
