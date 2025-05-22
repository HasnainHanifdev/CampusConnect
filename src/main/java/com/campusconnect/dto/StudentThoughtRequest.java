package com.campusconnect.dto;

import lombok.Data;

@Data
public class StudentThoughtRequest {
    private String title;
    private String content;
    private String category;
    private boolean isAnonymous = false;
}
