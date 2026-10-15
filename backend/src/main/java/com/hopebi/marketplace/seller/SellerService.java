package com.hopebi.marketplace.seller;

import com.hopebi.marketplace.common.BadRequestException;
import com.hopebi.marketplace.common.ConflictException;
import com.hopebi.marketplace.common.ResourceNotFoundException;
import com.hopebi.marketplace.seller.dto.*;
import com.hopebi.marketplace.user.Role;
import com.hopebi.marketplace.user.User;
import com.hopebi.marketplace.user.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.text.Normalizer;
import java.util.List;
import java.util.Locale;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Service
public class SellerService {

    private static final Pattern NONLATIN = Pattern.compile("[^\\w-]");
    private static final Pattern WHITESPACE = Pattern.compile("[\\s]");

    private final SellerRepository sellerRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public SellerService(SellerRepository sellerRepository,
                         UserRepository userRepository,
                         PasswordEncoder passwordEncoder) {
        this.sellerRepository = sellerRepository;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional
    public SellerProfileDto apply(SellerApplicationRequest request, User currentUser) {
        String baseSlug = toSlug(request.getCompanyName());
        String slug = baseSlug;
        int counter = 1;
        while (sellerRepository.existsBySlug(slug)) {
            slug = baseSlug + "-" + counter++;
        }

        User user = currentUser;
        if (user == null) {
            String email = request.getBusinessEmail().trim().toLowerCase();
            if (userRepository.existsByEmail(email)) {
                throw new ConflictException("An account already exists with email: " + email);
            }
            if (request.getPassword() == null || request.getPassword().length() < 6) {
                throw new BadRequestException("Password of at least 6 characters is required for new seller account");
            }
            user = new User(
                    request.getContactPersonName() != null ? request.getContactPersonName() : request.getCompanyName(),
                    email,
                    request.getContactPhone(),
                    passwordEncoder.encode(request.getPassword()),
                    Role.ROLE_SELLER
            );
            user = userRepository.save(user);
        } else {
            if (sellerRepository.findByUserId(user.getId()).isPresent()) {
                throw new ConflictException("You have already submitted a seller application.");
            }
            user.setRole(Role.ROLE_SELLER);
            userRepository.save(user);
        }

        SellerProfile profile = new SellerProfile(
                user,
                request.getCompanyName().trim(),
                slug,
                request.getCompanyDescription(),
                request.getCity(),
                request.getState(),
                request.getManufacturerHeritage(),
                request.getContactPhone(),
                request.getBusinessEmail().trim().toLowerCase(),
                request.getGstNumber()
        );

        SellerProfile saved = sellerRepository.save(profile);
        return new SellerProfileDto(saved);
    }

    @Transactional(readOnly = true)
    public List<SellerPublicDto> getApprovedSellers() {
        return sellerRepository.findBySellerStatus(SellerStatus.APPROVED)
                .stream()
                .map(SellerPublicDto::new)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public SellerPublicDto getApprovedSellerBySlug(String slug) {
        SellerProfile profile = sellerRepository.findBySlugAndSellerStatus(slug, SellerStatus.APPROVED)
                .orElseThrow(() -> new ResourceNotFoundException("Manufacturer not found or not active: " + slug));
        return new SellerPublicDto(profile);
    }

    @Transactional(readOnly = true)
    public SellerProfileDto getSellerProfileForUser(Long userId) {
        SellerProfile profile = sellerRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("No seller profile associated with this account."));
        return new SellerProfileDto(profile);
    }

    @Transactional(readOnly = true)
    public SellerProfile getSellerEntityForUser(Long userId) {
        return sellerRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Seller profile not found"));
    }

    @Transactional
    public SellerProfileDto updateSellerStatus(Long sellerId, SellerStatusUpdateRequest request) {
        SellerProfile profile = sellerRepository.findById(sellerId)
                .orElseThrow(() -> new ResourceNotFoundException("Seller profile not found with ID: " + sellerId));

        profile.setSellerStatus(request.getStatus());
        if (request.getVerificationStatus() != null) {
            profile.setVerificationStatus(request.getVerificationStatus());
        }
        if (request.getCommissionRate() != null) {
            profile.setCommissionRate(request.getCommissionRate());
        }

        SellerProfile updated = sellerRepository.save(profile);
        return new SellerProfileDto(updated);
    }

    @Transactional(readOnly = true)
    public List<SellerProfileDto> getAllSellersForAdmin() {
        return sellerRepository.findAll()
                .stream()
                .map(SellerProfileDto::new)
                .collect(Collectors.toList());
    }

    private String toSlug(String input) {
        String nowhitespace = WHITESPACE.matcher(input).replaceAll("-");
        String normalized = Normalizer.normalize(nowhitespace, Normalizer.Form.NFD);
        String slug = NONLATIN.matcher(normalized).replaceAll("");
        return slug.toLowerCase(Locale.ENGLISH);
    }
}
