package com.hopebi.marketplace.product;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;

import static org.junit.jupiter.api.Assertions.*;

class ProductPricingTest {

    @Test
    @DisplayName("Effective price should return sale price when sale price is less than regular price")
    void testEffectivePriceWithSalePrice() {
        Product product = new Product();
        product.setRegularPrice(BigDecimal.valueOf(1999));
        product.setSalePrice(BigDecimal.valueOf(1499));

        assertEquals(BigDecimal.valueOf(1499), product.getEffectivePrice());
    }

    @Test
    @DisplayName("Effective price should return regular price when sale price is null or zero")
    void testEffectivePriceWithoutSalePrice() {
        Product product = new Product();
        product.setRegularPrice(BigDecimal.valueOf(1999));
        product.setSalePrice(null);

        assertEquals(BigDecimal.valueOf(1999), product.getEffectivePrice());

        product.setSalePrice(BigDecimal.ZERO);
        assertEquals(BigDecimal.valueOf(1999), product.getEffectivePrice());
    }

    @Test
    @DisplayName("Product stock check should return true if stock is positive")
    void testInStockCheck() {
        Product product = new Product();
        product.setStockQuantity(5);
        assertTrue(product.isInStock());

        product.setStockQuantity(0);
        assertFalse(product.isInStock());
    }
}
