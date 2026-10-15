package com.hopebi.marketplace.review.dto;

import jakarta.validation.constraints.*;

public class CreateReviewRequest {

    @NotNull(message = "Product ID is required")
    private Long productId;

    @Min(value = 1, message = "Rating must be between 1 and 5")
    @Max(value = 5, message = "Rating must be between 1 and 5")
    private int rating;

    @Size(max = 150)
    private String title;

    @NotBlank(message = "Review comment is required")
    @Size(min = 10, max = 2000, message = "Review comment must be between 10 and 2000 characters")
    private String comment;

    @Size(max = 500)
    private String imageUrl;

    public CreateReviewRequest() {}

    public Long getProductId() { return productId; }
    public void setProductId(Long productId) { this.productId = productId; }
    public int getRating() { return rating; }
    public void setRating(int rating) { this.rating = rating; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getComment() { return comment; }
    public void setComment(String comment) { this.comment = comment; }
    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }
}
