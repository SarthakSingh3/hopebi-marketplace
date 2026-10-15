package com.hopebi.marketplace.auth.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public class OtpSendRequest {

    @NotBlank(message = "Phone number is required")
    @jakarta.validation.constraints.Size(min = 10, max = 20, message = "Please enter a valid phone number")
    private String phone;

    public OtpSendRequest() {}

    public OtpSendRequest(String phone) {
        this.phone = phone;
    }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }
}
