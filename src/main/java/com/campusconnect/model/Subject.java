package com.campusconnect.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.sql.Timestamp;

@Entity
@Table(name = "subjects")
@Data
@NoArgsConstructor
public class Subject {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String name;

    @Lob
    private String description;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "teacher_id", nullable = false)
    private User teacher;

    @CreationTimestamp
    @Column(updatable = false)
    private Timestamp createdAt;

    @UpdateTimestamp
    private Timestamp updatedAt;

    @Lob
    @Column(columnDefinition = "TEXT")
    private String classSchedule;

    @Lob
    @Column(columnDefinition = "TEXT")
    private String lectureOutlines;

    @Lob
    @Column(columnDefinition = "TEXT")
    private String gradingSystem;

    @OneToMany(mappedBy = "subject", cascade = CascadeType.ALL, orphanRemoval = true)
    private java.util.List<SubjectResource> resources = new java.util.ArrayList<>();


    public Subject(String name, String description, User teacher) {
        this.name = name;
        this.description = description;
        this.teacher = teacher;
    }
}
