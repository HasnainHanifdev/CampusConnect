package com.campusconnect.dto;

import lombok.Data;

@Data
public class SubjectRequest {
    private String name;
    private String description;
    // teacherId is not included here as the teacher will be the authenticated user creating the subject
}
