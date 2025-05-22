package com.campusconnect.dto;

import com.campusconnect.model.Subject;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.sql.Timestamp;

@Data
@NoArgsConstructor
public class SubjectResponse {
    private Long id;
    private String name;
    private String description;
    private Long teacherId;
    private String teacherUsername;
    private String teacherFirstName;
    private String teacherLastName;
    private Timestamp createdAt;
    private Timestamp updatedAt;

    // New fields for subject details
    private String classSchedule;
    private String lectureOutlines;
    private String gradingSystem;
    private java.util.List<SubjectResourceResponse> resources;

    public SubjectResponse(Subject subject) {
        this.id = subject.getId();
        this.name = subject.getName();
        this.description = subject.getDescription();
        this.createdAt = subject.getCreatedAt();
        this.updatedAt = subject.getUpdatedAt();

        // Map new fields
        this.classSchedule = subject.getClassSchedule();
        this.lectureOutlines = subject.getLectureOutlines();
        this.gradingSystem = subject.getGradingSystem();

        if (subject.getTeacher() != null) {
            this.teacherId = subject.getTeacher().getId();
            this.teacherUsername = subject.getTeacher().getUsername();
            if (subject.getTeacher().getProfile() != null) {
                this.teacherFirstName = subject.getTeacher().getProfile().getFirstName();
                this.teacherLastName = subject.getTeacher().getProfile().getLastName();
            } else {
                this.teacherFirstName = subject.getTeacher().getUsername();
                this.teacherLastName = "";
            }
        } else {
            this.teacherUsername = "N/A";
            this.teacherFirstName = "N/A";
            this.teacherLastName = "";
        }

        if (subject.getResources() != null) {
            this.resources = subject.getResources().stream()
                                    .map(SubjectResourceResponse::new)
                                    .collect(java.util.stream.Collectors.toList());
        } else {
            this.resources = new java.util.ArrayList<>();
        }
    }
}
