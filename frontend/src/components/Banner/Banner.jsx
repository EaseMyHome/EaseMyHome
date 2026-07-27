import React, { useState, useEffect } from 'react';
import './Banner.css';

const SLIDES = [
  {
    id: 1,
    title: 'All your home services delivered to your doorstep',
    subtitle: '10+ categories • 500+ verified professionals',
    cta: 'Book Now',
    imgUrl: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?q=80&w=1600&auto=format&fit=crop',
  },
  {
    id: 2,
    title: 'Professional deep cleaning & home sanitization',
    subtitle: 'Standardized methods • Eco-friendly materials',
    cta: 'Book Cleaning',
    imgUrl: 'https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?q=80&w=1600&auto=format&fit=crop',
  },
  {
    id: 3,
    title: 'Verified plumbers, electricians & technicians',
    subtitle: 'Transparent pricing • 100% background checked',
    cta: 'Book Repair',
    imgUrl: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?q=80&w=1600&auto=format&fit=crop',
  }
];

export default function Banner() {
  const [activeSlide, setActiveSlide] = useState(0);

  const nextSlide = () => {
    setActiveSlide((prev) => (prev + 1) % SLIDES.length);
  };

  const prevSlide = () => {
    setActiveSlide((prev) => (prev - 1 + SLIDES.length) % SLIDES.length);
  };

  // Auto-scroll slides every 6 seconds
  useEffect(() => {
    const timer = setInterval(nextSlide, 6000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="hero-section-hyperpure">
      {SLIDES.map((slide, idx) => (
        <div 
          key={slide.id} 
          className={`hero-slide ${idx === activeSlide ? 'active' : ''}`}
          style={{ backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.45), rgba(0, 0, 0, 0.45)), url("${slide.imgUrl}")` }}
        >
          <div className="container hero-slide-container">
            <div className="hero-slide-content">
              <h1>{slide.title}</h1>
              <p>{slide.subtitle}</p>
              <a href="#services" className="btn btn-accent hero-slide-btn">
                {slide.cta}
              </a>
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
        {SLIDES.map((_, idx) => (
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
