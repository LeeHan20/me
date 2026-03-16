/* =====================================================
   PORTFOLIO — main.js
   ===================================================== */

document.addEventListener('DOMContentLoaded', () => {

  // ── LOADING PAGE ────────────────────────────────────
  const loadingPage = document.getElementById('loading-page');
  window.addEventListener('load', () => {
    setTimeout(() => loadingPage.classList.add('hidden'), 1400);
  });

  // ── SCROLL PROGRESS BAR ─────────────────────────────
  const progressBar = document.getElementById('progress-bar');
  window.addEventListener('scroll', () => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    progressBar.value = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
  }, { passive: true });

  // ── HEADER SCROLL EFFECT ────────────────────────────
  const header = document.getElementById('header');
  window.addEventListener('scroll', () => {
    header.classList.toggle('scrolled', window.scrollY > 40);
  }, { passive: true });

  // ── SCROLL SPY (nav active) ─────────────────────────
  const sections = document.querySelectorAll('section[id]');
  const navItems = document.querySelectorAll('nav ul li');

  const spyObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        navItems.forEach(li => {
          const a = li.querySelector('a');
          li.classList.toggle('active', a && a.getAttribute('href') === `#${entry.target.id}`);
        });
      }
    });
  }, { threshold: 0.35 });

  sections.forEach(s => spyObserver.observe(s));

  // ── MOBILE MENU ─────────────────────────────────────
  const hamburgerBtn = document.getElementById('hamburger-btn');
  const mobileClose  = document.getElementById('mobile-close');
  const mobileMenu   = document.getElementById('mobile-menu');

  const openMenu  = () => mobileMenu.classList.add('open');
  const closeMenu = () => mobileMenu.classList.remove('open');

  hamburgerBtn.addEventListener('click', openMenu);
  mobileClose.addEventListener('click', closeMenu);
  mobileMenu.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMenu));

  // ── SECTION TITLE SLIDE-UP ───────────────────────────
  const titleObserver = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) e.target.classList.add('visible');
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.section-title').forEach(el => titleObserver.observe(el));

  // ── DESCRIPTION HIGHLIGHTS ──────────────────────────
  const descObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.querySelectorAll('.highlight').forEach((el, i) => {
          setTimeout(() => el.classList.add('active'), i * 350);
        });
      }
    });
  }, { threshold: 0.5 });

  document.querySelectorAll('.description-section').forEach(el => descObserver.observe(el));

  // ── SOFT SKILLS UNDERLINE ───────────────────────────
  const softObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.querySelectorAll('.soft-item').forEach((el, i) => {
          setTimeout(() => el.classList.add('active'), i * 150);
        });
      }
    });
  }, { threshold: 0.25 });

  document.querySelectorAll('.soft-section').forEach(el => softObserver.observe(el));

  // ── HARD SKILLS TAGS ───────────────────────────────
  const hardObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.querySelectorAll('.hard-skill-tag').forEach((el, i) => {
          setTimeout(() => el.classList.add('visible'), i * 80);
        });
      }
    });
  }, { threshold: 0.2 });

  document.querySelectorAll('.hard-section').forEach(el => hardObserver.observe(el));

  // ── CAROUSEL ────────────────────────────────────────
  const cards  = Array.from(document.querySelectorAll('.project-card'));
  const dots   = Array.from(document.querySelectorAll('.carousel-dot'));
  const total  = cards.length;
  let current  = 0;
  let isAnimating = false;

  function getCardStyle(offset) {
    // clamp offset to visible range
    const abs  = Math.abs(offset);
    const sign = offset >= 0 ? 1 : -1;

    if (abs === 0) {
      return {
        transform: 'translateX(0px) translateZ(0px) rotateY(0deg)',
        opacity: 1,
        zIndex: 10,
        filter: 'blur(0px)',
        pointerEvents: 'auto',
      };
    } else if (abs === 1) {
      return {
        transform: `translateX(${sign * 290}px) translateZ(-180px) rotateY(${sign * -18}deg)`,
        opacity: 0.65,
        zIndex: 5,
        filter: 'blur(1.5px)',
        pointerEvents: 'none',
      };
    } else if (abs === 2) {
      return {
        transform: `translateX(${sign * 490}px) translateZ(-340px) rotateY(${sign * -28}deg)`,
        opacity: 0.25,
        zIndex: 1,
        filter: 'blur(3px)',
        pointerEvents: 'none',
      };
    } else {
      return {
        transform: `translateX(${sign * 640}px) translateZ(-460px)`,
        opacity: 0,
        zIndex: 0,
        filter: 'blur(6px)',
        pointerEvents: 'none',
      };
    }
  }

  function updateCarousel() {
    cards.forEach((card, i) => {
      let offset = i - current;
      // circular wrap
      if (offset > total / 2)  offset -= total;
      if (offset < -total / 2) offset += total;

      const clamped = Math.max(-3, Math.min(3, offset));
      const style   = getCardStyle(clamped);

      card.style.transform     = style.transform;
      card.style.opacity       = style.opacity;
      card.style.zIndex        = style.zIndex;
      card.style.filter        = style.filter;
      card.style.pointerEvents = style.pointerEvents;
    });

    dots.forEach((dot, i) => dot.classList.toggle('active', i === current));
  }

  function goTo(idx) {
    if (isAnimating) return;
    isAnimating = true;
    current = ((idx % total) + total) % total;
    updateCarousel();
    setTimeout(() => { isAnimating = false; }, 760);
  }

  document.querySelector('.carousel-btn.prev').addEventListener('click', () => goTo(current - 1));
  document.querySelector('.carousel-btn.next').addEventListener('click', () => goTo(current + 1));

  dots.forEach((dot, i) => dot.addEventListener('click', () => goTo(i)));

  // swipe support
  let touchStartX = 0;
  const stage = document.getElementById('carousel-stage');
  stage.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
  stage.addEventListener('touchend', e => {
    const dx = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(dx) > 50) goTo(dx < 0 ? current + 1 : current - 1);
  }, { passive: true });

  updateCarousel();

  // ── EDU CARD 3D TILT ────────────────────────────────
  const eduCard = document.querySelector('.button-3d');
  if (eduCard) {
    const inner = eduCard.querySelector('span');
    eduCard.addEventListener('mousemove', e => {
      const rect = eduCard.getBoundingClientRect();
      const cx   = rect.left + rect.width  / 2;
      const cy   = rect.top  + rect.height / 2;
      const rx   = ((e.clientY - cy) / (rect.height / 2)) * -6;
      const ry   = ((e.clientX - cx) / (rect.width  / 2)) *  6;
      inner.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg) scale(1.01)`;
      inner.style.filter    = `drop-shadow(rgba(0,0,0,0.1) 0px 12px 24px)`;
    });
    eduCard.addEventListener('mouseleave', () => {
      inner.style.transform = 'rotateX(0deg) rotateY(0deg) scale(1)';
      inner.style.filter    = 'drop-shadow(rgba(0,0,0,0) 0px 0px 0px)';
    });
  }

  // ── GRAVITY BUTTONS ─────────────────────────────────
  document.querySelectorAll('.gravity-btn').forEach(btn => {
    btn.addEventListener('mousemove', e => {
      const rect = btn.getBoundingClientRect();
      const cx   = rect.left + rect.width  / 2;
      const cy   = rect.top  + rect.height / 2;
      const dx   = (e.clientX - cx) * 0.28;
      const dy   = (e.clientY - cy) * 0.28;
      btn.style.setProperty('--tx', `${dx}px`);
      btn.style.setProperty('--ty', `${dy}px`);
    });
    btn.addEventListener('mouseleave', () => {
      btn.style.setProperty('--tx', '0px');
      btn.style.setProperty('--ty', '0px');
    });
  });

  // Contact grid gravity links
  document.querySelectorAll('.wrapper-gravity a').forEach(link => {
    const wrapper = link.parentElement;
    wrapper.addEventListener('mousemove', e => {
      const rect = wrapper.getBoundingClientRect();
      const cx   = rect.left + rect.width  / 2;
      const cy   = rect.top  + rect.height / 2;
      const dx   = (e.clientX - cx) * 0.3;
      const dy   = (e.clientY - cy) * 0.3;
      link.style.setProperty('--tx', `${dx}px`);
      link.style.setProperty('--ty', `${dy}px`);
    });
    wrapper.addEventListener('mouseleave', () => {
      link.style.setProperty('--tx', '0px');
      link.style.setProperty('--ty', '0px');
    });
  });

  // ── EMAIL COPY ───────────────────────────────────────
  const emailBtn  = document.getElementById('email-btn');
  const copyText  = document.getElementById('copy-text');
  const emailAddr = 'han.lee@example.com';

  if (emailBtn) {
    emailBtn.addEventListener('click', () => {
      navigator.clipboard.writeText(emailAddr).then(() => {
        copyText.textContent = 'Copied!';
        setTimeout(() => { copyText.textContent = 'Copy'; }, 2200);
      }).catch(() => {
        // clipboard not available (non-https) — fallback
        copyText.textContent = 'Copied!';
        setTimeout(() => { copyText.textContent = 'Copy'; }, 2200);
      });
    });
  }

});
