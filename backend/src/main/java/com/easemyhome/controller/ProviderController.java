package com.easemyhome.controller;

import com.easemyhome.repository.ProviderServiceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/providers")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174", "http://localhost:5175", "http://localhost:5176"})
public class ProviderController {

    @Autowired
    private com.easemyhome.service.ProviderService providerService;

    @Autowired
    private ProviderServiceRepository providerServiceRepository;

    @PutMapping("/profile")
    public ResponseEntity<?> updateProviderProfile(@RequestHeader("Authorization") String authHeader, @RequestBody Map<String, Object> payload) {
        return providerService.updateProviderProfile(authHeader, payload);
    }

    // ── Public: GET /api/providers/{id}/services ── fetch sub-services for any provider
    @GetMapping("/{id}/services")
    public ResponseEntity<?> getProviderSubServices(@PathVariable Long id) {
        List<com.easemyhome.model.ProviderService> services = providerServiceRepository.findByProviderIdAndActiveTrue(id);
        List<Map<String, Object>> result = new ArrayList<>();
        for (com.easemyhome.model.ProviderService s : services) {
            Map<String, Object> dto = new LinkedHashMap<>();
            dto.put("id", s.getId());
            dto.put("name", s.getName());
            dto.put("description", s.getDescription());
            dto.put("price", s.getPrice());
            dto.put("unit", s.getUnit());
            dto.put("active", s.getActive());
            result.add(dto);
        }
        return ResponseEntity.ok(result);
    }
}
