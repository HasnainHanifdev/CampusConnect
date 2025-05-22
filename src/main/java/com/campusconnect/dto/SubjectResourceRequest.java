package com.campusconnect.dto;

import lombok.Data;

@Data
public class SubjectResourceRequest {
    private String title;
    private String link; // URL for the resource
    private String description;
}
