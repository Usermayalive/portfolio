/* ============================================================
   MAIN ENTRY — App Initialization + Global Orchestration
   ============================================================ */

import { ParticleSystem } from './particles.js';
import { MagneticCursor } from './magnetic.js';
import { AnimationOrchestrator } from './animations.js';

class Portfolio {
  constructor() {
    this.particles = null;
    this.magnetic = null;
    this.animations = null;

    this._waitForDom();
  }

  _waitForDom() {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this._init());
    } else {
      this._init();
    }
  }

  _init() {
    // Initialize systems
    this.particles = new ParticleSystem('hero-canvas');
    this.magnetic = new MagneticCursor();
    this.animations = new AnimationOrchestrator();

    this._setupPreloader();
    this._setupMobileNav();
    this._setupNavbar();
    this._setupTestimonials();
    this._setupSkillHovers();
    this._setupProjectCards();
    this._setupContactForm();
    this._setupBackToTop();
  }

  /* --- Preloader --- */
  _setupPreloader() {
    const preloader = document.querySelector('.preloader');
    if (!preloader) return;

    window.addEventListener('load', () => {
      setTimeout(() => {
        preloader.classList.add('hidden');
        // Trigger hero animations after preloader hides
        document.querySelector('.hero')?.classList.add('hero-loaded');
      }, 600);
    });

    // Fallback: hide after 3s even if not all resources loaded
    setTimeout(() => {
      preloader.classList.add('hidden');
      document.querySelector('.hero')?.classList.add('hero-loaded');
    }, 3000);
  }

  /* --- Mobile Navigation --- */
  _setupMobileNav() {
    const toggle = document.querySelector('.nav-toggle');
    const nav = document.querySelector('.nav');
    if (!toggle || !nav) return;

    toggle.addEventListener('click', () => {
      nav.classList.toggle('nav-open');
      toggle.setAttribute(
        'aria-expanded',
        nav.classList.contains('nav-open').toString()
      );
    });
  }

  /* --- Navbar background on scroll --- */
  _setupNavbar() {
    const navbar = document.querySelector('.navbar');
    if (!navbar) return;

    const handleScroll = () => {
      if (window.scrollY > 80) {
        navbar.classList.add('navbar-scrolled');
      } else {
        navbar.classList.remove('navbar-scrolled');
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
  }

  /* --- Testimonial Rotation --- */
  _setupTestimonials() {
    const slides = document.querySelectorAll('.testimonial-slide');
    const dots = document.querySelectorAll('.testimonial-dot');
    if (slides.length === 0) return;

    let current = 0;
    let interval;

    const showSlide = (index) => {
      slides.forEach((s, i) => {
        s.classList.toggle('active', i === index);
      });
      dots.forEach((d, i) => {
        d.classList.toggle('active', i === index);
      });
      current = index;
    };

    const next = () => {
      showSlide((current + 1) % slides.length);
    };

    // Auto-rotate
    interval = setInterval(next, 5000);

    // Click dots
    dots.forEach((dot, i) => {
      dot.addEventListener('click', () => {
        clearInterval(interval);
        showSlide(i);
        interval = setInterval(next, 5000);
      });
    });

    showSlide(0);
  }

  /* --- Skill Card Hovers --- */
  _setupSkillHovers() {
    const cards = document.querySelectorAll('.skill-card');
    cards.forEach(card => {
      card.addEventListener('mouseenter', () => {
        card.querySelector('.skill-progress-fill')?.style.setProperty(
          'width',
          card.dataset.proficiency || '0%'
        );
      });
    });
  }

  /* --- Project Card Tilt --- */
  _setupProjectCards() {
    const cards = document.querySelectorAll('.project-card');

    cards.forEach(card => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const rotateX = ((y - centerY) / centerY) * -5;
        const rotateY = ((x - centerX) / centerX) * 5;

        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
      });

      card.addEventListener('mouseleave', () => {
        card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)';
      });
    });
  }

  /* --- Contact Form --- */
  _setupContactForm() {
    const form = document.querySelector('.contact-form');
    if (!form) return;

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const btn = form.querySelector('.submit-btn');
      const originalText = btn.textContent;

      btn.textContent = 'Message Sent! ✨';
      btn.style.background = 'linear-gradient(135deg, hsl(150, 80%, 50%), hsl(180, 80%, 50%))';

      setTimeout(() => {
        btn.textContent = originalText;
        btn.style.background = '';
        form.reset();
      }, 3000);
    });
  }

  /* --- Back to Top --- */
  _setupBackToTop() {
    const btn = document.querySelector('.back-to-top');
    if (!btn) return;

    window.addEventListener('scroll', () => {
      btn.classList.toggle('visible', window.scrollY > 600);
    }, { passive: true });

    btn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }
}

// Boot the app
new Portfolio();
