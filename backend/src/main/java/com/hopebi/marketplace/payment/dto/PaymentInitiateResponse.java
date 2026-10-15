package com.hopebi.marketplace.payment.dto;

import java.math.BigDecimal;

public class PaymentInitiateResponse {
    private String orderNumber;
    private String providerOrderId;
    private BigDecimal amount;
    private String currency;
    private String paymentProvider;
    private boolean testMode;
    private String message;

    public PaymentInitiateResponse() {}

    public PaymentInitiateResponse(String orderNumber, String providerOrderId, BigDecimal amount,
                                   String currency, String paymentProvider, boolean testMode, String message) {
        this.orderNumber = orderNumber;
        this.providerOrderId = providerOrderId;
        this.amount = amount;
        this.currency = currency;
        this.paymentProvider = paymentProvider;
        this.testMode = testMode;
        this.message = message;
    }

    public String getOrderNumber() { return orderNumber; }
    public void setOrderNumber(String orderNumber) { this.orderNumber = orderNumber; }
    public String getProviderOrderId() { return providerOrderId; }
    public void setProviderOrderId(String providerOrderId) { this.providerOrderId = providerOrderId; }
    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }
    public String getCurrency() { return currency; }
    public void setCurrency(String currency) { this.currency = currency; }
    public String getPaymentProvider() { return paymentProvider; }
    public void setPaymentProvider(String paymentProvider) { this.paymentProvider = paymentProvider; }
    public boolean isTestMode() { return testMode; }
    public void setTestMode(boolean testMode) { this.testMode = testMode; }
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
}
