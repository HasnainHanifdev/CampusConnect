package com.campusconnect.controller;

import com.campusconnect.model.Notification; // Direct model usage for response is fine for now
import com.campusconnect.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

// Simple DTO for response to avoid exposing full User entity if needed later
// For now, we'll map to a simplified NotificationResponse DTO
@lombok.Data
@lombok.NoArgsConstructor
@lombok.AllArgsConstructor
class NotificationResponse {
    private Long id;
    private String message;
    private boolean isRead;
    private String type;
    private Long relatedEntityId;
    private java.sql.Timestamp createdAt;

    public NotificationResponse(Notification notification) {
        this.id = notification.getId();
        this.message = notification.getMessage();
        this.isRead = notification.isRead();
        this.type = notification.getType();
        this.relatedEntityId = notification.getRelatedEntityId();
        this.createdAt = notification.getCreatedAt();
    }
}


@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    @Autowired
    private NotificationService notificationService;

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<NotificationResponse>> getMyNotifications() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        List<Notification> notifications = notificationService.getNotificationsForUser(username);
        List<NotificationResponse> response = notifications.stream()
                                                     .map(NotificationResponse::new)
                                                     .collect(Collectors.toList());
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{notificationId}/read")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<NotificationResponse> markNotificationAsRead(@PathVariable Long notificationId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        Notification notification = notificationService.markNotificationAsRead(notificationId, username);
        return ResponseEntity.ok(new NotificationResponse(notification));
    }

    @PutMapping("/read-all")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<String> markAllNotificationsAsRead() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        int updatedCount = notificationService.markAllNotificationsAsRead(username);
        return ResponseEntity.ok(updatedCount + " notifications marked as read.");
    }
}
