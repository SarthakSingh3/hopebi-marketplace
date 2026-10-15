package com.hopebi.marketplace.product;

import com.hopebi.marketplace.category.Category;
import com.hopebi.marketplace.seller.SellerProfile;
import jakarta.persistence.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "products", indexes = {
    @Index(name = "idx_product_slug", columnList = "slug", unique = true),
    @Index(name = "idx_product_sku", columnList = "sku"),
    @Index(name = "idx_product_pub_appr", columnList = "publication_status, approval_status")
})
@EntityListeners(AuditingEntityListener.class)
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "seller_id", nullable = false)
    private SellerProfile seller;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id", nullable = false)
    private Category category;

    @Column(nullable = false, length = 200)
    private String name;

    @Column(nullable = false, unique = true, length = 220)
    private String slug;

    @Column(nullable = false, length = 80)
    private String sku;

    @Column(length = 500)
    private String shortDescription;

    @Column(columnDefinition = "TEXT")
    private String fullDescription;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal regularPrice;

    @Column(precision = 12, scale = 2)
    private BigDecimal salePrice;

    @Column(nullable = false, length = 10)
    private String currency = "INR";

    @Column(nullable = false)
    private int stockQuantity = 0;

    @Enumerated(EnumType.STRING)
    @Column(name = "publication_status", nullable = false, length = 30)
    private ProductStatus productStatus = ProductStatus.DRAFT;

    @Enumerated(EnumType.STRING)
    @Column(name = "approval_status", nullable = false, length = 30)
    private ProductApprovalStatus approvalStatus = ProductApprovalStatus.PENDING;

    @Column(length = 200)
    private String materials;

    @Column(length = 100)
    private String dimensions;

    private Integer weightGrams;

    @Column(length = 500)
    private String returnPolicy = "7-day easy returns if damaged or defective on arrival.";

    @Column(length = 150)
    private String originCityState;

    @Column(length = 300)
    private String verifiedClaims;

    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("displayOrder ASC")
    private List<ProductImage> images = new ArrayList<>();

    @CreatedDate
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(nullable = false)
    private LocalDateTime updatedAt;

    public Product() {}

    public Product(SellerProfile seller, Category category, String name, String slug, String sku,
                   String shortDescription, String fullDescription, BigDecimal regularPrice,
                   BigDecimal salePrice, int stockQuantity, String materials,
                   String originCityState, String verifiedClaims) {
        this.seller = seller;
        this.category = category;
        this.name = name;
        this.slug = slug;
        this.sku = sku;
        this.shortDescription = shortDescription;
        this.fullDescription = fullDescription;
        this.regularPrice = regularPrice;
        this.salePrice = salePrice;
        this.stockQuantity = stockQuantity;
        this.materials = materials;
        this.originCityState = originCityState;
        this.verifiedClaims = verifiedClaims;
        this.currency = "INR";
        this.productStatus = ProductStatus.DRAFT;
        this.approvalStatus = ProductApprovalStatus.PENDING;
    }

    public BigDecimal getEffectivePrice() {
        if (salePrice != null && salePrice.compareTo(BigDecimal.ZERO) > 0 && salePrice.compareTo(regularPrice) < 0) {
            return salePrice;
        }
        return regularPrice;
    }

    public boolean isInStock() {
        return stockQuantity > 0;
    }

    public void addImage(ProductImage image) {
        images.add(image);
        image.setProduct(this);
    }

    public void removeImage(ProductImage image) {
        images.remove(image);
        image.setProduct(null);
    }

    public String getPrimaryImageUrl() {
        if (images != null && !images.isEmpty()) {
            return images.stream()
                    .filter(ProductImage::isPrimary)
                    .map(ProductImage::getImageUrl)
                    .findFirst()
                    .orElse(images.get(0).getImageUrl());
        }
        return null;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public SellerProfile getSeller() { return seller; }
    public void setSeller(SellerProfile seller) { this.seller = seller; }
    public Category getCategory() { return category; }
    public void setCategory(Category category) { this.category = category; }
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
    public String getCurrency() { return currency; }
    public void setCurrency(String currency) { this.currency = currency; }
    public int getStockQuantity() { return stockQuantity; }
    public void setStockQuantity(int stockQuantity) { this.stockQuantity = stockQuantity; }
    public ProductStatus getProductStatus() { return productStatus; }
    public void setProductStatus(ProductStatus productStatus) { this.productStatus = productStatus; }
    public ProductApprovalStatus getApprovalStatus() { return approvalStatus; }
    public void setApprovalStatus(ProductApprovalStatus approvalStatus) { this.approvalStatus = approvalStatus; }
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
    public List<ProductImage> getImages() { return images; }
    public void setImages(List<ProductImage> images) { this.images = images; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
