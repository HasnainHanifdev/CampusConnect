package com.campusconnect.dto;

import com.campusconnect.model.Profile;
import com.campusconnect.model.User;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class ProfileResponse {
    // User fields
    private Long userId;
    private String username;
    private String email;
    private String role;

    // Profile fields
    private Long profileId;
    private String firstName;
    private String lastName;
    private String bio;
    private String profilePictureUrl;
    private String contactNumber;

    public ProfileResponse(User user, Profile profile) {
        this.userId = user.getId();
        this.username = user.getUsername();
        this.email = user.getEmail();
        this.role = user.getRole();

        if (profile != null) {
            this.profileId = profile.getId();
            this.firstName = profile.getFirstName();
            this.lastName = profile.getLastName();
            this.bio = profile.getBio();
            this.profilePictureUrl = profile.getProfilePictureUrl();
            this.contactNumber = profile.getContactNumber();
        }
    }
}
