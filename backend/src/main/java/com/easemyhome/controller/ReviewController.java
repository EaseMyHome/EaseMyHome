package com.easemyhome.controller;

import com.easemyhome.dto.request.ReviewRequestDTO;
import com.easemyhome.dto.response.ReviewResponseDTO;
import com.easemyhome.exception.BadRequestException;
import com.easemyhome.exception.ResourceNotFoundException;
import com.easemyhome.exception.UnauthorizedException;
import com.easemyhome.model.*;
import com.easemyhome.repository.*;
import com.easemyhome.service.JwtService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping("/api/reviews")
@CrossOrigin(origins = "*")
@Transactional(readOnly = true)
public class ReviewController {

    @Autowired
    private ReviewRepository reviewRepository;

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JwtService jwtService;

    // ── POST /api/reviews ── Submit a review after a completed booking
    @PostMapping
    @Transactional
    public ResponseEntity<Map<String, Object>> submitReview(
            @Valid @RequestBody ReviewRequestDTO dto,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {

        Booking booking = bookingRepository.findById(dto.getBookingId())
                .orElseThrow(() -> new ResourceNotFoundException("Booking", dto.getBookingId()));

        if (!"COMPLETED".equals(booking.getStatus())) {
            throw new BadRequestException("You can only review a COMPLETED booking");
        }

        if (reviewRepository.existsByBookingId(dto.getBookingId())) {
            throw new BadRequestException("A review for this booking already exists");
        }

        Review review = new Review();
        review.setBooking(booking);
        review.setProvider(booking.getProvider());
        review.setRating(dto.getRating());
        review.setComment(dto.getComment());
        review.setCreatedAt(LocalDateTime.now());

        // Optionally link logged-in user
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            try {
                String token = authHeader.substring(7);
                String email = jwtService.extractEmail(token);
                userRepository.findByEmail(email).ifPresent(review::setUser);
            } catch (Exception ignored) { }
        }

        Review saved = reviewRepository.save(review);
        return ResponseEntity.ok(Map.of("status", "SUCCESS", "review", toDto(saved)));
    }

    // ── GET /api/reviews/all ── Admin: get all platform reviews
    @GetMapping("/all")
    @Transactional(readOnly = true)
    public ResponseEntity<List<ReviewResponseDTO>> getAllReviews() {
        try {
            List<Review> all = reviewRepository.findAll();
            List<ReviewResponseDTO> dtos = new ArrayList<>();
            for (Review r : all) {
                if (r != null) {
                    try {
                        dtos.add(toDto(r));
                    } catch (Exception e) {
                        System.err.println("Error mapping review ID " + r.getId() + ": " + e.getMessage());
                    }
                }
            }
            return ResponseEntity.ok(dtos);
        } catch (Exception e) {
            System.err.println("Error in getAllReviews: " + e.getMessage());
            return ResponseEntity.ok(Collections.emptyList());
        }
    }

    // ── GET /api/reviews ── Admin: get all platform reviews root endpoint
    @GetMapping
    @Transactional(readOnly = true)
    public ResponseEntity<List<ReviewResponseDTO>> getReviewsRoot() {
        return getAllReviews();
    }

    // ── GET /api/reviews/provider/{providerId}  ──  Public: get all reviews for a provider
    @GetMapping("/provider/{providerId}")
    public ResponseEntity<List<ReviewResponseDTO>> getProviderReviews(@PathVariable Long providerId) {
        List<Review> reviews = reviewRepository.findByProviderId(providerId);
        return ResponseEntity.ok(reviews.stream().map(this::toDto).toList());
    }

    // ── GET /api/reviews/booking/{bookingId}  ──  Get review for a specific booking
    @GetMapping("/booking/{bookingId}")
    public ResponseEntity<ReviewResponseDTO> getBookingReview(@PathVariable Long bookingId) {
        Review review = reviewRepository.findByBookingId(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("No review found for booking id: " + bookingId, 0L));
        return ResponseEntity.ok(toDto(review));
    }

    // ── GET /api/reviews/my  ──  Customer: get all reviews submitted by logged-in user
    @GetMapping("/my")
    public ResponseEntity<List<ReviewResponseDTO>> getMyReviews(@RequestHeader("Authorization") String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            throw new UnauthorizedException("Missing Authorization header");
        }
        String token = authHeader.substring(7);
        String email = jwtService.extractEmail(token);

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UnauthorizedException("User not found"));

        List<Review> reviews = reviewRepository.findByUserId(user.getId());
        return ResponseEntity.ok(reviews.stream().map(this::toDto).toList());
    }

    // ── DTO mapper ────────────────────────────────────────────────────────────
    public ReviewResponseDTO toDto(Review r) {
        if (r == null) return null;

        Long bookingId = null;
        String customerName = "Customer";
        if (r.getBooking() != null) {
            try {
                bookingId = r.getBooking().getId();
                if (r.getBooking().getCustomerName() != null) {
                    customerName = r.getBooking().getCustomerName();
                }
            } catch (Exception ignored) { }
        }

        Long providerId = null;
        String providerName = "Partner";
        if (r.getProvider() != null) {
            try {
                providerId = r.getProvider().getId();
                if (r.getProvider().getName() != null) {
                    providerName = r.getProvider().getName();
                }
            } catch (Exception ignored) { }
        }

        Long userId = null;
        if (r.getUser() != null) {
            try {
                userId = r.getUser().getId();
                if (r.getUser().getName() != null) {
                    customerName = r.getUser().getName();
                }
            } catch (Exception ignored) { }
        }

        return ReviewResponseDTO.builder()
                .id(r.getId())
                .bookingId(bookingId)
                .providerId(providerId)
                .providerName(providerName)
                .userId(userId)
                .userName(customerName)
                .rating(r.getRating() != null ? r.getRating() : 5)
                .comment(r.getComment() != null ? r.getComment() : "")
                .createdAt(r.getCreatedAt() != null ? r.getCreatedAt() : LocalDateTime.now())
                .build();
    }
}
