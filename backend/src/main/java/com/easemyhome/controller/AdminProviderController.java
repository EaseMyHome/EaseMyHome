package com.easemyhome.controller;

import com.easemyhome.model.Provider;
import com.easemyhome.repository.ProviderRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/admin/providers")
@CrossOrigin(origins = "*")
public class AdminProviderController {

    @Autowired
    private ProviderRepository providerRepository;

    @GetMapping
    public ResponseEntity<List<Provider>> getAllProviders() {
        return ResponseEntity.ok(providerRepository.findAll());
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateProviderStatus(@PathVariable Long id, @RequestBody Map<String, Object> payload) {
        Optional<Provider> providerOpt = providerRepository.findById(id);
        if (providerOpt.isEmpty()) {
            Map<String, String> response = new HashMap<>();
            response.put("message", "Provider not found");
            return ResponseEntity.status(404).body(response);
        }

        String newStatus = (String) payload.get("status");
        if (newStatus == null) {
            Map<String, String> response = new HashMap<>();
            response.put("message", "Status parameter is required");
            return ResponseEntity.badRequest().body(response);
        }

        Provider provider = providerOpt.get();
        provider.setStatus(newStatus);

        if (payload.containsKey("coverageArea")) {
            provider.setCoverageArea((String) payload.get("coverageArea"));
        }

        if (payload.containsKey("workingRadius")) {
            Object radiusObj = payload.get("workingRadius");
            if (radiusObj instanceof Number) {
                provider.setWorkingRadius(((Number) radiusObj).intValue());
            } else if (radiusObj instanceof String) {
                try {
                    provider.setWorkingRadius(Integer.parseInt((String) radiusObj));
                } catch (NumberFormatException e) {
                    // ignore
                }
            }
        }

        Provider updated = providerRepository.save(provider);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteProvider(@PathVariable Long id) {
        Optional<Provider> providerOpt = providerRepository.findById(id);
        if (providerOpt.isEmpty()) {
            Map<String, String> response = new HashMap<>();
            response.put("message", "Provider not found");
            return ResponseEntity.status(404).body(response);
        }

        providerRepository.deleteById(id);
        Map<String, String> response = new HashMap<>();
        response.put("message", "Provider deleted successfully");
        return ResponseEntity.ok(response);
    }
}
