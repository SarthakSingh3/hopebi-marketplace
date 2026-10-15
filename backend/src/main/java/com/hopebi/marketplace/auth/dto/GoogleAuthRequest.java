package com.hopebi.marketplace.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public class GoogleAuthRequest {

    @NotBlank(message = "Email is required")
    @Email(message = "Valid email is required")
    private String email;

    private String name;

    private String photoUrl;

    private String idToken;
    private String password;
    private com.hopebi.marketplace.user.Role role;

    public GoogleAuthRequest() {}

    public GoogleAuthRequest(String email, String name, String photoUrl, String idToken) {
        this.email = email;
        this.name = name;
        this.photoUrl = photoUrl;
        this.idToken = idToken;
    }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getPhotoUrl() { return photoUrl; }
    public void setPhotoUrl(String photoUrl) { this.photoUrl = photoUrl; }
    public String getIdToken() { return idToken; }
    public void setIdToken(String idToken) { this.idToken = idToken; }
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
    public com.hopebi.marketplace.user.Role getRole() { return role; }
    public void setRole(com.hopebi.marketplace.user.Role role) { this.role = role; }
}
