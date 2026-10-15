package com.hopebi.marketplace.cart.dto;

import com.hopebi.marketplace.cart.CartItem;
import com.hopebi.marketplace.product.Product;
import com.hopebi.marketplace.product.ProductImage;

import java.math.BigDecimal;

public class CartItemDto {
    private Long id;
    private Long productId;
    private String productName;
    private String productSlug;
    private String sku;
    private String primaryImageUrl;
    private BigDecimal unitPrice;
    private BigDecimal regularPrice;
    private int quantity;
    private BigDecimal lineTotal;
    private int availableStock;
    private boolean inStock;
    private String sellerName;
    private String sellerSlug;

    public CartItemDto() {}

    public CartItemDto(CartItem item) {
        this.id = item.getId();
        Product product = item.getProduct();
        this.productId = product.getId();
        this.productName = product.getName();
        this.productSlug = product.getSlug();
        this.sku = product.getSku();
        this.unitPrice = product.getEffectivePrice();
        this.regularPrice = product.getRegularPrice();
        this.quantity = item.getQuantity();
        this.lineTotal = this.unitPrice.multiply(BigDecimal.valueOf(item.getQuantity()));
        this.availableStock = product.getStockQuantity();
        this.inStock = product.isInStock() && product.getStockQuantity() >= item.getQuantity();

        if (product.getSeller() != null) {
            this.sellerName = product.getSeller().getCompanyName();
            this.sellerSlug = product.getSeller().getSlug();
        }

        if (product.getImages() != null && !product.getImages().isEmpty()) {
            this.primaryImageUrl = product.getImages().stream()
                    .filter(ProductImage::isPrimary)
                    .findFirst()
                    .map(ProductImage::getImageUrl)
                    .orElse(product.getImages().get(0).getImageUrl());
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
    public String getPrimaryImageUrl() { return primaryImageUrl; }
    public void setPrimaryImageUrl(String primaryImageUrl) { this.primaryImageUrl = primaryImageUrl; }
    public BigDecimal getUnitPrice() { return unitPrice; }
    public void setUnitPrice(BigDecimal unitPrice) { this.unitPrice = unitPrice; }
    public BigDecimal getRegularPrice() { return regularPrice; }
    public void setRegularPrice(BigDecimal regularPrice) { this.regularPrice = regularPrice; }
    public int getQuantity() { return quantity; }
    public void setQuantity(int quantity) { this.quantity = quantity; }
    public BigDecimal getLineTotal() { return lineTotal; }
    public void setLineTotal(BigDecimal lineTotal) { this.lineTotal = lineTotal; }
    public int getAvailableStock() { return availableStock; }
    public void setAvailableStock(int availableStock) { this.availableStock = availableStock; }
    public boolean isInStock() { return inStock; }
    public void setInStock(boolean inStock) { this.inStock = inStock; }
    public String getSellerName() { return sellerName; }
    public void setSellerName(String sellerName) { this.sellerName = sellerName; }
    public String getSellerSlug() { return sellerSlug; }
    public void setSellerSlug(String sellerSlug) { this.sellerSlug = sellerSlug; }
}
