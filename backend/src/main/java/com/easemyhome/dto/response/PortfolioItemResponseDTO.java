package com.easemyhome.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PortfolioItemResponseDTO {
    private Long id;
    private String imageUrl;
    private String caption;
    private LocalDateTime uploadedAt;
}
