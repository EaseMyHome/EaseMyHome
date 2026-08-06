package com.easemyhome.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "bookings")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Booking {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // ── Customer info (denormalized for quick display; also linked via User FK below) ──
    @Column(nullable = false)
    private String customerName;

    @Column(nullable = false)
    private String customerPhone;

    @Column(nullable = false)
    private String customerEmail;

    @Column(nullable = false)
    private String address;

    // ── FK → users table (nullable: guest bookings without an account are allowed) ──
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = true)
    private User user;

    // ── FK → providers table ──
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "provider_id", nullable = false)
    private Provider provider;

    // ── FK → provider_services table (optional: general bookings may not pick a sub-service) ──
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sub_service_id", nullable = true)
    private ProviderService subService;

    // Kept as a plain string for cases where no ProviderService is linked (general category)
    @Column(nullable = false)
    private String serviceType; // e.g. "Cleaning"

    @Column(nullable = false)
    private String bookingDate; // e.g. "2026-08-05"

    @Column(nullable = false)
    private String bookingTime; // e.g. "10:00 AM"

    @Column(nullable = false, length = 50)
    private String status = "PENDING"; // "PENDING", "ACCEPTED", "ON_THE_WAY", "ARRIVED", "IN_PROGRESS", "WORK_COMPLETED", "COMPLETED"

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column
    private String completionOtp;

    @Column
    private String razorpayOrderId;

    @Column
    private String razorpayPaymentId;

    @Column
    private String paymentStatus = "PENDING"; // "PENDING", "SUCCESS", "FAILED"

    @Column
    private Double paymentAmount;

    @Column(nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
}
