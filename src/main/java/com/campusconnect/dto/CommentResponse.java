package com.campusconnect.dto;

import com.campusconnect.model.Comment;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.sql.Timestamp;

@Data
@NoArgsConstructor
public class CommentResponse {
    private Long id;
    private String content;
    private Long postId;
    private String authorUsername;
    private String authorFirstName;
    private String authorLastName;
    private Timestamp createdAt;
    private Timestamp updatedAt;

    public CommentResponse(Comment comment) {
        this.id = comment.getId();
        this.content = comment.getContent();
        this.createdAt = comment.getCreatedAt();
        this.updatedAt = comment.getUpdatedAt();

        if (comment.getPost() != null) {
            this.postId = comment.getPost().getId();
        }

        if (comment.getAuthor() != null) {
            this.authorUsername = comment.getAuthor().getUsername();
            if (comment.getAuthor().getProfile() != null) {
                this.authorFirstName = comment.getAuthor().getProfile().getFirstName();
                this.authorLastName = comment.getAuthor().getProfile().getLastName();
            } else {
                // Fallback if profile is not set or not loaded
                this.authorFirstName = comment.getAuthor().getUsername(); // Default to username
                this.authorLastName = "";
            }
        } else {
            this.authorUsername = "Unknown";
            this.authorFirstName = "Unknown";
            this.authorLastName = "";
        }
    }
}
