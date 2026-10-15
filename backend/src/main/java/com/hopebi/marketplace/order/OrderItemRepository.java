package com.hopebi.marketplace.order;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {
    List<OrderItem> findBySellerIdOrderByOrderCreatedAtDesc(Long sellerId);
    Page<OrderItem> findBySellerId(Long sellerId, Pageable pageable);
    Optional<OrderItem> findByIdAndSellerId(Long id, Long sellerId);
}
