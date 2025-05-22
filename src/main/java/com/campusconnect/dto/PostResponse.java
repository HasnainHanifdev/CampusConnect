package com.campusconnect.dto;

import com.campusconnect.model.Post;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.sql.Timestamp;

@Data
@NoArgsConstructor
public class PostResponse {
    private Long id;
    private String content;
    private String authorUsername;
    private String authorFirstName; // Added
    private String authorLastName;  // Added
    private Timestamp createdAt;
    private Timestamp updatedAt;

    public PostResponse(Post post) {
        this.id = post.getId();
        this.content = post.getContent();
        this.createdAt = post.getCreatedAt();
        this.updatedAt = post.getUpdatedAt();

        if (post.getAuthor() != null) {
            this.authorUsername = post.getAuthor().getUsername();
            if (post.getAuthor().getProfile() != null) {
                this.authorFirstName = post.getAuthor().getProfile().getFirstName();
                this.authorLastName = post.getAuthor().getProfile().getLastName();
            } else {
                // Fallback if profile is not set or not loaded
                this.authorFirstName = post.getAuthor().getUsername(); // Default to username
                this.authorLastName = "";
            }
        } else {
            this.authorUsername = "Unknown";
            this.authorFirstName = "Unknown";
            this.authorLastName = "";
        }
    }
}
