package com.easemyhome.service;

import com.easemyhome.model.Provider;
import com.easemyhome.repository.ProviderRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@Service
public class ProviderService {

    @Autowired
    private ProviderRepository providerRepository;

    @Autowired
    private JwtService jwtService;

    public ResponseEntity<?> updateProviderProfile(String authHeader, Map<String, Object> payload) {
        Map<String, Object> response = new HashMap<>();

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            response.put("message", "Missing or invalid Authorization header");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
        }

        String token = authHeader.substring(7);
        try {
            String email = jwtService.extractEmail(token);
            String role = jwtService.extractRole(token);

            if (jwtService.validateToken(token, email) && "PROVIDER".equals(role)) {
                Optional<Provider> providerOpt = providerRepository.findByEmail(email);
                if (providerOpt.isPresent()) {
                    Provider provider = providerOpt.get();

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
                                // ignore invalid radius
                            }
                        }
                    }
                    if (payload.containsKey("serviceType")) {
                        provider.setServiceType((String) payload.get("serviceType"));
                    }
                    if (payload.containsKey("experience")) {
                        Object expObj = payload.get("experience");
                        if (expObj instanceof Number) {
                            provider.setExperience(((Number) expObj).intValue());
                        } else if (expObj instanceof String) {
                            try {
                                provider.setExperience(Integer.parseInt((String) expObj));
                            } catch (NumberFormatException e) {
                                // ignore invalid experience
                            }
                        }
                    }
                    if (payload.containsKey("selfieImage")) {
                        provider.setSelfieImage((String) payload.get("selfieImage"));
                    }
                    if (payload.containsKey("bio")) {
                        provider.setBio((String) payload.get("bio"));
                    }
                    // Bank / payout details
                    if (payload.containsKey("bankAccountNumber")) {
                        provider.setBankAccountNumber((String) payload.get("bankAccountNumber"));
                    }
                    if (payload.containsKey("bankIfscCode")) {
                        provider.setBankIfscCode((String) payload.get("bankIfscCode"));
                    }
                    if (payload.containsKey("bankName")) {
                        provider.setBankName((String) payload.get("bankName"));
                    }
                    if (payload.containsKey("accountHolderName")) {
                        provider.setAccountHolderName((String) payload.get("accountHolderName"));
                    }
                    if (payload.containsKey("latitude") && payload.get("latitude") != null) {
                        Object latObj = payload.get("latitude");
                        if (latObj instanceof Number) provider.setLatitude(((Number) latObj).doubleValue());
                        else if (latObj instanceof String) try { provider.setLatitude(Double.parseDouble((String) latObj)); } catch (Exception ignored) {}
                    }
                    if (payload.containsKey("longitude") && payload.get("longitude") != null) {
                        Object lngObj = payload.get("longitude");
                        if (lngObj instanceof Number) provider.setLongitude(((Number) lngObj).doubleValue());
                        else if (lngObj instanceof String) try { provider.setLongitude(Double.parseDouble((String) lngObj)); } catch (Exception ignored) {}
                    }

                    Provider savedProvider = providerRepository.save(provider);


                    response.put("status", "SUCCESS");
                    response.put("user", mapProviderData(savedProvider));
                    return ResponseEntity.ok(response);
                }
            }
        } catch (Exception e) {
            response.put("message", "Profile update failed: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
        }

        response.put("message", "User profile not found or token expired");
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
    }

    public Map<String, Object> mapProviderData(Provider provider) {
        Map<String, Object> providerData = new HashMap<>();
        providerData.put("id", provider.getId());
        providerData.put("name", provider.getName());
        providerData.put("email", provider.getEmail());
        providerData.put("role", "PROVIDER");
        providerData.put("serviceType", provider.getServiceType());
        providerData.put("experience", provider.getExperience());
        providerData.put("status", provider.getStatus());
        providerData.put("coverageArea", provider.getCoverageArea());
        providerData.put("workingRadius", provider.getWorkingRadius());
        providerData.put("latitude", provider.getLatitude());
        providerData.put("longitude", provider.getLongitude());
        providerData.put("bio", provider.getBio());
        providerData.put("selfieImage", provider.getSelfieImage());
        providerData.put("bankAccountNumber", provider.getBankAccountNumber());
        providerData.put("bankIfscCode", provider.getBankIfscCode());
        providerData.put("bankName", provider.getBankName());
        providerData.put("accountHolderName", provider.getAccountHolderName());

        // NOTE: workPhotos removed — fetch from GET /api/provider/portfolio/{providerId}
        return providerData;
    }
}
