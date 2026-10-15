package com.hopebi.marketplace.promotion;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.*;

class PromotionCalculationTest {

    @Test
    @DisplayName("Flat discount should calculate accurately when order meets minimum value")
    void testFlatDiscount() {
        Promotion promo = new Promotion(
                "HOPEBI50", "Flat 500 off",
                PromotionType.FLAT_AMOUNT,
                BigDecimal.valueOf(500),
                BigDecimal.valueOf(1999),
                null,
                LocalDateTime.now().minusDays(1),
                LocalDateTime.now().plusDays(10)
        );

        assertTrue(promo.isValidFor(BigDecimal.valueOf(2500)));
        assertFalse(promo.isValidFor(BigDecimal.valueOf(1500))); // Below min order value

        BigDecimal discount = promo.calculateDiscount(BigDecimal.valueOf(2500));
        assertEquals(BigDecimal.valueOf(500), discount);
    }

    @Test
    @DisplayName("Percentage discount should respect maximum discount cap")
    void testPercentageDiscountCap() {
        Promotion promo = new Promotion(
                "SAVE20", "20% off capped at 300",
                PromotionType.PERCENTAGE,
                BigDecimal.valueOf(20),
                BigDecimal.valueOf(500),
                BigDecimal.valueOf(300),
                LocalDateTime.now().minusDays(1),
                LocalDateTime.now().plusDays(10)
        );

        // 20% of 2000 is 400, but cap is 300
        BigDecimal discount = promo.calculateDiscount(BigDecimal.valueOf(2000));
        assertEquals(BigDecimal.valueOf(300), discount);

        // 20% of 1000 is 200 (under cap)
        BigDecimal normalDiscount = promo.calculateDiscount(BigDecimal.valueOf(1000));
        assertEquals(BigDecimal.valueOf(200.00).setScale(2), normalDiscount.setScale(2));
    }
}
