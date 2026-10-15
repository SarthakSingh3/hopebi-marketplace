package com.hopebi.marketplace.product;

import com.hopebi.marketplace.common.ApiResponse;
import com.hopebi.marketplace.common.PageResponse;
import com.hopebi.marketplace.product.dto.ProductDetailDto;
import com.hopebi.marketplace.product.dto.ProductDto;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/products")
@Tag(name = "Products", description = "Public product catalogue, search, filters, and product details")
public class ProductController {

    private final ProductService productService;

    public ProductController(ProductService productService) {
        this.productService = productService;
    }

    @GetMapping
    @Operation(summary = "Search and filter approved products with pagination")
    public ResponseEntity<ApiResponse<PageResponse<ProductDto>>> getProducts(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String seller,
            @RequestParam(required = false) Boolean inStock,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size,
            @RequestParam(defaultValue = "newest") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {

        PageResponse<ProductDto> products = productService.getPublicProducts(
                category, seller, inStock, search, page, size, sortBy, sortDir);
        return ResponseEntity.ok(ApiResponse.success(products));
    }

    @GetMapping("/featured")
    @Operation(summary = "Get featured discoveries for homepage")
    public ResponseEntity<ApiResponse<List<ProductDto>>> getFeaturedDiscoveries(
            @RequestParam(defaultValue = "8") int limit) {
        return ResponseEntity.ok(ApiResponse.success(productService.getFeaturedDiscoveries(limit)));
    }

    @GetMapping("/{slug}")
    @Operation(summary = "Get product full details by slug")
    public ResponseEntity<ApiResponse<ProductDetailDto>> getProductBySlug(@PathVariable String slug) {
        return ResponseEntity.ok(ApiResponse.success(productService.getPublicProductBySlug(slug)));
    }
}
