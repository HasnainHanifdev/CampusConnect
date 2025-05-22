package com.campusconnect.service;

import com.campusconnect.model.Notification;
import com.campusconnect.model.User;
import com.campusconnect.repository.NotificationRepository;
import com.campusconnect.repository.UserRepository;
import com.campusconnect.exception.ResourceNotFoundException;
import com.campusconnect.exception.UnauthorizedException;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class NotificationService {

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private UserRepository userRepository;

    @Transactional
    public Notification createNotification(User user, String message, String type, Long relatedEntityId) {
        // The user object passed here is the recipient
        if (user == null) {
            throw new IllegalArgumentException("User (recipient) cannot be null for a notification.");
        }
        Notification notification = new Notification(user, message, type, relatedEntityId);
        return notificationRepository.save(notification);
    }
    
    // Overloaded method for convenience if you have username and need to fetch user
    @Transactional
    public Notification createNotification(String username, String message, String type, Long relatedEntityId) {
        User user = userRepository.findByUsername(username)
            .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username + ", cannot create notification."));
        return createNotification(user, message, type, relatedEntityId);
    }


    @Transactional(readOnly = true)
    public List<Notification> getNotificationsForUser(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with username: " + username));
        return notificationRepository.findByUserOrderByCreatedAtDesc(user);
    }

    @Transactional
    public Notification markNotificationAsRead(Long notificationId, String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with username: " + username));

        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found with id: " + notificationId));

        if (!notification.getUser().getId().equals(user.getId())) {
            throw new UnauthorizedException("User " + username + " is not authorized to mark this notification as read.");
        }

        notification.setRead(true);
        return notificationRepository.save(notification);
    }

    @Transactional
    public int markAllNotificationsAsRead(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with username: " + username));
        
        // Using the custom query from NotificationRepository
        return notificationRepository.markAllAsReadForUser(user);
    }
}
