package com.hopebi.marketplace.cart;

import com.hopebi.marketplace.cart.dto.*;
import com.hopebi.marketplace.common.ApiResponse;
import com.hopebi.marketplace.user.CustomUserDetails;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/cart")
@Tag(name = "Cart", description = "Shopping cart operations with guest and customer support")
public class CartController {

    private final CartService cartService;

    public CartController(CartService cartService) {
        this.cartService = cartService;
    }

    @GetMapping
    @Operation(summary = "Get cart contents and recalculated totals")
    public ResponseEntity<ApiResponse<CartDto>> getCart(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestParam(required = false) String guestSessionId) {
        Long userId = userDetails != null ? userDetails.getId() : null;
        CartDto cart = (userId != null) ? cartService.getCartDtoForUser(userId) : cartService.getCartDtoForGuest(guestSessionId);
        return ResponseEntity.ok(ApiResponse.success(cart));
    }

    @PostMapping("/items")
    @Operation(summary = "Add an item to cart")
    public ResponseEntity<ApiResponse<CartDto>> addItem(
            @Valid @RequestBody AddToCartRequest request,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        Long userId = userDetails != null ? userDetails.getId() : null;
        CartDto cart = cartService.addItem(userId, request.getGuestSessionId(), request);
        return ResponseEntity.ok(ApiResponse.success("Item added to cart", cart));
    }

    @PatchMapping("/items/{id}")
    @Operation(summary = "Update cart item quantity")
    public ResponseEntity<ApiResponse<CartDto>> updateQuantity(
            @PathVariable Long id,
            @Valid @RequestBody UpdateCartItemRequest request,
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestParam(required = false) String guestSessionId) {
        Long userId = userDetails != null ? userDetails.getId() : null;
        CartDto cart = cartService.updateItemQuantity(userId, guestSessionId, id, request.getQuantity());
        return ResponseEntity.ok(ApiResponse.success("Cart updated", cart));
    }

    @DeleteMapping("/items/{id}")
    @Operation(summary = "Remove item from cart")
    public ResponseEntity<ApiResponse<CartDto>> removeItem(
            @PathVariable Long id,
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestParam(required = false) String guestSessionId) {
        Long userId = userDetails != null ? userDetails.getId() : null;
        CartDto cart = cartService.removeItem(userId, guestSessionId, id);
        return ResponseEntity.ok(ApiResponse.success("Item removed from cart", cart));
    }

    @DeleteMapping
    @Operation(summary = "Clear all items from cart")
    public ResponseEntity<ApiResponse<CartDto>> clearCart(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestParam(required = false) String guestSessionId) {
        Long userId = userDetails != null ? userDetails.getId() : null;
        CartDto cart = cartService.clearCart(userId, guestSessionId);
        return ResponseEntity.ok(ApiResponse.success("Cart cleared", cart));
    }

    @PostMapping("/merge")
    @Operation(summary = "Merge client guest cart items into authenticated user's cart")
    public ResponseEntity<ApiResponse<CartDto>> mergeCart(
            @RequestBody(required = false) MergeCartRequest request,
            @RequestParam(required = false) String guestSessionId,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        if (userDetails == null) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Must be logged in to merge cart"));
        }
        if (request == null) {
            request = new MergeCartRequest();
        }
        if (guestSessionId != null && request.getGuestSessionId() == null) {
            request.setGuestSessionId(guestSessionId);
        }
        CartDto cart = cartService.mergeGuestCart(userDetails.getId(), request);
        return ResponseEntity.ok(ApiResponse.success("Cart merged successfully", cart));
    }
}
