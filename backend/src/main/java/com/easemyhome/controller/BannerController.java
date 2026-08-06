package com.easemyhome.controller;

import com.easemyhome.model.Banner;
import com.easemyhome.repository.BannerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/banners")
@CrossOrigin(origins = "*")
public class BannerController {

    @Autowired
    private BannerRepository bannerRepository;

    @GetMapping
    public ResponseEntity<List<Banner>> getAllBanners() {
        return ResponseEntity.ok(bannerRepository.findAllByOrderByDisplayOrderAsc());
    }

    @PostMapping
    public ResponseEntity<?> createBanner(@RequestBody Banner banner) {
        banner.setCreatedAt(LocalDateTime.now());
        if (banner.getStatus() == null) banner.setStatus("Active");
        if (banner.getDisplayOrder() == null) banner.setDisplayOrder(1);
        Banner saved = bannerRepository.save(banner);
        return ResponseEntity.ok(Map.of("status", "SUCCESS", "banner", saved));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateBanner(@PathVariable Long id, @RequestBody Banner bannerDetails) {
        Optional<Banner> opt = bannerRepository.findById(id);
        if (opt.isEmpty()) {
            return ResponseEntity.status(404).body(Map.of("message", "Banner not found"));
        }
        Banner banner = opt.get();
        if (bannerDetails.getTitle() != null) banner.setTitle(bannerDetails.getTitle());
        if (bannerDetails.getSubtitle() != null) banner.setSubtitle(bannerDetails.getSubtitle());
        if (bannerDetails.getImageUrl() != null) banner.setImageUrl(bannerDetails.getImageUrl());
        if (bannerDetails.getDisplayOrder() != null) banner.setDisplayOrder(bannerDetails.getDisplayOrder());
        if (bannerDetails.getStatus() != null) banner.setStatus(bannerDetails.getStatus());
        Banner saved = bannerRepository.save(banner);
        return ResponseEntity.ok(Map.of("status", "SUCCESS", "banner", saved));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<?> toggleStatus(@PathVariable Long id) {
        Optional<Banner> opt = bannerRepository.findById(id);
        if (opt.isEmpty()) {
            return ResponseEntity.status(404).body(Map.of("message", "Banner not found"));
        }
        Banner banner = opt.get();
        banner.setStatus("Active".equals(banner.getStatus()) ? "Inactive" : "Active");
        bannerRepository.save(banner);
        return ResponseEntity.ok(Map.of("status", "SUCCESS", "newStatus", banner.getStatus()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteBanner(@PathVariable Long id) {
        if (!bannerRepository.existsById(id)) {
            return ResponseEntity.status(404).body(Map.of("message", "Banner not found"));
        }
        bannerRepository.deleteById(id);
        return ResponseEntity.ok(Map.of("status", "SUCCESS", "message", "Banner deleted"));
    }
}
