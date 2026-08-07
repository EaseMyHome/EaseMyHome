import React, { useState } from 'react';
import './Quality.css';

const STATS = [
  { value: '130+', label: "cities we're active in" },
  { value: '2,500+', label: 'partners trust us' },
  { value: '1.5 Lakh+', label: 'services delivered' },
  { value: '100%', label: 'background checked' }
];

const QUALITY_STEPS = [
  {
    id: 'verify',
    title: 'Background Verification',
    description: 'Every partner undergoes comprehensive verification including government ID authentication, criminal history review, and past service audits to guarantee home safety.',
    imgUrl: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?q=80&w=600&auto=format&fit=crop',
  },
  {
    id: 'assess',
    title: 'Rigorous Assessments',
    description: 'We perform practical tests in simulated environments for plumbing, cleaning, painting, and wiring. Only top-performing experts earn the EaseMyHome partner badge.',
    imgUrl: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?q=80&w=600&auto=format&fit=crop',
  },
  {
    id: 'train',
    title: 'Standardized Training',
    description: 'Before their first booking, selected partners receive specialized soft skill, hygiene, safety protocols, and advanced tool usage training to meet international service norms.',
    imgUrl: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?q=80&w=600&auto=format&fit=crop',
  },
  {
    id: 'shield',
    title: 'Post-Service Warranty Shield',
    description: 'Your bookings are covered with structural guarantee safeguards. Enjoy direct customer help channels and up to ₹10,000 damage coverage policies on select works.',
    imgUrl: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?q=80&w=600&auto=format&fit=crop',
  }
];

export default function Quality() {
  const [activeStep, setActiveStep] = useState('verify');

  const currentStep = QUALITY_STEPS.find(s => s.id === activeStep) || QUALITY_STEPS[0];

  return (
    <section id="quality-section" className="section quality-section-hyperpure">
      <div className="container">
        
        {/* Statistics Bar (Matching Image 1) */}
        <div className="stats-bar-hyperpure">
          {STATS.map((stat, idx) => (
            <div key={idx} className="stat-col-hyperpure">
              <span className="stat-val">{stat.value}</span>
              <span className="stat-lbl">{stat.label}</span>
              {idx < STATS.length - 1 && <span className="stat-divider"></span>}
            </div>
          ))}
        </div>

        {/* Quality Title */}
        <div className="quality-header-hyperpure">
          <h2>✦ Quality at every step ✦</h2>
          <div className="header-subtitle">— Built on trust —</div>
        </div>

        {/* Vertical Tabs split layout (Matching Image 1) */}
        <div className="quality-split-layout">
          
          {/* Vertical Menu */}
          <div className="quality-tabs-menu">
            {QUALITY_STEPS.map((step) => (
              <button 
                key={step.id} 
                className={`q-tab-btn ${activeStep === step.id ? 'active' : ''}`}
                onClick={() => setActiveStep(step.id)}
              >
                <div className="tab-bullet-indicator"></div>
                <span className="q-tab-title">{step.title}</span>
              </button>
            ))}
          </div>

          {/* Details Card on Right */}
          <div className="quality-details-card">
            <div className="q-details-content">
              <h3>{currentStep.title}</h3>
              <p>{currentStep.description}</p>
            </div>
            
            <div className="q-details-image-wrapper">
              <div className="pin-aesthetic">📌</div>
              <img 
                src={currentStep.imgUrl} 
                alt={currentStep.title} 
                className="q-step-image"
              />
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
