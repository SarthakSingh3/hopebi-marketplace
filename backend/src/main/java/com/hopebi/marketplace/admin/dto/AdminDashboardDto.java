package com.hopebi.marketplace.admin.dto;

import java.math.BigDecimal;
import java.util.Map;

public class AdminDashboardDto {
    private long totalCustomers;
    private long approvedSellers;
    private long pendingSellers;
    private long publishedProducts;
    private long pendingProductApprovals;
    private long totalOrders;
    private BigDecimal grossMerchandiseValue;
    private BigDecimal platformRevenue;
    private Map<String, Long> ordersByStatus;
    private Map<String, Long> paymentsByStatus;

    public AdminDashboardDto() {}

    public long getTotalCustomers() { return totalCustomers; }
    public void setTotalCustomers(long totalCustomers) { this.totalCustomers = totalCustomers; }
    public long getApprovedSellers() { return approvedSellers; }
    public void setApprovedSellers(long approvedSellers) { this.approvedSellers = approvedSellers; }
    public long getPendingSellers() { return pendingSellers; }
    public void setPendingSellers(long pendingSellers) { this.pendingSellers = pendingSellers; }
    public long getPublishedProducts() { return publishedProducts; }
    public void setPublishedProducts(long publishedProducts) { this.publishedProducts = publishedProducts; }
    public long getPendingProductApprovals() { return pendingProductApprovals; }
    public void setPendingProductApprovals(long pendingProductApprovals) { this.pendingProductApprovals = pendingProductApprovals; }
    public long getTotalOrders() { return totalOrders; }
    public void setTotalOrders(long totalOrders) { this.totalOrders = totalOrders; }
    public BigDecimal getGrossMerchandiseValue() { return grossMerchandiseValue; }
    public void setGrossMerchandiseValue(BigDecimal grossMerchandiseValue) { this.grossMerchandiseValue = grossMerchandiseValue; }
    public BigDecimal getPlatformRevenue() { return platformRevenue; }
    public void setPlatformRevenue(BigDecimal platformRevenue) { this.platformRevenue = platformRevenue; }
    public Map<String, Long> getOrdersByStatus() { return ordersByStatus; }
    public void setOrdersByStatus(Map<String, Long> ordersByStatus) { this.ordersByStatus = ordersByStatus; }
    public Map<String, Long> getPaymentsByStatus() { return paymentsByStatus; }
    public void setPaymentsByStatus(Map<String, Long> paymentsByStatus) { this.paymentsByStatus = paymentsByStatus; }
}
