package com.easemyhome.controller;

import com.easemyhome.service.CloudinaryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "http://localhost:5173")
public class UploadController {

    private static final String UPLOAD_DIR = "uploads";

    @Autowired
    private CloudinaryService cloudinaryService;

    @PostMapping("/upload")
    public ResponseEntity<?> uploadFile(@RequestParam("file") MultipartFile file) {
        Map<String, String> response = new HashMap<>();
        if (file.isEmpty()) {
            response.put("message", "Please select a file to upload");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }

        // 1. Try uploading to Cloudinary
        try {
            System.out.println("Uploading file to Cloudinary via backend service...");
            String cloudinaryUrl = cloudinaryService.upload(file);
            System.out.println("Cloudinary upload successful! URL: " + cloudinaryUrl);
            
            response.put("status", "SUCCESS");
            response.put("url", cloudinaryUrl);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.err.println("Cloudinary upload failed: " + e.getMessage() + ". Falling back to local storage...");
        }

        // 2. Fallback: Save the file to the local upload directory
        try {
            // Create uploads directory if it doesn't exist
            File directory = new File(UPLOAD_DIR);
            if (!directory.exists()) {
                directory.mkdirs();
            }

            // Generate a unique file name
            String originalFilename = file.getOriginalFilename();
            String extension = "";
            if (originalFilename != null && originalFilename.contains(".")) {
                extension = originalFilename.substring(originalFilename.lastIndexOf("."));
            }
            String fileName = UUID.randomUUID().toString() + extension;

            // Save the file to the upload directory
            Path path = Paths.get(UPLOAD_DIR, fileName);
            Files.copy(file.getInputStream(), path);

            // Generate the file serving URL
            String fileUrl = "http://localhost:8085/uploads/" + fileName;

            response.put("status", "SUCCESS");
            response.put("url", fileUrl);
            return ResponseEntity.ok(response);

        } catch (IOException e) {
            response.put("status", "FAILED");
            response.put("message", "Both Cloudinary and Local upload failed: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
}
