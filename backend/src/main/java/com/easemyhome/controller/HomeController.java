package com.easemyhome.controller;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "http://localhost:5173") // Allow requests from Vite React app
public class HomeController {

    @GetMapping("/health")
    public Map<String, Object> healthCheck() {
        Map<String, Object> status = new HashMap<>();
        status.put("status", "UP");
        status.put("message", "EaseMyHome REST API is running successfully");
        status.put("timestamp", System.currentTimeMillis());
        return status;
    }

    @GetMapping("/config")
    public Map<String, Object> getAppConfiguration() {
        Map<String, Object> config = new HashMap<>();
        config.put("appName", "EaseMyHome");
        config.put("version", "1.0.0");
        config.put("description", "Premium Local Home Services Marketplace");
        
        String[] services = {"Cleaning", "Plumbing", "Electrical", "Appliance Repair", "Pest Control", "Painting"};
        config.put("availableServices", services);
        
        return config;
    }
}
