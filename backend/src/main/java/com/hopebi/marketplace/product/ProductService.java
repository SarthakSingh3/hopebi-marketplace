package com.hopebi.marketplace.product;

import com.hopebi.marketplace.category.Category;
import com.hopebi.marketplace.category.CategoryRepository;
import com.hopebi.marketplace.common.BadRequestException;
import com.hopebi.marketplace.common.PageResponse;
import com.hopebi.marketplace.common.ResourceNotFoundException;
import com.hopebi.marketplace.common.UnauthorizedException;
import com.hopebi.marketplace.product.dto.*;
import com.hopebi.marketplace.seller.SellerProfile;
import com.hopebi.marketplace.seller.SellerRepository;
import com.hopebi.marketplace.seller.SellerStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.text.Normalizer;
import java.util.List;
import java.util.Locale;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Service
public class ProductService {

    private static final Pattern NONLATIN = Pattern.compile("[^\\w-]");
    private static final Pattern WHITESPACE = Pattern.compile("[\\s]");

    private final ProductRepository productRepository;
    private final ProductImageRepository productImageRepository;
    private final CategoryRepository categoryRepository;
    private final SellerRepository sellerRepository;

    public ProductService(ProductRepository productRepository,
                          ProductImageRepository productImageRepository,
                          CategoryRepository categoryRepository,
                          SellerRepository sellerRepository) {
        this.productRepository = productRepository;
        this.productImageRepository = productImageRepository;
        this.categoryRepository = categoryRepository;
        this.sellerRepository = sellerRepository;
    }

    @Transactional(readOnly = true)
    public PageResponse<ProductDto> getPublicProducts(
            String categorySlug,
            String sellerSlug,
            Boolean inStock,
            String search,
            int page,
            int size,
            String sortBy,
            String sortDir) {

        // Enforce safe page boundaries
        int pageNumber = Math.max(0, page);
        int pageSize = Math.min(Math.max(1, size), 50);

        Sort sort = Sort.by(Sort.Direction.DESC, "createdAt");
        if ("price_asc".equalsIgnoreCase(sortBy)) {
            sort = Sort.by(Sort.Direction.ASC, "regularPrice");
        } else if ("price_desc".equalsIgnoreCase(sortBy)) {
            sort = Sort.by(Sort.Direction.DESC, "regularPrice");
        } else if ("name_asc".equalsIgnoreCase(sortBy)) {
            sort = Sort.by(Sort.Direction.ASC, "name");
        } else if ("oldest".equalsIgnoreCase(sortBy)) {
            sort = Sort.by(Sort.Direction.ASC, "createdAt");
        }

        Pageable pageable = PageRequest.of(pageNumber, pageSize, sort);

        String trimmedSearch = (search != null && !search.trim().isEmpty()) ? search.trim() : null;
        String trimmedCategory = (categorySlug != null && !categorySlug.trim().isEmpty()) ? categorySlug.trim() : null;
        String trimmedSeller = (sellerSlug != null && !sellerSlug.trim().isEmpty()) ? sellerSlug.trim() : null;

        Page<Product> productPage = productRepository.findPublicProductsWithFilters(
                trimmedCategory, trimmedSeller, inStock, trimmedSearch, pageable);

        Page<ProductDto> dtoPage = productPage.map(ProductDto::new);
        return PageResponse.from(dtoPage);
    }

    @Transactional(readOnly = true)
    public List<ProductDto> getFeaturedDiscoveries(int limit) {
        int boundedLimit = Math.min(Math.max(1, limit), 20);
        return productRepository.findFeaturedDiscoveries(PageRequest.of(0, boundedLimit))
                .stream()
                .map(ProductDto::new)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ProductDetailDto getPublicProductBySlug(String slug) {
        Product product = productRepository.findPublicBySlug(slug)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found or not published: " + slug));
        return new ProductDetailDto(product);
    }

    @Transactional(readOnly = true)
    public Product getProductEntityById(Long id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with ID: " + id));
    }

    @Transactional
    public ProductDetailDto createProduct(Long sellerUserId, ProductCreateRequest request) {
        SellerProfile seller = sellerRepository.findByUserId(sellerUserId)
                .orElseThrow(() -> new UnauthorizedException("Authenticated user does not have a seller profile."));

        if (seller.getSellerStatus() != SellerStatus.APPROVED) {
            throw new BadRequestException("Seller account must be approved by an administrator before listing products.");
        }

        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with ID: " + request.getCategoryId()));

        validatePricing(request.getRegularPrice(), request.getSalePrice());

        String baseSlug = toSlug(request.getName() + "-" + seller.getCompanyName());
        String slug = baseSlug;
        int counter = 1;
        while (productRepository.existsBySlug(slug)) {
            slug = baseSlug + "-" + counter++;
        }

        Product product = new Product(
                seller,
                category,
                request.getName().trim(),
                slug,
                request.getSku().trim(),
                request.getShortDescription(),
                request.getFullDescription(),
                request.getRegularPrice(),
                request.getSalePrice(),
                request.getStockQuantity(),
                request.getMaterials(),
                request.getOriginCityState() != null ? request.getOriginCityState() : (seller.getCity() + ", " + seller.getState()),
                request.getVerifiedClaims()
        );

        if (request.getDimensions() != null) product.setDimensions(request.getDimensions());
        if (request.getWeightGrams() != null) product.setWeightGrams(request.getWeightGrams());
        if (request.getReturnPolicy() != null) product.setReturnPolicy(request.getReturnPolicy());

        if (request.getImageUrls() != null && !request.getImageUrls().isEmpty()) {
            for (int i = 0; i < request.getImageUrls().size(); i++) {
                String url = request.getImageUrls().get(i);
                product.addImage(new ProductImage(url, product.getName(), i, i == 0));
            }
        }

        Product saved = productRepository.save(product);
        return new ProductDetailDto(saved);
    }

    @Transactional
    public ProductDetailDto updateProduct(Long productId, Long sellerUserId, ProductCreateRequest request) {
        Product product = getProductEntityById(productId);

        if (!product.getSeller().getUser().getId().equals(sellerUserId)) {
            throw new UnauthorizedException("You are not authorised to modify this product.");
        }

        validatePricing(request.getRegularPrice(), request.getSalePrice());

        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found"));

        product.setCategory(category);
        product.setName(request.getName().trim());
        product.setSku(request.getSku().trim());
        product.setShortDescription(request.getShortDescription());
        product.setFullDescription(request.getFullDescription());
        product.setRegularPrice(request.getRegularPrice());
        product.setSalePrice(request.getSalePrice());
        product.setStockQuantity(request.getStockQuantity());
        product.setMaterials(request.getMaterials());
        product.setDimensions(request.getDimensions());
        product.setWeightGrams(request.getWeightGrams());
        product.setReturnPolicy(request.getReturnPolicy());
        product.setOriginCityState(request.getOriginCityState());
        product.setVerifiedClaims(request.getVerifiedClaims());

        if (request.getImageUrls() != null) {
            product.getImages().clear();
            for (int i = 0; i < request.getImageUrls().size(); i++) {
                String url = request.getImageUrls().get(i);
                product.addImage(new ProductImage(url, product.getName(), i, i == 0));
            }
        }

        // Any significant edit resets approval to PENDING for moderation safety
        product.setApprovalStatus(ProductApprovalStatus.PENDING);

        Product saved = productRepository.save(product);
        return new ProductDetailDto(saved);
    }

    @Transactional
    public ProductDetailDto submitProductForApproval(Long productId, Long sellerUserId) {
        Product product = getProductEntityById(productId);
        if (!product.getSeller().getUser().getId().equals(sellerUserId)) {
            throw new UnauthorizedException("You are not authorised to submit this product.");
        }
        product.setApprovalStatus(ProductApprovalStatus.PENDING);
        return new ProductDetailDto(productRepository.save(product));
    }

    @Transactional(readOnly = true)
    public List<ProductDto> getProductsBySeller(Long sellerUserId) {
        SellerProfile seller = sellerRepository.findByUserId(sellerUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Seller profile not found"));
        return productRepository.findBySellerId(seller.getId())
                .stream()
                .map(ProductDto::new)
                .collect(Collectors.toList());
    }

    @Transactional
    public ProductDetailDto moderateProduct(Long productId, ProductApprovalStatus status, ProductStatus publicationStatus) {
        Product product = getProductEntityById(productId);
        product.setApprovalStatus(status);
        if (publicationStatus != null) {
            product.setProductStatus(publicationStatus);
        } else if (status == ProductApprovalStatus.APPROVED) {
            product.setProductStatus(ProductStatus.PUBLISHED);
        } else if (status == ProductApprovalStatus.REJECTED) {
            product.setProductStatus(ProductStatus.UNPUBLISHED);
        }
        return new ProductDetailDto(productRepository.save(product));
    }

    private void validatePricing(BigDecimal regularPrice, BigDecimal salePrice) {
        if (regularPrice == null || regularPrice.compareTo(BigDecimal.ZERO) <= 0) {
            throw new BadRequestException("Regular price must be greater than zero.");
        }
        if (salePrice != null && salePrice.compareTo(BigDecimal.ZERO) > 0) {
            if (salePrice.compareTo(regularPrice) >= 0) {
                throw new BadRequestException("Sale price must be strictly less than the regular price.");
            }
        }
    }

    private String toSlug(String input) {
        String nowhitespace = WHITESPACE.matcher(input).replaceAll("-");
        String normalized = Normalizer.normalize(nowhitespace, Normalizer.Form.NFD);
        String slug = NONLATIN.matcher(normalized).replaceAll("");
        return slug.toLowerCase(Locale.ENGLISH);
    }
}
