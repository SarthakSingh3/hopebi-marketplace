package com.hopebi.marketplace.payment;

import com.hopebi.marketplace.common.ApiResponse;
import com.hopebi.marketplace.payment.dto.PaymentInitiateRequest;
import com.hopebi.marketplace.payment.dto.PaymentInitiateResponse;
import com.hopebi.marketplace.payment.dto.PaymentVerifyRequest;
import com.hopebi.marketplace.payment.dto.PaymentVerifyResponse;
import com.hopebi.marketplace.user.CustomUserDetails;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/payments")
@Tag(name = "Payments", description = "Payment initiation and authoritative verification")
public class PaymentController {

    private final PaymentService paymentService;

    public PaymentController(PaymentService paymentService) {
        this.paymentService = paymentService;
    }

    @PostMapping("/initiate")
    @Operation(summary = "Initiate payment attempt for an order")
    public ResponseEntity<ApiResponse<PaymentInitiateResponse>> initiatePayment(
            @Valid @RequestBody PaymentInitiateRequest request,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        PaymentInitiateResponse response = paymentService.initiatePayment(request, userDetails.getId());
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PostMapping("/verify")
    @Operation(summary = "Verify payment attempt and confirm order")
    public ResponseEntity<ApiResponse<PaymentVerifyResponse>> verifyPayment(
            @Valid @RequestBody PaymentVerifyRequest request,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        PaymentVerifyResponse response = paymentService.verifyPayment(request, userDetails.getId());
        return ResponseEntity.ok(ApiResponse.success(response));
    }
}
