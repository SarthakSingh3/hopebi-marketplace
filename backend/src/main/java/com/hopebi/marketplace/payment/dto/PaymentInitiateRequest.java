package com.hopebi.marketplace.payment.dto;

import com.hopebi.marketplace.payment.PaymentMethod;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class PaymentInitiateRequest {

    @NotBlank(message = "Order number is required")
    private String orderNumber;

    @NotNull(message = "Payment method is required")
    private PaymentMethod paymentMethod;

    public PaymentInitiateRequest() {}

    public String getOrderNumber() { return orderNumber; }
    public void setOrderNumber(String orderNumber) { this.orderNumber = orderNumber; }
    public PaymentMethod getPaymentMethod() { return paymentMethod; }
    public void setPaymentMethod(PaymentMethod paymentMethod) { this.paymentMethod = paymentMethod; }
}
