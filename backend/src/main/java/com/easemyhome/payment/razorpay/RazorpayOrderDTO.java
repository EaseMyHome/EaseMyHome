package com.easemyhome.payment.razorpay;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

public class RazorpayOrderDTO {

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CreateOrderRequest {
        private Long bookingId;
        private Double amount;
        private String currency = "INR";
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CreateOrderResponse {
        private String orderId;
        private Double amount;
        private String currency;
        private String keyId;
        private Long bookingId;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PaymentVerificationRequest {
        private Long bookingId;
        private String razorpayOrderId;
        private String razorpayPaymentId;
        private String razorpaySignature;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PaymentVerificationResponse {
        private boolean success;
        private String message;
        private Long bookingId;
        private String status;
        private String paymentStatus;
    }
}
