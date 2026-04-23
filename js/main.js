/* =====================================================
   PORTFOLIO — main.js
   ===================================================== */

document.addEventListener('DOMContentLoaded', () => {

  let singleH = 0; // set by initInfiniteScroll

  // ── GSAP SETUP ──────────────────────────────────────
  gsap.registerPlugin(ScrollTrigger);

  // ── LOADING PAGE ────────────────────────────────────
  const loadingPage = document.getElementById('loading-page');
  window.addEventListener('load', () => {
    setTimeout(() => loadingPage.classList.add('hidden'), 1400);
  });

  // ── SCROLL PROGRESS BAR (GSAP) ───────────────────────
  gsap.to('#progress-bar', {
    value: 100,
    ease: 'none',
    scrollTrigger: { scrub: 0.8 }
  });

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

  // ── SECTION TITLE REVEAL (GSAP) ─────────────────────
  document.querySelectorAll('.section-title').forEach(title => {
    gsap.fromTo(title,
      { opacity: 0, y: '110%', skewY: 5 },
      {
        opacity: 1, y: '0%', skewY: 0,
        duration: 0.8,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: title,
          start: 'top 88%',
          toggleActions: 'play none none reverse'
        }
      }
    );
  });

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

  // ── SOFT SKILLS SCROLL HIGHLIGHT (GSAP) ────────────
  document.querySelectorAll('.soft-content .text-skill').forEach(textSkill => {
    gsap.to(textSkill, {
      duration: 4,
      scrollTrigger: {
        trigger:     textSkill,
        start:       'top 70%',
        scrub:       1,
        toggleClass: 'active-skill'
      }
    });
  });

  // ── CAROUSEL (GSAP 3D CYLINDER) ─────────────────────
  function initCarousel() {
    const stage = document.getElementById('stage');
    if (!stage) return;

    const isMobileDevice = window.matchMedia('(max-width: 768px)').matches;
    if (isMobileDevice) return; // CSS handles mobile layout

    const boxes    = Array.from(document.querySelectorAll('.box'));
    const boxCount = boxes.length;
    const RADIUS   = 460;          // wider spread for dramatic depth
    const STEP     = 360 / boxCount; // 72°
    const VERT_AMP = 60;           // vertical wave amplitude (px) — helix

    // Set up the 3D stage (perspective + preserve-3d + subtle downward tilt)
    gsap.set(stage, { perspective: 1100, transformStyle: 'preserve-3d', rotateX: 6 });

    // Single source of truth for cylinder rotation.
    // cylinderAngle = 0 → box[0] (Dev Blog) faces viewer directly.
    let cylinderAngle = 0;

    // Vertical offset: card at effective angle A rides a sine wave → helix look
    function getYOff(angleDeg) {
      return Math.sin((angleDeg % 360) * Math.PI / 180) * VERT_AMP;
    }

    boxes.forEach((box, i) => {
      gsap.set(box, {
        rotationY:       i * STEP,
        transformOrigin: `50% 50% -${RADIUS}px`,
        y:               getYOff(i * STEP),
        scale:           1 + 0.13 * Math.cos((i * STEP) * Math.PI / 180)
      });
    });

    // Rotate all boxes + animate helix Y + scale focus
    function applyRotation(duration, ease) {
      boxes.forEach((box, i) => {
        const totalAngle = cylinderAngle + i * STEP;
        const sc = 1 + 0.13 * Math.cos((totalAngle % 360) * Math.PI / 180);
        gsap.to(box, {
          rotationY: totalAngle,
          y:         getYOff(totalAngle),
          scale:     sc,
          duration,
          ease,
          overwrite: true
        });
      });
    }

    // ── Scroll-driven rotation (single ScrollTrigger, shared angle) ──
    const box1El = document.getElementById('box-1');
    let prevProgress = 0;
    ScrollTrigger.create({
      trigger: box1El,
      start:   'top 95%',
      end:     'bottom+=1000 5%',
      onUpdate(self) {
        const delta = self.progress - prevProgress;
        prevProgress = self.progress;
        cylinderAngle += delta * 360 * 2;
        applyRotation(1.5, 'power3.out');
      }
    });

    // ── Perspective deepens when box-5 comes into view ──
    const box5El = document.getElementById('box-5');
    if (box5El) {
      gsap.to(stage, {
        scrollTrigger: {
          trigger:       box5El,
          start:         'top 60%',
          end:           'bottom 30%',
          toggleActions: 'play none play none'
        },
        perspective: 10800,
        duration:    2,
        ease:        'power1.inOut'
      });
    }

    // ── Click-zone navigation with custom cursor arrows ──
    // Use a time-based cooldown instead of onComplete to avoid being broken
    // when overwrite:true cancels animations before onComplete fires.
    let navCooldown = false;

    function rotateCylinder(direction) {
      if (navCooldown) return;
      navCooldown = true;
      setTimeout(() => { navCooldown = false; }, 1300);

      // Snap to the nearest clean STEP multiple first, then advance by one step.
      // This corrects any floating-point drift that accumulates during scroll.
      cylinderAngle = Math.round(cylinderAngle / STEP) * STEP + direction * STEP;
      applyRotation(1.2, 'power3.out');
    }

    const arrowLeft  = document.getElementById('arrow-left');
    const arrowRight = document.getElementById('arrow-right');
    const leftZone   = document.getElementById('wrapperCursor-left');
    const rightZone  = document.getElementById('wrapperCursor-right');

    function positionArrow(e, arrowEl) {
      arrowEl.style.left = e.clientX + 'px';
      arrowEl.style.top  = e.clientY + 'px';
    }

    if (leftZone && arrowLeft) {
      leftZone.addEventListener('mouseenter', () => {
        arrowLeft.style.display  = 'flex';
        arrowRight.style.display = 'none';
      });
      leftZone.addEventListener('mouseleave', () => { arrowLeft.style.display = 'none'; });
      leftZone.addEventListener('mousemove',  e  => positionArrow(e, arrowLeft));
      leftZone.addEventListener('click',      ()  => rotateCylinder(-1));
    }

    if (rightZone && arrowRight) {
      rightZone.addEventListener('mouseenter', () => {
        arrowRight.style.display = 'flex';
        arrowLeft.style.display  = 'none';
      });
      rightZone.addEventListener('mouseleave', () => { arrowRight.style.display = 'none'; });
      rightZone.addEventListener('mousemove',  e  => positionArrow(e, arrowRight));
      rightZone.addEventListener('click',      ()  => rotateCylinder(1));
    }
  }

  initCarousel();

  // ── HARD SKILLS HORIZONTAL SCROLL (GSAP) ────────────
  function initHardSkills() {
    const section2 = document.querySelector('.section2');
    if (!section2) return;

    const isMobileDevice = window.matchMedia('(max-width: 768px)').matches;
    if (isMobileDevice) return;

    // Pin the section and slide its content horizontally
    gsap.to(section2, {
      xPercent: -45,
      scrollTrigger: {
        trigger:  section2,
        start:    'top -5%',
        end:      '+=3500',
        pin:      true,
        scrub:    2
      }
    });

    // Each line animates from small/invisible to full size
    document.querySelectorAll('.line-skill').forEach(line => {
      gsap.from(line, {
        fontSize:      '0.6rem',
        opacity:       0,
        duration:      1,
        scrollTrigger: {
          trigger:       '.line-skill-1',
          start:         'top 70%',
          toggleActions: 'play none none reverse'
        }
      });
    });

    // Diagonal drift of individual rows while scrolling
    gsap.to('.line-skill-1', {
      x: -500, y: 500,
      scrollTrigger: {
        trigger:       '.line-skill-1',
        start:         '+=400 65%',
        end:           '+=2200',
        toggleActions: 'play none none reverse',
        scrub:         2
      }
    });

    gsap.to('.line-skill-2', {
      x: 300, y: -240,
      scrollTrigger: {
        trigger:       '.line-skill-1',
        start:         '+=400 65%',
        end:           '+=1000',
        toggleActions: 'play none none reverse',
        scrub:         2
      }
    });
  }

  initHardSkills();

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
  function initGravity() {
    document.querySelectorAll('[data-gravity]').forEach(zone => {
      const strength = parseFloat(zone.dataset.gravityStrength ?? 0.28);
      const targetSel = zone.dataset.gravityTarget;
      const target = targetSel ? zone.querySelector(targetSel) : zone;
      if (!target) return;

      zone.addEventListener('mousemove', e => {
        const rect = zone.getBoundingClientRect();
        const dx = (e.clientX - (rect.left + rect.width  / 2)) * strength;
        const dy = (e.clientY - (rect.top  + rect.height / 2)) * strength;
        target.style.setProperty('--tx', `${dx}px`);
        target.style.setProperty('--ty', `${dy}px`);
      });

      zone.addEventListener('mouseleave', () => {
        target.style.setProperty('--tx', '0px');
        target.style.setProperty('--ty', '0px');
      });
    });
  }

  initGravity();

  // ── EMAIL COPY ───────────────────────────────────────
  const emailBtn  = document.getElementById('email-btn');
  const copyText  = document.getElementById('copy-text');
  const emailAddr = 'hi385790@hanyang.ac.kr';

  if (emailBtn) {
    emailBtn.addEventListener('click', () => {
      navigator.clipboard.writeText(emailAddr).then(() => {
        copyText.textContent = 'Copied!';
        setTimeout(() => { copyText.textContent = 'Copy'; }, 2200);
      }).catch(() => {
        copyText.textContent = 'Copied!';
        setTimeout(() => { copyText.textContent = 'Copy'; }, 2200);
      });
    });
  }

  initInfiniteScroll();

});
