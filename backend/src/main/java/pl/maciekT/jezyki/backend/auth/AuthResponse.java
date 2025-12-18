package pl.maciekT.jezyki.backend.auth;

import pl.maciekT.jezyki.backend.user.UserRole;

public class AuthResponse {

    private String token;
    private Long id;
    private String email;
    private UserRole role;

    public AuthResponse(String token, Long id, String email, UserRole role) {
        this.token = token;
        this.id = id;
        this.email = email;
        this.role = role;
    }

    public String getToken() {
        return token;
    }

    public Long getId() {
        return id;
    }

    public String getEmail() {
        return email;
    }

    public UserRole getRole() {
        return role;
    }
}
