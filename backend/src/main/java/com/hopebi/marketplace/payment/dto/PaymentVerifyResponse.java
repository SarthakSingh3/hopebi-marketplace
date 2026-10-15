package com.hopebi.marketplace.payment.dto;

import com.hopebi.marketplace.order.OrderStatus;
import com.hopebi.marketplace.order.PaymentStatus;

public class PaymentVerifyResponse {
    private boolean verified;
    private String orderNumber;
    private PaymentStatus paymentStatus;
    private OrderStatus orderStatus;
    private String transactionId;
    private String message;

    public PaymentVerifyResponse() {}

    public PaymentVerifyResponse(boolean verified, String orderNumber, PaymentStatus paymentStatus,
                                 OrderStatus orderStatus, String transactionId, String message) {
        this.verified = verified;
        this.orderNumber = orderNumber;
        this.paymentStatus = paymentStatus;
        this.orderStatus = orderStatus;
        this.transactionId = transactionId;
        this.message = message;
    }

    public boolean isVerified() { return verified; }
    public void setVerified(boolean verified) { this.verified = verified; }
    public String getOrderNumber() { return orderNumber; }
    public void setOrderNumber(String orderNumber) { this.orderNumber = orderNumber; }
    public PaymentStatus getPaymentStatus() { return paymentStatus; }
    public void setPaymentStatus(PaymentStatus paymentStatus) { this.paymentStatus = paymentStatus; }
    public OrderStatus getOrderStatus() { return orderStatus; }
    public void setOrderStatus(OrderStatus orderStatus) { this.orderStatus = orderStatus; }
    public String getTransactionId() { return transactionId; }
    public void setTransactionId(String transactionId) { this.transactionId = transactionId; }
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
}
