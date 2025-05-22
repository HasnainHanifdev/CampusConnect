package com.campusconnect.service;

import com.campusconnect.dto.ProfileRequest;
import com.campusconnect.dto.ProfileResponse;
import com.campusconnect.model.Profile;
import com.campusconnect.model.User;
import com.campusconnect.repository.ProfileRepository;
import com.campusconnect.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ProfileService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProfileRepository profileRepository;

    @Transactional(readOnly = true)
    public ProfileResponse getProfile(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with username: " + username));

        // Profile is expected to be created during registration.
        // If not, findByUserId might return empty, which ProfileResponse handles.
        Profile profile = profileRepository.findByUserId(user.getId()).orElse(null); 
                                                                            
        return new ProfileResponse(user, profile);
    }

    @Transactional
    public ProfileResponse updateProfile(String username, ProfileRequest profileRequest) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with username: " + username));

        Profile profile = profileRepository.findByUserId(user.getId())
                .orElseGet(() -> {
                    // This case should ideally not be hit if profile is created during registration
                    // As mentioned in previous task's summary, profile is created during registration.
                    // If it could be null, we'd create a new one:
                    // Profile newProfile = new Profile(user, profileRequest.getFirstName(), profileRequest.getLastName());
                    // However, we expect it to exist.
                    // If it's critical it must exist, throw IllegalStateException or similar.
                    // For now, let's re-fetch or assume it exists.
                    // The previous task's AuthService creates a Profile.
                    // So, an existing profile should be found.
                    throw new IllegalStateException("Profile not found for user: " + username + ". It should have been created during registration.");
                });

        profile.setFirstName(profileRequest.getFirstName());
        profile.setLastName(profileRequest.getLastName());
        profile.setBio(profileRequest.getBio());
        profile.setProfilePictureUrl(profileRequest.getProfilePictureUrl());
        profile.setContactNumber(profileRequest.getContactNumber());

        Profile updatedProfile = profileRepository.save(profile);
        return new ProfileResponse(user, updatedProfile);
    }
}
