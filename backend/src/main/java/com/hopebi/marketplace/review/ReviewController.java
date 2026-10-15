package com.hopebi.marketplace.review;

import com.hopebi.marketplace.common.ApiResponse;
import com.hopebi.marketplace.review.dto.CreateReviewRequest;
import com.hopebi.marketplace.review.dto.ReviewDto;
import com.hopebi.marketplace.user.CustomUserDetails;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@Tag(name = "Reviews", description = "Verified customer reviews and ratings")
public class ReviewController {

    private final ReviewService reviewService;

    public ReviewController(ReviewService reviewService) {
        this.reviewService = reviewService;
    }

    @GetMapping("/api/v1/products/{productId}/reviews")
    @Operation(summary = "Get all customer reviews for a product")
    public ResponseEntity<ApiResponse<List<ReviewDto>>> getProductReviews(@PathVariable Long productId) {
        return ResponseEntity.ok(ApiResponse.success(reviewService.getProductReviews(productId)));
    }

    @PostMapping("/api/v1/me/reviews")
    @Operation(summary = "Submit a review for a verified purchased product")
    public ResponseEntity<ApiResponse<ReviewDto>> submitReview(
            @Valid @RequestBody CreateReviewRequest request,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        ReviewDto created = reviewService.submitReview(userDetails.getId(), request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Review posted successfully", created));
    }
}
