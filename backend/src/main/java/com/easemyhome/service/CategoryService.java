package com.easemyhome.service;

import com.easemyhome.model.Category;
import com.easemyhome.repository.CategoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class CategoryService {

    @Autowired
    private CategoryRepository categoryRepository;

    public ResponseEntity<List<Category>> getAllCategories() {
        return ResponseEntity.ok(categoryRepository.findAll());
    }

    public ResponseEntity<?> createCategory(Category category) {
        if (category.getName() == null || category.getName().trim().isEmpty()) {
            Map<String, String> response = new HashMap<>();
            response.put("message", "Category name is required");
            return ResponseEntity.badRequest().body(response);
        }
        Category saved = categoryRepository.save(category);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    public ResponseEntity<?> updateCategory(Long id, Category categoryDetails) {
        Optional<Category> categoryOpt = categoryRepository.findById(id);
        if (categoryOpt.isEmpty()) {
            Map<String, String> response = new HashMap<>();
            response.put("message", "Category not found");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }

        Category category = categoryOpt.get();
        category.setName(categoryDetails.getName());
        category.setImage(categoryDetails.getImage());
        category.setStatus(categoryDetails.getStatus());

        Category updated = categoryRepository.save(category);
        return ResponseEntity.ok(updated);
    }

    public ResponseEntity<?> toggleCategoryStatus(Long id) {
        Optional<Category> categoryOpt = categoryRepository.findById(id);
        if (categoryOpt.isEmpty()) {
            Map<String, String> response = new HashMap<>();
            response.put("message", "Category not found");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }

        Category category = categoryOpt.get();
        if ("Active".equalsIgnoreCase(category.getStatus())) {
            category.setStatus("Inactive");
        } else {
            category.setStatus("Active");
        }

        Category updated = categoryRepository.save(category);
        return ResponseEntity.ok(updated);
    }

    public ResponseEntity<?> deleteCategory(Long id) {
        Optional<Category> categoryOpt = categoryRepository.findById(id);
        if (categoryOpt.isEmpty()) {
            Map<String, String> response = new HashMap<>();
            response.put("message", "Category not found");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }

        categoryRepository.deleteById(id);
        Map<String, String> response = new HashMap<>();
        response.put("message", "Category deleted successfully");
        return ResponseEntity.ok(response);
    }
}
