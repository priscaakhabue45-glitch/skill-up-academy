import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';

const LandingPage = () => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="landing-page">
      {/* Navigation */}
      <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
        <div className="container flex justify-between items-center">
          <div className="logo">
            <h2 style={{ margin: 0, background: 'var(--gradient-primary)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Skill Up Academy
            </h2>
          </div>
          <div className="nav-links flex gap-xl items-center">
            <a href="#features" className="nav-link">Features</a>
            <a href="#about" className="nav-link">About</a>
            <Link to="/register" className="btn btn-primary btn-sm">Get Started</Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-background"></div>
        <div className="container">
          <div className="hero-content animate-fadeIn">
            <div className="badge badge-secondary mb-lg">
              🚀 Transform Your Future with Digital Skills
            </div>
            <h1 className="hero-title">
              Learn. Grow. <br />
              <span className="gradient-text">Live with Purpose</span>
            </h1>
            <p className="hero-subtitle">
              Master practical digital skills like social media management, video editing,
              and freelancing while building a foundation of purpose, values, and faith.
            </p>
            <div className="hero-cta flex gap-md">
              <Link to="/register" className="btn btn-primary btn-lg">
                Start Learning Today
              </Link>
              <a href="#features" className="btn btn-outline btn-lg">
                Learn More
              </a>
            </div>

            {/* Stats */}
            <div className="hero-stats">
              <div className="stat-item">
                <h3>14</h3>
                <p>Weekly Modules</p>
              </div>
              <div className="stat-item">
                <h3>100+</h3>
                <p>Video Lessons</p>
              </div>
              <div className="stat-item">
                <h3>24/7</h3>
                <p>AI Support</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="features-section">
        <div className="container">
          <div className="section-header text-center mb-2xl">
            <h2 className="section-title">Everything You Need to Succeed</h2>
            <p className="section-subtitle">
              Our platform is designed to help you stay accountable and track your progress
            </p>
          </div>

          <div className="features-grid">
            <div className="feature-card card animate-fadeIn">
              <div className="feature-icon">📚</div>
              <h3>Weekly Module Unlocks</h3>
              <p>New lessons automatically unlock every Monday at 9:00 AM WAT, keeping you on track with a structured learning path.</p>
            </div>

            <div className="feature-card card animate-fadeIn" style={{ animationDelay: '0.1s' }}>
              <div className="feature-icon">🎯</div>
              <h3>Daily Accountability</h3>
              <p>Log your progress daily with our simple tracker. Document videos completed, key learnings, and actions taken.</p>
            </div>

            <div className="feature-card card animate-fadeIn" style={{ animationDelay: '0.2s' }}>
              <div className="feature-icon">📊</div>
              <h3>Progress Tracking</h3>
              <p>Visualize your learning journey with detailed analytics. Mark lectures complete and pass quizzes to advance.</p>
            </div>

            <div className="feature-card card animate-fadeIn" style={{ animationDelay: '0.3s' }}>
              <div className="feature-icon">🔒</div>
              <h3>Secure Content Access</h3>
              <p>All lecture materials are securely stored and only accessible to enrolled, authenticated students.</p>
            </div>

            <div className="feature-card card animate-fadeIn" style={{ animationDelay: '0.4s' }}>
              <div className="feature-icon">📧</div>
              <h3>Smart Reminders</h3>
              <p>Receive email notifications about new modules and gentle nudges if you haven't logged in recently.</p>
            </div>

            <div className="feature-card card animate-fadeIn" style={{ animationDelay: '0.5s' }}>
              <div className="feature-icon">🤖</div>
              <h3>AI Chat Support</h3>
              <p>Get instant help navigating the platform with our AI-powered chatbot, available 24/7.</p>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="about-section">
        <div className="container">
          <div className="about-content">
            <div className="about-text">
              <h2>More Than Just Skills Training</h2>
              <p>
                At Skill Up Academy, we believe that true success comes from more than just
                technical abilities. That's why our program integrates practical digital skills
                training with lessons on living with purpose, values, and faith.
              </p>
              <p>
                Whether you're learning social media management, video editing, or how to
                succeed as a freelancer, you'll also discover how to apply these skills with
                integrity and purpose.
              </p>
              <div className="mt-xl">
                <Link to="/register" className="btn btn-secondary btn-lg">
                  Join Our Community
                </Link>
              </div>
            </div>
            <div className="about-image">
              <div className="about-card glass">
                <h3>🎓 Your Learning Journey</h3>
                <ul className="journey-list">
                  <li>✓ 14 comprehensive weekly modules</li>
                  <li>✓ Hands-on practical assignments</li>
                  <li>✓ Interactive quizzes and assessments</li>
                  <li>✓ Personal progress tracking</li>
                  <li>✓ Certificate upon completion</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container text-center">
          <h2 className="cta-title">Ready to Transform Your Future?</h2>
          <p className="cta-subtitle">Join hundreds of students already learning and growing with purpose.</p>
          <Link to="/register" className="btn btn-primary btn-lg">
            Get Started Now →
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <div>
              <h3 style={{ marginBottom: 'var(--spacing-md)' }}>Skill Up Academy</h3>
              <p style={{ color: 'var(--color-gray-400)', maxWidth: '300px' }}>
                Empowering young people with digital skills and purpose-driven living.
              </p>
            </div>
            <div>
              <p style={{ color: 'var(--color-gray-400)' }}>
                © 2025 Skill Up Academy. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </footer>

      <style>{`
        .landing-page {
          min-height: 100vh;
        }

        .navbar {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          padding: 1.5rem 0;
          background: transparent;
          transition: all var(--transition-normal);
          z-index: 1000;
        }

        .navbar.scrolled {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(10px);
          box-shadow: var(--shadow-md);
        }

        .nav-link {
          font-weight: 600;
          color: var(--color-gray-700);
          transition: color var(--transition-fast);
        }

        .nav-link:hover {
          color: var(--color-primary);
        }

        .hero {
          position: relative;
          min-height: 100vh;
          display: flex;
          align-items: center;
          padding: 8rem 0 4rem;
          overflow: hidden;
        }

        .hero-background {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: var(--gradient-hero);
          z-index: -1;
        }

        .hero-background::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: radial-gradient(circle at 20% 50%, rgba(66, 141, 255, 0.15), transparent 50%),
                      radial-gradient(circle at 80% 80%, rgba(255, 168, 0, 0.15), transparent 50%);
        }

        .hero-content {
          max-width: 800px;
          margin: 0 auto;
          text-align: center;
          color: var(--color-white);
        }

        .hero-title {
          font-size: 4rem;
          margin-bottom: var(--spacing-lg);
          line-height: 1.1;
        }

        .gradient-text {
          background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .hero-subtitle {
          font-size: 1.25rem;
          color: var(--color-gray-300);
          margin-bottom: var(--spacing-2xl);
          line-height: 1.6;
        }

        .hero-cta {
          justify-content: center;
          margin-bottom: var(--spacing-3xl);
        }

        .hero-stats {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: var(--spacing-xl);
          max-width: 600px;
          margin: 0 auto;
        }

        .stat-item {
          text-align: center;
        }

        .stat-item h3 {
          font-size: 3rem;
          background: var(--gradient-primary);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          margin-bottom: var(--spacing-sm);
        }

        .stat-item p {
          color: var(--color-gray-400);
          font-size: 0.875rem;
          margin: 0;
        }

        .features-section {
          padding: 6rem 0;
        }

        .section-title {
          font-size: 2.5rem;
          margin-bottom: var(--spacing-md);
        }

        .section-subtitle {
          font-size: 1.25rem;
          color: var(--color-gray-600);
          max-width: 600px;
          margin: 0 auto;
        }

        .features-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: var(--spacing-xl);
        }

        .feature-card {
          text-align: center;
        }

        .feature-icon {
          font-size: 3rem;
          margin-bottom: var(--spacing-lg);
        }

        .feature-card h3 {
          margin-bottom: var(--spacing-md);
        }

        .feature-card p {
          color: var(--color-gray-600);
          margin: 0;
        }

        .about-section {
          padding: 6rem 0;
          background: var(--gradient-hero);
          color: var(--color-white);
        }

        .about-content {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: var(--spacing-3xl);
          align-items: center;
        }

        .about-text h2 {
          font-size: 2.5rem;
          margin-bottom: var(--spacing-lg);
          color: var(--color-white);
        }

        .about-text p {
          color: var(--color-gray-300);
          font-size: 1.125rem;
          line-height: 1.8;
        }

        .about-card {
          padding: var(--spacing-2xl);
          border-radius: var(--radius-xl);
        }

        .about-card h3 {
          margin-bottom: var(--spacing-lg);
          color: var(--color-white);
        }

        .journey-list {
          list-style: none;
        }

        .journey-list li {
          padding: var(--spacing-md) 0;
          font-size: 1.125rem;
          color: var(--color-gray-300);
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .journey-list li:last-child {
          border-bottom: none;
        }

        .cta-section {
          padding: 6rem 0;
          background: var(--gradient-card);
        }

        .cta-title {
          font-size: 2.5rem;
          margin-bottom: var(--spacing-lg);
        }

        .cta-subtitle {
          font-size: 1.25rem;
          color: var(--color-gray-600);
          margin-bottom: var(--spacing-xl);
        }

        .footer {
          background: var(--color-gray-900);
          color: var(--color-white);
          padding: 3rem 0;
        }

        .footer-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        @media (max-width: 768px) {
          .hero-title {
            font-size: 2.5rem;
          }

          .hero-stats {
            grid-template-columns: 1fr;
          }

          .about-content {
            grid-template-columns: 1fr;
          }

          .footer-content {
            flex-direction: column;
            gap: var(--spacing-xl);
            text-align: center;
          }

          .nav-links {
            display: none;
          }
        }
      `}</style>
    </div>
  );
};

export default LandingPage;
