package com.hopebi.marketplace.shipping.dto;

import jakarta.validation.constraints.NotBlank;

public class DispatchOrderItemRequest {

    @NotBlank(message = "Carrier is required (e.g. Delhivery, Blue Dart, India Post)")
    private String carrier;

    @NotBlank(message = "Tracking number is required")
    private String trackingNumber;

    public DispatchOrderItemRequest() {}

    public String getCarrier() { return carrier; }
    public void setCarrier(String carrier) { this.carrier = carrier; }
    public String getTrackingNumber() { return trackingNumber; }
    public void setTrackingNumber(String trackingNumber) { this.trackingNumber = trackingNumber; }
}
