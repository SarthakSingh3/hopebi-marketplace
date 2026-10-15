package com.hopebi.marketplace.payment;

import com.hopebi.marketplace.common.BadRequestException;
import com.hopebi.marketplace.common.ResourceNotFoundException;
import com.hopebi.marketplace.config.AppProperties;
import com.hopebi.marketplace.order.*;
import com.hopebi.marketplace.payment.dto.*;
import com.hopebi.marketplace.product.Product;
import com.hopebi.marketplace.product.ProductRepository;
import com.hopebi.marketplace.shipping.FulfilmentStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final AppProperties appProperties;

    public PaymentService(PaymentRepository paymentRepository,
                          OrderRepository orderRepository,
                          ProductRepository productRepository,
                          AppProperties appProperties) {
        this.paymentRepository = paymentRepository;
        this.orderRepository = orderRepository;
        this.productRepository = productRepository;
        this.appProperties = appProperties;
    }

    @Transactional
    public PaymentInitiateResponse initiatePayment(PaymentInitiateRequest request, Long userId) {
        Order order = orderRepository.findByOrderNumberAndUserId(request.getOrderNumber(), userId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with number: " + request.getOrderNumber()));

        if (order.getPaymentStatus() == PaymentStatus.PAID) {
            throw new BadRequestException("This order has already been paid.");
        }

        order.setPaymentMethod(request.getPaymentMethod());
        orderRepository.save(order);

        String providerOrderId = "HOPEBI_TXN_" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();

        Payment payment = new Payment(
                order,
                request.getPaymentMethod(),
                appProperties.getPayment().getProvider(),
                providerOrderId,
                order.getTotalAmount(),
                appProperties.getCurrency()
        );

        paymentRepository.save(payment);

        return new PaymentInitiateResponse(
                order.getOrderNumber(),
                providerOrderId,
                order.getTotalAmount(),
                appProperties.getCurrency(),
                appProperties.getPayment().getProvider(),
                appProperties.getPayment().isTestMode(),
                "Payment transaction initiated. Ready for authorization."
        );
    }

    @Transactional
    public PaymentVerifyResponse verifyPayment(PaymentVerifyRequest request, Long userId) {
        Order order = orderRepository.findByOrderNumberAndUserId(request.getOrderNumber(), userId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found: " + request.getOrderNumber()));

        Payment payment = paymentRepository.findByProviderOrderId(request.getProviderOrderId())
                .orElseThrow(() -> new ResourceNotFoundException("Payment attempt not found: " + request.getProviderOrderId()));

        if (payment.getStatus() == PaymentStatus.PAID) {
            return new PaymentVerifyResponse(
                    true,
                    order.getOrderNumber(),
                    PaymentStatus.PAID,
                    order.getOrderStatus(),
                    payment.getProviderTransactionId(),
                    "Payment was already verified successfully."
            );
        }

        if (request.isSimulateSuccess()) {
            String txnId = request.getProviderPaymentId() != null
                    ? request.getProviderPaymentId()
                    : "DEV_PAY_" + UUID.randomUUID().toString().substring(0, 10).toUpperCase();

            payment.setStatus(PaymentStatus.PAID);
            payment.setProviderTransactionId(txnId);
            paymentRepository.save(payment);

            // Update Order
            order.setPaymentStatus(PaymentStatus.PAID);
            order.setOrderStatus(OrderStatus.CONFIRMED);

            // Concurrency-safe inventory deduction upon payment confirmation
            for (OrderItem item : order.getItems()) {
                Product product = item.getProduct();
                if (product.getStockQuantity() < item.getQuantity()) {
                    // Out-of-stock emergency handling
                    item.setFulfilmentStatus(FulfilmentStatus.CANCELLED);
                } else {
                    product.setStockQuantity(product.getStockQuantity() - item.getQuantity());
                    productRepository.save(product);
                    item.setFulfilmentStatus(FulfilmentStatus.ACCEPTED);
                }
            }

            orderRepository.save(order);

            return new PaymentVerifyResponse(
                    true,
                    order.getOrderNumber(),
                    PaymentStatus.PAID,
                    OrderStatus.CONFIRMED,
                    txnId,
                    "Payment verified successfully! Order is confirmed."
            );
        } else {
            payment.setStatus(PaymentStatus.FAILED);
            payment.setFailureReason("Payment declined or cancelled by user in test simulator.");
            paymentRepository.save(payment);

            order.setPaymentStatus(PaymentStatus.FAILED);
            orderRepository.save(order);

            return new PaymentVerifyResponse(
                    false,
                    order.getOrderNumber(),
                    PaymentStatus.FAILED,
                    order.getOrderStatus(),
                    null,
                    "Payment verification failed: " + payment.getFailureReason()
            );
        }
    }
}
