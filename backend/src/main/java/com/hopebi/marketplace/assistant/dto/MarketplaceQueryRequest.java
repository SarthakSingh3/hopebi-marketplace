package com.hopebi.marketplace.assistant.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class MarketplaceQueryRequest {

    @NotBlank(message = "Query cannot be blank")
    @Size(min = 2, max = 500, message = "Query must be between 2 and 500 characters")
    private String query;

    private String sessionId;

    private String userName;

    public MarketplaceQueryRequest() {}

    public MarketplaceQueryRequest(String query) {
        this.query = query;
    }

    public MarketplaceQueryRequest(String query, String userName) {
        this.query = query;
        this.userName = userName;
    }

    public String getQuery() { return query; }
    public void setQuery(String query) { this.query = query; }
    public String getSessionId() { return sessionId; }
    public void setSessionId(String sessionId) { this.sessionId = sessionId; }
    public String getUserName() { return userName; }
    public void setUserName(String userName) { this.userName = userName; }
}
