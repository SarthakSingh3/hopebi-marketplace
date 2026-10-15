package com.hopebi.marketplace.auth.dto;

import com.hopebi.marketplace.user.Role;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public class OtpVerifyRequest {

    @NotBlank(message = "Phone number is required")
    @jakarta.validation.constraints.Size(min = 10, max = 20, message = "Please enter a valid phone number")
    private String phone;

    @NotBlank(message = "OTP code is required")
    private String otp;

    private String name;

    private Role role = Role.ROLE_CUSTOMER;

    public OtpVerifyRequest() {}

    public OtpVerifyRequest(String phone, String otp, String name, Role role) {
        this.phone = phone;
        this.otp = otp;
        this.name = name;
        this.role = role != null ? role : Role.ROLE_CUSTOMER;
    }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getOtp() { return otp; }
    public void setOtp(String otp) { this.otp = otp; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public Role getRole() { return role; }
    public void setRole(Role role) { this.role = role; }
}
