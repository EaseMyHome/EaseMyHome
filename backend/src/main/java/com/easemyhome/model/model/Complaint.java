package com.easemyhome.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "complaints")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Complaint {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String ticketId;

    @Column(nullable = false)
    private String userName;

    @Column(nullable = false)
    private String userEmail;

    @Column(nullable = false)
    private String userRole = "CUSTOMER"; // "PROVIDER" or "CUSTOMER"

    @Column(nullable = true)
    private String bookingId;

    // e.g. "Provider didn't arrive", "Fraud", etc.
    @Column(nullable = true)
    private String issueType;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String description;

    // Comma-separated image URLs uploaded with the complaint
    @Column(columnDefinition = "TEXT", nullable = true)
    private String imageUrls;

    // When the booking was completed (for timeline reference)
    @Column(nullable = true)
    private String bookingCompletedAt;

    // Service name/type from the booking
    @Column(nullable = true)
    private String serviceType;

    @Column(nullable = false)
    private String status = "Open"; // "Open", "In Progress", "Resolved", "Closed"

    @Column(nullable = true)
    private String assignedTo;

    @Column(nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
}
