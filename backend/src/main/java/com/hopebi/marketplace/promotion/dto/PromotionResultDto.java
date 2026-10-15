package com.hopebi.marketplace.promotion.dto;

import java.math.BigDecimal;

public class PromotionResultDto {
    private boolean valid;
    private String code;
    private String message;
    private BigDecimal discountAmount = BigDecimal.ZERO;
    private BigDecimal newTotal = BigDecimal.ZERO;

    public PromotionResultDto() {}

    public PromotionResultDto(boolean valid, String code, String message, BigDecimal discountAmount, BigDecimal newTotal) {
        this.valid = valid;
        this.code = code;
        this.message = message;
        this.discountAmount = discountAmount;
        this.newTotal = newTotal;
    }

    public static PromotionResultDto invalid(String code, String message) {
        return new PromotionResultDto(false, code, message, BigDecimal.ZERO, BigDecimal.ZERO);
    }

    public static PromotionResultDto valid(String code, String message, BigDecimal discountAmount, BigDecimal newTotal) {
        return new PromotionResultDto(true, code, message, discountAmount, newTotal);
    }

    public boolean isValid() { return valid; }
    public void setValid(boolean valid) { this.valid = valid; }
    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
    public BigDecimal getDiscountAmount() { return discountAmount; }
    public void setDiscountAmount(BigDecimal discountAmount) { this.discountAmount = discountAmount; }
    public BigDecimal getNewTotal() { return newTotal; }
    public void setNewTotal(BigDecimal newTotal) { this.newTotal = newTotal; }
}
