package com.campusconnect.controller;

import com.campusconnect.dto.LibraryInfoResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/library")
public class LibraryInfoController {

    @GetMapping("/info")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<LibraryInfoResponse> getLibraryInfo() {
        // Hardcoded library information
        LibraryInfoResponse info = new LibraryInfoResponse(
            "Mon-Fri: 9 AM - 10 PM, Sat-Sun: 10 AM - 6 PM",
            "library@campusconnect.edu",
            "http://library.campusconnect.edu",
            "Main Campus, Building A, 2nd Floor",
            "Books, Journals, Digital Archives, Study Spaces, Computer Labs"
        );
        return ResponseEntity.ok(info);
    }
}
