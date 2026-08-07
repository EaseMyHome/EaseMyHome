package com.easemyhome.service;

import com.easemyhome.model.BannerImage;
import com.easemyhome.repository.BannerImageRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;

@Service
public class BannerImageService {

    private static final String UPLOAD_DIR = "uploads/banner-images"; // relative to project root

    @Autowired
    private BannerImageRepository bannerImageRepository;

    public BannerImage storeImage(Long bannerId, MultipartFile file) throws IOException {
        // Ensure upload directory exists
        Path uploadPath = Path.of(UPLOAD_DIR);
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }
        String filename = System.currentTimeMillis() + "_" + file.getOriginalFilename();
        Path filePath = uploadPath.resolve(filename);
        Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

        BannerImage bannerImage = new BannerImage();
        bannerImage.setFilename(filename);
        // Assuming application will serve static files from /uploads/**
        bannerImage.setUrl("/" + UPLOAD_DIR + "/" + filename);
        // Set relation later via controller when banner is known
        return bannerImageRepository.save(bannerImage);
    }
}
