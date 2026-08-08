package com.easemyhome.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import jakarta.annotation.PostConstruct;
import java.io.IOException;
import java.util.Map;

@Service
public class CloudinaryService {

    @Value("${cloudinary.cloud-name}")
    private String cloudName;

    @Value("${cloudinary.api-key}")
    private String apiKey;

    @Value("${cloudinary.api-secret}")
    private String apiSecret;

    private Cloudinary cloudinary;

    @PostConstruct
    public void init() {
        cloudinary = new Cloudinary(ObjectUtils.asMap(
                "cloud_name", cloudName,
                "api_key", apiKey,
                "api_secret", apiSecret,
                "secure", true
        ));
    }

    public String upload(MultipartFile file) throws IOException {
        return upload(file, null);
    }

    public String upload(MultipartFile file, String folderName) throws IOException {
        java.util.Map<String, Object> options = new java.util.HashMap<>();
        if (folderName != null && !folderName.trim().isEmpty()) {
            // Sanitize folder name for Cloudinary (replace spaces & special chars with underscores)
            String sanitizedFolder = folderName.trim().replaceAll("[^a-zA-Z0-9_\\-/]", "_");
            options.put("folder", "providers/" + sanitizedFolder);
        } else {
            options.put("folder", "providers/general");
        }

        Map<?, ?> uploadResult = cloudinary.uploader().upload(file.getBytes(), options);
        return (String) uploadResult.get("secure_url");
    }
}
