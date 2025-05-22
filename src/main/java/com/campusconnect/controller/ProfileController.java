package com.campusconnect.controller;

import com.campusconnect.dto.ProfileRequest;
import com.campusconnect.dto.ProfileResponse;
import com.campusconnect.service.ProfileService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/profile")
public class ProfileController {

    @Autowired
    private ProfileService profileService;

    @GetMapping("/me")
    public ResponseEntity<ProfileResponse> getCurrentUserProfile() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String currentPrincipalName = authentication.getName();
        ProfileResponse profileResponse = profileService.getProfile(currentPrincipalName);
        return ResponseEntity.ok(profileResponse);
    }

    @PutMapping("/me")
    public ResponseEntity<ProfileResponse> updateCurrentUserProfile(@RequestBody ProfileRequest profileRequest) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String currentPrincipalName = authentication.getName();
        ProfileResponse updatedProfile = profileService.updateProfile(currentPrincipalName, profileRequest);
        return ResponseEntity.ok(updatedProfile);
    }
}
