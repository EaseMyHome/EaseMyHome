import React, { useState } from 'react';
import './Reviews.css';

const REVIEWS = [
  {
    id: 1,
    company: "Harley's Fine Baking",
    title: "CEO",
    quote: "...an invaluable partner in our expansion across multiple cities, ensuring reliable service logistics.",
    firstName: "Suresh",
    lastName: "Naik",
    bgColor: "#E57373", // Coral Pink
    logo: "🥯"
  },
  {
    id: 2,
    company: "Blue Tokai Coffee",
    title: "Co-Founder",
    quote: "...consistent supply of high-quality sanitation, reducing customer complaints and downtime.",
    firstName: "Shivam",
    lastName: "Shahi",
    bgColor: "#4DB6AC", // Teal
    logo: "☕"
  },
  {
    id: 3,
    company: "Meghana Foods",
    title: "Founder",
    quote: "...their top-quality verified technicians provide timely kitchen repairs and upkeep.",
    firstName: "B.",
    lastName: "Ramesh",
    bgColor: "#A1887F", // Brown/Terracotta
    logo: "🍛"
  },
  {
    id: 4,
    company: "Sodexo Services",
    title: "Director",
    quote: "...standardized cleaning checks simplify our facility management checklists enormously.",
    firstName: "Gaurav",
    lastName: "Gite",
    bgColor: "#9CCC65", // Olive Green
    logo: "🏢"
  },
  {
    id: 5,
    company: "Naturals Salon",
    title: "Regional Head",
    quote: "...flexible booking slots let us schedule disinfection rounds after retail operating hours.",
    firstName: "Pooja",
    lastName: "Sharma",
    bgColor: "#5C6BC0", // Indigo Blue
    logo: "💅"
  }
];

export default function Reviews() {
  const [startIndex, setStartIndex] = useState(0);

  const handleNext = () => {
    setStartIndex((prev) => (prev + 1) % REVIEWS.length);
  };

  const handlePrev = () => {
    setStartIndex((prev) => (prev - 1 + REVIEWS.length) % REVIEWS.length);
  };

  // Get 3 reviews starting from startIndex (wrap around)
  const visibleReviews = [
    REVIEWS[startIndex],
    REVIEWS[(startIndex + 1) % REVIEWS.length],
    REVIEWS[(startIndex + 2) % REVIEWS.length]
  ];

  return (
    <section id="testimonials" className="section testimonials-sectionbg-grey">
      <div className="container">
        
        {/* Testimonials Header */}
        <div className="testimonials-header-hyperpure">
          <h2>What our partners say about us</h2>
        </div>

        {/* Carousel Slider Wrapper */}
        <div className="slider-wrapper-hyperpure">
          <button className="slider-nav-btn prev-btn" onClick={handlePrev}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>

          <div className="testimonials-slider-row">
            {visibleReviews.map((rev) => (
              <div 
                key={rev.id} 
                className="testimonial-card-hyperpure" 
                style={{ backgroundColor: rev.bgColor }}
              >
                <div className="hp-t-card-header">
                  <div className="hp-t-avatar-box">
                    <span>{rev.logo}</span>
                  </div>
                  <div className="hp-t-meta">
                    <h4>{rev.company}</h4>
                    <span>{rev.title}</span>
                  </div>
                </div>

                <p className="hp-t-quote">"{rev.quote}"</p>

                <div className="hp-t-card-footer">
                  <div className="hp-t-client-name">
                    <span className="first-name">{rev.firstName}</span>
                    <span className="last-name">{rev.lastName}</span>
                  </div>
                  <button className="hp-plus-btn">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                      <line x1="12" y1="5" x2="12" y2="19" />
                      <line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>

          <button className="slider-nav-btn next-btn" onClick={handleNext}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </div>

      </div>
    </section>
  );
}
