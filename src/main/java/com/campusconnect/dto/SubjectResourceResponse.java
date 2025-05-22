package com.campusconnect.dto;

import com.campusconnect.model.SubjectResource;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.sql.Timestamp;

@Data
@NoArgsConstructor
public class SubjectResourceResponse {
    private Long id;
    private String title;
    private String link;
    private String description;
    private Long subjectId;
    private Timestamp createdAt;

    public SubjectResourceResponse(SubjectResource resource) {
        this.id = resource.getId();
        this.title = resource.getTitle();
        this.link = resource.getLink();
        this.description = resource.getDescription();
        this.createdAt = resource.getCreatedAt();
        if (resource.getSubject() != null) {
            this.subjectId = resource.getSubject().getId();
        }
    }
}
