package com.hopebi.marketplace.product;

import com.hopebi.marketplace.common.ApiResponse;
import com.hopebi.marketplace.product.dto.ProductCreateRequest;
import com.hopebi.marketplace.product.dto.ProductDetailDto;
import com.hopebi.marketplace.product.dto.ProductDto;
import com.hopebi.marketplace.user.CustomUserDetails;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/seller/products")
@Tag(name = "Seller Products", description = "Seller portal product management")
@PreAuthorize("hasAnyRole('SELLER', 'ADMIN')")
public class SellerProductController {

    private final ProductService productService;

    public SellerProductController(ProductService productService) {
        this.productService = productService;
    }

    @GetMapping
    @Operation(summary = "List all products listed by the authenticated seller")
    public ResponseEntity<ApiResponse<List<ProductDto>>> getSellerProducts(
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        List<ProductDto> products = productService.getProductsBySeller(userDetails.getId());
        return ResponseEntity.ok(ApiResponse.success(products));
    }

    @PostMapping
    @Operation(summary = "Create a new product listing (draft/pending approval)")
    public ResponseEntity<ApiResponse<ProductDetailDto>> createProduct(
            @Valid @RequestBody ProductCreateRequest request,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        ProductDetailDto created = productService.createProduct(userDetails.getId(), request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Product draft created successfully", created));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update an existing product listing")
    public ResponseEntity<ApiResponse<ProductDetailDto>> updateProduct(
            @PathVariable Long id,
            @Valid @RequestBody ProductCreateRequest request,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        ProductDetailDto updated = productService.updateProduct(id, userDetails.getId(), request);
        return ResponseEntity.ok(ApiResponse.success("Product updated successfully", updated));
    }

    @PostMapping("/{id}/submit")
    @Operation(summary = "Submit a product listing for administrator approval")
    public ResponseEntity<ApiResponse<ProductDetailDto>> submitProduct(
            @PathVariable Long id,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        ProductDetailDto submitted = productService.submitProductForApproval(id, userDetails.getId());
        return ResponseEntity.ok(ApiResponse.success("Product submitted for approval", submitted));
    }
}
