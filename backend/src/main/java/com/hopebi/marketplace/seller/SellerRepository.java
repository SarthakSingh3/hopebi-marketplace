package com.hopebi.marketplace.seller;

import com.hopebi.marketplace.user.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SellerRepository extends JpaRepository<SellerProfile, Long> {
    Optional<SellerProfile> findBySlug(String slug);
    Optional<SellerProfile> findBySlugAndSellerStatus(String slug, SellerStatus status);
    Optional<SellerProfile> findByUser(User user);
    Optional<SellerProfile> findByUserId(Long userId);
    List<SellerProfile> findBySellerStatus(SellerStatus status);
    boolean existsBySlug(String slug);
    long countBySellerStatus(SellerStatus status);
}
