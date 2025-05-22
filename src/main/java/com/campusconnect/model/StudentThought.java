package com.campusconnect.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.sql.Timestamp;

@Entity
@Table(name = "student_thoughts")
@Data
@NoArgsConstructor
public class StudentThought {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "author_id", nullable = false)
    private User author;

    @Column(nullable = false, length = 255)
    private String title;

    @Lob
    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;

    @Column(nullable = false, length = 100)
    private String category; // E.g., "Academic", "Campus Life", "Suggestions", "Problems"

    @Column(nullable = false)
    private boolean isAnonymous = false;

    @CreationTimestamp
    @Column(updatable = false)
    private Timestamp createdAt;

    @UpdateTimestamp
    private Timestamp updatedAt;

    public StudentThought(User author, String title, String content, String category, boolean isAnonymous) {
        this.author = author;
        this.title = title;
        this.content = content;
        this.category = category;
        this.isAnonymous = isAnonymous;
    }
}
