package com.easemyhome.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "providers")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Provider {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String phone;

    @Column(nullable = false)
    private String password;

    @Column(nullable = false)
    private String serviceType;

    @Column(nullable = false)
    private Integer experience;

    @Column(nullable = false)
    private String documentType; // "AADHAR" or "PAN"

    @Lob
    @Column(columnDefinition = "LONGTEXT")
    private String documentImage; // Base64 encoded string of Document

    @Lob
    @Column(columnDefinition = "LONGTEXT")
    private String selfieImage; // Base64 encoded string of Selfie

    @Column(nullable = false)
    private String status = "PENDING"; // "PENDING", "APPROVED", "REJECTED"

    @Column(nullable = true)
    private String coverageArea; // E.g., "HSR Layout, Bangalore"

    @Column(nullable = true)
    private Integer workingRadius; // Operational radius in kilometers

    // NOTE: workPhotos removed — use portfolio_items table instead (PortfolioItem entity)

    @Column(nullable = true)
    private Double latitude;

    @Column(nullable = true)
    private Double longitude;

    @Column(columnDefinition = "TEXT")
    private String bio; // Description of their profile/services

    // ── Bank / Payout Details ─────────────────────────────────────────────────
    @Column(nullable = true)
    private String bankAccountNumber;

    @Column(nullable = true)
    private String bankIfscCode;

    @Column(nullable = true)
    private String bankName;

    @Column(nullable = true)
    private String accountHolderName;
}


