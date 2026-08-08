import React from 'react';
import { useNavigate } from 'react-router-dom';
import './JoinUs.css';

export default function JoinUs() {
  const navigate = useNavigate();

  return (
    <section id="portals" className="section portals-section-hyperpure">
      <div className="container">
        
        {/* Zomato Hyperpure Style Dynamic Flowchart (Curved Lines + Official Brand Logos) */}
        <div className="flowchart-container-hyperpure">
          
          {/* Left Column (Supply side brand logo marquees -> Capsules) */}
          <div className="flow-column left-column">
            
            {/* Lane 1: Gig Partners */}
            <div className="flow-lane">
              <div className="track-marquee-wrapper">
                <div className="marquee-content left-to-right">
                  <div className="marquee-logo">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Urban_Company_logo.svg/320px-Urban_Company_logo.svg.png" alt="Urban Company" />
                  </div>
                  <div className="marquee-logo">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/c2/Skill_India_logo.png/320px-Skill_India_logo.png" alt="Skill India" />
                  </div>
                  <div className="marquee-logo">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/b/b5/ISO_Logo_%28Red%29.svg/320px-ISO_Logo_%28Red%29.svg.png" alt="ISO" />
                  </div>
                  {/* Duplicate for infinite loop */}
                  <div className="marquee-logo">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Urban_Company_logo.svg/320px-Urban_Company_logo.svg.png" alt="Urban Company" />
                  </div>
                  <div className="marquee-logo">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/c2/Skill_India_logo.png/320px-Skill_India_logo.png" alt="Skill India" />
                  </div>
                  <div className="marquee-logo">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/b/b5/ISO_Logo_%28Red%29.svg/320px-ISO_Logo_%28Red%29.svg.png" alt="ISO" />
                  </div>
                </div>
              </div>
              <span className="lane-capsule tag-teal">GIG PARTNERS</span>
            </div>

            {/* Lane 2: Agencies */}
            <div className="flow-lane">
              <div className="track-marquee-wrapper">
                <div className="marquee-content left-to-right slow">
                  <div className="marquee-logo">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/9/9f/Justdial_Logo.svg/320px-Justdial_Logo.svg.png" alt="JustDial" />
                  </div>
                  <div className="marquee-logo">
                    <img src="https://upload.wikimedia.org/wikipedia/en/thumb/b/b8/Sulekha_logo.svg/320px-Sulekha_logo.svg.png" alt="Sulekha" />
                  </div>
                  {/* Duplicate */}
                  <div className="marquee-logo">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/9/9f/Justdial_Logo.svg/320px-Justdial_Logo.svg.png" alt="JustDial" />
                  </div>
                  <div className="marquee-logo">
                    <img src="https://upload.wikimedia.org/wikipedia/en/thumb/b/b8/Sulekha_logo.svg/320px-Sulekha_logo.svg.png" alt="Sulekha" />
                  </div>
                </div>
              </div>
              <span className="lane-capsule tag-teal">AGENCIES</span>
            </div>

            {/* Lane 3: Contractors */}
            <div className="flow-lane">
              <div className="track-marquee-wrapper">
                <div className="marquee-content left-to-right fast">
                  <div className="marquee-logo">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/b/b5/ISO_Logo_%28Red%29.svg/320px-ISO_Logo_%28Red%29.svg.png" alt="ISO" />
                  </div>
                  <div className="marquee-logo">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Urban_Company_logo.svg/320px-Urban_Company_logo.svg.png" alt="Urban Company" />
                  </div>
                  {/* Duplicate */}
                  <div className="marquee-logo">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/b/b5/ISO_Logo_%28Red%29.svg/320px-ISO_Logo_%28Red%29.svg.png" alt="ISO" />
                  </div>
                  <div className="marquee-logo">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Urban_Company_logo.svg/320px-Urban_Company_logo.svg.png" alt="Urban Company" />
                  </div>
                </div>
              </div>
              <span className="lane-capsule tag-teal">CONTRACTORS</span>
            </div>

          </div>

          {/* Center Column: SVG Curved lines + Marketplace Box */}
          <div className="center-flow-connector">
            
            <svg className="svg-connector-lines" viewBox="0 0 400 240">
              {/* Left side converging dashed lines */}
              <path d="M 5,40 Q 150,40 190,120" stroke="#0F766E" strokeWidth="2" strokeDasharray="6 4" className="path-flow-in" fill="none" />
              <path d="M 5,120 L 190,120" stroke="#0F766E" strokeWidth="2" strokeDasharray="6 4" className="path-flow-in" fill="none" />
              <path d="M 5,200 Q 150,200 190,120" stroke="#0F766E" strokeWidth="2" strokeDasharray="6 4" className="path-flow-in" fill="none" />

              {/* Right side diverging dashed lines */}
              <path d="M 210,120 Q 250,40 395,40" stroke="#BE123C" strokeWidth="2" strokeDasharray="6 4" className="path-flow-out" fill="none" />
              <path d="M 210,120 L 395,120" stroke="#BE123C" strokeWidth="2" strokeDasharray="6 4" className="path-flow-out" fill="none" />
              <path d="M 210,120 Q 250,200 395,200" stroke="#BE123C" strokeWidth="2" strokeDasharray="6 4" className="path-flow-out" fill="none" />
            </svg>

            <div className="flow-center-box-hyperpure">
              <div className="center-glow"></div>
              <div className="center-inner-box">
                <h3>EaseMyHome</h3>
                <p>BY ANTAGRAVITY</p>
              </div>
            </div>
          </div>

          {/* Right Column (Demand side brand logo marquees -> Capsules) */}
          <div className="flow-column right-column">
            
            {/* Lane 4: Apartments */}
            <div className="flow-lane flex-reverse">
              <span className="lane-capsule tag-red">APARTMENTS</span>
              <div className="track-marquee-wrapper">
                <div className="marquee-content left-to-right">
                  <div className="marquee-logo">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/7/75/DLF_logo.svg/320px-DLF_logo.svg.png" alt="DLF" />
                  </div>
                  <div className="marquee-logo">
                    <img src="https://upload.wikimedia.org/wikipedia/en/thumb/5/52/Lodha_Group_Logo.svg/320px-Lodha_Group_Logo.svg.png" alt="Lodha" />
                  </div>
                  <div className="marquee-logo">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Tata_logo.svg/320px-Tata_logo.svg.png" alt="Tata" />
                  </div>
                  {/* Duplicate */}
                  <div className="marquee-logo">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/7/75/DLF_logo.svg/320px-DLF_logo.svg.png" alt="DLF" />
                  </div>
                  <div className="marquee-logo">
                    <img src="https://upload.wikimedia.org/wikipedia/en/thumb/5/52/Lodha_Group_Logo.svg/320px-Lodha_Group_Logo.svg.png" alt="Lodha" />
                  </div>
                  <div className="marquee-logo">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Tata_logo.svg/320px-Tata_logo.svg.png" alt="Tata" />
                  </div>
                </div>
              </div>
            </div>

            {/* Lane 5: Offices */}
            <div className="flow-lane flex-reverse">
              <span className="lane-capsule tag-red">OFFICES</span>
              <div className="track-marquee-wrapper">
                <div className="marquee-content left-to-right slow">
                  <div className="marquee-logo">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Tata_logo.svg/320px-Tata_logo.svg.png" alt="Tata Offices" />
                  </div>
                  <div className="marquee-logo">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/7/75/DLF_logo.svg/320px-DLF_logo.svg.png" alt="DLF Offices" />
                  </div>
                  {/* Duplicate */}
                  <div className="marquee-logo">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Tata_logo.svg/320px-Tata_logo.svg.png" alt="Tata Offices" />
                  </div>
                  <div className="marquee-logo">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/7/75/DLF_logo.svg/320px-DLF_logo.svg.png" alt="DLF Offices" />
                  </div>
                </div>
              </div>
            </div>

            {/* Lane 6: Co-living */}
            <div className="flow-lane flex-reverse">
              <span className="lane-capsule tag-red">CO-LIVING</span>
              <div className="track-marquee-wrapper">
                <div className="marquee-content left-to-right fast">
                  <div className="marquee-logo">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/1/19/OYO_Rooms_Logo.svg/320px-OYO_Rooms_Logo.svg.png" alt="OYO" />
                  </div>
                  {/* Duplicate */}
                  <div className="marquee-logo">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/1/19/OYO_Rooms_Logo.svg/320px-OYO_Rooms_Logo.svg.png" alt="OYO" />
                  </div>
                </div>
              </div>
            </div>

          </div>

        </div>

        {/* Dual Callout Action Cards (Matching Screenshot Layout 100%) */}
        <div className="portals-flex-wrapper-hyperpure">
          
          {/* Card 1: Sellers / Partners (Behind/Left) */}
          <div className="hp-portal-card partner-card-white">
            <div className="hp-card-badge-black">FOR PARTNERS</div>
            <div className="hp-card-intro">
              <h2>Deliver home services now</h2>
              <p>Join 1000+ partners now</p>
              <button className="btn hp-btn-white-pill" onClick={() => navigate('/provider/auth?mode=register')}>
                Register as a partner
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="btn-chevron-arrow">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>
            </div>
          </div>

          {/* Card 2: Customers (Overlap/Right) */}
          <div className="hp-portal-card customer-card-terracotta">
            <div className="hp-card-badge-black">FOR CUSTOMERS</div>
            <div className="hp-card-intro">
              <h2>Smarter booking, cleaner living</h2>
              <p>Trusted by 1 lakh+ households</p>
              <button className="btn hp-btn-white-pill" onClick={() => navigate('/user/auth?mode=register')}>
                Signup now
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="btn-chevron-arrow">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
