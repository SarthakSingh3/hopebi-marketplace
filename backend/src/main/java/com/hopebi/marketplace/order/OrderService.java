package com.hopebi.marketplace.order;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.hopebi.marketplace.address.Address;
import com.hopebi.marketplace.address.AddressService;
import com.hopebi.marketplace.cart.Cart;
import com.hopebi.marketplace.cart.CartItem;
import com.hopebi.marketplace.cart.CartService;
import com.hopebi.marketplace.common.BadRequestException;
import com.hopebi.marketplace.common.ResourceNotFoundException;
import com.hopebi.marketplace.config.AppProperties;
import com.hopebi.marketplace.order.dto.CheckoutRequest;
import com.hopebi.marketplace.order.dto.OrderDto;
import com.hopebi.marketplace.order.dto.OrderItemDto;
import com.hopebi.marketplace.payment.PaymentMethod;
import com.hopebi.marketplace.product.Product;
import com.hopebi.marketplace.product.ProductApprovalStatus;
import com.hopebi.marketplace.product.ProductRepository;
import com.hopebi.marketplace.product.ProductStatus;
import com.hopebi.marketplace.promotion.Promotion;
import com.hopebi.marketplace.promotion.PromotionRepository;
import com.hopebi.marketplace.promotion.PromotionService;
import com.hopebi.marketplace.shipping.FulfilmentStatus;
import com.hopebi.marketplace.user.User;
import com.hopebi.marketplace.user.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class OrderService {

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final CartService cartService;
    private final AddressService addressService;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final PromotionRepository promotionRepository;
    private final PromotionService promotionService;
    private final AppProperties appProperties;
    private final ObjectMapper objectMapper;

    public OrderService(OrderRepository orderRepository,
                        OrderItemRepository orderItemRepository,
                        CartService cartService,
                        AddressService addressService,
                        ProductRepository productRepository,
                        UserRepository userRepository,
                        PromotionRepository promotionRepository,
                        PromotionService promotionService,
                        AppProperties appProperties,
                        ObjectMapper objectMapper) {
        this.orderRepository = orderRepository;
        this.orderItemRepository = orderItemRepository;
        this.cartService = cartService;
        this.addressService = addressService;
        this.productRepository = productRepository;
        this.userRepository = userRepository;
        this.promotionRepository = promotionRepository;
        this.promotionService = promotionService;
        this.appProperties = appProperties;
        this.objectMapper = objectMapper;
    }

    @Transactional
    public OrderDto checkout(Long userId, CheckoutRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        // Idempotency check
        if (request.getIdempotencyKey() != null && !request.getIdempotencyKey().trim().isEmpty()) {
            Optional<Order> existingOrder = orderRepository.findByIdempotencyKey(request.getIdempotencyKey().trim());
            if (existingOrder.isPresent()) {
                return new OrderDto(existingOrder.get());
            }
        }

        Cart cart = cartService.getOrCreateUserCart(userId);
        if (cart.getItems() == null || cart.getItems().isEmpty()) {
            throw new BadRequestException("Your cart is empty. Please add items before checking out.");
        }

        Address address = addressService.getAddressEntityByIdAndUser(request.getAddressId(), userId);
        String addressSnapshot = formatAddressSnapshot(address);

        BigDecimal subtotal = BigDecimal.ZERO;
        List<CartItem> validatedCartItems = new ArrayList<>();

        // Revalidate stock and pricing on the server
        for (CartItem item : cart.getItems()) {
            Product product = productRepository.findById(item.getProduct().getId())
                    .orElseThrow(() -> new BadRequestException("Product no longer available: " + item.getProduct().getName()));

            if (product.getProductStatus() != ProductStatus.PUBLISHED || product.getApprovalStatus() != ProductApprovalStatus.APPROVED) {
                throw new BadRequestException("Product is currently unavailable: " + product.getName());
            }

            if (product.getStockQuantity() < item.getQuantity()) {
                throw new BadRequestException("Insufficient stock for '" + product.getName() + "'. Available: " + product.getStockQuantity());
            }

            BigDecimal lineTotal = product.getEffectivePrice().multiply(BigDecimal.valueOf(item.getQuantity()));
            subtotal = subtotal.add(lineTotal);
            validatedCartItems.add(item);
        }

        // Apply Promotion / Discount
        BigDecimal discountAmount = BigDecimal.ZERO;
        String appliedCoupon = null;
        if (request.getCouponCode() != null && !request.getCouponCode().trim().isEmpty()) {
            String cleanCode = request.getCouponCode().trim().toUpperCase();
            Optional<Promotion> promoOpt = promotionRepository.findByCodeAndActiveTrue(cleanCode);
            if (promoOpt.isPresent() && promoOpt.get().isValidFor(subtotal)) {
                discountAmount = promoOpt.get().calculateDiscount(subtotal);
                appliedCoupon = cleanCode;
                promotionService.recordUsage(cleanCode);
            }
        }

        // Shipping calculation: Free on >= ₹999, else ₹99
        BigDecimal shippingFee = (subtotal.compareTo(BigDecimal.valueOf(999)) >= 0) ? BigDecimal.ZERO : BigDecimal.valueOf(99);

        // Platform Commission calculation
        BigDecimal commissionPercent = BigDecimal.valueOf(appProperties.getDefaultCommissionPercent());
        BigDecimal platformCommission = subtotal.multiply(commissionPercent)
                .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);

        BigDecimal totalAmount = subtotal.subtract(discountAmount).add(shippingFee);
        if (totalAmount.compareTo(BigDecimal.ZERO) < 0) {
            totalAmount = BigDecimal.ZERO;
        }

        String orderNumber = generateOrderNumber();

        Order order = new Order(
                orderNumber,
                user,
                request.getPaymentMethod(),
                subtotal,
                discountAmount,
                shippingFee,
                platformCommission,
                totalAmount,
                appliedCoupon,
                addressSnapshot,
                request.getIdempotencyKey()
        );

        // If Cash on delivery, order is immediately confirmed
        if (request.getPaymentMethod() == PaymentMethod.COD) {
            order.setOrderStatus(OrderStatus.CONFIRMED);
            order.setPaymentStatus(PaymentStatus.PENDING);
        }

        Order savedOrder = orderRepository.save(order);

        // Create Order Items with historical snapshots
        for (CartItem cartItem : validatedCartItems) {
            Product product = cartItem.getProduct();
            OrderItem orderItem = new OrderItem(
                    savedOrder,
                    product,
                    product.getSeller(),
                    product.getName(),
                    product.getSku(),
                    product.getEffectivePrice(),
                    cartItem.getQuantity()
            );

            if (request.getPaymentMethod() == PaymentMethod.COD) {
                // Deduct inventory immediately for COD
                product.setStockQuantity(product.getStockQuantity() - cartItem.getQuantity());
                productRepository.save(product);
                orderItem.setFulfilmentStatus(FulfilmentStatus.ACCEPTED);
            }

            orderItemRepository.save(orderItem);
            savedOrder.addItem(orderItem);
        }

        // Clear cart after successful order creation
        cartService.clearCart(userId, null);

        return new OrderDto(savedOrder);
    }

    @Transactional(readOnly = true)
    public List<OrderDto> getUserOrders(Long userId) {
        return orderRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(OrderDto::new)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public OrderDto getOrderByNumber(String orderNumber, Long userId) {
        Order order = orderRepository.findByOrderNumberAndUserId(orderNumber, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found: " + orderNumber));
        return new OrderDto(order);
    }

    @Transactional
    public OrderDto cancelOrder(String orderNumber, Long userId, String reason) {
        Order order = orderRepository.findByOrderNumberAndUserId(orderNumber, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found: " + orderNumber));

        if (order.getOrderStatus() == OrderStatus.SHIPPED || order.getOrderStatus() == OrderStatus.DELIVERED) {
            throw new BadRequestException("Order cannot be cancelled after dispatch. You may request a return upon delivery.");
        }

        if (order.getOrderStatus() == OrderStatus.CANCELLED) {
            throw new BadRequestException("Order is already cancelled.");
        }

        order.setOrderStatus(OrderStatus.CANCELLED);
        if (reason != null && !reason.trim().isEmpty()) {
            order.setCancellationReason(reason.trim());
        } else {
            order.setCancellationReason("Customer cancelled prior to dispatch");
        }

        // Restore inventory if stock was deducted (CONFIRMED status, COD, or ACCEPTED/PACKED)
        for (OrderItem item : order.getItems()) {
            boolean stockWasDeducted = (order.getPaymentStatus() == PaymentStatus.PAID)
                    || (order.getPaymentMethod() == PaymentMethod.COD)
                    || (item.getFulfilmentStatus() == FulfilmentStatus.ACCEPTED)
                    || (item.getFulfilmentStatus() == FulfilmentStatus.PACKED);

            if (stockWasDeducted && item.getProduct() != null) {
                Product product = item.getProduct();
                product.setStockQuantity(product.getStockQuantity() + item.getQuantity());
                productRepository.save(product);
            }
            item.setFulfilmentStatus(FulfilmentStatus.CANCELLED);
            orderItemRepository.save(item);
        }

        return new OrderDto(orderRepository.save(order));
    }

    @Transactional
    public OrderDto cancelOrder(String orderNumber, Long userId) {
        return cancelOrder(orderNumber, userId, "Customer requested cancellation");
    }

    @Transactional
    public OrderDto requestReturn(String orderNumber, Long userId, String reason) {
        Order order = orderRepository.findByOrderNumberAndUserId(orderNumber, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found: " + orderNumber));

        if (order.getOrderStatus() != OrderStatus.DELIVERED) {
            throw new BadRequestException("Returns can only be requested for delivered orders.");
        }

        order.setOrderStatus(OrderStatus.RETURN_REQUESTED);
        return new OrderDto(orderRepository.save(order));
    }

    private String generateOrderNumber() {
        String datePart = LocalDate.now().format(DateTimeFormatter.BASIC_ISO_DATE);
        String randPart = UUID.randomUUID().toString().substring(0, 6).toUpperCase();
        return "HOP-" + datePart + "-" + randPart;
    }

    private String formatAddressSnapshot(Address address) {
        Map<String, String> map = new LinkedHashMap<>();
        map.put("recipientName", address.getRecipientName());
        map.put("phoneNumber", address.getPhoneNumber());
        map.put("streetAddress", address.getStreetAddress());
        map.put("locality", address.getLocality() != null ? address.getLocality() : "");
        map.put("city", address.getCity());
        map.put("state", address.getState());
        map.put("pincode", address.getPincode());
        map.put("landmark", address.getLandmark() != null ? address.getLandmark() : "");
        try {
            return objectMapper.writeValueAsString(map);
        } catch (Exception e) {
            return address.getRecipientName() + ", " + address.getStreetAddress() + ", " + address.getCity() + ", " + address.getState() + " - " + address.getPincode();
        }
    }
}
