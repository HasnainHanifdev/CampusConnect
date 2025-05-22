package com.campusconnect.dto;

import com.campusconnect.model.StudentThought;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.sql.Timestamp;

@Data
@NoArgsConstructor
public class StudentThoughtResponse {
    private Long id;
    private String authorUsername; // "Anonymous" if isAnonymous is true
    private String authorFirstName; // Optional: for non-anonymous posts, if available
    private String authorLastName;  // Optional
    private String title;
    private String content;
    private String category;
    private boolean isAnonymous;
    private Timestamp createdAt;
    private Timestamp updatedAt;

    public StudentThoughtResponse(StudentThought thought) {
        this.id = thought.getId();
        this.title = thought.getTitle();
        this.content = thought.getContent();
        this.category = thought.getCategory();
        this.isAnonymous = thought.isAnonymous();
        this.createdAt = thought.getCreatedAt();
        this.updatedAt = thought.getUpdatedAt();

        if (thought.isAnonymous()) {
            this.authorUsername = "Anonymous";
            this.authorFirstName = "Anonymous";
            this.authorLastName = "";
        } else if (thought.getAuthor() != null) {
            this.authorUsername = thought.getAuthor().getUsername();
            if (thought.getAuthor().getProfile() != null) {
                this.authorFirstName = thought.getAuthor().getProfile().getFirstName();
                this.authorLastName = thought.getAuthor().getProfile().getLastName();
            } else {
                this.authorFirstName = thought.getAuthor().getUsername(); // Fallback
                this.authorLastName = "";
            }
        } else {
            this.authorUsername = "Unknown";
            this.authorFirstName = "Unknown";
            this.authorLastName = "";
        }
    }
}
