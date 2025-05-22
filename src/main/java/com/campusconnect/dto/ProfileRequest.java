package com.campusconnect.dto;

import lombok.Data;

@Data
public class ProfileRequest {
    private String firstName;
    private String lastName;
    private String bio;
    private String profilePictureUrl;
    private String contactNumber;
}
