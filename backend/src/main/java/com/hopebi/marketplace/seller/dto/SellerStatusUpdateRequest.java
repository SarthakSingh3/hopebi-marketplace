package com.hopebi.marketplace.seller.dto;

import com.hopebi.marketplace.seller.SellerStatus;
import com.hopebi.marketplace.seller.SellerVerificationStatus;
import jakarta.validation.constraints.NotNull;

public class SellerStatusUpdateRequest {

    @NotNull(message = "Seller status is required")
    private SellerStatus status;

    private SellerVerificationStatus verificationStatus;
    private String reason;
    private Double commissionRate;

    public SellerStatusUpdateRequest() {}

    public SellerStatus getStatus() { return status; }
    public void setStatus(SellerStatus status) { this.status = status; }
    public SellerVerificationStatus getVerificationStatus() { return verificationStatus; }
    public void setVerificationStatus(SellerVerificationStatus verificationStatus) { this.verificationStatus = verificationStatus; }
    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }
    public Double getCommissionRate() { return commissionRate; }
    public void setCommissionRate(Double commissionRate) { this.commissionRate = commissionRate; }
}
