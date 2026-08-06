package com.easemyhome.controller;

import com.easemyhome.dto.request.ProviderServiceRequestDTO;
import com.easemyhome.dto.response.ProviderServiceResponseDTO;
import com.easemyhome.exception.BadRequestException;
import com.easemyhome.exception.ResourceNotFoundException;
import com.easemyhome.exception.UnauthorizedException;
import com.easemyhome.model.Provider;
import com.easemyhome.model.ProviderService;
import com.easemyhome.repository.ProviderRepository;
import com.easemyhome.repository.ProviderServiceRepository;
import com.easemyhome.service.JwtService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/provider/services")
@CrossOrigin(origins = "*")
public class ProviderServiceController {

    @Autowired
    private ProviderServiceRepository providerServiceRepository;

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
                .orElseThrow(() -> new UnauthorizedException("Provider not found for token email: " + email));
    }

    // ── GET /api/provider/services  ──  List all services for the logged-in provider
    @GetMapping
    public ResponseEntity<List<ProviderServiceResponseDTO>> getMyServices(@RequestHeader("Authorization") String authHeader) {
        Provider provider = resolveProvider(authHeader);
        List<ProviderService> services = providerServiceRepository.findByProviderId(provider.getId());
        return ResponseEntity.ok(services.stream().map(this::toDto).toList());
    }

    // ── POST /api/provider/services  ──  Add a new sub-service
    @PostMapping
    public ResponseEntity<Map<String, Object>> addService(@RequestHeader("Authorization") String authHeader,
                                                         @Valid @RequestBody ProviderServiceRequestDTO dto) {
        Provider provider = resolveProvider(authHeader);

        ProviderService service = new ProviderService();
        service.setProvider(provider);
        service.setName(dto.getName().trim());
        service.setDescription(dto.getDescription() != null ? dto.getDescription().trim() : "");
        service.setPrice(dto.getPrice());
        service.setUnit(dto.getUnit().trim());
        service.setActive(dto.getActive() != null ? dto.getActive() : true);

        ProviderService saved = providerServiceRepository.save(service);
        return ResponseEntity.ok(Map.of("status", "SUCCESS", "service", toDto(saved)));
    }

    // ── PUT /api/provider/services/{id}  ──  Update an existing sub-service
    @PutMapping("/{id}")
    public ResponseEntity<Map<String, Object>> updateService(@RequestHeader("Authorization") String authHeader,
                                                            @PathVariable Long id,
                                                            @RequestBody ProviderServiceRequestDTO dto) {
        Provider provider = resolveProvider(authHeader);

        ProviderService service = providerServiceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("ProviderService", id));

        if (!service.getProvider().getId().equals(provider.getId())) {
            throw new BadRequestException("Access denied: service belongs to another provider");
        }

        if (dto.getName() != null && !dto.getName().isBlank()) service.setName(dto.getName().trim());
        if (dto.getDescription() != null) service.setDescription(dto.getDescription().trim());
        if (dto.getUnit() != null && !dto.getUnit().isBlank()) service.setUnit(dto.getUnit().trim());
        if (dto.getPrice() != null) service.setPrice(dto.getPrice());
        if (dto.getActive() != null) service.setActive(dto.getActive());

        ProviderService updated = providerServiceRepository.save(service);
        return ResponseEntity.ok(Map.of("status", "SUCCESS", "service", toDto(updated)));
    }

    // ── DELETE /api/provider/services/{id}  ──  Delete a sub-service
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Object>> deleteService(@RequestHeader("Authorization") String authHeader,
                                                             @PathVariable Long id) {
        Provider provider = resolveProvider(authHeader);

        ProviderService service = providerServiceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("ProviderService", id));

        if (!service.getProvider().getId().equals(provider.getId())) {
            throw new BadRequestException("Access denied: service belongs to another provider");
        }

        providerServiceRepository.deleteById(id);
        return ResponseEntity.ok(Map.of("status", "SUCCESS", "message", "Service deleted"));
    }

    public ProviderServiceResponseDTO toDto(ProviderService s) {
        return ProviderServiceResponseDTO.builder()
                .id(s.getId())
                .name(s.getName())
                .description(s.getDescription())
                .price(s.getPrice())
                .unit(s.getUnit())
                .active(s.getActive())
                .build();
    }
}
