package com.hopebi.marketplace.auth;

import com.hopebi.marketplace.auth.dto.*;
import com.hopebi.marketplace.common.ConflictException;
import com.hopebi.marketplace.common.ResourceNotFoundException;
import com.hopebi.marketplace.config.JwtTokenProvider;
import com.hopebi.marketplace.user.CustomUserDetails;
import com.hopebi.marketplace.user.Role;
import com.hopebi.marketplace.user.User;
import com.hopebi.marketplace.user.UserRepository;
import com.hopebi.marketplace.seller.SellerRepository;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import org.springframework.beans.factory.annotation.Value;

import java.util.UUID;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final SellerRepository sellerRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider tokenProvider;
    private final SmsService smsService;

    @Value("${spring.profiles.active:dev}")
    private String activeProfile;

    public AuthService(UserRepository userRepository,
                       SellerRepository sellerRepository,
                       PasswordEncoder passwordEncoder,
                       AuthenticationManager authenticationManager,
                       JwtTokenProvider tokenProvider,
                       SmsService smsService) {
        this.userRepository = userRepository;
        this.sellerRepository = sellerRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.tokenProvider = tokenProvider;
        this.smsService = smsService;
    }

    private UserSummaryDto mapToDto(User user) {
        UserSummaryDto dto = new UserSummaryDto(user);
        if (user.getRole() == Role.ROLE_SELLER) {
            sellerRepository.findByUserId(user.getId()).ifPresent(seller -> {
                dto.setCompanyName(seller.getCompanyName());
                dto.setSellerSlug(seller.getSlug());
                dto.setSellerStatus(seller.getSellerStatus().name());
            });
        }
        return dto;
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        String normalizedEmail = request.getEmail().trim().toLowerCase();

        if (userRepository.existsByEmail(normalizedEmail)) {
            throw new ConflictException("Email is already registered: " + normalizedEmail);
        }

        // Prevent self-registration as ADMIN
        Role assignedRole = request.getRole() == Role.ROLE_ADMIN ? Role.ROLE_CUSTOMER : request.getRole();
        if (assignedRole == null) {
            assignedRole = Role.ROLE_CUSTOMER;
        }

        String cleanPhone = normalizePhone(request.getPhone());

        User user = new User(
                request.getFullName(),
                normalizedEmail,
                cleanPhone,
                passwordEncoder.encode(request.getPassword()),
                assignedRole
        );

        User savedUser = userRepository.save(user);

        if (assignedRole == Role.ROLE_SELLER) {
            String baseSlug = request.getFullName().toLowerCase().replaceAll("[^a-z0-9]", "-");
            String slug = baseSlug.isEmpty() ? "artisan" : baseSlug;
            int counter = 1;
            while (sellerRepository.existsBySlug(slug)) {
                slug = baseSlug + "-" + counter++;
            }
            com.hopebi.marketplace.seller.SellerProfile profile = new com.hopebi.marketplace.seller.SellerProfile(
                    savedUser,
                    request.getFullName() + " Workshop",
                    slug,
                    "Verified regional artisan producer registered directly on Hopebi.",
                    "India",
                    "India",
                    "Direct Indian manufacturer selling directly to consumers.",
                    request.getPhone() != null ? request.getPhone() : "",
                    normalizedEmail,
                    ""
            );
            profile.setSellerStatus(com.hopebi.marketplace.seller.SellerStatus.APPROVED);
            profile.setVerificationStatus(com.hopebi.marketplace.seller.SellerVerificationStatus.VERIFIED);
            sellerRepository.save(profile);
        }

        // Auto authenticate on register
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(normalizedEmail, request.getPassword())
        );
        SecurityContextHolder.getContext().setAuthentication(authentication);

        String token = tokenProvider.generateToken(authentication);
        return new AuthResponse(token, mapToDto(savedUser));
    }

    public AuthResponse login(LoginRequest request) {
        String normalizedEmail = request.getEmail().trim().toLowerCase();

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(normalizedEmail, request.getPassword())
        );
        SecurityContextHolder.getContext().setAuthentication(authentication);

        String token = tokenProvider.generateToken(authentication);

        User user = userRepository.findByEmail(normalizedEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + normalizedEmail));

        if (user.getAccountStatus() != com.hopebi.marketplace.user.UserStatus.ACTIVE) {
            throw new com.hopebi.marketplace.common.UnauthorizedException("Your account is currently " + user.getAccountStatus().name().toLowerCase() + ". Please contact support@hopebi.com");
        }

        return new AuthResponse(token, mapToDto(user));
    }

    @Transactional
    public AuthResponse loginWithGoogle(GoogleAuthRequest request) {
        String normalizedEmail = request.getEmail().trim().toLowerCase();

        User user = userRepository.findByEmail(normalizedEmail)
                .orElseGet(() -> {
                    String name = (request.getName() != null && !request.getName().trim().isEmpty())
                            ? request.getName().trim()
                            : normalizedEmail.split("@")[0];
                    Role targetRole = (request.getRole() == Role.ROLE_SELLER) ? Role.ROLE_SELLER : Role.ROLE_CUSTOMER;
                    String initialPassword = (request.getPassword() != null && request.getPassword().length() >= 6)
                            ? request.getPassword()
                            : UUID.randomUUID().toString();
                    User newUser = new User(
                            name,
                            normalizedEmail,
                            "",
                            passwordEncoder.encode(initialPassword),
                            targetRole
                    );
                    User saved = userRepository.save(newUser);

                    if (targetRole == Role.ROLE_SELLER) {
                        String baseSlug = name.toLowerCase().replaceAll("[^a-z0-9]", "-");
                        String slug = baseSlug.isEmpty() ? "artisan" : baseSlug;
                        int counter = 1;
                        while (sellerRepository.existsBySlug(slug)) {
                            slug = baseSlug + "-" + counter++;
                        }
                        com.hopebi.marketplace.seller.SellerProfile profile = new com.hopebi.marketplace.seller.SellerProfile(
                                saved,
                                name + " Workshop",
                                slug,
                                "Artisan producer and manufacturer directly onboarded via Google.",
                                "India",
                                "India",
                                "Verified regional maker cluster selling directly to Indian consumers.",
                                "",
                                normalizedEmail,
                                ""
                        );
                        profile.setSellerStatus(com.hopebi.marketplace.seller.SellerStatus.APPROVED);
                        profile.setVerificationStatus(com.hopebi.marketplace.seller.SellerVerificationStatus.VERIFIED);
                        sellerRepository.save(profile);
                    }
                    return saved;
                });

        // If existing user and user provided a password to link/set:
        if (request.getPassword() != null && request.getPassword().length() >= 6) {
            user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
            userRepository.save(user);
        }

        if (user.getAccountStatus() != com.hopebi.marketplace.user.UserStatus.ACTIVE) {
            throw new com.hopebi.marketplace.common.UnauthorizedException("Your account is currently " + user.getAccountStatus().name().toLowerCase() + ". Please contact support@hopebi.com");
        }

        CustomUserDetails userDetails = new CustomUserDetails(user);
        Authentication authentication = new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
        SecurityContextHolder.getContext().setAuthentication(authentication);

        String token = tokenProvider.generateToken(authentication);
        return new AuthResponse(token, mapToDto(user));
    }

    @Transactional
    public void updatePassword(String email, String newPassword) {
        User user = userRepository.findByEmail(email.trim().toLowerCase())
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));
        user.setPasswordHash(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }

    private String normalizePhone(String rawPhone) {
        if (rawPhone == null) return "";
        String digits = rawPhone.replaceAll("\\D", "");
        if (digits.startsWith("91") && digits.length() == 12) {
            digits = digits.substring(2);
        } else if (digits.startsWith("0") && digits.length() == 11) {
            digits = digits.substring(1);
        }
        return digits;
    }

    private static class OtpRecord {
        final String code;
        final long createdAt;
        final long expiresAt;
        int failedAttempts = 0;

        OtpRecord(String code) {
            this.code = code;
            this.createdAt = System.currentTimeMillis();
            this.expiresAt = System.currentTimeMillis() + (5 * 60 * 1000); // 5 minutes validity
        }

        boolean isExpired() {
            return System.currentTimeMillis() > expiresAt;
        }
    }

    private final java.util.concurrent.ConcurrentHashMap<String, OtpRecord> otpStorage = new java.util.concurrent.ConcurrentHashMap<>();

    public OtpResponse sendOtp(OtpSendRequest request) {
        String phone = normalizePhone(request.getPhone());
        if (phone.length() != 10 || !phone.matches("^[6-9]\\d{9}$")) {
            throw new com.hopebi.marketplace.common.BadRequestException("Please enter a valid 10-digit Indian mobile number starting with 6, 7, 8, or 9.");
        }

        // Rate limit: 15s cooldown between OTP requests for the same number
        OtpRecord existing = otpStorage.get(phone);
        if (existing != null && (System.currentTimeMillis() - existing.createdAt < 15000)) {
            long remainingSec = 15 - ((System.currentTimeMillis() - existing.createdAt) / 1000);
            throw new com.hopebi.marketplace.common.BadRequestException("Please wait " + remainingSec + " seconds before requesting a new OTP.");
        }

        boolean isExisting = userRepository.existsByPhone(phone);
        String otp = String.format("%06d", new java.util.Random().nextInt(900000) + 100000);
        otpStorage.put(phone, new OtpRecord(otp));

        // Dispatch real SMS via configured SMS gateway (Fast2SMS / Twilio) or log in dev
        smsService.sendOtpSms(phone, otp);

        boolean hasRealSms = smsService.isRealSmsConfigured();
        String returnedOtp = hasRealSms ? null : otp;
        String message = hasRealSms
                ? ("6-digit OTP dispatched to +91 " + phone)
                : ("Demo Mode OTP: " + otp + " (SMS gateway not configured)");
        return new OtpResponse(phone, message, returnedOtp, isExisting);
    }

    @Transactional
    public AuthResponse verifyOtp(OtpVerifyRequest request) {
        String phone = normalizePhone(request.getPhone());
        OtpRecord record = otpStorage.get(phone);

        boolean hasRealSms = smsService.isRealSmsConfigured();
        boolean devBypass = !hasRealSms && "123456".equals(request.getOtp().trim());

        if (record == null && !devBypass) {
            throw new com.hopebi.marketplace.common.BadRequestException("No active OTP found for this number. Please request an OTP first.");
        }

        if (record != null && record.isExpired() && !devBypass) {
            otpStorage.remove(phone);
            throw new com.hopebi.marketplace.common.BadRequestException("OTP has expired (valid for 5 minutes). Please request a new code.");
        }

        boolean codeMatches = record != null && record.code.equals(request.getOtp().trim());
        if (!codeMatches && !devBypass) {
            if (record != null) {
                record.failedAttempts++;
                if (record.failedAttempts >= 5) {
                    otpStorage.remove(phone);
                    throw new com.hopebi.marketplace.common.BadRequestException("Too many failed attempts. This OTP has been invalidated for security. Please request a new code.");
                }
            }
            throw new com.hopebi.marketplace.common.BadRequestException("Invalid OTP code. Please enter the correct code or request a new OTP.");
        }
        otpStorage.remove(phone);

        User user = userRepository.findByPhone(phone)
                .orElseGet(() -> {
                    String name = (request.getName() != null && !request.getName().trim().isEmpty())
                            ? request.getName().trim()
                            : "User " + phone.substring(phone.length() - 4);
                    Role targetRole = (request.getRole() == Role.ROLE_SELLER) ? Role.ROLE_SELLER : Role.ROLE_CUSTOMER;
                    String generatedEmail = "phone_" + phone + "@hopebi.in";
                    User newUser = new User(
                            name,
                            generatedEmail,
                            phone,
                            passwordEncoder.encode(UUID.randomUUID().toString()),
                            targetRole
                    );
                    User saved = userRepository.save(newUser);

                    if (targetRole == Role.ROLE_SELLER) {
                        String baseSlug = name.toLowerCase().replaceAll("[^a-z0-9]", "-");
                        String slug = baseSlug.isEmpty() ? "artisan" : baseSlug;
                        int counter = 1;
                        while (sellerRepository.existsBySlug(slug)) {
                            slug = baseSlug + "-" + counter++;
                        }
                        com.hopebi.marketplace.seller.SellerProfile profile = new com.hopebi.marketplace.seller.SellerProfile(
                                saved,
                                name + " Workshop",
                                slug,
                                "Verified regional maker onboarded via OTP verification.",
                                "India",
                                "India",
                                "Direct Indian manufacturer selling directly to consumers.",
                                phone,
                                generatedEmail,
                                ""
                        );
                        profile.setSellerStatus(com.hopebi.marketplace.seller.SellerStatus.APPROVED);
                        profile.setVerificationStatus(com.hopebi.marketplace.seller.SellerVerificationStatus.VERIFIED);
                        sellerRepository.save(profile);
                    }
                    return saved;
                });

        if (user.getAccountStatus() != com.hopebi.marketplace.user.UserStatus.ACTIVE) {
            throw new com.hopebi.marketplace.common.UnauthorizedException("Your account is currently " + user.getAccountStatus().name().toLowerCase() + ". Please contact support@hopebi.com");
        }

        CustomUserDetails userDetails = new CustomUserDetails(user);
        Authentication authentication = new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
        SecurityContextHolder.getContext().setAuthentication(authentication);

        String token = tokenProvider.generateToken(authentication);
        return new AuthResponse(token, mapToDto(user));
    }

    @Transactional(readOnly = true)
    public UserSummaryDto getCurrentUser(String email) {
        User user = userRepository.findByEmail(email.trim().toLowerCase())
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));
        return mapToDto(user);
    }
}
