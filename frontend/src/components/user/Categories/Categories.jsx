import React from 'react';
import './Categories.css';

const CATEGORIES = [
  {
    id: 'cleaning',
    title: 'Deep Cleaning',
    icon: '🧼',
  },
  {
    id: 'plumbing',
    title: 'Plumbing Solutions',
    icon: '🔧',
  },
  {
    id: 'electrical',
    title: 'Electrical Repair',
    icon: '⚡',
  },
  {
    id: 'appliance',
    title: 'Appliance Repair',
    icon: '❄️',
  },
  {
    id: 'pest',
    title: 'Pest Control',
    icon: '🦟',
  },
  {
    id: 'painting',
    title: 'Home Painting',
    icon: '🎨',
  },
  {
    id: 'carpentry',
    title: 'Carpentry Work',
    icon: '🔨',
  },
  {
    id: 'sofa',
    title: 'Sofa Cleaning',
    icon: '🛋️',
  },
  {
    id: 'gardening',
    title: 'Lawn & Garden',
    icon: '🌱',
  },
  {
    id: 'smarthome',
    title: 'Smart Home Setup',
    icon: '🏠',
  },
  {
    id: 'disinfection',
    title: 'Sanitization',
    icon: '🧴',
  },
  {
    id: 'packers',
    title: 'Packers & Movers',
    icon: '📦',
  }
];

export default function Categories() {
  return (
    <section id="services" className="section services-sectionbg-white">
      <div className="container">
        <div className="section-header-hyperpure">
          <span className="hp-subtitle-red">OUR CATEGORIES</span>
        </div>

        <div className="hyperpure-categories-grid">
          {CATEGORIES.map((cat) => (
            <a href="#portals" key={cat.id} className="hp-category-card">
              <div className="hp-category-icon-box">
                <span className="hp-emoji">{cat.icon}</span>
              </div>
              <span className="hp-category-title">{cat.title}</span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
