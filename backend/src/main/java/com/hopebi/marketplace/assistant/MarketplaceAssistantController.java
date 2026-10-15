package com.hopebi.marketplace.assistant;

import com.hopebi.marketplace.assistant.dto.MarketplaceQueryRequest;
import com.hopebi.marketplace.assistant.dto.MarketplaceQueryResponse;
import com.hopebi.marketplace.common.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/assistant")
@Tag(name = "AI Marketplace Assistant", description = "Site-grounded AI conversational shopping assistant & knowledge engine")
public class MarketplaceAssistantController {

    private final MarketplaceAssistantService assistantService;

    public MarketplaceAssistantController(MarketplaceAssistantService assistantService) {
        this.assistantService = assistantService;
    }

    @PostMapping("/query")
    @Operation(summary = "Ask HOPEBI AI a question", description = "Answers queries strictly grounded to HOPEBI products, manufacturers, traditional Indian craft clusters, and store policies.")
    public ResponseEntity<ApiResponse<MarketplaceQueryResponse>> queryAssistant(
            @Valid @RequestBody MarketplaceQueryRequest request,
            @org.springframework.security.core.annotation.AuthenticationPrincipal com.hopebi.marketplace.user.CustomUserDetails userDetails) {
        if ((request.getUserName() == null || request.getUserName().trim().isEmpty()) && userDetails != null) {
            request.setUserName(userDetails.getFullName());
        }
        MarketplaceQueryResponse response = assistantService.answerQuery(request);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PostMapping("/chat")
    @Operation(summary = "Chat endpoint alias for conversational widgets")
    public ResponseEntity<ApiResponse<MarketplaceQueryResponse>> chatAssistant(
            @Valid @RequestBody MarketplaceQueryRequest request,
            @org.springframework.security.core.annotation.AuthenticationPrincipal com.hopebi.marketplace.user.CustomUserDetails userDetails) {
        return queryAssistant(request, userDetails);
    }
}
