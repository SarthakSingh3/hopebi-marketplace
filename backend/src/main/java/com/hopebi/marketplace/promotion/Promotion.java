package com.hopebi.marketplace.promotion;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "promotions", indexes = {
    @Index(name = "idx_promotion_code", columnList = "code", unique = true)
})
public class Promotion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 50)
    private String code;

    @Column(nullable = false, length = 150)
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private PromotionType promotionType;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal discountValue;

    @Column(precision = 10, scale = 2)
    private BigDecimal minOrderValue = BigDecimal.ZERO;

    @Column(precision = 10, scale = 2)
    private BigDecimal maxDiscountAmount;

    private Integer usageLimit;

    private int timesUsed = 0;

    private LocalDateTime startsAt;

    private LocalDateTime expiresAt;

    @Column(nullable = false)
    private boolean active = true;

    public Promotion() {}

    public Promotion(String code, String description, PromotionType promotionType,
                     BigDecimal discountValue, BigDecimal minOrderValue, BigDecimal maxDiscountAmount,
                     LocalDateTime startsAt, LocalDateTime expiresAt) {
        this.code = code != null ? code.trim().toUpperCase() : null;
        this.description = description;
        this.promotionType = promotionType;
        this.discountValue = discountValue;
        this.minOrderValue = minOrderValue != null ? minOrderValue : BigDecimal.ZERO;
        this.maxDiscountAmount = maxDiscountAmount;
        this.startsAt = startsAt;
        this.expiresAt = expiresAt;
        this.active = true;
    }

    public boolean isValidFor(BigDecimal subtotal) {
        if (!active) return false;
        LocalDateTime now = LocalDateTime.now();
        if (startsAt != null && now.isBefore(startsAt)) return false;
        if (expiresAt != null && now.isAfter(expiresAt)) return false;
        if (usageLimit != null && timesUsed >= usageLimit) return false;
        return subtotal.compareTo(minOrderValue) >= 0;
    }

    public BigDecimal calculateDiscount(BigDecimal subtotal) {
        if (!isValidFor(subtotal)) return BigDecimal.ZERO;

        BigDecimal discount = BigDecimal.ZERO;
        if (promotionType == PromotionType.PERCENTAGE) {
            discount = subtotal.multiply(discountValue).divide(BigDecimal.valueOf(100), 2, java.math.RoundingMode.HALF_UP);
            if (maxDiscountAmount != null && discount.compareTo(maxDiscountAmount) > 0) {
                discount = maxDiscountAmount;
            }
        } else if (promotionType == PromotionType.FLAT_AMOUNT) {
            discount = discountValue;
        }

        if (discount.compareTo(subtotal) > 0) {
            discount = subtotal;
        }
        return discount;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getCode() { return code; }
    public void setCode(String code) { this.code = code != null ? code.trim().toUpperCase() : null; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public PromotionType getPromotionType() { return promotionType; }
    public void setPromotionType(PromotionType promotionType) { this.promotionType = promotionType; }
    public BigDecimal getDiscountValue() { return discountValue; }
    public void setDiscountValue(BigDecimal discountValue) { this.discountValue = discountValue; }
    public BigDecimal getMinOrderValue() { return minOrderValue; }
    public void setMinOrderValue(BigDecimal minOrderValue) { this.minOrderValue = minOrderValue; }
    public BigDecimal getMaxDiscountAmount() { return maxDiscountAmount; }
    public void setMaxDiscountAmount(BigDecimal maxDiscountAmount) { this.maxDiscountAmount = maxDiscountAmount; }
    public Integer getUsageLimit() { return usageLimit; }
    public void setUsageLimit(Integer usageLimit) { this.usageLimit = usageLimit; }
    public int getTimesUsed() { return timesUsed; }
    public void setTimesUsed(int timesUsed) { this.timesUsed = timesUsed; }
    public LocalDateTime getStartsAt() { return startsAt; }
    public void setStartsAt(LocalDateTime startsAt) { this.startsAt = startsAt; }
    public LocalDateTime getExpiresAt() { return expiresAt; }
    public void setExpiresAt(LocalDateTime expiresAt) { this.expiresAt = expiresAt; }
    public boolean isActive() { return active; }
    public void setActive(boolean active) { this.active = active; }
}
