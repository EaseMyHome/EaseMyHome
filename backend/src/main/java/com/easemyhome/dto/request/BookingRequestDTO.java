package com.easemyhome.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class BookingRequestDTO {

    @NotNull(message = "Provider ID is required")
    private Long providerId;

    private Long subServiceId; // optional

    @NotBlank(message = "Customer name is required")
    private String customerName;

    @NotBlank(message = "Customer email is required")
    private String customerEmail;

    @NotBlank(message = "Customer phone is required")
    private String customerPhone;

    @NotBlank(message = "Address is required")
    private String address;

    private String serviceType;

    @NotBlank(message = "Booking date is required")
    private String bookingDate;

    @NotBlank(message = "Booking time is required")
    private String bookingTime;

    private String notes;
}
