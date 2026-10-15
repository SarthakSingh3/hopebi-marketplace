package com.hopebi.marketplace.cart.dto;

import java.util.List;

public class MergeCartRequest {
    public static class GuestCartItem {
        private Long productId;
        private int quantity;

        public GuestCartItem() {}
        public GuestCartItem(Long productId, int quantity) {
            this.productId = productId;
            this.quantity = quantity;
        }
        public Long getProductId() { return productId; }
        public void setProductId(Long productId) { this.productId = productId; }
        public int getQuantity() { return quantity; }
        public void setQuantity(int quantity) { this.quantity = quantity; }
    }

    private String guestSessionId;
    private List<GuestCartItem> localItems;

    public MergeCartRequest() {}

    public String getGuestSessionId() { return guestSessionId; }
    public void setGuestSessionId(String guestSessionId) { this.guestSessionId = guestSessionId; }
    public List<GuestCartItem> getLocalItems() { return localItems; }
    public void setLocalItems(List<GuestCartItem> localItems) { this.localItems = localItems; }
}
