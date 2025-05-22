package com.campusconnect.controller;

import com.campusconnect.dto.SubjectRequest;
import com.campusconnect.dto.SubjectResponse;
import com.campusconnect.service.SubjectService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/subjects")
public class SubjectController {

    @Autowired
    private SubjectService subjectService;

    @PostMapping
    @PreAuthorize("hasRole('TEACHER')")
    public ResponseEntity<SubjectResponse> createSubject(@RequestBody SubjectRequest subjectRequest) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String teacherUsername = authentication.getName();
        SubjectResponse createdSubject = subjectService.createSubject(subjectRequest, teacherUsername);
        return new ResponseEntity<>(createdSubject, HttpStatus.CREATED);
    }

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<SubjectResponse>> getAllSubjects() {
        List<SubjectResponse> subjects = subjectService.getAllSubjects();
        return ResponseEntity.ok(subjects);
    }

    @GetMapping("/{subjectId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<SubjectResponse> getSubjectById(@PathVariable Long subjectId) {
        SubjectResponse subject = subjectService.getSubjectById(subjectId);
        return ResponseEntity.ok(subject);
    }

    @GetMapping("/teacher/my-subjects")
    @PreAuthorize("hasRole('TEACHER')")
    public ResponseEntity<List<SubjectResponse>> getMySubjects() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String teacherUsername = authentication.getName();
        List<SubjectResponse> subjects = subjectService.getSubjectsByTeacher(teacherUsername);
        return ResponseEntity.ok(subjects);
    }

    @PutMapping("/{subjectId}")
    @PreAuthorize("hasRole('TEACHER')")
    public ResponseEntity<SubjectResponse> updateSubject(@PathVariable Long subjectId,
                                                         @RequestBody SubjectRequest subjectRequest) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String teacherUsername = authentication.getName();
        SubjectResponse updatedSubject = subjectService.updateSubject(subjectId, subjectRequest, teacherUsername);
        return ResponseEntity.ok(updatedSubject);
    }

    @DeleteMapping("/{subjectId}")
    @PreAuthorize("hasRole('TEACHER')")
    public ResponseEntity<Void> deleteSubject(@PathVariable Long subjectId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String teacherUsername = authentication.getName();
        subjectService.deleteSubject(subjectId, teacherUsername);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{subjectId}/details")
    @PreAuthorize("hasRole('TEACHER')")
    public ResponseEntity<SubjectResponse> updateSubjectDetails(@PathVariable Long subjectId,
                                                                @RequestBody com.campusconnect.dto.SubjectDetailUpdateRequest detailRequest) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String teacherUsername = authentication.getName();
        SubjectResponse updatedSubject = subjectService.updateSubjectDetails(subjectId, detailRequest, teacherUsername);
        return ResponseEntity.ok(updatedSubject);
    }
}
