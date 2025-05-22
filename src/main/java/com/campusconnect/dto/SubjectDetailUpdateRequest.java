package com.campusconnect.dto;

import lombok.Data;

@Data
public class SubjectDetailUpdateRequest {
    private String classSchedule;
    private String lectureOutlines;
    private String gradingSystem;
}
