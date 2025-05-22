package com.campusconnect.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Collection;
import org.springframework.security.core.GrantedAuthority;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserLoginResponse {
    private String username;
    private String role; // Store a single primary role, or List<String> for multiple roles
    // private String token; // Placeholder for JWT if implemented later

    // Constructor to simplify creation from UserDetails
    public UserLoginResponse(String username, Collection<? extends GrantedAuthority> authorities) {
        this.username = username;
        if (authorities != null && !authorities.isEmpty()) {
            // Assuming the first authority is the primary role.
            // Roles are expected to be in "ROLE_TEACHER", "ROLE_STUDENT" format from UserDetailsServiceImpl
            GrantedAuthority auth = authorities.iterator().next();
            this.role = auth.getAuthority(); 
        } else {
            this.role = "N/A"; // Default if no roles found
        }
    }
}
