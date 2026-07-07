/* =============================================
   NYSA TECHNOLOGY — SHARED JS
   ============================================= */

/* --- NAV SCROLL DARKENING --- */
(function () {
  const nav = document.querySelector('.nav');
  if (!nav) return;
  const onScroll = () => {
    if (window.scrollY > 60) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
})();

/* --- ACTIVE NAV LINK --- */
(function () {
  const page = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-link, .nav-mobile .nav-link').forEach(link => {
    const href = link.getAttribute('href');
    if (
      href === page ||
      (page === '' && href === 'index.html') ||
      (page === 'index.html' && href === 'index.html')
    ) {
      link.classList.add('active');
    }
  });
})();

/* --- HAMBURGER MENU --- */
(function () {
  const hamburger = document.querySelector('.nav-hamburger');
  const mobileNav = document.querySelector('.nav-mobile');
  if (!hamburger || !mobileNav) return;

  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('open');
    mobileNav.classList.toggle('open');
  });

  // Close on link click
  mobileNav.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
      hamburger.classList.remove('open');
      mobileNav.classList.remove('open');
    });
  });
})();

/* --- SMOOTH SCROLL FOR ANCHOR LINKS --- */
(function () {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        e.preventDefault();
        const offset = 80;
        const top = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });
})();

/* --- INTERSECTION OBSERVER FOR REVEAL ANIMATIONS --- */
(function () {
  const els = document.querySelectorAll('.reveal, .reveal-left, .reveal-right');
  if (!els.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.12,
    rootMargin: '0px 0px -40px 0px'
  });

  els.forEach(el => observer.observe(el));
})();

/* --- FAQ ACCORDION --- */
(function () {
  document.querySelectorAll('.faq-question').forEach(question => {
    question.addEventListener('click', function () {
      const item = this.closest('.faq-item');
      const answer = item.querySelector('.faq-answer');
      const isOpen = item.classList.contains('open');

      // Close all
      document.querySelectorAll('.faq-item.open').forEach(openItem => {
        openItem.classList.remove('open');
        openItem.querySelector('.faq-answer').style.maxHeight = '0';
      });

      // Toggle current
      if (!isOpen) {
        item.classList.add('open');
        answer.style.maxHeight = answer.scrollHeight + 'px';
      }
    });
  });
})();

/* --- CALENDLY POPUP EMBED + BOOKING CONVERSION TRACKING ---
   Replaces plain outbound links to Calendly with an inline popup widget,
   so we can detect an actual completed booking (not just a click) and
   fire a GA4 event for it. That event can then be imported into Google
   Ads as a conversion action, so bidding optimizes toward real bookings
   instead of link clicks.
   ============================================= */
(function () {
  const CALENDLY_LINK_MATCH = 'calendly.com/pedrambk';
  const CALENDLY_URL = 'https://calendly.com/pedrambk';

  const calendlyLinks = document.querySelectorAll('a[href*="' + CALENDLY_LINK_MATCH + '"]');
  if (!calendlyLinks.length) return;

  function ensureCalendlyAssets(callback) {
    if (window.Calendly) {
      callback();
      return;
    }
    if (!document.querySelector('link[data-calendly-css]')) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://assets.calendly.com/assets/external/widget.css';
      link.setAttribute('data-calendly-css', 'true');
      document.head.appendChild(link);
    }
    let script = document.querySelector('script[data-calendly-js]');
    if (!script) {
      script = document.createElement('script');
      script.src = 'https://assets.calendly.com/assets/external/widget.js';
      script.async = true;
      script.setAttribute('data-calendly-js', 'true');
      document.head.appendChild(script);
    }
    script.addEventListener('load', callback, { once: true });
    // In case the script was already appended (e.g. two links clicked
    // back to back) and has already finished loading by the time we get here.
    if (window.Calendly) callback();
  }

  calendlyLinks.forEach(function (link) {
    link.addEventListener('click', function (e) {
      e.preventDefault();
      ensureCalendlyAssets(function () {
        window.Calendly.initPopupWidget({ url: CALENDLY_URL });
      });
    });
  });

  window.addEventListener('message', function (e) {
    if (e.origin !== 'https://calendly.com') return;
    if (e.data && e.data.event === 'calendly.event_scheduled') {
      if (typeof gtag === 'function') {
        gtag('event', 'calendly_booking_completed', {
          event_category: 'engagement',
          event_label: 'Calendly booking confirmed'
        });
      }
    }
  });
})();
