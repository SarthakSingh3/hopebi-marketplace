package com.hopebi.marketplace.product.dto;

import com.hopebi.marketplace.product.ProductImage;

public class ProductImageDto {
    private Long id;
    private String imageUrl;
    private String altText;
    private int displayOrder;
    private boolean isPrimary;

    public ProductImageDto() {}

    public ProductImageDto(ProductImage image) {
        this.id = image.getId();
        this.imageUrl = image.getImageUrl();
        this.altText = image.getAltText();
        this.displayOrder = image.getDisplayOrder();
        this.isPrimary = image.isPrimary();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }
    public String getAltText() { return altText; }
    public void setAltText(String altText) { this.altText = altText; }
    public int getDisplayOrder() { return displayOrder; }
    public void setDisplayOrder(int displayOrder) { this.displayOrder = displayOrder; }
    public boolean isPrimary() { return isPrimary; }
    public void setPrimary(boolean primary) { isPrimary = primary; }
}
