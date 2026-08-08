package com.easemyhome.controller;

import com.easemyhome.dto.response.AuthResponseDTO;
import com.easemyhome.service.GoogleOAuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * Dedicated Google OAuth controller.
 * Accepts a Google ID token from the frontend and returns our own JWT.
 *
 * POST /api/auth/google
 * Body: { "idToken": "<google-id-token>" }
 */
@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class GoogleAuthController {

    @Autowired
    private GoogleOAuthService googleOAuthService;

    @PostMapping("/google")
    public ResponseEntity<AuthResponseDTO> googleLogin(@RequestBody Map<String, String> body) {
        String idToken = body.get("idToken");
        if (idToken == null || idToken.isBlank()) {
            return ResponseEntity.badRequest().build();
        }
        return googleOAuthService.handleGoogleLogin(idToken);
    }
}
