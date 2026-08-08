package com.easemyhome.service;

import com.easemyhome.dto.request.BookingRequestDTO;
import com.easemyhome.dto.response.BookingResponseDTO;
import com.easemyhome.exception.BadRequestException;
import com.easemyhome.exception.ResourceNotFoundException;
import com.easemyhome.exception.UnauthorizedException;
import com.easemyhome.model.Booking;
import com.easemyhome.model.Provider;
import com.easemyhome.model.ProviderService;
import com.easemyhome.repository.BookingRepository;
import com.easemyhome.repository.ProviderRepository;
import com.easemyhome.repository.ProviderServiceRepository;
import com.easemyhome.repository.ReviewRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;

@Service
@Transactional
public class BookingService {

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private ProviderRepository providerRepository;

    @Autowired
    private ProviderServiceRepository providerServiceRepository;

    @Autowired
    private ReviewRepository reviewRepository;

    @Autowired
    private JwtService jwtService;

    /** Generate a random 6-digit OTP string */
    private String generateOtp() {
        int otp = 100000 + new Random().nextInt(900000);
        return String.valueOf(otp);
    }

    /** Create a new booking using BookingRequestDTO */
    public ResponseEntity<BookingResponseDTO> createBooking(BookingRequestDTO dto) {
        Provider provider = providerRepository.findById(dto.getProviderId())
                .orElseThrow(() -> new ResourceNotFoundException("Provider", dto.getProviderId()));

        String requestedService = dto.getServiceType() != null ? dto.getServiceType() : provider.getServiceType();
        String customerEmail = dto.getCustomerEmail();

        if (customerEmail != null && !customerEmail.trim().isEmpty()) {
            List<Booking> existingBookings = bookingRepository.findByCustomerEmail(customerEmail.trim());
            boolean existsActive = existingBookings.stream().anyMatch(b -> 
                b.getProvider() != null && b.getProvider().getId().equals(provider.getId()) &&
                Objects.equals(b.getServiceType(), requestedService) &&
                !"COMPLETED".equalsIgnoreCase(b.getStatus()) &&
                !"DECLINED".equalsIgnoreCase(b.getStatus()) &&
                !"CANCELLED".equalsIgnoreCase(b.getStatus())
            );

            if (existsActive) {
                throw new BadRequestException("This service is already booked with this provider and is currently in-progress. Please complete or cancel your existing request before booking again.");
            }
        }

        Booking booking = new Booking();
        booking.setProvider(provider);
        booking.setServiceType(requestedService);
        booking.setCustomerName(dto.getCustomerName());
        booking.setCustomerPhone(dto.getCustomerPhone());
        booking.setCustomerEmail(dto.getCustomerEmail());
        booking.setAddress(dto.getAddress());
        booking.setBookingDate(dto.getBookingDate());
        booking.setBookingTime(dto.getBookingTime());
        booking.setNotes(dto.getNotes());
        booking.setStatus("PENDING");
        booking.setCreatedAt(LocalDateTime.now());

        if (dto.getSubServiceId() != null) {
            providerServiceRepository.findById(dto.getSubServiceId())
                    .ifPresent(booking::setSubService);
        } else if (provider != null) {
            List<ProviderService> services = providerServiceRepository.findByProviderIdAndActiveTrue(provider.getId());
            if (services != null && !services.isEmpty()) {
                ProviderService match = services.stream()
                        .filter(s -> s.getName() != null && s.getName().equalsIgnoreCase(requestedService))
                        .findFirst()
                        .orElse(services.get(0));
                booking.setSubService(match);
            }
        }

        Booking saved = bookingRepository.save(booking);
        return ResponseEntity.ok(toDto(saved));
    }

    public ResponseEntity<List<BookingResponseDTO>> getProviderBookings(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            throw new UnauthorizedException("Missing or invalid Authorization header");
        }

        String token = authHeader.substring(7);
        String email = jwtService.extractEmail(token);
        String role = jwtService.extractRole(token);

        if (!jwtService.validateToken(token, email) || !"PROVIDER".equals(role)) {
            throw new UnauthorizedException("Unauthorized to view provider bookings");
        }

        Provider provider = providerRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Provider not found for email: " + email, 0L));

        List<Booking> bookings = bookingRepository.findByProviderIdOrderByIdDesc(provider.getId());
        return ResponseEntity.ok(bookings.stream().map(this::toDto).toList());
    }

    public ResponseEntity<BookingResponseDTO> acceptBooking(Long id) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking", id));

        if (booking.getCompletionOtp() == null || booking.getCompletionOtp().isEmpty()) {
            booking.setCompletionOtp(generateOtp());
        }
        booking.setStatus("ACCEPTED");
        Booking saved = bookingRepository.save(booking);
        return ResponseEntity.ok(toDto(saved));
    }

    public ResponseEntity<BookingResponseDTO> travelBooking(Long id) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking", id));

        booking.setStatus("ON_THE_WAY");
        Booking saved = bookingRepository.save(booking);
        return ResponseEntity.ok(toDto(saved));
    }

    public ResponseEntity<BookingResponseDTO> arrivedBooking(Long id) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking", id));

        if (booking.getCompletionOtp() == null || booking.getCompletionOtp().isEmpty()) {
            booking.setCompletionOtp(generateOtp());
        }
        booking.setStatus("ARRIVED");
        Booking saved = bookingRepository.save(booking);
        return ResponseEntity.ok(toDto(saved));
    }

    public ResponseEntity<BookingResponseDTO> declineBooking(Long id) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking", id));

        booking.setStatus("DECLINED");
        Booking saved = bookingRepository.save(booking);
        return ResponseEntity.ok(toDto(saved));
    }

    public ResponseEntity<BookingResponseDTO> rescheduleBooking(Long id, Map<String, String> payload) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking", id));

        if (payload.containsKey("bookingDate")) booking.setBookingDate(payload.get("bookingDate"));
        if (payload.containsKey("bookingTime")) booking.setBookingTime(payload.get("bookingTime"));
        booking.setStatus("RESCHEDULED");
        Booking saved = bookingRepository.save(booking);
        return ResponseEntity.ok(toDto(saved));
    }

    public ResponseEntity<Map<String, Object>> verifyOtp(Long id, String enteredOtp) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking", id));

        String actualOtp = booking.getCompletionOtp();
        if (actualOtp == null || actualOtp.isEmpty()) {
            actualOtp = generateOtp();
            booking.setCompletionOtp(actualOtp);
            bookingRepository.save(booking);
        }

        String trimmedEntered = enteredOtp != null ? enteredOtp.trim() : "";

        // Check if OTP matches OR test master OTP "123456"
        boolean isMatch = actualOtp.equalsIgnoreCase(trimmedEntered) || "123456".equals(trimmedEntered);

        if (!isMatch) {
            throw new BadRequestException("Invalid OTP (" + trimmedEntered + "). The customer OTP for this booking is: " + actualOtp + " (or try master test OTP: 123456)");
        }

        // Verified OTP transitions status to IN_PROGRESS
        booking.setStatus("IN_PROGRESS");
        Booking saved = bookingRepository.save(booking);
        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "OTP verified! Job status updated to IN_PROGRESS.",
                "booking", toDto(saved)
        ));
    }

    public ResponseEntity<BookingResponseDTO> completeWork(Long id) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking", id));

        booking.setStatus("WORK_COMPLETED");
        Booking saved = bookingRepository.save(booking);
        return ResponseEntity.ok(toDto(saved));
    }

    public ResponseEntity<List<BookingResponseDTO>> getCustomerBookings(String customerEmail) {
        if (customerEmail == null || customerEmail.trim().isEmpty()) {
            return ResponseEntity.ok(bookingRepository.findAllByOrderByIdDesc().stream().map(this::toDto).toList());
        }
        List<Booking> list = bookingRepository.findByCustomerEmailOrderByIdDesc(customerEmail.trim());
        return ResponseEntity.ok(list.stream().map(this::toDto).toList());
    }

    /** Admin: Get ALL bookings across the platform */
    public ResponseEntity<?> getAllBookings() {
        List<Booking> all = bookingRepository.findAllByOrderByIdDesc();
        List<BookingResponseDTO> dtos = all.stream().map(this::toDto).toList();
        return ResponseEntity.ok(dtos);
    }

    /** Admin: Update status or assign provider */
    public ResponseEntity<?> adminUpdateBookingStatus(Long id, Map<String, Object> payload) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking", id));

        if (payload.containsKey("status") && payload.get("status") != null) {
            String newStatus = String.valueOf(payload.get("status")).toUpperCase();
            booking.setStatus(newStatus);
            if ("ACCEPTED".equals(newStatus) && (booking.getCompletionOtp() == null || booking.getCompletionOtp().isEmpty())) {
                booking.setCompletionOtp(generateOtp());
            }
        }

        if (payload.containsKey("paymentStatus") && payload.get("paymentStatus") != null) {
            booking.setPaymentStatus(String.valueOf(payload.get("paymentStatus")).toUpperCase());
        }

        if (payload.containsKey("providerId") && payload.get("providerId") != null) {
            try {
                Long providerId = Long.parseLong(String.valueOf(payload.get("providerId")).replace("PROV-", ""));
                providerRepository.findById(providerId).ifPresent(booking::setProvider);
            } catch (NumberFormatException ignored) {}
        }

        Booking saved = bookingRepository.save(booking);
        return ResponseEntity.ok(toDto(saved));
    }

    /** Map Booking entity to BookingResponseDTO */
    public BookingResponseDTO toDto(Booking b) {
        if (b == null) return null;

        BookingResponseDTO.ProviderSummaryDTO providerSummary = null;
        try {
            if (b.getProvider() != null) {
                providerSummary = BookingResponseDTO.ProviderSummaryDTO.builder()
                        .id(b.getProvider().getId())
                        .name(b.getProvider().getName())
                        .email(b.getProvider().getEmail())
                        .phone(b.getProvider().getPhone())
                        .build();
            }
        } catch (Exception e) {
            System.err.println("Error mapping provider in toDto: " + e.getMessage());
        }

        BookingResponseDTO.SubServiceSummaryDTO subServiceSummary = null;
        try {
            if (b.getSubService() != null) {
                ProviderService ps = b.getSubService();
                subServiceSummary = BookingResponseDTO.SubServiceSummaryDTO.builder()
                        .id(ps.getId())
                        .name(ps.getName())
                        .price(ps.getPrice())
                        .unit(ps.getUnit())
                        .build();
            }
        } catch (Exception e) {
            System.err.println("Error mapping subService in toDto: " + e.getMessage());
        }

        Double calculatedAmount = 400.0;
        try {
            if (b.getPaymentAmount() != null && b.getPaymentAmount() > 0) {
                calculatedAmount = b.getPaymentAmount();
            } else if (b.getSubService() != null && b.getSubService().getPrice() != null && b.getSubService().getPrice() > 0) {
                calculatedAmount = b.getSubService().getPrice();
            } else if (b.getProvider() != null) {
                List<ProviderService> services = providerServiceRepository.findByProviderId(b.getProvider().getId());
                if (services != null && !services.isEmpty()) {
                    ProviderService match = services.stream()
                            .filter(s -> s.getName() != null && (s.getName().equalsIgnoreCase(b.getServiceType()) || (b.getServiceType() != null && b.getServiceType().toLowerCase().contains(s.getName().toLowerCase()))))
                            .findFirst()
                            .orElse(services.get(0));
                    if (match != null && match.getPrice() != null && match.getPrice() > 0) {
                        calculatedAmount = match.getPrice();
                    }
                }
            }
        } catch (Exception e) {
            System.err.println("Error calculating amount in toDto: " + e.getMessage());
        }

        boolean reviewed = false;
        try {
            if (reviewRepository != null && b.getId() != null) {
                reviewed = reviewRepository.existsByBookingId(b.getId());
            }
        } catch (Exception e) {
            System.err.println("Error checking isReviewed in toDto: " + e.getMessage());
        }

        Long userId = null;
        try {
            if (b.getUser() != null) {
                userId = b.getUser().getId();
            }
        } catch (Exception e) {
            System.err.println("Error getting userId in toDto: " + e.getMessage());
        }

        return BookingResponseDTO.builder()
                .id(b.getId())
                .customerName(b.getCustomerName())
                .customerPhone(b.getCustomerPhone())
                .customerEmail(b.getCustomerEmail())
                .address(b.getAddress())
                .serviceType(b.getServiceType())
                .bookingDate(b.getBookingDate())
                .bookingTime(b.getBookingTime())
                .status(b.getStatus())
                .notes(b.getNotes())
                .completionOtp(b.getCompletionOtp())
                .createdAt(b.getCreatedAt())
                .isReviewed(reviewed)
                .amount(calculatedAmount)
                .razorpayOrderId(b.getRazorpayOrderId())
                .razorpayPaymentId(b.getRazorpayPaymentId())
                .paymentStatus(b.getPaymentStatus())
                .provider(providerSummary)
                .subService(subServiceSummary)
                .userId(userId)
                .build();
    }
}
