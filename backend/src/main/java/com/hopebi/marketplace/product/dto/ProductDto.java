package com.hopebi.marketplace.product.dto;

import com.hopebi.marketplace.product.Product;
import com.hopebi.marketplace.product.ProductImage;

import java.math.BigDecimal;
import java.math.RoundingMode;

public class ProductDto {
    private Long id;
    private String name;
    private String slug;
    private String sku;
    private String shortDescription;
    private BigDecimal regularPrice;
    private BigDecimal salePrice;
    private BigDecimal effectivePrice;
    private Integer discountPercentage;
    private String currency;
    private int stockQuantity;
    private boolean inStock;
    private String primaryImageUrl;
    private String sellerName;
    private String sellerSlug;
    private String sellerCity;
    private String sellerState;
    private String categoryName;
    private String categorySlug;
    private String originCityState;
    private String verifiedClaims;

    public ProductDto() {}

    public ProductDto(Product product) {
        this.id = product.getId();
        this.name = product.getName();
        this.slug = product.getSlug();
        this.sku = product.getSku();
        this.shortDescription = product.getShortDescription();
        this.regularPrice = product.getRegularPrice();
        this.salePrice = product.getSalePrice();
        this.effectivePrice = product.getEffectivePrice();
        this.currency = product.getCurrency();
        this.stockQuantity = product.getStockQuantity();
        this.inStock = product.isInStock();
        this.originCityState = product.getOriginCityState();
        this.verifiedClaims = product.getVerifiedClaims();

        if (product.getSalePrice() != null && product.getSalePrice().compareTo(BigDecimal.ZERO) > 0
                && product.getSalePrice().compareTo(product.getRegularPrice()) < 0) {
            BigDecimal diff = product.getRegularPrice().subtract(product.getSalePrice());
            BigDecimal pct = diff.divide(product.getRegularPrice(), 2, RoundingMode.HALF_UP).multiply(BigDecimal.valueOf(100));
            this.discountPercentage = pct.intValue();
        }

        if (product.getSeller() != null) {
            this.sellerName = product.getSeller().getCompanyName();
            this.sellerSlug = product.getSeller().getSlug();
            this.sellerCity = product.getSeller().getCity();
            this.sellerState = product.getSeller().getState();
        }

        if (product.getCategory() != null) {
            this.categoryName = product.getCategory().getName();
            this.categorySlug = product.getCategory().getSlug();
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
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getSlug() { return slug; }
    public void setSlug(String slug) { this.slug = slug; }
    public String getSku() { return sku; }
    public void setSku(String sku) { this.sku = sku; }
    public String getShortDescription() { return shortDescription; }
    public void setShortDescription(String shortDescription) { this.shortDescription = shortDescription; }
    public BigDecimal getRegularPrice() { return regularPrice; }
    public void setRegularPrice(BigDecimal regularPrice) { this.regularPrice = regularPrice; }
    public BigDecimal getSalePrice() { return salePrice; }
    public void setSalePrice(BigDecimal salePrice) { this.salePrice = salePrice; }
    public BigDecimal getEffectivePrice() { return effectivePrice; }
    public void setEffectivePrice(BigDecimal effectivePrice) { this.effectivePrice = effectivePrice; }
    public Integer getDiscountPercentage() { return discountPercentage; }
    public void setDiscountPercentage(Integer discountPercentage) { this.discountPercentage = discountPercentage; }
    public String getCurrency() { return currency; }
    public void setCurrency(String currency) { this.currency = currency; }
    public int getStockQuantity() { return stockQuantity; }
    public void setStockQuantity(int stockQuantity) { this.stockQuantity = stockQuantity; }
    public boolean isInStock() { return inStock; }
    public void setInStock(boolean inStock) { this.inStock = inStock; }
    public String getPrimaryImageUrl() { return primaryImageUrl; }
    public void setPrimaryImageUrl(String primaryImageUrl) { this.primaryImageUrl = primaryImageUrl; }
    public String getSellerName() { return sellerName; }
    public void setSellerName(String sellerName) { this.sellerName = sellerName; }
    public String getSellerSlug() { return sellerSlug; }
    public void setSellerSlug(String sellerSlug) { this.sellerSlug = sellerSlug; }
    public String getSellerCity() { return sellerCity; }
    public void setSellerCity(String sellerCity) { this.sellerCity = sellerCity; }
    public String getSellerState() { return sellerState; }
    public void setSellerState(String sellerState) { this.sellerState = sellerState; }
    public String getCategoryName() { return categoryName; }
    public void setCategoryName(String categoryName) { this.categoryName = categoryName; }
    public String getCategorySlug() { return categorySlug; }
    public void setCategorySlug(String categorySlug) { this.categorySlug = categorySlug; }
    public String getOriginCityState() { return originCityState; }
    public void setOriginCityState(String originCityState) { this.originCityState = originCityState; }
    public String getVerifiedClaims() { return verifiedClaims; }
    public void setVerifiedClaims(String verifiedClaims) { this.verifiedClaims = verifiedClaims; }
}
