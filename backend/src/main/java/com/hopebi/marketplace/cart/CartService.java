package com.hopebi.marketplace.cart;

import com.hopebi.marketplace.cart.dto.*;
import com.hopebi.marketplace.common.BadRequestException;
import com.hopebi.marketplace.common.ResourceNotFoundException;
import com.hopebi.marketplace.product.Product;
import com.hopebi.marketplace.product.ProductApprovalStatus;
import com.hopebi.marketplace.product.ProductRepository;
import com.hopebi.marketplace.product.ProductStatus;
import com.hopebi.marketplace.user.User;
import com.hopebi.marketplace.user.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class CartService {

    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    public CartService(CartRepository cartRepository,
                       CartItemRepository cartItemRepository,
                       ProductRepository productRepository,
                       UserRepository userRepository) {
        this.cartRepository = cartRepository;
        this.cartItemRepository = cartItemRepository;
        this.productRepository = productRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public Cart getOrCreateUserCart(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return cartRepository.findByUserId(userId)
                .orElseGet(() -> cartRepository.save(new Cart(user)));
    }

    @Transactional
    public Cart getOrCreateGuestCart(String guestSessionId) {
        String sessionId = (guestSessionId != null && !guestSessionId.trim().isEmpty())
                ? guestSessionId : UUID.randomUUID().toString();
        return cartRepository.findByGuestSessionId(sessionId)
                .orElseGet(() -> cartRepository.save(new Cart(sessionId)));
    }

    @Transactional(readOnly = true)
    public CartDto getCartDtoForUser(Long userId) {
        Cart cart = getOrCreateUserCart(userId);
        return mapToCartDto(cart);
    }

    @Transactional(readOnly = true)
    public CartDto getCartDtoForGuest(String guestSessionId) {
        Cart cart = getOrCreateGuestCart(guestSessionId);
        return mapToCartDto(cart);
    }

    @Transactional
    public CartDto addItem(Long userId, String guestSessionId, AddToCartRequest request) {
        if (request.getQuantity() <= 0) {
            throw new BadRequestException("Quantity must be greater than zero.");
        }

        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with ID: " + request.getProductId()));

        if (product.getProductStatus() != ProductStatus.PUBLISHED || product.getApprovalStatus() != ProductApprovalStatus.APPROVED) {
            throw new BadRequestException("This product is currently not available for purchase.");
        }

        if (product.getStockQuantity() < request.getQuantity()) {
            throw new BadRequestException("Requested quantity exceeds available stock (" + product.getStockQuantity() + " available).");
        }

        Cart cart = (userId != null) ? getOrCreateUserCart(userId) : getOrCreateGuestCart(guestSessionId);

        Optional<CartItem> existingItemOpt = cartItemRepository.findByCartIdAndProductId(cart.getId(), product.getId());
        if (existingItemOpt.isPresent()) {
            CartItem item = existingItemOpt.get();
            int newQty = item.getQuantity() + request.getQuantity();
            if (newQty > product.getStockQuantity()) {
                throw new BadRequestException("Cannot add more. Total in cart would exceed available stock (" + product.getStockQuantity() + ").");
            }
            item.setQuantity(newQty);
            cartItemRepository.save(item);
        } else {
            CartItem newItem = new CartItem(cart, product, request.getQuantity());
            cart.addItem(newItem);
            cartItemRepository.save(newItem);
        }

        return mapToCartDto(cart);
    }

    @Transactional
    public CartDto updateItemQuantity(Long userId, String guestSessionId, Long itemId, int quantity) {
        Cart cart = (userId != null) ? getOrCreateUserCart(userId) : getOrCreateGuestCart(guestSessionId);

        CartItem item = cartItemRepository.findById(itemId)
                .orElseThrow(() -> new ResourceNotFoundException("Cart item not found: " + itemId));

        if (!item.getCart().getId().equals(cart.getId())) {
            throw new BadRequestException("Cart item does not belong to your cart.");
        }

        if (quantity <= 0) {
            cart.removeItem(item);
            cartItemRepository.delete(item);
        } else {
            Product product = item.getProduct();
            if (quantity > product.getStockQuantity()) {
                throw new BadRequestException("Requested quantity exceeds available stock (" + product.getStockQuantity() + " available).");
            }
            item.setQuantity(quantity);
            cartItemRepository.save(item);
        }

        return mapToCartDto(cart);
    }

    @Transactional
    public CartDto removeItem(Long userId, String guestSessionId, Long itemId) {
        return updateItemQuantity(userId, guestSessionId, itemId, 0);
    }

    @Transactional
    public CartDto clearCart(Long userId, String guestSessionId) {
        Cart cart = (userId != null) ? getOrCreateUserCart(userId) : getOrCreateGuestCart(guestSessionId);
        cart.clearItems();
        cartRepository.save(cart);
        return mapToCartDto(cart);
    }

    @Transactional
    public CartDto mergeGuestCart(Long userId, MergeCartRequest request) {
        Cart userCart = getOrCreateUserCart(userId);

        if (request != null) {
            // 1. Merge items from guest session in database if guestSessionId provided
            if (request.getGuestSessionId() != null && !request.getGuestSessionId().isBlank()) {
                Optional<Cart> guestCartOpt = cartRepository.findByGuestSessionId(request.getGuestSessionId());
                if (guestCartOpt.isPresent()) {
                    Cart guestCart = guestCartOpt.get();
                    for (CartItem guestItem : guestCart.getItems()) {
                        Product product = guestItem.getProduct();
                        if (product.getProductStatus() != ProductStatus.PUBLISHED) continue;

                        Optional<CartItem> existing = cartItemRepository.findByCartIdAndProductId(userCart.getId(), product.getId());
                        if (existing.isPresent()) {
                            CartItem item = existing.get();
                            int targetQty = Math.min(item.getQuantity() + guestItem.getQuantity(), product.getStockQuantity());
                            item.setQuantity(Math.max(1, targetQty));
                            cartItemRepository.save(item);
                        } else {
                            int initialQty = Math.min(guestItem.getQuantity(), product.getStockQuantity());
                            if (initialQty > 0) {
                                CartItem newItem = new CartItem(userCart, product, initialQty);
                                userCart.addItem(newItem);
                                cartItemRepository.save(newItem);
                            }
                        }
                    }
                    guestCart.clearItems();
                    cartRepository.save(guestCart);
                }
            }

            // 2. Merge local items sent from client storage if any
            if (request.getLocalItems() != null) {
                for (MergeCartRequest.GuestCartItem guestItem : request.getLocalItems()) {
                    if (guestItem.getProductId() == null || guestItem.getQuantity() <= 0) continue;
                    Product product = productRepository.findById(guestItem.getProductId()).orElse(null);
                    if (product == null || product.getProductStatus() != ProductStatus.PUBLISHED) continue;

                    Optional<CartItem> existing = cartItemRepository.findByCartIdAndProductId(userCart.getId(), product.getId());
                    if (existing.isPresent()) {
                        CartItem item = existing.get();
                        int targetQty = Math.min(item.getQuantity() + guestItem.getQuantity(), product.getStockQuantity());
                        item.setQuantity(Math.max(1, targetQty));
                        cartItemRepository.save(item);
                    } else {
                        int initialQty = Math.min(guestItem.getQuantity(), product.getStockQuantity());
                        if (initialQty > 0) {
                            CartItem newItem = new CartItem(userCart, product, initialQty);
                            userCart.addItem(newItem);
                            cartItemRepository.save(newItem);
                        }
                    }
                }
            }
        }

        return mapToCartDto(userCart);
    }

    private CartDto mapToCartDto(Cart cart) {
        CartDto dto = new CartDto();
        dto.setId(cart.getId());
        dto.setItems(cart.getItems().stream().map(CartItemDto::new).collect(Collectors.toList()));
        dto.recalculateTotals();
        return dto;
    }
}
