package com.easemyhome.controller;

import com.easemyhome.dto.request.BookingRequestDTO;
import com.easemyhome.service.BookingService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/bookings")
@CrossOrigin(origins = "*")
public class BookingController {

    @Autowired
    private BookingService bookingService;

    // Create a new booking request using validated DTO
    @PostMapping
    public ResponseEntity<?> createBooking(@Valid @RequestBody BookingRequestDTO dto) {
        return bookingService.createBooking(dto);
    }

    // Get bookings for the authenticated provider
    @GetMapping("/provider")
    public ResponseEntity<?> getProviderBookings(@RequestHeader("Authorization") String authHeader) {
        return bookingService.getProviderBookings(authHeader);
    }

    // Accept booking request (generates OTP on first accept)
    @PutMapping("/{id}/accept")
    public ResponseEntity<?> acceptBooking(@PathVariable Long id) {
        return bookingService.acceptBooking(id);
    }

    // Provider starts traveling
    @PutMapping("/{id}/travel")
    public ResponseEntity<?> travelBooking(@PathVariable Long id) {
        return bookingService.travelBooking(id);
    }

    // Provider clicks I've Arrived
    @PutMapping("/{id}/arrived")
    public ResponseEntity<?> arrivedBooking(@PathVariable Long id) {
        return bookingService.arrivedBooking(id);
    }

    // Decline booking request
    @PutMapping("/{id}/decline")
    public ResponseEntity<?> declineBooking(@PathVariable Long id) {
        return bookingService.declineBooking(id);
    }

    // Reschedule booking request
    @PutMapping("/{id}/reschedule")
    public ResponseEntity<?> rescheduleBooking(@PathVariable Long id, @RequestBody Map<String, String> payload) {
        return bookingService.rescheduleBooking(id, payload);
    }

    // Verify OTP to set status to IN_PROGRESS
    @PutMapping("/{id}/verify-otp")
    public ResponseEntity<?> verifyOtp(@PathVariable Long id, @RequestBody Map<String, String> payload) {
        String otp = payload.getOrDefault("otp", "");
        return bookingService.verifyOtp(id, otp);
    }

    // Provider completes work (WORK_COMPLETED)
    @PutMapping("/{id}/complete-work")
    public ResponseEntity<?> completeWork(@PathVariable Long id) {
        return bookingService.completeWork(id);
    }

    // Generic status update endpoint
    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateBookingStatus(@PathVariable Long id, @RequestBody Map<String, Object> payload) {
        return bookingService.adminUpdateBookingStatus(id, payload);
    }

    // Get bookings for customer (by email query param)
    @GetMapping("/customer")
    public ResponseEntity<?> getCustomerBookings(@RequestParam(value = "email", required = false) String email) {
        return bookingService.getCustomerBookings(email);
    }

    // Admin: Get ALL bookings across the platform
    @GetMapping("/all")
    public ResponseEntity<?> getAllBookings() {
        return bookingService.getAllBookings();
    }
}

