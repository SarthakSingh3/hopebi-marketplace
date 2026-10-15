package com.hopebi.marketplace.order;

import com.hopebi.marketplace.common.ApiResponse;
import com.hopebi.marketplace.order.dto.CheckoutRequest;
import com.hopebi.marketplace.order.dto.OrderDto;
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
@RequestMapping("/api/v1/orders")
@Tag(name = "Orders", description = "Customer checkout and order lifecycle management")
public class OrderController {

    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @PostMapping
    @Operation(summary = "Checkout and create order from current cart")
    public ResponseEntity<ApiResponse<OrderDto>> checkout(
            @Valid @RequestBody CheckoutRequest request,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        OrderDto order = orderService.checkout(userDetails.getId(), request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Order created successfully", order));
    }

    @GetMapping
    @Operation(summary = "List all orders placed by the current customer")
    public ResponseEntity<ApiResponse<List<OrderDto>>> getOrders(@AuthenticationPrincipal CustomUserDetails userDetails) {
        return ResponseEntity.ok(ApiResponse.success(orderService.getUserOrders(userDetails.getId())));
    }

    @GetMapping("/{orderNumber}")
    @Operation(summary = "Get detailed order information by order number")
    public ResponseEntity<ApiResponse<OrderDto>> getOrderByNumber(
            @PathVariable String orderNumber,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        return ResponseEntity.ok(ApiResponse.success(orderService.getOrderByNumber(orderNumber, userDetails.getId())));
    }

    @PostMapping("/{orderNumber}/cancel")
    @Operation(summary = "Cancel an order before dispatch")
    public ResponseEntity<ApiResponse<OrderDto>> cancelOrder(
            @PathVariable String orderNumber,
            @RequestBody(required = false) java.util.Map<String, String> body,
            @RequestParam(required = false) String reason,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        String effectiveReason = (body != null && body.containsKey("reason"))
                ? body.get("reason")
                : (reason != null ? reason : "Customer cancelled order");
        OrderDto cancelled = orderService.cancelOrder(orderNumber, userDetails.getId(), effectiveReason);
        return ResponseEntity.ok(ApiResponse.success("Order cancelled successfully", cancelled));
    }

    @PostMapping("/{orderNumber}/return")
    @Operation(summary = "Request a return for a delivered order")
    public ResponseEntity<ApiResponse<OrderDto>> requestReturn(
            @PathVariable String orderNumber,
            @RequestParam(required = false, defaultValue = "Customer return request") String reason,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        OrderDto returned = orderService.requestReturn(orderNumber, userDetails.getId(), reason);
        return ResponseEntity.ok(ApiResponse.success("Return request recorded", returned));
    }
}
