package com.hopebi.marketplace.promotion;

import com.hopebi.marketplace.promotion.dto.PromotionResultDto;
import com.hopebi.marketplace.promotion.dto.PromotionValidateRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.Optional;

@Service
public class PromotionService {

    private final PromotionRepository promotionRepository;

    public PromotionService(PromotionRepository promotionRepository) {
        this.promotionRepository = promotionRepository;
    }

    @Transactional(readOnly = true)
    public PromotionResultDto validatePromotion(PromotionValidateRequest request) {
        String cleanCode = request.getCode().trim().toUpperCase();
        Optional<Promotion> promoOpt = promotionRepository.findByCodeAndActiveTrue(cleanCode);

        if (promoOpt.isEmpty()) {
            return PromotionResultDto.invalid(cleanCode, "Invalid or expired coupon code.");
        }

        Promotion promo = promoOpt.get();
        if (!promo.isValidFor(request.getSubtotal())) {
            if (request.getSubtotal().compareTo(promo.getMinOrderValue()) < 0) {
                return PromotionResultDto.invalid(cleanCode, "Minimum order value of ₹" + promo.getMinOrderValue() + " required for this coupon.");
            }
            return PromotionResultDto.invalid(cleanCode, "Coupon is not applicable or usage limit reached.");
        }

        BigDecimal discount = promo.calculateDiscount(request.getSubtotal());
        BigDecimal newTotal = request.getSubtotal().subtract(discount);

        return PromotionResultDto.valid(cleanCode, "Coupon applied: ₹" + discount + " discount!", discount, newTotal);
    }

    @Transactional
    public void recordUsage(String code) {
        promotionRepository.findByCode(code.trim().toUpperCase()).ifPresent(p -> {
            p.setTimesUsed(p.getTimesUsed() + 1);
            promotionRepository.save(p);
        });
    }
}
