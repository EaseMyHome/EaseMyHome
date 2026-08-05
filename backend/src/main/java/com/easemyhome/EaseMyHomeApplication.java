package com.easemyhome;

import com.easemyhome.model.User;
import com.easemyhome.repository.BookingRepository;
import com.easemyhome.repository.CategoryRepository;
import com.easemyhome.repository.ProviderRepository;
import com.easemyhome.repository.ProviderServiceRepository;
import com.easemyhome.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

@SpringBootApplication
public class EaseMyHomeApplication {
    public static void main(String[] args) {
        SpringApplication.run(EaseMyHomeApplication.class, args);
    }

    @Bean
    public CommandLineRunner seedDatabase(
            UserRepository userRepository,
            ProviderRepository providerRepository,
            CategoryRepository categoryRepository,
            BookingRepository bookingRepository,
            ProviderServiceRepository providerServiceRepository,
            com.easemyhome.repository.PortfolioItemRepository portfolioItemRepository,
            com.easemyhome.repository.ReviewRepository reviewRepository,
            com.easemyhome.repository.BannerImageRepository bannerImageRepository,
            com.easemyhome.repository.ReportRepository reportRepository,
            com.easemyhome.repository.NotificationLocationRepository notificationLocationRepository) {
        return args -> {
            // 1. Seed Admin User if not already present
            if (userRepository.findByEmail("admin@easemyhome.com").isEmpty()) {
                User admin = new User();
                admin.setName("EaseMyHome Admin");
                admin.setEmail("admin@easemyhome.com");
                admin.setPhone("9999999999");
                admin.setPassword("admin123");
                admin.setAddress("EaseMyHome Headquarters");
                admin.setRole("ADMIN");
                userRepository.save(admin);
                System.out.println("Seeded Admin: admin@easemyhome.com / admin123");
            }

            // 2. Seed Default Categories if none exist
            if (categoryRepository.count() == 0) {
                com.easemyhome.model.Category cat1 = new com.easemyhome.model.Category(null, "Cleaning", "🧹", "Active");
                com.easemyhome.model.Category cat2 = new com.easemyhome.model.Category(null, "Plumbing", "🔧", "Active");
                com.easemyhome.model.Category cat3 = new com.easemyhome.model.Category(null, "Electrician", "⚡", "Active");
                com.easemyhome.model.Category cat4 = new com.easemyhome.model.Category(null, "Appliance Repair", "❄️", "Active");
                com.easemyhome.model.Category cat5 = new com.easemyhome.model.Category(null, "Painting", "🎨", "Active");
                com.easemyhome.model.Category cat6 = new com.easemyhome.model.Category(null, "Carpentry", "🪚", "Active");
                com.easemyhome.model.Category cat7 = new com.easemyhome.model.Category(null, "Pest Control", "🦟", "Active");
                com.easemyhome.model.Category cat8 = new com.easemyhome.model.Category(null, "Home Automation", "📹", "Active");

                categoryRepository.saveAll(java.util.List.of(cat1, cat2, cat3, cat4, cat5, cat6, cat7, cat8));
                System.out.println("Seeded 8 Categories into database.");
            }

            System.out.println("Startup complete. Preserving existing database records.");
        };
    }
}
