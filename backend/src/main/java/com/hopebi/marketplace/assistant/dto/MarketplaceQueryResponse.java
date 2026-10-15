package com.hopebi.marketplace.assistant.dto;

import com.hopebi.marketplace.product.dto.ProductDto;
import com.hopebi.marketplace.seller.dto.SellerPublicDto;

import java.util.ArrayList;
import java.util.List;

public class MarketplaceQueryResponse {

    private String query;
    private String answer;
    private String topic;
    private boolean isGrounded = true;
    private List<ProductDto> relevantProducts = new ArrayList<>();
    private List<SellerPublicDto> relevantSellers = new ArrayList<>();
    private List<String> suggestedQueries = new ArrayList<>();

    public MarketplaceQueryResponse() {}

    public MarketplaceQueryResponse(String query, String answer, String topic) {
        this.query = query;
        this.answer = answer;
        this.topic = topic;
    }

    public String getQuery() { return query; }
    public void setQuery(String query) { this.query = query; }

    public String getAnswer() { return answer; }
    public void setAnswer(String answer) { this.answer = answer; }

    public String getTopic() { return topic; }
    public void setTopic(String topic) { this.topic = topic; }

    public boolean isGrounded() { return isGrounded; }
    public void setGrounded(boolean grounded) { isGrounded = grounded; }

    public List<ProductDto> getRelevantProducts() { return relevantProducts; }
    public void setRelevantProducts(List<ProductDto> relevantProducts) { this.relevantProducts = relevantProducts; }

    public List<SellerPublicDto> getRelevantSellers() { return relevantSellers; }
    public void setRelevantSellers(List<SellerPublicDto> relevantSellers) { this.relevantSellers = relevantSellers; }

    public List<String> getSuggestedQueries() { return suggestedQueries; }
    public void setSuggestedQueries(List<String> suggestedQueries) { this.suggestedQueries = suggestedQueries; }
}
