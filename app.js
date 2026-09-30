/**
 * BizFlow — Landing Page JS (app.js)
 * Includes continuous typewriter effect for the tagline
 */

;(function () {
  'use strict';

  // ── 1. Navbar scroll effect ──────────────────────────────────────
  const navbar = document.getElementById('navbar');
  const hamburger = document.getElementById('hamburger');
  const navLinks = document.getElementById('nav-links');

  function onScroll() {
    if (navbar) {
      navbar.classList.toggle('scrolled', window.scrollY > 20);
    }
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Mobile hamburger toggle
  if (hamburger && navLinks) {
    hamburger.addEventListener('click', () => {
      const isOpen = navLinks.classList.toggle('open');
      hamburger.setAttribute('aria-expanded', String(isOpen));
    });

    navLinks.querySelectorAll('.nav-item').forEach(link => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('open');
        hamburger.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // ── 2. Continuous Typing Animation for Tagline ──────────────────
  const typingElement = document.getElementById('tagline-typing');

  // Phrases to continuously type and cycle
  const phrases = [
    'ONE FLOW.  ONE VIEW.  BETTER DECISIONS.',
    'SMART BUSINESS MANAGEMENT.',
    'TURNING TRANSACTIONS INTO DECISIONS.'
  ];

  let phraseIndex = 0;
  let charIndex = 0;
  let isDeleting = false;
  let typingSpeed = 75; // ms per char when typing
  const deletingSpeed = 35; // ms per char when deleting
  const holdDelay = 2200; // ms to pause when a phrase finishes typing
  const pauseBeforeType = 450; // ms to pause after deleting before next phrase

  function typeStep() {
    if (!typingElement) return;

    const currentPhrase = phrases[phraseIndex];

    if (!isDeleting) {
      // Typing forward
      charIndex++;
      typingElement.textContent = currentPhrase.substring(0, charIndex);

      if (charIndex === currentPhrase.length) {
        // Full phrase typed: pause, then start deleting
        isDeleting = true;
        setTimeout(typeStep, holdDelay);
        return;
      }
      setTimeout(typeStep, typingSpeed);
    } else {
      // Backspacing
      charIndex--;
      typingElement.textContent = currentPhrase.substring(0, charIndex);

      if (charIndex === 0) {
        // Completely deleted: move to next phrase, pause, then type
        isDeleting = false;
        phraseIndex = (phraseIndex + 1) % phrases.length;
        setTimeout(typeStep, pauseBeforeType);
        return;
      }
      setTimeout(typeStep, deletingSpeed);
    }
  }

  // Start continuous typing after page initial load
  setTimeout(typeStep, 600);

  // ── 3. CTA Button interaction ──────────────────────────────────
  const ctaBtn = document.getElementById('btn-get-started');
  if (ctaBtn) {
    ctaBtn.addEventListener('click', function () {
      console.log('BizFlow Get Started clicked');
    });
  }

})();
