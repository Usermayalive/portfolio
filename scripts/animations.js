/* ============================================================
   ANIMATION ORCHESTRATOR
   Handles scroll-animation fallbacks + section reveals
   ============================================================ */

export class AnimationOrchestrator {
  constructor() {
    this.supportsScrollDriven = CSS.supports(
      '(animation-timeline: view()) and (animation-range: entry)'
    );
    this._init();
  }

  _init() {
    if (!this.supportsScrollDriven) {
      this._setupFallbackObservers();
    }
    this._setupNavHighlight();
    this._setupSmoothScroll();
    this._setupCounters();
  }

  /* --- Fallback: IntersectionObserver for reveal animations --- */
  _setupFallbackObservers() {
    const revealElements = document.querySelectorAll(
      '.reveal, .reveal-left, .reveal-right, .reveal-scale, .reveal-blur, .stagger-reveal'
    );

    if (!revealElements.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.15,
        rootMargin: '0px 0px -50px 0px',
      }
    );

    revealElements.forEach((el) => observer.observe(el));
  }

  /* --- Active nav link highlight on scroll --- */
  _setupNavHighlight() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');

    if (!sections.length || !navLinks.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = entry.target.getAttribute('id');
            navLinks.forEach((link) => {
              link.classList.toggle(
                'active',
                link.getAttribute('href') === `#${id}`
              );
            });
          }
        });
      },
      {
        threshold: 0.3,
        rootMargin: '-80px 0px -40% 0px',
      }
    );

    sections.forEach((section) => observer.observe(section));
  }

  /* --- Smooth scroll for anchor links --- */
  _setupSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
      anchor.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = anchor.getAttribute('href');
        if (targetId === '#') return;

        const target = document.querySelector(targetId);
        if (target) {
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }

        // Close mobile nav if open
        const nav = document.querySelector('.nav');
        if (nav && nav.classList.contains('nav-open')) {
          nav.classList.remove('nav-open');
        }
      });
    });
  }

  /* --- Animated counters --- */
  _setupCounters() {
    const counters = document.querySelectorAll('[data-count]');
    if (!counters.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            this._animateCounter(entry.target);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.5 }
    );

    counters.forEach((el) => observer.observe(el));
  }

  _animateCounter(el) {
    const target = parseInt(el.dataset.count, 10);
    const suffix = el.dataset.countSuffix || '';
    const duration = 2000;
    const start = performance.now();

    const step = (now) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out expo
      const eased = 1 - Math.pow(1 - progress, 4);
      const current = Math.round(eased * target);
      el.textContent = current + suffix;

      if (progress < 1) {
        requestAnimationFrame(step);
      }
    };

    requestAnimationFrame(step);
  }
}
