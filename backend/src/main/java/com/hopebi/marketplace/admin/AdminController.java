package com.hopebi.marketplace.admin;

import com.hopebi.marketplace.admin.dto.AdminDashboardDto;
import com.hopebi.marketplace.audit.AuditEvent;
import com.hopebi.marketplace.audit.AuditService;
import com.hopebi.marketplace.common.ApiResponse;
import com.hopebi.marketplace.order.dto.OrderDto;
import com.hopebi.marketplace.product.ProductApprovalStatus;
import com.hopebi.marketplace.product.ProductStatus;
import com.hopebi.marketplace.product.dto.ProductDetailDto;
import com.hopebi.marketplace.product.dto.ProductDto;
import com.hopebi.marketplace.seller.SellerService;
import com.hopebi.marketplace.seller.dto.SellerProfileDto;
import com.hopebi.marketplace.seller.dto.SellerStatusUpdateRequest;
import com.hopebi.marketplace.user.CustomUserDetails;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/admin")
@Tag(name = "Admin Portal", description = "Administrator operations for approvals, moderation, orders, and audits")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final AdminService adminService;
    private final SellerService sellerService;
    private final AuditService auditService;

    public AdminController(AdminService adminService, SellerService sellerService, AuditService auditService) {
        this.adminService = adminService;
        this.sellerService = sellerService;
        this.auditService = auditService;
    }

    @GetMapping("/dashboard")
    @Operation(summary = "Get aggregated platform overview metrics")
    public ResponseEntity<ApiResponse<AdminDashboardDto>> getDashboard() {
        return ResponseEntity.ok(ApiResponse.success(adminService.getDashboard()));
    }

    @GetMapping("/sellers")
    @Operation(summary = "List all seller applications and profiles")
    public ResponseEntity<ApiResponse<List<SellerProfileDto>>> getAllSellers() {
        return ResponseEntity.ok(ApiResponse.success(sellerService.getAllSellersForAdmin()));
    }

    @PostMapping("/sellers/{id}/status")
    @Operation(summary = "Approve, reject, or suspend a seller application")
    public ResponseEntity<ApiResponse<SellerProfileDto>> updateSellerStatus(
            @PathVariable Long id,
            @Valid @RequestBody SellerStatusUpdateRequest request,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        SellerProfileDto updated = adminService.updateSellerStatus(id, request, userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success("Seller status updated", updated));
    }

    @GetMapping("/products")
    @Operation(summary = "List all products across all statuses for moderation")
    public ResponseEntity<ApiResponse<List<ProductDto>>> getAllProducts() {
        return ResponseEntity.ok(ApiResponse.success(adminService.getAllProducts()));
    }

    @PostMapping("/products/{id}/moderate")
    @Operation(summary = "Moderate product listing (approve, reject, unpublish)")
    public ResponseEntity<ApiResponse<ProductDetailDto>> moderateProduct(
            @PathVariable Long id,
            @RequestParam ProductApprovalStatus approvalStatus,
            @RequestParam(required = false) ProductStatus publicationStatus,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        ProductDetailDto moderated = adminService.moderateProduct(id, approvalStatus, publicationStatus, userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success("Product moderation completed", moderated));
    }

    @GetMapping("/orders")
    @Operation(summary = "List all customer orders across all sellers")
    public ResponseEntity<ApiResponse<List<OrderDto>>> getAllOrders() {
        return ResponseEntity.ok(ApiResponse.success(adminService.getAllOrders()));
    }

    @GetMapping("/audit-logs")
    @Operation(summary = "Get recent administrative audit events")
    public ResponseEntity<ApiResponse<List<AuditEvent>>> getAuditLogs() {
        return ResponseEntity.ok(ApiResponse.success(auditService.getRecentEvents()));
    }

    @PostMapping("/settings/commission")
    @Operation(summary = "Update default platform commission rate")
    public ResponseEntity<ApiResponse<String>> updateCommission(
            @RequestBody Map<String, Double> payload,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        Double rate = payload.get("commissionRate");
        if (rate == null || rate < 0 || rate > 50) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Commission rate must be between 0% and 50%"));
        }
        adminService.updateCommissionRate(rate, userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success("Platform commission updated to " + rate + "%", null));
    }
}
