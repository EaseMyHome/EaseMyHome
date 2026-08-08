package com.easemyhome.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class PortfolioItemRequestDTO {

    @NotBlank(message = "imageUrl is required")
    private String imageUrl;

    private String caption;
}
