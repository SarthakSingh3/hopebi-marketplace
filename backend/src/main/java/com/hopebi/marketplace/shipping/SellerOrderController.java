package com.hopebi.marketplace.shipping;

import com.hopebi.marketplace.common.ApiResponse;
import com.hopebi.marketplace.common.BadRequestException;
import com.hopebi.marketplace.common.ResourceNotFoundException;
import com.hopebi.marketplace.common.UnauthorizedException;
import com.hopebi.marketplace.order.Order;
import com.hopebi.marketplace.order.OrderItem;
import com.hopebi.marketplace.order.OrderItemRepository;
import com.hopebi.marketplace.order.OrderRepository;
import com.hopebi.marketplace.order.OrderStatus;
import com.hopebi.marketplace.order.PaymentStatus;
import com.hopebi.marketplace.order.dto.OrderItemDto;
import com.hopebi.marketplace.product.ProductRepository;
import com.hopebi.marketplace.seller.SellerProfile;
import com.hopebi.marketplace.seller.SellerRepository;
import com.hopebi.marketplace.shipping.dto.DispatchOrderItemRequest;
import com.hopebi.marketplace.user.CustomUserDetails;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/seller")
@Tag(name = "Seller Orders & Fulfilment", description = "Seller order item fulfilment and analytics")
@PreAuthorize("hasAnyRole('SELLER', 'ADMIN')")
public class SellerOrderController {

    private final OrderItemRepository orderItemRepository;
    private final OrderRepository orderRepository;
    private final SellerRepository sellerRepository;
    private final ProductRepository productRepository;

    public SellerOrderController(OrderItemRepository orderItemRepository,
                                 OrderRepository orderRepository,
                                 SellerRepository sellerRepository,
                                 ProductRepository productRepository) {
        this.orderItemRepository = orderItemRepository;
        this.orderRepository = orderRepository;
        this.sellerRepository = sellerRepository;
        this.productRepository = productRepository;
    }

    @GetMapping("/orders")
    @Operation(summary = "List order items relevant to the authenticated seller")
    @Transactional(readOnly = true)
    public ResponseEntity<ApiResponse<List<OrderItemDto>>> getSellerOrderItems(
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        SellerProfile seller = sellerRepository.findByUserId(userDetails.getId())
                .orElseThrow(() -> new UnauthorizedException("Seller profile not found."));

        List<OrderItemDto> items = orderItemRepository.findBySellerIdOrderByOrderCreatedAtDesc(seller.getId())
                .stream()
                .map(OrderItemDto::new)
                .collect(Collectors.toList());

        return ResponseEntity.ok(ApiResponse.success(items));
    }

    @PostMapping("/order-items/{id}/dispatch")
    @Operation(summary = "Mark an order item as dispatched with carrier tracking info")
    @Transactional
    public ResponseEntity<ApiResponse<OrderItemDto>> dispatchOrderItem(
            @PathVariable Long id,
            @Valid @RequestBody DispatchOrderItemRequest request,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        SellerProfile seller = sellerRepository.findByUserId(userDetails.getId())
                .orElseThrow(() -> new UnauthorizedException("Seller profile not found."));

        OrderItem item = orderItemRepository.findByIdAndSellerId(id, seller.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Order item not found or does not belong to you: " + id));

        Order order = item.getOrder();

        if (order.getPaymentStatus() != PaymentStatus.PAID && order.getOrderStatus() != OrderStatus.CONFIRMED) {
            throw new BadRequestException("Cannot dispatch an order that is not yet paid or confirmed.");
        }

        item.setFulfilmentStatus(FulfilmentStatus.DISPATCHED);
        item.setCarrier(request.getCarrier().trim());
        item.setTrackingNumber(request.getTrackingNumber().trim());
        item.setDispatchedAt(LocalDateTime.now());

        orderItemRepository.save(item);

        // Check if all items in the order have been dispatched
        boolean allDispatched = order.getItems().stream()
                .allMatch(i -> i.getFulfilmentStatus() == FulfilmentStatus.DISPATCHED || i.getFulfilmentStatus() == FulfilmentStatus.DELIVERED);
        if (allDispatched) {
            order.setOrderStatus(OrderStatus.SHIPPED);
            orderRepository.save(order);
        }

        return ResponseEntity.ok(ApiResponse.success("Item marked as dispatched", new OrderItemDto(item)));
    }

    @PostMapping("/order-items/{id}/deliver")
    @Operation(summary = "Mark an order item as delivered")
    @Transactional
    public ResponseEntity<ApiResponse<OrderItemDto>> markDelivered(
            @PathVariable Long id,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        SellerProfile seller = sellerRepository.findByUserId(userDetails.getId())
                .orElseThrow(() -> new UnauthorizedException("Seller profile not found."));

        OrderItem item = orderItemRepository.findByIdAndSellerId(id, seller.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Order item not found: " + id));

        item.setFulfilmentStatus(FulfilmentStatus.DELIVERED);
        item.setDeliveredAt(LocalDateTime.now());
        orderItemRepository.save(item);

        Order order = item.getOrder();
        boolean allDelivered = order.getItems().stream()
                .allMatch(i -> i.getFulfilmentStatus() == FulfilmentStatus.DELIVERED);
        if (allDelivered) {
            order.setOrderStatus(OrderStatus.DELIVERED);
            orderRepository.save(order);
        }

        return ResponseEntity.ok(ApiResponse.success("Item marked as delivered", new OrderItemDto(item)));
    }

    @GetMapping("/analytics")
    @Operation(summary = "Get basic sales analytics for current seller")
    @Transactional(readOnly = true)
    public ResponseEntity<ApiResponse<Map<String, Object>>> getSellerAnalytics(
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        SellerProfile seller = sellerRepository.findByUserId(userDetails.getId())
                .orElseThrow(() -> new UnauthorizedException("Seller profile not found."));

        List<OrderItem> items = orderItemRepository.findBySellerIdOrderByOrderCreatedAtDesc(seller.getId());

        int totalUnitsSold = 0;
        BigDecimal grossSales = BigDecimal.ZERO;
        int activeOrders = 0;
        int deliveredOrders = 0;

        for (OrderItem item : items) {
            if (item.getOrder().getPaymentStatus() == PaymentStatus.PAID) {
                totalUnitsSold += item.getQuantity();
                grossSales = grossSales.add(item.getLineTotal());

                if (item.getFulfilmentStatus() == FulfilmentStatus.DELIVERED) {
                    deliveredOrders++;
                } else if (item.getFulfilmentStatus() != FulfilmentStatus.CANCELLED) {
                    activeOrders++;
                }
            }
        }

        long activeProducts = productRepository.findBySellerId(seller.getId()).size();

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalUnitsSold", totalUnitsSold);
        stats.put("grossSales", grossSales);
        stats.put("activeOrders", activeOrders);
        stats.put("deliveredOrders", deliveredOrders);
        stats.put("totalProducts", activeProducts);
        stats.put("commissionPercent", seller.getCommissionRate() != null ? seller.getCommissionRate() : 5.0);

        return ResponseEntity.ok(ApiResponse.success(stats));
    }
}
