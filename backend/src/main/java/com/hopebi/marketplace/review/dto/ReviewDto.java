package com.hopebi.marketplace.review.dto;

import com.hopebi.marketplace.review.Review;

import java.time.LocalDateTime;

public class ReviewDto {
    private Long id;
    private Long productId;
    private String reviewerName;
    private int rating;
    private String title;
    private String comment;
    private boolean verifiedPurchase;
    private String imageUrl;
    private LocalDateTime createdAt;

    public ReviewDto() {}

    public ReviewDto(Review review) {
        this.id = review.getId();
        if (review.getProduct() != null) {
            this.productId = review.getProduct().getId();
        }
        if (review.getUser() != null) {
            this.reviewerName = review.getUser().getFullName();
        }
        this.rating = review.getRating();
        this.title = review.getTitle();
        this.comment = review.getComment();
        this.verifiedPurchase = review.isVerifiedPurchase();
        this.imageUrl = review.getImageUrl();
        this.createdAt = review.getCreatedAt();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getProductId() { return productId; }
    public void setProductId(Long productId) { this.productId = productId; }
    public String getReviewerName() { return reviewerName; }
    public void setReviewerName(String reviewerName) { this.reviewerName = reviewerName; }
    public int getRating() { return rating; }
    public void setRating(int rating) { this.rating = rating; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getComment() { return comment; }
    public void setComment(String comment) { this.comment = comment; }
    public boolean isVerifiedPurchase() { return verifiedPurchase; }
    public void setVerifiedPurchase(boolean verifiedPurchase) { this.verifiedPurchase = verifiedPurchase; }
    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
