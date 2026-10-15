package com.hopebi.marketplace.cart.dto;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

public class CartDto {
    private Long id;
    private List<CartItemDto> items = new ArrayList<>();
    private int totalItemCount;
    private BigDecimal subtotal = BigDecimal.ZERO;
    private BigDecimal savings = BigDecimal.ZERO;
    private BigDecimal estimatedShipping = BigDecimal.ZERO;
    private BigDecimal estimatedTotal = BigDecimal.ZERO;
    private String currency = "INR";
    private boolean hasUnavailableItems;

    public CartDto() {}

    public void recalculateTotals() {
        this.totalItemCount = 0;
        this.subtotal = BigDecimal.ZERO;
        this.savings = BigDecimal.ZERO;
        this.hasUnavailableItems = false;

        for (CartItemDto item : items) {
            this.totalItemCount += item.getQuantity();
            this.subtotal = this.subtotal.add(item.getLineTotal());

            if (item.getRegularPrice().compareTo(item.getUnitPrice()) > 0) {
                BigDecimal diff = item.getRegularPrice().subtract(item.getUnitPrice());
                this.savings = this.savings.add(diff.multiply(BigDecimal.valueOf(item.getQuantity())));
            }

            if (!item.isInStock()) {
                this.hasUnavailableItems = true;
            }
        }

        // Standard Indian e-commerce shipping rule: Free delivery on orders ₹999 and above, else ₹99
        if (this.subtotal.compareTo(BigDecimal.ZERO) > 0 && this.subtotal.compareTo(BigDecimal.valueOf(999)) < 0) {
            this.estimatedShipping = BigDecimal.valueOf(99);
        } else {
            this.estimatedShipping = BigDecimal.ZERO;
        }

        this.estimatedTotal = this.subtotal.add(this.estimatedShipping);
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public List<CartItemDto> getItems() { return items; }
    public void setItems(List<CartItemDto> items) { this.items = items; }
    public int getTotalItemCount() { return totalItemCount; }
    public void setTotalItemCount(int totalItemCount) { this.totalItemCount = totalItemCount; }
    public BigDecimal getSubtotal() { return subtotal; }
    public void setSubtotal(BigDecimal subtotal) { this.subtotal = subtotal; }
    public BigDecimal getSavings() { return savings; }
    public void setSavings(BigDecimal savings) { this.savings = savings; }
    public BigDecimal getEstimatedShipping() { return estimatedShipping; }
    public void setEstimatedShipping(BigDecimal estimatedShipping) { this.estimatedShipping = estimatedShipping; }
    public BigDecimal getEstimatedTotal() { return estimatedTotal; }
    public void setEstimatedTotal(BigDecimal estimatedTotal) { this.estimatedTotal = estimatedTotal; }
    public String getCurrency() { return currency; }
    public void setCurrency(String currency) { this.currency = currency; }
    public boolean isHasUnavailableItems() { return hasUnavailableItems; }
    public void setHasUnavailableItems(boolean hasUnavailableItems) { this.hasUnavailableItems = hasUnavailableItems; }
}
