package com.easemyhome.controller;

import com.easemyhome.model.Booking;
import com.easemyhome.model.User;
import com.easemyhome.repository.BookingRepository;
import com.easemyhome.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping({"/api/admin/users", "/api/admin/customers"})
@CrossOrigin(origins = "*")
public class AdminUserController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private BookingRepository bookingRepository;

    @GetMapping
    public ResponseEntity<List<User>> getAllCustomers() {
        List<User> customers = userRepository.findAll().stream()
                .filter(user -> "USER".equalsIgnoreCase(user.getRole()))
                .collect(Collectors.toList());
        return ResponseEntity.ok(customers);
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<?> toggleStatus(@PathVariable Long id) {
        Optional<User> userOpt = userRepository.findById(id);
        if (userOpt.isEmpty()) {
            Map<String, String> response = new HashMap<>();
            response.put("message", "Customer not found");
            return ResponseEntity.status(404).body(response);
        }
        User user = userOpt.get();
        String newStatus = "Active".equals(user.getStatus()) ? "Blocked" : "Active";
        user.setStatus(newStatus);
        userRepository.save(user);
        Map<String, String> response = new HashMap<>();
        response.put("status", newStatus);
        response.put("message", "Customer status updated to " + newStatus);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    @Transactional
    public ResponseEntity<?> deleteCustomer(@PathVariable Long id) {
        Optional<User> userOpt = userRepository.findById(id);
        if (userOpt.isEmpty()) {
            Map<String, String> response = new HashMap<>();
            response.put("message", "Customer not found");
            return ResponseEntity.status(404).body(response);
        }
        User user = userOpt.get();
        try {
            if (user.getEmail() != null) {
                List<Booking> customerBookings = bookingRepository.findByCustomerEmail(user.getEmail());
                for (Booking b : customerBookings) {
                    bookingRepository.delete(b);
                }
            }
            userRepository.delete(user);
            Map<String, String> response = new HashMap<>();
            response.put("message", "Customer deleted successfully");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> response = new HashMap<>();
            response.put("message", "Error deleting customer: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }
}
