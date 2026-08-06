package com.easemyhome.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "portfolio_items")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PortfolioItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // FK → providers table
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "provider_id", nullable = false)
    private Provider provider;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String imageUrl; // Cloudinary or upload URL

    @Column(columnDefinition = "TEXT")
    private String caption; // Optional description of the photo

    @Column(nullable = false)
    private LocalDateTime uploadedAt = LocalDateTime.now();
}
