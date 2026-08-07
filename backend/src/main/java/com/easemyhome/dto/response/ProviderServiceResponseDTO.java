package com.easemyhome.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProviderServiceResponseDTO {
    private Long id;
    private String name;
    private String description;
    private Double price;
    private String unit;
    private Boolean active;
}
