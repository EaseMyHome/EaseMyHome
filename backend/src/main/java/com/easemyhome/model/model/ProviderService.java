package com.easemyhome.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "provider_services")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProviderService {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // FK → providers table
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "provider_id", nullable = false)
    private Provider provider;

    @Column(nullable = false)
    private String name;          // e.g. "Fan Fitting"

    @Column(columnDefinition = "TEXT")
    private String description;   // e.g. "Installation of ceiling/wall fans"

    @Column(nullable = false)
    private Double price;          // price in ₹

    @Column(nullable = false)
    private String unit;          // e.g. "per unit", "per visit", "per hour"

    @Column(nullable = false)
    private Boolean active = true; // whether this service is currently offered
}
