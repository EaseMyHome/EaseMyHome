package com.easemyhome.dto.request;

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class RegisterProviderRequestDTO {

    @NotBlank(message = "Full name is required")
    private String name;

    @NotBlank(message = "Email is required")
    @Email(message = "Please provide a valid email address")
    private String email;

    @NotBlank(message = "Password is required")
    @Size(min = 6, message = "Password must be at least 6 characters")
    private String password;

    @NotBlank(message = "Phone number is required")
    private String phone;

    @NotBlank(message = "Service type is required")
    private String serviceType;

    @NotNull(message = "Years of experience is required")
    @Min(value = 0, message = "Experience cannot be negative")
    private Integer experience;

    @NotBlank(message = "Document type is required (AADHAR or PAN)")
    private String documentType;

    private String documentImage; // Base64 or Cloudinary URL
    private String selfieImage;   // Base64 or Cloudinary URL
}
