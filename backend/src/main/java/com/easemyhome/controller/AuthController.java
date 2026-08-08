package com.easemyhome.controller;

import com.easemyhome.dto.request.LoginRequestDTO;
import com.easemyhome.dto.request.RegisterCustomerRequestDTO;
import com.easemyhome.dto.request.RegisterProviderRequestDTO;
import com.easemyhome.dto.request.ResetPasswordRequestDTO;
import com.easemyhome.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    @Autowired
    private AuthService authService;

    @PostMapping("/send-otp")
    public ResponseEntity<?> sendOtp(@RequestParam String email) {
        return authService.sendOtp(email);
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<?> verifyOtp(@RequestParam String email, @RequestParam String otp) {
        return authService.verifyOtp(email, otp);
    }

    @PostMapping("/register-provider")
    public ResponseEntity<?> registerProvider(@Valid @RequestBody RegisterProviderRequestDTO dto) {
        return authService.registerProvider(dto);
    }

    @PostMapping("/register-customer")
    public ResponseEntity<?> registerCustomer(@Valid @RequestBody RegisterCustomerRequestDTO dto) {
        return authService.registerCustomer(dto);
    }

    @PostMapping("/forgot-password/send-otp")
    public ResponseEntity<?> sendForgotPasswordOtp(@RequestParam String email) {
        return authService.sendForgotPasswordOtp(email);
    }

    @PostMapping("/forgot-password/reset")
    public ResponseEntity<?> resetPassword(@Valid @RequestBody ResetPasswordRequestDTO dto) {
        return authService.resetPassword(dto);
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequestDTO dto) {
        return authService.login(dto);
    }

    @GetMapping("/me")
    public ResponseEntity<?> getProfile(@RequestHeader("Authorization") String authHeader) {
        return authService.getProfile(authHeader);
    }

    @PutMapping("/location")
    public ResponseEntity<?> updateUserLocation(
            @RequestHeader("Authorization") String authHeader,
            @RequestBody java.util.Map<String, Object> payload) {
        return authService.updateUserLocation(authHeader, payload);
    }
}

