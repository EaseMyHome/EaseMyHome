package com.easemyhome.repository;

import com.easemyhome.model.BannerImage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface BannerImageRepository extends JpaRepository<BannerImage, Long> {
    // Custom queries if needed
}
