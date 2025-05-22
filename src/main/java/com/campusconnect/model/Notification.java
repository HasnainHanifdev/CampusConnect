package com.campusconnect.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.sql.Timestamp;

@Entity
@Table(name = "notifications")
@Data
@NoArgsConstructor
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user; // Recipient

    @Column(nullable = false, length = 1024)
    private String message;

    @Column(nullable = false)
    private boolean isRead = false;

    @Column(nullable = false)
    private String type; // E.g., NEW_POST_IN_SUBJECT, EVENT_UPDATE, GENERAL_ANNOUNCEMENT

    private Long relatedEntityId; // E.g., ID of the post, event, or subject

    @CreationTimestamp
    @Column(updatable = false)
    private Timestamp createdAt;

    public Notification(User user, String message, String type, Long relatedEntityId) {
        this.user = user;
        this.message = message;
        this.type = type;
        this.relatedEntityId = relatedEntityId;
        this.isRead = false;
    }
}
