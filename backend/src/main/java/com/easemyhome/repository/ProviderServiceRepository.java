package com.easemyhome.repository;

import com.easemyhome.model.ProviderService;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProviderServiceRepository extends JpaRepository<ProviderService, Long> {
    List<ProviderService> findByProviderId(Long providerId);
    List<ProviderService> findByProviderIdAndActiveTrue(Long providerId);
    void deleteByProviderId(Long providerId);
}
