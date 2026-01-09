/**
 * Ball Transfer Systems - Award-Winning Interactions
 * Shared JavaScript for all pages
 */

document.addEventListener('DOMContentLoaded', function() {
  'use strict';

  // ============================================
  // Mobile Navigation
  // ============================================
  const mobileToggle = document.querySelector('.mobile-nav-toggle');
  const mainNav = document.querySelector('.main-nav');
  const dropdowns = document.querySelectorAll('.nav-dropdown');

  if (mobileToggle && mainNav) {
    mobileToggle.addEventListener('click', function() {
      this.classList.toggle('active');
      mainNav.classList.toggle('active');
      this.setAttribute('aria-expanded', mainNav.classList.contains('active'));

      // Prevent body scroll when menu is open
      document.body.style.overflow = mainNav.classList.contains('active') ? 'hidden' : '';
    });
  }

  dropdowns.forEach(dropdown => {
    const toggleBtn = dropdown.querySelector('.nav-dropdown__toggle');
    if (toggleBtn) {
      toggleBtn.addEventListener('click', function(e) {
        if (window.innerWidth <= 1024) {
          e.preventDefault();
          dropdown.classList.toggle('active');
        }
      });
    }
  });

  // ============================================
  // Scroll-Triggered Animations
  // ============================================
  const animatedElements = document.querySelectorAll(
    '.fade-in-up, .fade-in-left, .fade-in-right, .fade-in-scale, .stagger-children'
  );

  if (animatedElements.length > 0 && 'IntersectionObserver' in window) {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);

    animatedElements.forEach(el => observer.observe(el));
  } else {
    // Fallback for browsers without IntersectionObserver
    animatedElements.forEach(el => el.classList.add('visible'));
  }

  // ============================================
  // Scroll Progress Bar
  // ============================================
  const scrollProgress = document.querySelector('.scroll-progress');

  function updateScrollProgress() {
    if (!scrollProgress) return;
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const scrollPercent = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    scrollProgress.style.width = scrollPercent + '%';
  }

  // ============================================
  // Back to Top Button
  // ============================================
  const backToTop = document.querySelector('.back-to-top');

  function updateBackToTop() {
    if (!backToTop) return;
    if (window.scrollY > 500) {
      backToTop.classList.add('visible');
    } else {
      backToTop.classList.remove('visible');
    }
  }

  if (backToTop) {
    backToTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // ============================================
  // Throttled Scroll Handler
  // ============================================
  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        updateScrollProgress();
        updateBackToTop();
        updateHeaderShadow();
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });

  // ============================================
  // Smooth Header Shadow
  // ============================================
  const header = document.querySelector('.site-header');

  function updateHeaderShadow() {
    if (!header) return;
    if (window.scrollY > 10) {
      header.style.boxShadow = '0 4px 20px rgba(0,0,0,0.1)';
    } else {
      header.style.boxShadow = '';
    }
  }

  // ============================================
  // Lazy Load Images
  // ============================================
  const lazyImages = document.querySelectorAll('img[loading="lazy"]');
  lazyImages.forEach(img => {
    if (img.complete) {
      img.classList.add('loaded');
    } else {
      img.addEventListener('load', () => img.classList.add('loaded'));
    }
  });

  // ============================================
  // Form Validation (if forms exist)
  // ============================================
  const contactForm = document.getElementById('contact-form');
  const quoteForm = document.getElementById('quote-form');

  function showError(input, message) {
    input.style.borderColor = '#dc2626';
    const existingError = input.parentNode.querySelector('.form-error');
    if (existingError) existingError.remove();

    const error = document.createElement('div');
    error.className = 'form-error';
    error.style.cssText = 'color: #dc2626; font-size: 0.875rem; margin-top: 0.25rem;';
    error.textContent = message;
    input.parentNode.appendChild(error);
  }

  function clearErrors() {
    document.querySelectorAll('.form-error').forEach(el => el.remove());
    document.querySelectorAll('.form-input, .form-textarea, .form-select').forEach(el => {
      el.style.borderColor = '';
    });
  }

  function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
      e.preventDefault();
      clearErrors();
      let isValid = true;

      const name = document.getElementById('name');
      const email = document.getElementById('email');
      const message = document.getElementById('message');

      if (!name.value.trim()) { showError(name, 'Please enter your name'); isValid = false; }
      if (!email.value.trim()) { showError(email, 'Please enter your email'); isValid = false; }
      else if (!validateEmail(email.value)) { showError(email, 'Please enter a valid email'); isValid = false; }
      if (!message.value.trim()) { showError(message, 'Please enter a message'); isValid = false; }

      if (isValid) {
        alert('Thank you for your message! We will get back to you soon.');
        contactForm.reset();
      }
    });
  }

  if (quoteForm) {
    quoteForm.addEventListener('submit', function(e) {
      e.preventDefault();
      clearErrors();
      let isValid = true;

      const fields = ['name', 'job-title', 'company', 'phone', 'email', 'product', 'timeline'];
      fields.forEach(id => {
        const field = document.getElementById(id);
        if (field && !field.value.trim()) {
          showError(field, 'This field is required');
          isValid = false;
        }
      });

      const email = document.getElementById('email');
      if (email && email.value.trim() && !validateEmail(email.value)) {
        showError(email, 'Please enter a valid email');
        isValid = false;
      }

      const phone = document.getElementById('phone');
      if (phone && phone.value.trim() && phone.value.replace(/\D/g, '').length < 10) {
        showError(phone, 'Please enter a valid phone number');
        isValid = false;
      }

      if (isValid) {
        alert('Thank you for your quote request! A representative will contact you shortly.');
        quoteForm.reset();
      }
    });
  }

  // ============================================
  // Keyboard Navigation Improvements
  // ============================================
  document.addEventListener('keydown', function(e) {
    // Escape key closes mobile nav
    if (e.key === 'Escape' && mainNav && mainNav.classList.contains('active')) {
      mobileToggle.click();
    }
  });

  // ============================================
  // Reduced Motion Support
  // ============================================
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  if (prefersReducedMotion.matches) {
    // Instantly show all animated elements
    animatedElements.forEach(el => el.classList.add('visible'));
  }

  // ============================================
  // Smooth cursor glow effect on hero
  // ============================================
  const hero = document.querySelector('.hero');
  if (hero) {
    hero.addEventListener('mousemove', (e) => {
      const rect = hero.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      hero.style.setProperty('--mouse-x', x + '%');
      hero.style.setProperty('--mouse-y', y + '%');
    });
  }

  // ============================================
  // Magnetic buttons on hover
  // ============================================
  document.querySelectorAll('.btn--accent, .btn--primary').forEach(btn => {
    btn.addEventListener('mousemove', (e) => {
      const rect = btn.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      btn.style.transform = `translate(${x * 0.1}px, ${y * 0.1}px)`;
    });
    btn.addEventListener('mouseleave', () => {
      btn.style.transform = '';
    });
  });

  // ============================================
  // Parallax on scroll for hero
  // ============================================
  const heroBackground = document.querySelector('.hero__background img');
  if (heroBackground) {
    window.addEventListener('scroll', () => {
      const scroll = window.scrollY;
      if (scroll < 800) {
        heroBackground.style.transform = `translateY(${scroll * 0.3}px) scale(1.1)`;
      }
    }, { passive: true });
  }

  // ============================================
  // Testimonials Carousel
  // ============================================
  const testimonialsTrack = document.getElementById('testimonials-track');
  const testimonialsDots = document.getElementById('testimonials-dots');
  const testimonialsPrev = document.getElementById('testimonials-prev');
  const testimonialsNext = document.getElementById('testimonials-next');

  if (testimonialsTrack && testimonialsDots) {
    let currentTestimonial = 0;
    const totalTestimonials = testimonialsTrack.children.length;

    function updateTestimonials() {
      testimonialsTrack.style.transform = `translateX(-${currentTestimonial * 100}%)`;
      testimonialsDots.querySelectorAll('.testimonials__dot').forEach((dot, i) => {
        dot.classList.toggle('active', i === currentTestimonial);
      });
    }

    testimonialsPrev?.addEventListener('click', () => {
      currentTestimonial = (currentTestimonial - 1 + totalTestimonials) % totalTestimonials;
      updateTestimonials();
    });

    testimonialsNext?.addEventListener('click', () => {
      currentTestimonial = (currentTestimonial + 1) % totalTestimonials;
      updateTestimonials();
    });

    testimonialsDots.querySelectorAll('.testimonials__dot').forEach(dot => {
      dot.addEventListener('click', () => {
        currentTestimonial = parseInt(dot.dataset.index);
        updateTestimonials();
      });
    });

    // Auto-advance every 6 seconds
    setInterval(() => {
      currentTestimonial = (currentTestimonial + 1) % totalTestimonials;
      updateTestimonials();
    }, 6000);
  }

  // ============================================
  // 3D Card Tilt Effect
  // ============================================
  document.querySelectorAll('.product-card-3d[data-tilt]').forEach(card => {
    const inner = card.querySelector('.product-card-3d__inner');
    if (!inner) return;

    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const tiltX = ((y - centerY) / centerY) * -10;
      const tiltY = ((x - centerX) / centerX) * 10;

      card.style.setProperty('--tilt-x', tiltX + 'deg');
      card.style.setProperty('--tilt-y', tiltY + 'deg');
      card.style.setProperty('--tilt-scale', '1.02');
    });

    card.addEventListener('mouseleave', () => {
      card.style.setProperty('--tilt-x', '0deg');
      card.style.setProperty('--tilt-y', '0deg');
      card.style.setProperty('--tilt-scale', '1');
    });
  });

  // ============================================
  // Initialize
  // ============================================
  updateScrollProgress();
  updateBackToTop();
  updateHeaderShadow();
});
