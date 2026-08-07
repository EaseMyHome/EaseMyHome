package com.easemyhome.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserResponseDTO {
    private Long id;
    private String name;
    private String email;
    private String phone;
    private String address;
    private String landmark;
    private String pincode;
    private Double latitude;
    private Double longitude;
    private String role;
    private String avatarUrl;
}

