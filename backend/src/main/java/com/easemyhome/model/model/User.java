package com.easemyhome.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = true)
    private String phone;

    @Column(nullable = true)
    private String password;

    @Column(nullable = true)
    private String address;

    @Column(nullable = true)
    private String landmark;

    @Column(nullable = true)
    private String pincode;

    @Column(nullable = true)
    private Double latitude;

    @Column(nullable = true)
    private Double longitude;

    @Column(nullable = false)
    private String role = "USER"; // Default role is "USER" (Customer)


    @Column(nullable = false)
    private String status = "Active"; // "Active" or "Blocked"

    // Google OAuth fields (null for email/password users)
    @Column(nullable = true, unique = true)
    private String googleId;

    @Column(nullable = true, length = 512)
    private String avatarUrl;
}
