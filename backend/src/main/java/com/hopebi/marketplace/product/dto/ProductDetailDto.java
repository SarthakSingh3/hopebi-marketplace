package com.hopebi.marketplace.product.dto;

import com.hopebi.marketplace.product.Product;
import com.hopebi.marketplace.seller.dto.SellerPublicDto;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

public class ProductDetailDto {
    private Long id;
    private String name;
    private String slug;
    private String sku;
    private String shortDescription;
    private String fullDescription;
    private BigDecimal regularPrice;
    private BigDecimal salePrice;
    private BigDecimal effectivePrice;
    private Integer discountPercentage;
    private String currency;
    private int stockQuantity;
    private boolean inStock;
    private String materials;
    private String dimensions;
    private Integer weightGrams;
    private String returnPolicy;
    private String originCityState;
    private String verifiedClaims;
    private List<ProductImageDto> images;
    private SellerPublicDto seller;
    private String categoryName;
    private String categorySlug;
    private LocalDateTime createdAt;

    public ProductDetailDto() {}

    public ProductDetailDto(Product product) {
        this.id = product.getId();
        this.name = product.getName();
        this.slug = product.getSlug();
        this.sku = product.getSku();
        this.shortDescription = product.getShortDescription();
        this.fullDescription = product.getFullDescription();
        this.regularPrice = product.getRegularPrice();
        this.salePrice = product.getSalePrice();
        this.effectivePrice = product.getEffectivePrice();
        this.currency = product.getCurrency();
        this.stockQuantity = product.getStockQuantity();
        this.inStock = product.isInStock();
        this.materials = product.getMaterials();
        this.dimensions = product.getDimensions();
        this.weightGrams = product.getWeightGrams();
        this.returnPolicy = product.getReturnPolicy();
        this.originCityState = product.getOriginCityState();
        this.verifiedClaims = product.getVerifiedClaims();
        this.createdAt = product.getCreatedAt();

        if (product.getSalePrice() != null && product.getSalePrice().compareTo(BigDecimal.ZERO) > 0
                && product.getSalePrice().compareTo(product.getRegularPrice()) < 0) {
            BigDecimal diff = product.getRegularPrice().subtract(product.getSalePrice());
            BigDecimal pct = diff.divide(product.getRegularPrice(), 2, RoundingMode.HALF_UP).multiply(BigDecimal.valueOf(100));
            this.discountPercentage = pct.intValue();
        }

        if (product.getImages() != null) {
            this.images = product.getImages().stream().map(ProductImageDto::new).collect(Collectors.toList());
        }

        if (product.getSeller() != null) {
            this.seller = new SellerPublicDto(product.getSeller());
        }

        if (product.getCategory() != null) {
            this.categoryName = product.getCategory().getName();
            this.categorySlug = product.getCategory().getSlug();
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
    public String getFullDescription() { return fullDescription; }
    public void setFullDescription(String fullDescription) { this.fullDescription = fullDescription; }
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
    public String getMaterials() { return materials; }
    public void setMaterials(String materials) { this.materials = materials; }
    public String getDimensions() { return dimensions; }
    public void setDimensions(String dimensions) { this.dimensions = dimensions; }
    public Integer getWeightGrams() { return weightGrams; }
    public void setWeightGrams(Integer weightGrams) { this.weightGrams = weightGrams; }
    public String getReturnPolicy() { return returnPolicy; }
    public void setReturnPolicy(String returnPolicy) { this.returnPolicy = returnPolicy; }
    public String getOriginCityState() { return originCityState; }
    public void setOriginCityState(String originCityState) { this.originCityState = originCityState; }
    public String getVerifiedClaims() { return verifiedClaims; }
    public void setVerifiedClaims(String verifiedClaims) { this.verifiedClaims = verifiedClaims; }
    public List<ProductImageDto> getImages() { return images; }
    public void setImages(List<ProductImageDto> images) { this.images = images; }
    public SellerPublicDto getSeller() { return seller; }
    public void setSeller(SellerPublicDto seller) { this.seller = seller; }
    public String getCategoryName() { return categoryName; }
    public void setCategoryName(String categoryName) { this.categoryName = categoryName; }
    public String getCategorySlug() { return categorySlug; }
    public void setCategorySlug(String categorySlug) { this.categorySlug = categorySlug; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
