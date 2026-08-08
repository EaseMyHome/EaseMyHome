package com.easemyhome.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponseDTO {
    private String status;   // "SUCCESS"
    private String message;
    private String token;    // JWT
    private Object user;     // UserResponseDTO or ProviderResponseDTO
}
