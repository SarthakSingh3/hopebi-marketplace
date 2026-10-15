package com.hopebi.marketplace.product;

import com.hopebi.marketplace.seller.SellerStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long>, JpaSpecificationExecutor<Product> {

    Optional<Product> findBySlug(String slug);

    @Query("SELECT p FROM Product p " +
           "JOIN p.seller s " +
           "WHERE p.slug = :slug " +
           "AND p.productStatus = 'PUBLISHED' " +
           "AND p.approvalStatus = 'APPROVED' " +
           "AND s.sellerStatus = 'APPROVED'")
    Optional<Product> findPublicBySlug(@Param("slug") String slug);

    List<Product> findBySellerId(Long sellerId);

    Page<Product> findBySellerId(Long sellerId, Pageable pageable);

    boolean existsBySlug(String slug);

    long countByProductStatusAndApprovalStatus(ProductStatus productStatus, ProductApprovalStatus approvalStatus);

    @Query("SELECT p FROM Product p " +
           "JOIN p.seller s " +
           "JOIN p.category c " +
           "WHERE p.productStatus = 'PUBLISHED' " +
           "AND p.approvalStatus = 'APPROVED' " +
           "AND s.sellerStatus = 'APPROVED' " +
           "AND (:categorySlug IS NULL OR c.slug = :categorySlug) " +
           "AND (:sellerSlug IS NULL OR s.slug = :sellerSlug) " +
           "AND (:inStock IS NULL OR (:inStock = true AND p.stockQuantity > 0)) " +
           "AND (:search IS NULL OR LOWER(p.name) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "     OR LOWER(p.shortDescription) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "     OR LOWER(s.companyName) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<Product> findPublicProductsWithFilters(
            @Param("categorySlug") String categorySlug,
            @Param("sellerSlug") String sellerSlug,
            @Param("inStock") Boolean inStock,
            @Param("search") String search,
            Pageable pageable);

    @Query("SELECT p FROM Product p " +
           "JOIN p.seller s " +
           "WHERE p.productStatus = 'PUBLISHED' " +
           "AND p.approvalStatus = 'APPROVED' " +
           "AND s.sellerStatus = 'APPROVED' " +
           "ORDER BY p.createdAt DESC")
    List<Product> findFeaturedDiscoveries(Pageable pageable);
}
