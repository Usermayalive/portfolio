/* ============================================================
   PARTICLE CONSTELLATION SYSTEM
   Interactive canvas particle field with mouse-reactive connections
   ============================================================ */

export class ParticleSystem {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;

    this.ctx = this.canvas.getContext('2d');
    this.particles = [];
    this.mouse = { x: -1000, y: -1000, radius: 180 };
    this.animationId = null;
    this.isRunning = false;

    // Configuration
    this.config = {
      particleCount: Math.min(120, Math.floor(window.innerWidth / 12)),
      maxConnectionDist: 150,
      particleMinSize: 1,
      particleMaxSize: 3,
      baseSpeed: 0.3,
      mouseRepelForce: 0.08,
      connectionColor: { r: 100, g: 220, b: 230 },
      particleColor: { r: 140, g: 230, b: 240 },
    };

    this._init();
  }

  _init() {
    this._resize();
    this._createParticles();
    this._bindEvents();
    this.start();
  }

  _resize() {
    const dpr = window.devicePixelRatio || 1;
    const rect = this.canvas.parentElement.getBoundingClientRect();
    this.canvas.width = rect.width * dpr;
    this.canvas.height = rect.height * dpr;
    this.canvas.style.width = rect.width + 'px';
    this.canvas.style.height = rect.height + 'px';
    this.ctx.scale(dpr, dpr);
    this.width = rect.width;
    this.height = rect.height;
  }

  _createParticles() {
    this.particles = [];
    for (let i = 0; i < this.config.particleCount; i++) {
      this.particles.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        vx: (Math.random() - 0.5) * this.config.baseSpeed,
        vy: (Math.random() - 0.5) * this.config.baseSpeed,
        size: this.config.particleMinSize + Math.random() * (this.config.particleMaxSize - this.config.particleMinSize),
        opacity: 0.3 + Math.random() * 0.6,
        // Subtle oscillation
        phase: Math.random() * Math.PI * 2,
        phaseSpeed: 0.005 + Math.random() * 0.01,
      });
    }
  }

  _bindEvents() {
    // Debounced resize
    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        this._resize();
        // Redistribute particles that ended up out of bounds
        this.particles.forEach(p => {
          if (p.x > this.width) p.x = Math.random() * this.width;
          if (p.y > this.height) p.y = Math.random() * this.height;
        });
        this.config.particleCount = Math.min(120, Math.floor(window.innerWidth / 12));
      }, 250);
    });

    // Mouse tracking (relative to canvas)
    this.canvas.addEventListener('mousemove', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      this.mouse.x = e.clientX - rect.left;
      this.mouse.y = e.clientY - rect.top;
    });

    this.canvas.addEventListener('mouseleave', () => {
      this.mouse.x = -1000;
      this.mouse.y = -1000;
    });

    // Visibility API — pause when tab is hidden
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.stop();
      } else {
        this.start();
      }
    });
  }

  _updateParticle(p) {
    // Oscillation for organic feel
    p.phase += p.phaseSpeed;
    const oscillation = Math.sin(p.phase) * 0.15;

    p.x += p.vx + oscillation;
    p.y += p.vy + Math.cos(p.phase) * 0.1;

    // Mouse interaction — gentle repel
    const dx = p.x - this.mouse.x;
    const dy = p.y - this.mouse.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < this.mouse.radius && dist > 0) {
      const force = (this.mouse.radius - dist) / this.mouse.radius * this.config.mouseRepelForce;
      p.vx += (dx / dist) * force;
      p.vy += (dy / dist) * force;
    }

    // Friction
    p.vx *= 0.998;
    p.vy *= 0.998;

    // Clamp velocity
    const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
    if (speed > this.config.baseSpeed * 3) {
      p.vx = (p.vx / speed) * this.config.baseSpeed * 3;
      p.vy = (p.vy / speed) * this.config.baseSpeed * 3;
    }

    // Wrap edges
    if (p.x < -20) p.x = this.width + 20;
    if (p.x > this.width + 20) p.x = -20;
    if (p.y < -20) p.y = this.height + 20;
    if (p.y > this.height + 20) p.y = -20;
  }

  _drawParticle(p) {
    const { r, g, b } = this.config.particleColor;
    this.ctx.beginPath();
    this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    this.ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${p.opacity})`;
    this.ctx.fill();

    // Subtle glow on larger particles
    if (p.size > 2) {
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.size * 3, 0, Math.PI * 2);
      this.ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${p.opacity * 0.08})`;
      this.ctx.fill();
    }
  }

  _drawConnections() {
    const { r, g, b } = this.config.connectionColor;
    const maxDist = this.config.maxConnectionDist;
    const particles = this.particles;

    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = dx * dx + dy * dy; // squared for perf

        if (dist < maxDist * maxDist) {
          const opacity = (1 - Math.sqrt(dist) / maxDist) * 0.35;
          this.ctx.beginPath();
          this.ctx.moveTo(particles[i].x, particles[i].y);
          this.ctx.lineTo(particles[j].x, particles[j].y);
          this.ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${opacity})`;
          this.ctx.lineWidth = 0.6;
          this.ctx.stroke();
        }
      }
    }

    // Mouse connections — brighter
    for (let i = 0; i < particles.length; i++) {
      const dx = particles[i].x - this.mouse.x;
      const dy = particles[i].y - this.mouse.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < this.mouse.radius) {
        const opacity = (1 - dist / this.mouse.radius) * 0.5;
        this.ctx.beginPath();
        this.ctx.moveTo(particles[i].x, particles[i].y);
        this.ctx.lineTo(this.mouse.x, this.mouse.y);
        this.ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${opacity})`;
        this.ctx.lineWidth = 0.8;
        this.ctx.stroke();
      }
    }
  }

  _animate() {
    this.ctx.clearRect(0, 0, this.width, this.height);

    // Update and draw particles
    this.particles.forEach(p => {
      this._updateParticle(p);
      this._drawParticle(p);
    });

    // Draw connections
    this._drawConnections();

    if (this.isRunning) {
      this.animationId = requestAnimationFrame(() => this._animate());
    }
  }

  start() {
    if (this.isRunning) return;
    this.isRunning = true;
    this._animate();
  }

  stop() {
    this.isRunning = false;
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }

  destroy() {
    this.stop();
    this.particles = [];
  }
}
