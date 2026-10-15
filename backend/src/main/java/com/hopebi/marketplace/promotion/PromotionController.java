package com.hopebi.marketplace.promotion;

import com.hopebi.marketplace.common.ApiResponse;
import com.hopebi.marketplace.promotion.dto.PromotionResultDto;
import com.hopebi.marketplace.promotion.dto.PromotionValidateRequest;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/promotions")
@Tag(name = "Promotions", description = "Coupon validation and promotional discounts")
public class PromotionController {

    private final PromotionService promotionService;

    public PromotionController(PromotionService promotionService) {
        this.promotionService = promotionService;
    }

    @PostMapping("/validate")
    @Operation(summary = "Validate coupon code against order subtotal")
    public ResponseEntity<ApiResponse<PromotionResultDto>> validateCoupon(@Valid @RequestBody PromotionValidateRequest request) {
        PromotionResultDto result = promotionService.validatePromotion(request);
        return ResponseEntity.ok(ApiResponse.success(result));
    }
}
