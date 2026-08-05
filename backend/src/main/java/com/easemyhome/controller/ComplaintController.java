package com.easemyhome.controller;

import com.easemyhome.model.Complaint;
import com.easemyhome.model.Provider;
import com.easemyhome.model.User;
import com.easemyhome.repository.ComplaintRepository;
import com.easemyhome.repository.ProviderRepository;
import com.easemyhome.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/complaints")
@CrossOrigin(origins = "*")
public class ComplaintController {

    @Autowired
    private ComplaintRepository complaintRepository;

    @Autowired
    private ProviderRepository providerRepository;

    @Autowired
    private UserRepository userRepository;

    @GetMapping
    public ResponseEntity<List<Complaint>> getAllComplaints() {
        return ResponseEntity.ok(complaintRepository.findAllByOrderByCreatedAtDesc());
    }

    @PostMapping
    public ResponseEntity<Complaint> createComplaint(@RequestBody Map<String, String> body) {
        String title       = body.get("title");
        String description = body.get("description");
        String userName    = body.getOrDefault("userName", "Anonymous");
        String userEmail   = body.getOrDefault("userEmail", "unknown@easemyhome.com");
        String userRole    = body.getOrDefault("userRole", "CUSTOMER");
        String bookingId   = body.getOrDefault("bookingId", "N/A");
        String issueType   = body.get("issueType");
        String imageUrls   = body.get("imageUrls");
        String bookingCompletedAt = body.get("bookingCompletedAt");
        String serviceType = body.get("serviceType");

        if (title == null || title.isBlank() || description == null || description.isBlank()) {
            return ResponseEntity.badRequest().build();
        }

        long count = complaintRepository.count() + 101;
        String ticketId = "CMP-" + count;

        Complaint complaint = new Complaint();
        complaint.setTicketId(ticketId);
        complaint.setUserName(userName);
        complaint.setUserEmail(userEmail);
        complaint.setUserRole(userRole);
        complaint.setBookingId(bookingId);
        complaint.setIssueType(issueType);
        complaint.setTitle(title);
        complaint.setDescription(description);
        complaint.setImageUrls(imageUrls);
        complaint.setBookingCompletedAt(bookingCompletedAt);
        complaint.setServiceType(serviceType);
        complaint.setStatus("Open");
        complaint.setCreatedAt(LocalDateTime.now());

        Complaint saved = complaintRepository.save(complaint);
        return ResponseEntity.ok(saved);
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateStatus(@PathVariable Long id, @RequestBody Map<String, String> body) {
        String newStatus = body.get("status");
        Optional<Complaint> optional = complaintRepository.findById(id);
        if (optional.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        Complaint complaint = optional.get();
        complaint.setStatus(newStatus);
        complaintRepository.save(complaint);
        return ResponseEntity.ok(complaint);
    }

    @PutMapping("/{id}/assign")
    public ResponseEntity<?> assignExecutive(@PathVariable Long id, @RequestBody Map<String, String> body) {
        String assignedTo = body.get("assignedTo");
        Optional<Complaint> optional = complaintRepository.findById(id);
        if (optional.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        Complaint complaint = optional.get();
        complaint.setAssignedTo(assignedTo);
        if ("Open".equals(complaint.getStatus())) {
            complaint.setStatus("In Progress");
        }
        complaintRepository.save(complaint);
        return ResponseEntity.ok(complaint);
    }

    /**
     * Admin direct action on account: suspend, approve, or delete
     * Body: { action: "SUSPEND" | "APPROVE" | "DELETE", userEmail: "...", userRole: "PROVIDER" | "CUSTOMER" }
     */
    @PostMapping("/{id}/action")
    public ResponseEntity<?> performAction(@PathVariable Long id, @RequestBody Map<String, String> body) {
        String action    = body.getOrDefault("action", "").toUpperCase();
        String userEmail = body.get("userEmail");
        String userRole  = body.getOrDefault("userRole", "PROVIDER").toUpperCase();

        Map<String, String> result = new HashMap<>();

        if ("PROVIDER".equals(userRole)) {
            Optional<Provider> provOpt = providerRepository.findByEmail(userEmail);
            if (provOpt.isEmpty()) {
                result.put("message", "Provider not found with email: " + userEmail);
                return ResponseEntity.status(404).body(result);
            }
            Provider provider = provOpt.get();
            switch (action) {
                case "SUSPEND" -> {
                    provider.setStatus("Suspended");
                    providerRepository.save(provider);
                    // Also close the complaint
                    complaintRepository.findById(id).ifPresent(c -> {
                        c.setStatus("Closed");
                        complaintRepository.save(c);
                    });
                    result.put("message", "Provider account suspended and complaint closed.");
                }
                case "APPROVE" -> {
                    provider.setStatus("Active");
                    providerRepository.save(provider);
                    complaintRepository.findById(id).ifPresent(c -> {
                        c.setStatus("Resolved");
                        complaintRepository.save(c);
                    });
                    result.put("message", "Provider account approved and complaint resolved.");
                }
                case "DELETE" -> {
                    providerRepository.deleteById(provider.getId());
                    complaintRepository.findById(id).ifPresent(c -> {
                        c.setStatus("Closed");
                        complaintRepository.save(c);
                    });
                    result.put("message", "Provider account deleted and complaint closed.");
                }
                default -> {
                    result.put("message", "Unknown action: " + action);
                    return ResponseEntity.badRequest().body(result);
                }
            }
        } else {
            // CUSTOMER / USER
            Optional<User> userOpt = userRepository.findByEmail(userEmail);
            if (userOpt.isEmpty()) {
                result.put("message", "User not found with email: " + userEmail);
                return ResponseEntity.status(404).body(result);
            }
            User user = userOpt.get();
            switch (action) {
                case "SUSPEND" -> {
                    user.setStatus("Blocked");
                    userRepository.save(user);
                    complaintRepository.findById(id).ifPresent(c -> {
                        c.setStatus("Closed");
                        complaintRepository.save(c);
                    });
                    result.put("message", "User account suspended and complaint closed.");
                }
                case "APPROVE" -> {
                    user.setStatus("Active");
                    userRepository.save(user);
                    complaintRepository.findById(id).ifPresent(c -> {
                        c.setStatus("Resolved");
                        complaintRepository.save(c);
                    });
                    result.put("message", "User account approved and complaint resolved.");
                }
                case "DELETE" -> {
                    userRepository.deleteById(user.getId());
                    complaintRepository.findById(id).ifPresent(c -> {
                        c.setStatus("Closed");
                        complaintRepository.save(c);
                    });
                    result.put("message", "User account deleted and complaint closed.");
                }
                default -> {
                    result.put("message", "Unknown action: " + action);
                    return ResponseEntity.badRequest().body(result);
                }
            }
        }

        return ResponseEntity.ok(result);
    }
}
