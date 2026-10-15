package com.hopebi.marketplace.cart;

import com.hopebi.marketplace.cart.dto.CartDto;
import com.hopebi.marketplace.cart.dto.CartItemDto;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class CartCalculationTest {

    @Test
    @DisplayName("Cart totals should calculate shipping fee of ₹99 for orders below ₹999")
    void testShippingFeeBelowThreshold() {
        CartDto cart = new CartDto();
        CartItemDto item = new CartItemDto();
        item.setQuantity(1);
        item.setUnitPrice(BigDecimal.valueOf(500));
        item.setRegularPrice(BigDecimal.valueOf(500));
        item.setLineTotal(BigDecimal.valueOf(500));
        item.setInStock(true);

        cart.setItems(List.of(item));
        cart.recalculateTotals();

        assertEquals(BigDecimal.valueOf(500), cart.getSubtotal());
        assertEquals(BigDecimal.valueOf(99), cart.getEstimatedShipping());
        assertEquals(BigDecimal.valueOf(599), cart.getEstimatedTotal());
    }

    @Test
    @DisplayName("Cart totals should give free shipping on orders ₹999 and above")
    void testFreeShippingAboveThreshold() {
        CartDto cart = new CartDto();
        CartItemDto item = new CartItemDto();
        item.setQuantity(1);
        item.setUnitPrice(BigDecimal.valueOf(1299));
        item.setRegularPrice(BigDecimal.valueOf(1599));
        item.setLineTotal(BigDecimal.valueOf(1299));
        item.setInStock(true);

        cart.setItems(List.of(item));
        cart.recalculateTotals();

        assertEquals(BigDecimal.valueOf(1299), cart.getSubtotal());
        assertEquals(BigDecimal.ZERO, cart.getEstimatedShipping());
        assertEquals(BigDecimal.valueOf(1299), cart.getEstimatedTotal());
        assertEquals(BigDecimal.valueOf(300), cart.getSavings());
    }
}
