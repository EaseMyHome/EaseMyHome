package com.easemyhome.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProviderResponseDTO {
    private Long id;
    private String name;
    private String email;
    private String phone;
    private String role; // always "PROVIDER"
    private String serviceType;
    private Integer experience;
    private String status;
    private String coverageArea;
    private Integer workingRadius;
    private Double latitude;
    private Double longitude;
    private String bio;
    private String selfieImage;
    // NOTE: workPhotos excluded — use GET /api/provider/portfolio/{id}
}
