import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiArrowRight, FiArrowLeft, FiCheck, FiZap, FiUsers } from "react-icons/fi";
import TemplateSelector from "../Templates/TemplateSelector";
import "./landing.css";

function Landing() {
  const navigate = useNavigate();
  const [showTemplateSelector, setShowTemplateSelector] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Check if user is logged in
  const isLoggedIn = !!localStorage.getItem("token");

  const handleAuthAction = () => {
    if (isLoggedIn) {
      navigate("/retroDashboard");
    } else {
      navigate("/register");
    }
  };

  const handleBackToSegmento = () => {
    window.location.href = "https://www.segmento.in/";
  };

  return (
    <div className="landing-page">
      <div className="gradient-bg"></div>

      <nav className="landing-nav">
        <div className="nav-container">
          {/* Logo */}
          <div className="nav-logo">
            <span className="logo-desktop">SegmentoRetro</span>
            
          </div>

          {/* Mobile actions: hamburger + back button */}
          <div className="nav-mobile-actions">
            <button
              type="button"
              className={`nav-hamburger${mobileMenuOpen ? " open" : ""}`}
              onClick={() => setMobileMenuOpen((open) => !open)}
              aria-label="Toggle menu"
            >
              <span />
              <span />
              <span />
            </button>
            <button
              type="button"
              className="mobile-back-button btn-nav-primary"
              onClick={handleBackToSegmento}
              aria-label="Back to Segmento"
            >
              <FiArrowLeft size={12} /> Back Segmento
            </button>
          </div>

          {/* Desktop actions */}
          <div className="nav-actions">
            <button onClick={() => setShowTemplateSelector(true)} className="btn-nav-templates">
              Templates
            </button>
            <button className="btn-nav-primary" onClick={handleAuthAction}>
              {isLoggedIn ? "Go to Dashboard" : "Get Started"}
            </button>
            <button className="btn-nav-primary" onClick={handleBackToSegmento}>
              <FiArrowLeft size={14} /> Back to Segmento
            </button>
          </div>
        </div>

        {/* Mobile drawer menu */}
        <div className={`landing-mobile-menu${mobileMenuOpen ? " open" : ""}`}>
          <div className="mobile-menu-row">
            <button
              className="mobile-menu-btn"
              onClick={() => {
                setShowTemplateSelector(true);
                setMobileMenuOpen(false);
              }}
            >
              Templates
            </button>
            <button
              className="btn-nav-primary mobile-menu-btn-right"
              onClick={() => {
                handleAuthAction();
                setMobileMenuOpen(false);
              }}
            >
              {isLoggedIn ? "Go to Dashboard" : "Get Started"}
            </button>
          </div>
          
        </div>
      </nav>

      {showTemplateSelector && (
        <TemplateSelector
          onClose={() => setShowTemplateSelector(false)}
          onSelectTemplate={(template) => {
            setSelectedTemplate(template);
            setShowTemplateSelector(false);
          }}
        />
      )}

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-container">
          <h1 className="hero-title">
            Easy online retrospectives for <span className="gradient-text">distributed teams</span>
          </h1>
          <p className="hero-description">
            Run engaging and effective retrospectives with your remote team. Simple, intuitive, and built for agile teams who want to improve continuously.
          </p>
          <div className="hero-cta">
            <button className="btn-hero-primary" onClick={handleAuthAction}>
              {isLoggedIn ? "Go to Dashboard" : "Start a retrospective"}
              <FiArrowRight size={18} />
            </button>
            {!isLoggedIn && (
              <button className="btn-hero-secondary" onClick={() => navigate("/login")}>
                Sign in
              </button>
            )}
          </div>
          {/* Hero Image - Board Preview */}
          <div className="hero-board">
            <div className="board-preview">
              <div className="board-header-preview">
                <div className="board-title-preview">Sprint 24 Retrospective</div>
                <div className="board-actions-preview">
                  <div className="action-dot"></div>
                  <div className="action-dot"></div>
                  <div className="action-dot"></div>
                </div>
              </div>
              <div className="board-columns-preview">
                <div className="column-preview column-green">
                  <div className="column-header-preview">
                    <div className="column-icon">😊</div>
                    <div className="column-title">What went well</div>
                  </div>
                  <div className="card-preview"></div>
                  <div className="card-preview"></div>
                  <div className="card-preview"></div>
                </div>
                <div className="column-preview column-yellow">
                  <div className="column-header-preview">
                    <div className="column-icon">💡</div>
                    <div className="column-title">To improve</div>
                  </div>
                  <div className="card-preview"></div>
                  <div className="card-preview"></div>
                </div>
                <div className="column-preview column-blue">
                  <div className="column-header-preview">
                    <div className="column-icon">🎯</div>
                    <div className="column-title">Action items</div>
                  </div>
                  <div className="card-preview"></div>
                  <div className="card-preview"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="features-container">
          <h2 className="features-title">Everything you need for great retrospectives</h2>
          <div className="features-list">
            <div className="feature-item">
              <div className="feature-icon-wrapper">
                <FiZap className="feature-icon" />
              </div>
              <div className="feature-content">
                <h3 className="feature-name">Quick to start</h3>
                <p className="feature-text">Create a board in seconds. No signup required to get started.</p>
              </div>
            </div>
            <div className="feature-item">
              <div className="feature-icon-wrapper">
                <FiUsers className="feature-icon" />
              </div>
              <div className="feature-content">
                <h3 className="feature-name">Real-time collaboration</h3>
                <p className="feature-text">Everyone sees updates instantly. Add cards, vote, and discuss together.</p>
              </div>
            </div>
            <div className="feature-item">
              <div className="feature-icon-wrapper">
                <FiCheck className="feature-icon" />
              </div>
              <div className="feature-content">
                <h3 className="feature-name">Simple & intuitive</h3>
                <p className="feature-text">Clean interface that anyone can use. No training needed.</p>
              </div>
            </div>
            <div className="feature-item">
              <div className="feature-icon-wrapper">
                <FiArrowRight className="feature-icon" />
              </div>
              <div className="feature-content">
                <h3 className="feature-name">Action-oriented</h3>
                <p className="feature-text">Turn insights into action items. Track progress and follow through.</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Landing;
