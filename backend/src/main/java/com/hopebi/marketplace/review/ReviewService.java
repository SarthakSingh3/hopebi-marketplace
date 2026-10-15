package com.hopebi.marketplace.review;

import com.hopebi.marketplace.common.BadRequestException;
import com.hopebi.marketplace.common.ConflictException;
import com.hopebi.marketplace.common.ResourceNotFoundException;
import com.hopebi.marketplace.order.Order;
import com.hopebi.marketplace.order.OrderItem;
import com.hopebi.marketplace.order.OrderRepository;
import com.hopebi.marketplace.order.PaymentStatus;
import com.hopebi.marketplace.product.Product;
import com.hopebi.marketplace.product.ProductRepository;
import com.hopebi.marketplace.review.dto.CreateReviewRequest;
import com.hopebi.marketplace.review.dto.ReviewDto;
import com.hopebi.marketplace.user.User;
import com.hopebi.marketplace.user.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final OrderRepository orderRepository;

    public ReviewService(ReviewRepository reviewRepository,
                         ProductRepository productRepository,
                         UserRepository userRepository,
                         OrderRepository orderRepository) {
        this.reviewRepository = reviewRepository;
        this.productRepository = productRepository;
        this.userRepository = userRepository;
        this.orderRepository = orderRepository;
    }

    @Transactional(readOnly = true)
    public List<ReviewDto> getProductReviews(Long productId) {
        return reviewRepository.findByProductIdOrderByCreatedAtDesc(productId)
                .stream()
                .map(ReviewDto::new)
                .collect(Collectors.toList());
    }

    @Transactional
    public ReviewDto submitReview(Long userId, CreateReviewRequest request) {
        if (reviewRepository.existsByUserIdAndProductId(userId, request.getProductId())) {
            throw new ConflictException("You have already reviewed this product.");
        }

        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException("Product not found: " + request.getProductId()));

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        // Verify that the user has a confirmed/delivered order with this product
        List<Order> orders = orderRepository.findByUserIdOrderByCreatedAtDesc(userId);
        boolean isVerifiedPurchase = orders.stream()
                .filter(o -> o.getPaymentStatus() == PaymentStatus.PAID)
                .flatMap(o -> o.getItems().stream())
                .anyMatch(item -> item.getProduct().getId().equals(product.getId()));

        if (!isVerifiedPurchase) {
            throw new BadRequestException("Only verified buyers of this product can submit a review.");
        }

        Review review = new Review(
                product,
                user,
                request.getRating(),
                request.getTitle(),
                request.getComment(),
                true
        );
        review.setImageUrl(request.getImageUrl());

        return new ReviewDto(reviewRepository.save(review));
    }
}
