package com.easemyhome.repository;

import com.easemyhome.model.PortfolioItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PortfolioItemRepository extends JpaRepository<PortfolioItem, Long> {
    List<PortfolioItem> findByProviderId(Long providerId);
    void deleteByProviderId(Long providerId);
}
