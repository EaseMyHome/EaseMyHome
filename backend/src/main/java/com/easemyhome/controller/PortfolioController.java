package com.easemyhome.controller;

import com.easemyhome.dto.request.PortfolioItemRequestDTO;
import com.easemyhome.dto.response.PortfolioItemResponseDTO;
import com.easemyhome.exception.BadRequestException;
import com.easemyhome.exception.ResourceNotFoundException;
import com.easemyhome.exception.UnauthorizedException;
import com.easemyhome.model.PortfolioItem;
import com.easemyhome.model.Provider;
import com.easemyhome.repository.PortfolioItemRepository;
import com.easemyhome.repository.ProviderRepository;
import com.easemyhome.service.JwtService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping("/api/provider/portfolio")
@CrossOrigin(origins = "*")
public class PortfolioController {

    @Autowired
    private PortfolioItemRepository portfolioItemRepository;

    @Autowired
    private ProviderRepository providerRepository;

    @Autowired
    private JwtService jwtService;

    private Provider resolveProvider(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            throw new UnauthorizedException("Missing or invalid Authorization header");
        }
        String token = authHeader.substring(7);
        String email = jwtService.extractEmail(token);
        if (email == null) {
            throw new UnauthorizedException("Invalid JWT token");
        }
        return providerRepository.findByEmail(email)
                .orElseThrow(() -> new UnauthorizedException("Provider not found"));
    }

    // ── GET /api/provider/portfolio  ──  My portfolio items (authenticated provider)
    @GetMapping
    public ResponseEntity<List<PortfolioItemResponseDTO>> getMyPortfolio(@RequestHeader("Authorization") String authHeader) {
        Provider provider = resolveProvider(authHeader);
        List<PortfolioItem> items = portfolioItemRepository.findByProviderId(provider.getId());
        return ResponseEntity.ok(items.stream().map(this::toDto).toList());
    }

    // ── GET /api/provider/portfolio/{providerId}  ──  Public: view any provider's portfolio
    @GetMapping("/{providerId}")
    public ResponseEntity<List<PortfolioItemResponseDTO>> getProviderPortfolio(@PathVariable Long providerId) {
        List<PortfolioItem> items = portfolioItemRepository.findByProviderId(providerId);
        return ResponseEntity.ok(items.stream().map(this::toDto).toList());
    }

    // ── POST /api/provider/portfolio  ──  Add a new portfolio photo
    @PostMapping
    public ResponseEntity<Map<String, Object>> addPortfolioItem(
            @RequestHeader("Authorization") String authHeader,
            @Valid @RequestBody PortfolioItemRequestDTO dto) {
        Provider provider = resolveProvider(authHeader);

        PortfolioItem item = new PortfolioItem();
        item.setProvider(provider);
        item.setImageUrl(dto.getImageUrl().trim());
        item.setCaption(dto.getCaption());
        item.setUploadedAt(LocalDateTime.now());

        PortfolioItem saved = portfolioItemRepository.save(item);
        return ResponseEntity.ok(Map.of("status", "SUCCESS", "item", toDto(saved)));
    }

    // ── DELETE /api/provider/portfolio/{id}  ──  Remove a portfolio photo
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Object>> deletePortfolioItem(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable Long id) {
        Provider provider = resolveProvider(authHeader);

        PortfolioItem item = portfolioItemRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("PortfolioItem", id));

        if (!item.getProvider().getId().equals(provider.getId())) {
            throw new BadRequestException("Access denied: portfolio item belongs to another provider");
        }

        portfolioItemRepository.deleteById(id);
        return ResponseEntity.ok(Map.of("status", "SUCCESS", "message", "Portfolio item deleted"));
    }

    public PortfolioItemResponseDTO toDto(PortfolioItem item) {
        return PortfolioItemResponseDTO.builder()
                .id(item.getId())
                .imageUrl(item.getImageUrl())
                .caption(item.getCaption())
                .uploadedAt(item.getUploadedAt())
                .build();
    }
}
