package com.easemyhome.service;

import com.easemyhome.dto.request.LoginRequestDTO;
import com.easemyhome.dto.request.RegisterCustomerRequestDTO;
import com.easemyhome.dto.request.RegisterProviderRequestDTO;
import com.easemyhome.dto.request.ResetPasswordRequestDTO;
import com.easemyhome.dto.response.AuthResponseDTO;
import com.easemyhome.dto.response.ProviderResponseDTO;
import com.easemyhome.dto.response.UserResponseDTO;
import com.easemyhome.exception.BadRequestException;
import com.easemyhome.exception.ResourceNotFoundException;
import com.easemyhome.exception.UnauthorizedException;
import com.easemyhome.model.Provider;
import com.easemyhome.model.User;
import com.easemyhome.repository.ProviderRepository;
import com.easemyhome.repository.UserRepository;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class AuthService {

    @Autowired private OtpService otpService;
    @Autowired private JwtService jwtService;
    @Autowired private ProviderRepository providerRepository;
    @Autowired private UserRepository userRepository;
    @Autowired private ProviderService providerService;
    @Autowired private ModelMapper modelMapper;

    // ── OTP ───────────────────────────────────────────────────────────────────

    public ResponseEntity<?> sendOtp(String email) {
        if (providerRepository.existsByEmail(email) || userRepository.existsByEmail(email)) {
            throw new BadRequestException("Email is already registered");
        }
        otpService.sendOtp(email);
        return ResponseEntity.ok(java.util.Map.of(
                "status", "SUCCESS",
                "message", "OTP sent successfully to " + email
        ));
    }

    public ResponseEntity<?> verifyOtp(String email, String otp) {
        boolean isValid = otpService.verifyOtp(email, otp);
        if (!isValid) {
            throw new BadRequestException("Invalid or expired OTP");
        }
        return ResponseEntity.ok(java.util.Map.of(
                "status", "SUCCESS",
                "message", "OTP verified successfully"
        ));
    }

    public ResponseEntity<?> sendForgotPasswordOtp(String email) {
        if (!providerRepository.existsByEmail(email) && !userRepository.existsByEmail(email)) {
            throw new BadRequestException("Email is not registered");
        }
        otpService.sendOtp(email);
        return ResponseEntity.ok(java.util.Map.of(
                "status", "SUCCESS",
                "message", "Password reset OTP sent successfully to " + email
        ));
    }

    public ResponseEntity<?> resetPassword(ResetPasswordRequestDTO dto) {
        if (!otpService.isEmailVerified(dto.getEmail())) {
            throw new BadRequestException("Email has not been verified. Please verify the OTP first.");
        }

        Optional<Provider> providerOpt = providerRepository.findByEmail(dto.getEmail());
        if (providerOpt.isPresent()) {
            Provider provider = providerOpt.get();
            provider.setPassword(dto.getNewPassword());
            providerRepository.save(provider);
            otpService.clearEmailVerification(dto.getEmail());
            return ResponseEntity.ok(java.util.Map.of("status", "SUCCESS", "message", "Password reset successfully"));
        }

        Optional<User> userOpt = userRepository.findByEmail(dto.getEmail());
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            user.setPassword(dto.getNewPassword());
            userRepository.save(user);
            otpService.clearEmailVerification(dto.getEmail());
            return ResponseEntity.ok(java.util.Map.of("status", "SUCCESS", "message", "Password reset successfully"));
        }

        throw new BadRequestException("User not found");
    }

    // ── Register Provider ─────────────────────────────────────────────────────

    public ResponseEntity<AuthResponseDTO> registerProvider(RegisterProviderRequestDTO dto) {
        if (!otpService.isEmailVerified(dto.getEmail())) {
            throw new BadRequestException("Email has not been verified. Please request and verify the OTP first.");
        }
        if (providerRepository.existsByEmail(dto.getEmail()) || userRepository.existsByEmail(dto.getEmail())) {
            throw new BadRequestException("Email is already registered");
        }

        Provider provider = new Provider();
        provider.setName(dto.getName());
        provider.setEmail(dto.getEmail());
        provider.setPhone(dto.getPhone());
        provider.setPassword(dto.getPassword());
        provider.setServiceType(dto.getServiceType());
        provider.setExperience(dto.getExperience());
        provider.setDocumentType(dto.getDocumentType());
        provider.setDocumentImage(dto.getDocumentImage());
        provider.setSelfieImage(dto.getSelfieImage());
        provider.setStatus("Pending");

        Provider saved = providerRepository.save(provider);
        otpService.clearEmailVerification(dto.getEmail());

        String token = jwtService.generateToken(saved.getEmail(), "PROVIDER");
        ProviderResponseDTO providerDTO = mapToProviderDTO(saved);

        return ResponseEntity.ok(AuthResponseDTO.builder()
                .status("SUCCESS")
                .message("Provider registered successfully!")
                .token(token)
                .user(providerDTO)
                .build());
    }

    // ── Register Customer ─────────────────────────────────────────────────────

    public ResponseEntity<AuthResponseDTO> registerCustomer(RegisterCustomerRequestDTO dto) {
        if (!otpService.isEmailVerified(dto.getEmail())) {
            throw new BadRequestException("Email has not been verified. Please request and verify the OTP first.");
        }
        if (providerRepository.existsByEmail(dto.getEmail()) || userRepository.existsByEmail(dto.getEmail())) {
            throw new BadRequestException("Email is already registered");
        }

        User user = new User();
        user.setName(dto.getName());
        user.setEmail(dto.getEmail());
        user.setPhone(dto.getPhone() != null ? dto.getPhone() : "");
        user.setPassword(dto.getPassword());
        user.setAddress(dto.getAddress() != null ? dto.getAddress() : "");
        user.setRole("USER");

        User saved = userRepository.save(user);
        otpService.clearEmailVerification(dto.getEmail());

        String token = jwtService.generateToken(saved.getEmail(), "USER");
        UserResponseDTO userDTO = mapToUserDTO(saved);

        return ResponseEntity.ok(AuthResponseDTO.builder()
                .status("SUCCESS")
                .message("Customer registered successfully!")
                .token(token)
                .user(userDTO)
                .build());
    }

    // ── Login ─────────────────────────────────────────────────────────────────

    public ResponseEntity<AuthResponseDTO> login(LoginRequestDTO dto) {
        // Check provider first
        Optional<Provider> providerOpt = providerRepository.findByEmail(dto.getEmail());
        if (providerOpt.isPresent() && providerOpt.get().getPassword().equals(dto.getPassword())) {
            Provider provider = providerOpt.get();
            String token = jwtService.generateToken(provider.getEmail(), "PROVIDER");
            return ResponseEntity.ok(AuthResponseDTO.builder()
                    .status("SUCCESS")
                    .message("Login successful")
                    .token(token)
                    .user(mapToProviderDTO(provider))
                    .build());
        }

        // Check user/admin
        Optional<User> userOpt = userRepository.findByEmail(dto.getEmail());
        if (userOpt.isPresent() && userOpt.get().getPassword().equals(dto.getPassword())) {
            User user = userOpt.get();
            String token = jwtService.generateToken(user.getEmail(), user.getRole());
            return ResponseEntity.ok(AuthResponseDTO.builder()
                    .status("SUCCESS")
                    .message("Login successful")
                    .token(token)
                    .user(mapToUserDTO(user))
                    .build());
        }

        throw new UnauthorizedException("Invalid email or password");
    }

    // ── Profile ───────────────────────────────────────────────────────────────

    public ResponseEntity<?> getProfile(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            throw new UnauthorizedException("Missing or invalid Authorization header");
        }
        String token = authHeader.substring(7);
        String email = jwtService.extractEmail(token);
        String role = jwtService.extractRole(token);

        if (!jwtService.validateToken(token, email)) {
            throw new UnauthorizedException("Token expired or invalid");
        }

        if ("PROVIDER".equals(role)) {
            Provider provider = providerRepository.findByEmail(email)
                    .orElseThrow(() -> new ResourceNotFoundException("Provider", 0L));
            return ResponseEntity.ok(java.util.Map.of("status", "SUCCESS", "user", mapToProviderDTO(provider)));
        } else {
            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new ResourceNotFoundException("User", 0L));
            return ResponseEntity.ok(java.util.Map.of("status", "SUCCESS", "user", mapToUserDTO(user)));
        }
    }

    public ResponseEntity<?> updateUserLocation(String authHeader, java.util.Map<String, Object> payload) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            throw new UnauthorizedException("Missing or invalid Authorization header");
        }
        String token = authHeader.substring(7);
        String email = jwtService.extractEmail(token);

        if (!jwtService.validateToken(token, email)) {
            throw new UnauthorizedException("Token expired or invalid");
        }

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User", 0L));

        if (payload.containsKey("address")) user.setAddress((String) payload.get("address"));
        if (payload.containsKey("landmark")) user.setLandmark((String) payload.get("landmark"));
        if (payload.containsKey("pincode")) user.setPincode((String) payload.get("pincode"));

        if (payload.containsKey("latitude") && payload.get("latitude") != null) {
            Object val = payload.get("latitude");
            if (val instanceof Number) user.setLatitude(((Number) val).doubleValue());
            else if (val instanceof String) try { user.setLatitude(Double.parseDouble((String) val)); } catch (Exception ignored) {}
        }
        if (payload.containsKey("longitude") && payload.get("longitude") != null) {
            Object val = payload.get("longitude");
            if (val instanceof Number) user.setLongitude(((Number) val).doubleValue());
            else if (val instanceof String) try { user.setLongitude(Double.parseDouble((String) val)); } catch (Exception ignored) {}
        }

        User saved = userRepository.save(user);
        return ResponseEntity.ok(java.util.Map.of("status", "SUCCESS", "user", mapToUserDTO(saved)));
    }

    // ── Mappers ───────────────────────────────────────────────────────────────

    public ProviderResponseDTO mapToProviderDTO(Provider provider) {
        return ProviderResponseDTO.builder()
                .id(provider.getId())
                .name(provider.getName())
                .email(provider.getEmail())
                .phone(provider.getPhone())
                .role("PROVIDER")
                .serviceType(provider.getServiceType())
                .experience(provider.getExperience())
                .status(provider.getStatus())
                .coverageArea(provider.getCoverageArea())
                .workingRadius(provider.getWorkingRadius())
                .latitude(provider.getLatitude())
                .longitude(provider.getLongitude())
                .bio(provider.getBio())
                .selfieImage(provider.getSelfieImage())
                .build();
    }

    public UserResponseDTO mapToUserDTO(User user) {
        return UserResponseDTO.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .address(user.getAddress())
                .landmark(user.getLandmark())
                .pincode(user.getPincode())
                .latitude(user.getLatitude())
                .longitude(user.getLongitude())
                .role(user.getRole())
                .avatarUrl(user.getAvatarUrl())
                .build();
    }
}

