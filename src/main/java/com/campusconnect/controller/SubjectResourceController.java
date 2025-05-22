package com.campusconnect.controller;

import com.campusconnect.dto.SubjectResourceRequest;
import com.campusconnect.dto.SubjectResourceResponse;
import com.campusconnect.service.SubjectService; // Assuming methods are in SubjectService
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/subjects/{subjectId}/resources")
public class SubjectResourceController {

    @Autowired
    private SubjectService subjectService; // Autowire SubjectService

    @PostMapping
    @PreAuthorize("hasRole('TEACHER')")
    public ResponseEntity<SubjectResourceResponse> addResourceToSubject(
            @PathVariable Long subjectId,
            @RequestBody SubjectResourceRequest resourceRequest) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String teacherUsername = authentication.getName();
        SubjectResourceResponse createdResource = subjectService.addResourceToSubject(subjectId, resourceRequest, teacherUsername);
        return new ResponseEntity<>(createdResource, HttpStatus.CREATED);
    }

    @DeleteMapping("/{resourceId}")
    @PreAuthorize("hasRole('TEACHER')")
    public ResponseEntity<Void> deleteResourceFromSubject(
            @PathVariable Long subjectId,
            @PathVariable Long resourceId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String teacherUsername = authentication.getName();
        subjectService.deleteResourceFromSubject(subjectId, resourceId, teacherUsername);
        return ResponseEntity.noContent().build();
    }

    @GetMapping
    @PreAuthorize("isAuthenticated()") // Students and Teachers can view resources
    public ResponseEntity<List<SubjectResourceResponse>> getResourcesForSubject(
            @PathVariable Long subjectId) {
        List<SubjectResourceResponse> resources = subjectService.getResourcesForSubject(subjectId);
        return ResponseEntity.ok(resources);
    }
}
