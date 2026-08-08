package com.easemyhome.repository;

import com.easemyhome.model.Booking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {
    // Query via the nested provider FK
    List<Booking> findByProviderId(Long providerId);
    List<Booking> findByProviderIdOrderByIdDesc(Long providerId);
    List<Booking> findByProviderEmail(String providerEmail);
    // Customer lookup by email field (still denormalized for quick access)
    List<Booking> findByCustomerEmail(String customerEmail);
    List<Booking> findByCustomerEmailOrderByIdDesc(String customerEmail);
    // Customer lookup via User FK
    List<Booking> findByUserId(Long userId);
    List<Booking> findAllByOrderByIdDesc();
}
