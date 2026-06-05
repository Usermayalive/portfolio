/* ============================================================
   MAGNETIC CURSOR EFFECT
   Elements with .magnetic subtly pull toward the cursor
   ============================================================ */

export class MagneticCursor {
  constructor() {
    this.elements = [];
    this.isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

    if (this.isTouchDevice) return;
    this._init();
  }

  _init() {
    this.elements = document.querySelectorAll('.magnetic');
    this._bindEvents();
  }

  _bindEvents() {
    this.elements.forEach(el => {
      const strength = parseFloat(el.dataset.magneticStrength) || 0.3;
      const radius = parseFloat(el.dataset.magneticRadius) || 100;

      el.addEventListener('mousemove', (e) => {
        const rect = el.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        const dx = e.clientX - centerX;
        const dy = e.clientY - centerY;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < radius) {
          const pull = (1 - dist / radius) * strength;
          const tx = dx * pull;
          const ty = dy * pull;

          el.style.transform = `translate(${tx}px, ${ty}px)`;
          el.style.transition = 'transform 0.15s cubic-bezier(0.16, 1, 0.3, 1)';
        }
      });

      el.addEventListener('mouseleave', () => {
        el.style.transform = 'translate(0, 0)';
        el.style.transition = 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)';
      });
    });
  }

  refresh() {
    if (this.isTouchDevice) return;
    this.elements = document.querySelectorAll('.magnetic');
    this._bindEvents();
  }
}
