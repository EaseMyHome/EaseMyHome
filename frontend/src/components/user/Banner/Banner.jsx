import React, { useState, useEffect } from 'react';
import './Banner.css';

const DEFAULT_SLIDES = [
  {
    id: 1,
    title: 'All your home services delivered to your doorstep',
    subtitle: '10+ categories • 500+ verified professionals',
    cta: 'Book Now',
    imgUrl: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?q=80&w=1600&auto=format&fit=crop',
  }
];

export default function Banner() {
  const [slides, setSlides] = useState([]);
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    fetch('http://localhost:8085/api/banners')
      .then(res => res.json())
      .then(data => {
        const activeBanners = data.filter(b => b.status === 'Active');
        if (activeBanners.length > 0) {
          const formattedSlides = activeBanners.map(b => ({
            id: b.id,
            title: b.title || 'Special Offer!',
            subtitle: b.subtitle || 'Book now to avail exciting discounts.',
            cta: 'Book Now',
            imgUrl: b.imageUrl,
          }));
          setSlides(formattedSlides);
        } else {
          setSlides(DEFAULT_SLIDES);
        }
      })
      .catch(err => {
        console.error("Failed to fetch banners", err);
        setSlides(DEFAULT_SLIDES);
      });
  }, []);

  const nextSlide = () => {
    if (slides.length > 0) {
      setActiveSlide((prev) => (prev + 1) % slides.length);
    }
  };

  const prevSlide = () => {
    if (slides.length > 0) {
      setActiveSlide((prev) => (prev - 1 + slides.length) % slides.length);
    }
  };

  // Auto-scroll slides every 6 seconds
  useEffect(() => {
    if (slides.length > 1) {
      const timer = setInterval(nextSlide, 6000);
      return () => clearInterval(timer);
    }
  }, [slides.length]);

  if (slides.length === 0) return null;

  return (
    <section className="hero-section-hyperpure">
      {slides.map((slide, idx) => (
        <div 
          key={slide.id} 
          className={`hero-slide ${idx === activeSlide ? 'active' : ''}`}
          style={{ backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.45), rgba(0, 0, 0, 0.45)), url("${slide.imgUrl}")` }}
        >
          <div className="container hero-slide-container">
            <div className="hero-slide-content">
              <h1>{slide.title}</h1>
              <p>{slide.subtitle}</p>
            </div>
          </div>
        </div>
      ))}

      {/* Prev / Next Arrows (Placed on sides) */}
      <button className="slider-arrow-hp arrow-left" onClick={prevSlide} aria-label="Previous Slide">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <polyline points="15 18 9 12 15 6" />
        </svg>
      </button>
      <button className="slider-arrow-hp arrow-right" onClick={nextSlide} aria-label="Next Slide">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </button>

      {/* Slide Indicators / Dots */}
      <div className="slider-dots-hp">
        {slides.map((_, idx) => (
          <button 
            key={idx} 
            className={`slider-dot-hp ${idx === activeSlide ? 'active' : ''}`}
            onClick={() => setActiveSlide(idx)}
            aria-label={`Go to slide ${idx + 1}`}
          ></button>
        ))}
      </div>
    </section>
  );
}
