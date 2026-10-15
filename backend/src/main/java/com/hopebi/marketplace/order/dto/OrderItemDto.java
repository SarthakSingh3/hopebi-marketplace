package com.hopebi.marketplace.order.dto;

import com.hopebi.marketplace.order.OrderItem;
import com.hopebi.marketplace.shipping.FulfilmentStatus;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class OrderItemDto {
    private Long id;
    private Long productId;
    private String productName;
    private String productSlug;
    private String sku;
    private BigDecimal unitPrice;
    private int quantity;
    private BigDecimal lineTotal;
    private Long sellerId;
    private String sellerName;
    private String sellerSlug;
    private String productImageUrl;
    private FulfilmentStatus fulfilmentStatus;
    private String carrier;
    private String trackingNumber;
    private LocalDateTime dispatchedAt;
    private LocalDateTime deliveredAt;

    public OrderItemDto() {}

    public OrderItemDto(OrderItem item) {
        this.id = item.getId();
        this.productName = item.getProductName();
        this.sku = item.getSku();
        this.unitPrice = item.getUnitPrice();
        this.quantity = item.getQuantity();
        this.lineTotal = item.getLineTotal();
        this.fulfilmentStatus = item.getFulfilmentStatus();
        this.carrier = item.getCarrier();
        this.trackingNumber = item.getTrackingNumber();
        this.dispatchedAt = item.getDispatchedAt();
        this.deliveredAt = item.getDeliveredAt();

        if (item.getProduct() != null) {
            this.productId = item.getProduct().getId();
            this.productSlug = item.getProduct().getSlug();
            this.productImageUrl = item.getProduct().getPrimaryImageUrl();
        }

        if (item.getSeller() != null) {
            this.sellerId = item.getSeller().getId();
            this.sellerName = item.getSeller().getCompanyName();
            this.sellerSlug = item.getSeller().getSlug();
        }
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getProductId() { return productId; }
    public void setProductId(Long productId) { this.productId = productId; }
    public String getProductName() { return productName; }
    public void setProductName(String productName) { this.productName = productName; }
    public String getProductSlug() { return productSlug; }
    public void setProductSlug(String productSlug) { this.productSlug = productSlug; }
    public String getSku() { return sku; }
    public void setSku(String sku) { this.sku = sku; }
    public BigDecimal getUnitPrice() { return unitPrice; }
    public void setUnitPrice(BigDecimal unitPrice) { this.unitPrice = unitPrice; }
    public int getQuantity() { return quantity; }
    public void setQuantity(int quantity) { this.quantity = quantity; }
    public BigDecimal getLineTotal() { return lineTotal; }
    public void setLineTotal(BigDecimal lineTotal) { this.lineTotal = lineTotal; }
    public Long getSellerId() { return sellerId; }
    public void setSellerId(Long sellerId) { this.sellerId = sellerId; }
    public String getSellerName() { return sellerName; }
    public void setSellerName(String sellerName) { this.sellerName = sellerName; }
    public String getSellerSlug() { return sellerSlug; }
    public void setSellerSlug(String sellerSlug) { this.sellerSlug = sellerSlug; }
    public String getProductImageUrl() { return productImageUrl; }
    public void setProductImageUrl(String productImageUrl) { this.productImageUrl = productImageUrl; }
    public FulfilmentStatus getFulfilmentStatus() { return fulfilmentStatus; }
    public void setFulfilmentStatus(FulfilmentStatus fulfilmentStatus) { this.fulfilmentStatus = fulfilmentStatus; }
    public String getCarrier() { return carrier; }
    public void setCarrier(String carrier) { this.carrier = carrier; }
    public String getTrackingNumber() { return trackingNumber; }
    public void setTrackingNumber(String trackingNumber) { this.trackingNumber = trackingNumber; }
    public LocalDateTime getDispatchedAt() { return dispatchedAt; }
    public void setDispatchedAt(LocalDateTime dispatchedAt) { this.dispatchedAt = dispatchedAt; }
    public LocalDateTime getDeliveredAt() { return deliveredAt; }
    public void setDeliveredAt(LocalDateTime deliveredAt) { this.deliveredAt = deliveredAt; }
}
