package com.campusconnect.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class LibraryInfoResponse {
    private String openingHours;
    private String contactEmail;
    private String websiteUrl;
    private String location;
    private String availableResourcesSummary;
}
