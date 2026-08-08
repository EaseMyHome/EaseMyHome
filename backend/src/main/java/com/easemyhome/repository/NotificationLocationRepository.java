package com.easemyhome.repository;

import com.easemyhome.model.NotificationLocation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface NotificationLocationRepository extends JpaRepository<NotificationLocation, Long> {
    // Custom queries if needed
}
