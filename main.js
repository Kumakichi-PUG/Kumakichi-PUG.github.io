/**
 * main.js - Portfolio Site Interactions & Animations
 * Vanilla JS (no external libraries)
 *
 * Features:
 *   1. Scroll-triggered fade-in animations (Intersection Observer)
 *   2. Smooth scroll for anchor links
 *   3. Header scroll state (background on scroll)
 *   4. Typing effect for hero subtitle
 *   5. Lightweight particle background (canvas)
 */

document.addEventListener('DOMContentLoaded', () => {
  initScrollAnimations();
  initSmoothScroll();
  initHeaderScroll();
  initTypingEffect();
  initParticleBackground();
});

/* ==========================================================================
   1. Scroll Animations (Intersection Observer)
   ========================================================================== */

/**
 * data-animate 属性を持つ要素を監視し、
 * ビューポートに入ったら is-visible クラスを付与する。
 * CSS 側で opacity / transform のトランジションを定義する想定。
 */
const initScrollAnimations = () => {
  const targets = document.querySelectorAll('[data-animate]');
  if (targets.length === 0) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          // 一度表示したら監視を外す（パフォーマンス）
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1 }
  );

  targets.forEach((el) => observer.observe(el));
};

/* ==========================================================================
   2. Smooth Scroll
   ========================================================================== */

/**
 * href="#..." 形式のアンカーリンクをクリックしたとき、
 * 対象セクションへスムーズにスクロールする。
 */
const initSmoothScroll = () => {
  document.addEventListener('click', (e) => {
    const link = e.target.closest('a[href^="#"]');
    if (!link) return;

    const targetId = link.getAttribute('href');
    if (targetId === '#') return;

    const targetEl = document.querySelector(targetId);
    if (!targetEl) return;

    e.preventDefault();
    targetEl.scrollIntoView({ behavior: 'smooth' });
  });
};

/* ==========================================================================
   3. Header / Nav Scroll State
   ========================================================================== */

/**
 * スクロール量が 50px を超えたら header (または nav) に
 * scrolled クラスを付与し、背景色を表示する。
 */
const initHeaderScroll = () => {
  const header = document.querySelector('.nav');
  if (!header) return;

  const SCROLL_THRESHOLD = 50;

  const onScroll = () => {
    if (window.scrollY > SCROLL_THRESHOLD) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  };

  // スクロールイベントを間引く（16ms ≒ 60fps）
  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        onScroll();
        ticking = false;
      });
      ticking = true;
    }
  });

  // 初期状態も反映
  onScroll();
};

/* ==========================================================================
   4. Typing Effect
   ========================================================================== */

/**
 * .typing-text 要素のテキストをタイピングアニメーションで表示する。
 * カーソル点滅は CSS の ::after 疑似要素で実現する想定
 * （.typing-text.typing クラス付与中にカーソル表示）。
 */
const initTypingEffect = () => {
  const el = document.querySelector('.typing-text');
  if (!el) return;

  const fullText = el.textContent;
  const typingSpeed = 80;   // ms per character
  const startDelay = 600;   // 開始までの遅延

  // 初期状態：テキストを空にし、typing クラスを付与
  el.textContent = '';
  el.classList.add('typing');

  let index = 0;

  const type = () => {
    if (index < fullText.length) {
      el.textContent += fullText.charAt(index);
      index++;
      setTimeout(type, typingSpeed);
    } else {
      // タイピング完了後もカーソル点滅を維持
      // 数秒後にカーソルを非表示にしたい場合は typing クラスを外す
      setTimeout(() => {
        el.classList.remove('typing');
        el.classList.add('typed');
      }, 2000);
    }
  };

  setTimeout(type, startDelay);
};

/* ==========================================================================
   5. Particle Background (Canvas)
   ========================================================================== */

/**
 * id="bg-canvas" の canvas にパーティクル（小さなドット）を描画する。
 * マウス位置に軽く反応し、requestAnimationFrame で描画ループを回す。
 */
const initParticleBackground = () => {
  const canvas = document.getElementById('bg-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // --- 設定 ---
  const PARTICLE_COUNT = 60;
  const PARTICLE_COLOR = 'rgba(255, 255, 255, 0.4)';
  const PARTICLE_MIN_RADIUS = 1;
  const PARTICLE_MAX_RADIUS = 3;
  const BASE_SPEED = 0.3;
  const MOUSE_INFLUENCE_RADIUS = 120;
  const MOUSE_REPEL_FORCE = 0.8;

  let width = 0;
  let height = 0;
  const mouse = { x: -9999, y: -9999 };
  let particles = [];
  let animationId = null;

  /** canvas サイズをウィンドウに合わせる */
  const resize = () => {
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;
  };

  /** パーティクル生成 */
  class Particle {
    constructor() {
      this.reset();
    }

    reset() {
      this.x = Math.random() * width;
      this.y = Math.random() * height;
      this.radius =
        Math.random() * (PARTICLE_MAX_RADIUS - PARTICLE_MIN_RADIUS) +
        PARTICLE_MIN_RADIUS;
      this.vx = (Math.random() - 0.5) * BASE_SPEED;
      this.vy = (Math.random() - 0.5) * BASE_SPEED;
      this.opacity = Math.random() * 0.5 + 0.2;
    }

    update() {
      // マウスからの距離を計算し、軽く反発させる
      const dx = this.x - mouse.x;
      const dy = this.y - mouse.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < MOUSE_INFLUENCE_RADIUS && dist > 0) {
        const force = (MOUSE_INFLUENCE_RADIUS - dist) / MOUSE_INFLUENCE_RADIUS;
        this.vx += (dx / dist) * force * MOUSE_REPEL_FORCE * 0.05;
        this.vy += (dy / dist) * force * MOUSE_REPEL_FORCE * 0.05;
      }

      // 速度に減衰を掛けて暴走を防ぐ
      this.vx *= 0.99;
      this.vy *= 0.99;

      this.x += this.vx;
      this.y += this.vy;

      // 画面外に出たら反対側から再登場
      if (this.x < -this.radius) this.x = width + this.radius;
      if (this.x > width + this.radius) this.x = -this.radius;
      if (this.y < -this.radius) this.y = height + this.radius;
      if (this.y > height + this.radius) this.y = -this.radius;
    }

    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fillStyle = PARTICLE_COLOR;
      ctx.globalAlpha = this.opacity;
      ctx.fill();
    }
  }

  /** パーティクル配列を初期化 */
  const createParticles = () => {
    particles = [];
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particles.push(new Particle());
    }
  };

  /** 描画ループ */
  const animate = () => {
    ctx.clearRect(0, 0, width, height);
    ctx.globalAlpha = 1;

    for (const p of particles) {
      p.update();
      p.draw();
    }

    animationId = requestAnimationFrame(animate);
  };

  // --- イベントリスナー ---

  window.addEventListener('resize', () => {
    resize();
  });

  window.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  });

  // マウスが離れたら影響をリセット
  document.addEventListener('mouseleave', () => {
    mouse.x = -9999;
    mouse.y = -9999;
  });

  // タブ非表示時にアニメーションを停止（パフォーマンス配慮）
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      if (animationId) {
        cancelAnimationFrame(animationId);
        animationId = null;
      }
    } else {
      if (!animationId) {
        animationId = requestAnimationFrame(animate);
      }
    }
  });

  // --- 起動 ---
  resize();
  createParticles();
  animate();
};
