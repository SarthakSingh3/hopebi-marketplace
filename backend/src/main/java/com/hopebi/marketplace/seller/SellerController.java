package com.hopebi.marketplace.seller;

import com.hopebi.marketplace.common.ApiResponse;
import com.hopebi.marketplace.seller.dto.SellerApplicationRequest;
import com.hopebi.marketplace.seller.dto.SellerProfileDto;
import com.hopebi.marketplace.seller.dto.SellerPublicDto;
import com.hopebi.marketplace.user.CustomUserDetails;
import com.hopebi.marketplace.user.User;
import com.hopebi.marketplace.user.UserRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@Tag(name = "Sellers", description = "Seller discovery, applications, and portal")
public class SellerController {

    private final SellerService sellerService;
    private final UserRepository userRepository;

    public SellerController(SellerService sellerService, UserRepository userRepository) {
        this.sellerService = sellerService;
        this.userRepository = userRepository;
    }

    @PostMapping("/api/v1/seller-applications")
    @Operation(summary = "Submit an application to become a seller/manufacturer on HOPEBI")
    public ResponseEntity<ApiResponse<SellerProfileDto>> applyAsSeller(
            @Valid @RequestBody SellerApplicationRequest request,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        User currentUser = null;
        if (userDetails != null) {
            currentUser = userRepository.findById(userDetails.getId()).orElse(null);
        }
        SellerProfileDto created = sellerService.apply(request, currentUser);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Seller application submitted successfully. Pending administrator review.", created));
    }

    @GetMapping("/api/v1/sellers")
    @Operation(summary = "List all approved manufacturers and emerging brands")
    public ResponseEntity<ApiResponse<List<SellerPublicDto>>> getApprovedSellers() {
        return ResponseEntity.ok(ApiResponse.success(sellerService.getApprovedSellers()));
    }

    @GetMapping("/api/v1/sellers/{slug}")
    @Operation(summary = "Get public manufacturer brand profile by slug")
    public ResponseEntity<ApiResponse<SellerPublicDto>> getSellerBySlug(@PathVariable String slug) {
        return ResponseEntity.ok(ApiResponse.success(sellerService.getApprovedSellerBySlug(slug)));
    }

    @GetMapping("/api/v1/seller/profile")
    @Operation(summary = "Get current authenticated seller's private profile")
    public ResponseEntity<ApiResponse<SellerProfileDto>> getCurrentSellerProfile(@AuthenticationPrincipal CustomUserDetails userDetails) {
        return ResponseEntity.ok(ApiResponse.success(sellerService.getSellerProfileForUser(userDetails.getId())));
    }
}
