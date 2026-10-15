package com.hopebi.marketplace.admin;

import com.hopebi.marketplace.admin.dto.AdminDashboardDto;
import com.hopebi.marketplace.audit.AuditService;
import com.hopebi.marketplace.config.AppProperties;
import com.hopebi.marketplace.order.Order;
import com.hopebi.marketplace.order.OrderRepository;
import com.hopebi.marketplace.order.OrderStatus;
import com.hopebi.marketplace.order.PaymentStatus;
import com.hopebi.marketplace.order.dto.OrderDto;
import com.hopebi.marketplace.product.*;
import com.hopebi.marketplace.product.dto.ProductDetailDto;
import com.hopebi.marketplace.product.dto.ProductDto;
import com.hopebi.marketplace.seller.SellerProfile;
import com.hopebi.marketplace.seller.SellerRepository;
import com.hopebi.marketplace.seller.SellerStatus;
import com.hopebi.marketplace.seller.SellerVerificationStatus;
import com.hopebi.marketplace.seller.dto.SellerProfileDto;
import com.hopebi.marketplace.seller.dto.SellerStatusUpdateRequest;
import com.hopebi.marketplace.user.Role;
import com.hopebi.marketplace.user.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class AdminService {

    private final UserRepository userRepository;
    private final SellerRepository sellerRepository;
    private final ProductRepository productRepository;
    private final OrderRepository orderRepository;
    private final ProductService productService;
    private final AuditService auditService;
    private final AppProperties appProperties;

    public AdminService(UserRepository userRepository,
                        SellerRepository sellerRepository,
                        ProductRepository productRepository,
                        OrderRepository orderRepository,
                        ProductService productService,
                        AuditService auditService,
                        AppProperties appProperties) {
        this.userRepository = userRepository;
        this.sellerRepository = sellerRepository;
        this.productRepository = productRepository;
        this.orderRepository = orderRepository;
        this.productService = productService;
        this.auditService = auditService;
        this.appProperties = appProperties;
    }

    @Transactional(readOnly = true)
    public AdminDashboardDto getDashboard() {
        AdminDashboardDto dto = new AdminDashboardDto();
        dto.setTotalCustomers(userRepository.countByRole(Role.ROLE_CUSTOMER));
        dto.setApprovedSellers(sellerRepository.countBySellerStatus(SellerStatus.APPROVED));
        dto.setPendingSellers(sellerRepository.countBySellerStatus(SellerStatus.PENDING_APPROVAL));
        dto.setPublishedProducts(productRepository.countByProductStatusAndApprovalStatus(ProductStatus.PUBLISHED, ProductApprovalStatus.APPROVED));
        dto.setPendingProductApprovals(productRepository.countByProductStatusAndApprovalStatus(ProductStatus.DRAFT, ProductApprovalStatus.PENDING));

        List<Order> orders = orderRepository.findAll();
        dto.setTotalOrders(orders.size());

        BigDecimal gmv = BigDecimal.ZERO;
        BigDecimal revenue = BigDecimal.ZERO;
        Map<String, Long> ordersByStatus = new HashMap<>();
        Map<String, Long> paymentsByStatus = new HashMap<>();

        for (Order o : orders) {
            ordersByStatus.put(o.getOrderStatus().name(), ordersByStatus.getOrDefault(o.getOrderStatus().name(), 0L) + 1);
            paymentsByStatus.put(o.getPaymentStatus().name(), paymentsByStatus.getOrDefault(o.getPaymentStatus().name(), 0L) + 1);

            if (o.getPaymentStatus() == PaymentStatus.PAID) {
                gmv = gmv.add(o.getTotalAmount());
                revenue = revenue.add(o.getPlatformCommission());
            }
        }

        dto.setGrossMerchandiseValue(gmv);
        dto.setPlatformRevenue(revenue);
        dto.setOrdersByStatus(ordersByStatus);
        dto.setPaymentsByStatus(paymentsByStatus);

        return dto;
    }

    @Transactional
    public SellerProfileDto updateSellerStatus(Long sellerId, SellerStatusUpdateRequest req, String adminEmail) {
        SellerProfile profile = sellerRepository.findById(sellerId)
                .orElseThrow(() -> new RuntimeException("Seller not found: " + sellerId));

        profile.setSellerStatus(req.getStatus());
        if (req.getVerificationStatus() != null) {
            profile.setVerificationStatus(req.getVerificationStatus());
        }
        if (req.getCommissionRate() != null) {
            profile.setCommissionRate(req.getCommissionRate());
        }

        SellerProfile saved = sellerRepository.save(profile);

        auditService.recordEvent(
                "SELLER_STATUS_UPDATE",
                adminEmail,
                "SellerProfile",
                String.valueOf(sellerId),
                "Status changed to " + req.getStatus() + ". Reason: " + req.getReason()
        );

        return new SellerProfileDto(saved);
    }

    @Transactional
    public ProductDetailDto moderateProduct(Long productId, ProductApprovalStatus approvalStatus, ProductStatus publicationStatus, String adminEmail) {
        ProductDetailDto dto = productService.moderateProduct(productId, approvalStatus, publicationStatus);

        auditService.recordEvent(
                "PRODUCT_MODERATION",
                adminEmail,
                "Product",
                String.valueOf(productId),
                "Approval: " + approvalStatus + ", Publication: " + publicationStatus
        );

        return dto;
    }

    @Transactional(readOnly = true)
    public List<OrderDto> getAllOrders() {
        return orderRepository.findAll()
                .stream()
                .sorted((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()))
                .map(OrderDto::new)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ProductDto> getAllProducts() {
        return productRepository.findAll()
                .stream()
                .sorted((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()))
                .map(ProductDto::new)
                .collect(Collectors.toList());
    }

    @Transactional
    public void updateCommissionRate(double newRate, String adminEmail) {
        appProperties.setDefaultCommissionPercent(newRate);
        auditService.recordEvent("COMMISSION_RATE_UPDATE", adminEmail, "Platform", "CONFIG", "Updated to " + newRate + "%");
    }
}
