package com.hopebi.marketplace.auth.dto;

public class OtpResponse {
    private String phone;
    private String message;
    private String otp; // returned for development/simulation ease
    private boolean isExistingUser;

    public OtpResponse() {}

    public OtpResponse(String phone, String message, String otp, boolean isExistingUser) {
        this.phone = phone;
        this.message = message;
        this.otp = otp;
        this.isExistingUser = isExistingUser;
    }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
    public String getOtp() { return otp; }
    public void setOtp(String otp) { this.otp = otp; }
    public boolean isExistingUser() { return isExistingUser; }
    public void setExistingUser(boolean existingUser) { isExistingUser = existingUser; }
}
