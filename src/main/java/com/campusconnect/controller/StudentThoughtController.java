package com.campusconnect.controller;

import com.campusconnect.dto.StudentThoughtRequest;
import com.campusconnect.dto.StudentThoughtResponse;
import com.campusconnect.service.StudentThoughtService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/student-thoughts")
public class StudentThoughtController {

    @Autowired
    private StudentThoughtService studentThoughtService;

    @PostMapping
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<StudentThoughtResponse> createThought(@RequestBody StudentThoughtRequest request) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        StudentThoughtResponse createdThought = studentThoughtService.createThought(request, username);
        return new ResponseEntity<>(createdThought, HttpStatus.CREATED);
    }

    @GetMapping
    @PreAuthorize("isAuthenticated()") // All authenticated users can view thoughts
    public ResponseEntity<List<StudentThoughtResponse>> getAllThoughts() {
        List<StudentThoughtResponse> thoughts = studentThoughtService.getAllThoughts();
        return ResponseEntity.ok(thoughts);
    }

    @GetMapping("/category/{category}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<StudentThoughtResponse>> getThoughtsByCategory(@PathVariable String category) {
        List<StudentThoughtResponse> thoughts = studentThoughtService.getThoughtsByCategory(category);
        return ResponseEntity.ok(thoughts);
    }
    
    @GetMapping("/my-thoughts")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<List<StudentThoughtResponse>> getMyThoughts() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        List<StudentThoughtResponse> thoughts = studentThoughtService.getThoughtsByAuthor(username);
        return ResponseEntity.ok(thoughts);
    }


    @DeleteMapping("/{thoughtId}")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<Void> deleteThought(@PathVariable Long thoughtId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        studentThoughtService.deleteThought(thoughtId, username);
        return ResponseEntity.noContent().build();
    }
}
