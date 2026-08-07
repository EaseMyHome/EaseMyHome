package com.easemyhome.dto.request;

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class ProviderServiceRequestDTO {

    @NotBlank(message = "Service name is required")
    private String name;

    private String description;

    @NotNull(message = "Price is required")
    @DecimalMin(value = "0.0", inclusive = false, message = "Price must be greater than 0")
    private Double price;

    @NotBlank(message = "Unit is required (e.g. 'per visit', 'per hour')")
    private String unit;

    private Boolean active = true;
}
