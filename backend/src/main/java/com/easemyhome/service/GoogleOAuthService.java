package com.easemyhome.service;

import com.easemyhome.dto.response.AuthResponseDTO;
import com.easemyhome.dto.response.UserResponseDTO;
import com.easemyhome.exception.BadRequestException;
import com.easemyhome.model.User;
import com.easemyhome.repository.UserRepository;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken.Payload;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.Collections;
import java.util.Map;
import java.util.Optional;

@Service
public class GoogleOAuthService {

    @Value("${google.client-id}")
    private String googleClientId;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JwtService jwtService;

    @Autowired
    private AuthService authService;

    /**
     * Verifies the Google ID token or Access Token, then finds or creates a User in our DB.
     * Returns our own JWT + user info wrapped in AuthResponseDTO.
     */
    public ResponseEntity<AuthResponseDTO> handleGoogleLogin(String tokenString) {
        String googleId = null;
        String email = null;
        String name = null;
        String picture = null;

        // 1. Try verifying as Google ID Token (JWT format)
        try {
            GoogleIdTokenVerifier verifier = new GoogleIdTokenVerifier.Builder(
                    new NetHttpTransport(), new GsonFactory())
                    .setAudience(Collections.singletonList(googleClientId))
                    .build();

            GoogleIdToken idToken = verifier.verify(tokenString);
            if (idToken != null) {
                Payload payload = idToken.getPayload();
                googleId = payload.getSubject();
                email    = payload.getEmail();
                name     = (String) payload.get("name");
                picture  = (String) payload.get("picture");
            }
        } catch (Exception ignored) {
            // Token may be an OAuth2 Access Token instead of an ID Token
        }

        // 2. Fallback: Try verifying as Google OAuth Access Token via Google's UserInfo API
        if (googleId == null || email == null) {
            try {
                RestTemplate restTemplate = new RestTemplate();
                HttpHeaders headers = new HttpHeaders();
                headers.setBearerAuth(tokenString);
                HttpEntity<String> entity = new HttpEntity<>("", headers);

                ResponseEntity<Map> response = restTemplate.exchange(
                        "https://www.googleapis.com/oauth2/v3/userinfo",
                        HttpMethod.GET,
                        entity,
                        Map.class
                );

                if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                    Map<String, Object> body = response.getBody();
                    googleId = (String) body.get("sub");
                    email    = (String) body.get("email");
                    name     = (String) body.get("name");
                    picture  = (String) body.get("picture");
                }
            } catch (Exception ex) {
                String errMsg = ex.getMessage() != null ? ex.getMessage() : ex.getClass().getSimpleName();
                throw new BadRequestException("Failed to verify Google token: " + errMsg);
            }
        }

        if (googleId == null || email == null) {
            throw new BadRequestException("Invalid or expired Google token");
        }

        // 3. Check if this Google account is already linked to a user
        Optional<User> existingByGoogleId = userRepository.findByGoogleId(googleId);
        if (existingByGoogleId.isPresent()) {
            // Returning OAuth user — update avatar in case it changed
            User user = existingByGoogleId.get();
            if (picture != null) {
                user.setAvatarUrl(picture);
                userRepository.save(user);
            }

            String token = jwtService.generateToken(user.getEmail(), user.getRole());
            return ResponseEntity.ok(AuthResponseDTO.builder()
                    .status("SUCCESS")
                    .message("Login successful")
                    .token(token)
                    .user(authService.mapToUserDTO(user))
                    .build());
        }

        // 4. Check if an email/password account exists for this email
        Optional<User> existingByEmail = userRepository.findByEmail(email);
        if (existingByEmail.isPresent()) {
            // Link Google ID to the existing account
            User user = existingByEmail.get();
            user.setGoogleId(googleId);
            if (picture != null) {
                user.setAvatarUrl(picture);
            }
            userRepository.save(user);

            String token = jwtService.generateToken(user.getEmail(), user.getRole());
            return ResponseEntity.ok(AuthResponseDTO.builder()
                    .status("SUCCESS")
                    .message("Google account linked. Login successful")
                    .token(token)
                    .user(authService.mapToUserDTO(user))
                    .build());
        }

        // 5. Brand new user — create account via Google
        User newUser = new User();
        newUser.setName(name != null ? name : email.split("@")[0]);
        newUser.setEmail(email);
        newUser.setGoogleId(googleId);
        newUser.setAvatarUrl(picture);
        newUser.setPhone("");
        newUser.setAddress("");
        newUser.setPassword(""); // Placeholder for OAuth users to satisfy DB non-null constraint
        newUser.setRole("USER");
        newUser.setStatus("Active");

        User saved = userRepository.save(newUser);

        String token = jwtService.generateToken(saved.getEmail(), "USER");
        UserResponseDTO userDTO = authService.mapToUserDTO(saved);

        return ResponseEntity.ok(AuthResponseDTO.builder()
                .status("SUCCESS")
                .message("Account created via Google. Welcome to EaseMyHome!")
                .token(token)
                .user(userDTO)
                .build());
    }
}

