package com.easemyhome.dto.response;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BookingResponseDTO {
    private Long id;
    private String customerName;
    private String customerPhone;
    private String customerEmail;
    private String address;
    private String serviceType;
    private String bookingDate;
    private String bookingTime;
    private String status;
    private String notes;
    private String completionOtp;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime createdAt;

    @JsonProperty("isReviewed")
    private boolean isReviewed;

    private Double amount;

    private String razorpayOrderId;
    private String razorpayPaymentId;
    private String paymentStatus;

    // Nested provider info
    private ProviderSummaryDTO provider;

    // Nested sub-service info (nullable)
    private SubServiceSummaryDTO subService;

    private Long userId;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ProviderSummaryDTO {
        private Long id;
        private String name;
        private String email;
        private String phone;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SubServiceSummaryDTO {
        private Long id;
        private String name;
        private Double price;
        private String unit;
    }
}
