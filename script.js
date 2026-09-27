(function () {
  'use strict';

  // ==========================================================================
  // CURSOR GLOW (Resplandor cinemático que sigue el cursor)
  // ==========================================================================
  const glow = document.getElementById('cursor-glow');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let targetX = window.innerWidth / 2;
  let targetY = window.innerHeight / 2;
  let currentX = targetX;
  let currentY = targetY;
  let active = false;

  function updateGlowVisibility(x, y) {
    if (!glow) return;
    const el = document.elementFromPoint(x, y);
    // Ocultar suavemente el glow cuando está sobre secciones claras
    const onLight = el && el.closest('.section-light');
    glow.style.opacity = onLight ? '0' : '1';
  }

  window.addEventListener('mousemove', function (e) {
    targetX = e.clientX;
    targetY = e.clientY;
    if (!active && glow) {
      active = true;
      glow.style.opacity = '1';
    }
    updateGlowVisibility(e.clientX, e.clientY);
  });

  window.addEventListener('mouseleave', function () {
    active = false;
    if (glow) glow.style.opacity = '0';
  });

  function tick() {
    currentX += (targetX - currentX) * 0.08;
    currentY += (targetY - currentY) * 0.08;
    if (glow) {
      glow.style.transform = `translate(${currentX}px, ${currentY}px)`;
    }
    requestAnimationFrame(tick);
  }

  if (!reduceMotion && glow) {
    requestAnimationFrame(tick);
  }

  // ==========================================================================
  // SCROLL REVEAL Y CONTADORES ANIMADOS
  // ==========================================================================
  function animateCounter(el) {
    if (el.dataset.animated) return;
    el.dataset.animated = 'true';

    const target = parseInt(el.getAttribute('data-target'), 10);
    const prefix = el.getAttribute('data-prefix') || '';
    const suffix = el.getAttribute('data-suffix') || '';
    const duration = 1200;
    const startTime = performance.now();

    function update(now) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      const current = Math.floor(easeProgress * target);

      el.textContent = `${prefix}${current}${suffix}`;

      if (progress < 1) {
        requestAnimationFrame(update);
      } else {
        el.textContent = `${prefix}${target}${suffix}`;
      }
    }

    requestAnimationFrame(update);
  }

  const revealEls = document.querySelectorAll('.reveal');

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');

            // Animación de números de métricas
            const counters = entry.target.querySelectorAll('.metric-val[data-target]');
            counters.forEach(animateCounter);
            if (entry.target.matches('.metric-val[data-target]')) {
              animateCounter(entry.target);
            }

            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.05,
        rootMargin: '0px 0px -20px 0px'
      }
    );

    revealEls.forEach(function (el) {
      observer.observe(el);
    });
  } else {
    revealEls.forEach(function (el) {
      el.classList.add('visible');
      const counters = el.querySelectorAll('.metric-val[data-target]');
      counters.forEach(animateCounter);
    });
  }

  // ==========================================================================
  // NAVEGACIÓN SUAVE CON COMPENSACIÓN DE CABECERA
  // ==========================================================================
  const headerHeight = 72;
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#' || targetId === '#top') {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }

      const targetElem = document.querySelector(targetId);
      if (targetElem) {
        e.preventDefault();
        const elementPosition = targetElem.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerHeight;

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }
    });
  });

  // ==========================================================================
  // MENÚ HAMBURGUESA DESPLEGABLE MÓVIL
  // ==========================================================================
  const burgerToggle = document.getElementById('burger-toggle');
  const navMenu = document.getElementById('nav-menu');
  const headerInner = document.querySelector('.header-inner');

  if (burgerToggle && navMenu) {
    burgerToggle.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
      const isExpanded = burgerToggle.getAttribute('aria-expanded') === 'true';
      const newState = !isExpanded;

      burgerToggle.setAttribute('aria-expanded', newState ? 'true' : 'false');
      burgerToggle.classList.toggle('active', newState);
      navMenu.classList.toggle('active', newState);
      if (headerInner) {
        headerInner.classList.toggle('menu-open', newState);
      }
    });

    // Cerrar automáticamente el menú al pulsar sobre cualquier enlace
    navMenu.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        burgerToggle.setAttribute('aria-expanded', 'false');
        burgerToggle.classList.remove('active');
        navMenu.classList.remove('active');
        if (headerInner) headerInner.classList.remove('menu-open');
      });
    });

    // Cerrar menú al hacer clic fuera del área del menú
    document.addEventListener('click', function (e) {
      if (navMenu.classList.contains('active') && !navMenu.contains(e.target) && !burgerToggle.contains(e.target)) {
        burgerToggle.setAttribute('aria-expanded', 'false');
        burgerToggle.classList.remove('active');
        navMenu.classList.remove('active');
        if (headerInner) headerInner.classList.remove('menu-open');
      }
    });

    // Cerrar menú con tecla ESC
    window.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && navMenu.classList.contains('active')) {
        burgerToggle.setAttribute('aria-expanded', 'false');
        burgerToggle.classList.remove('active');
        navMenu.classList.remove('active');
        if (headerInner) headerInner.classList.remove('menu-open');
      }
    });
  }

  // ==========================================================================
  // CAMBIO DINÁMICO DE CABECERA AL HACER SCROLL
  // ==========================================================================
  const header = document.querySelector('.header');
  window.addEventListener('scroll', function () {
    if (header) {
      header.classList.toggle('scrolled', window.scrollY > 40);
    }
  });

  // ==========================================================================
  // ACORDEÓN EXCLUSIVO PARA FAQ (Cierra los demás al abrir uno)
  // ==========================================================================
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(function (item) {
    item.addEventListener('toggle', function () {
      if (this.open) {
        faqItems.forEach(function (otherItem) {
          if (otherItem !== item) {
            otherItem.removeAttribute('open');
          }
        });
      }
    });
  });

  // ==========================================================================
  // MODALES LEGALES (Aviso Legal, Privacidad, Cookies)
  // ==========================================================================
  const legalBtns = document.querySelectorAll('.legal-btn');
  const modalOverlays = document.querySelectorAll('.modal-overlay');

  function closeModal(modal) {
    if (modal) {
      modal.classList.remove('active');
      modal.setAttribute('aria-hidden', 'true');
    }
  }

  legalBtns.forEach(function (btn) {
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      const targetModalId = this.getAttribute('data-modal');
      const targetModal = document.getElementById(targetModalId);
      if (targetModal) {
        targetModal.classList.add('active');
        targetModal.setAttribute('aria-hidden', 'false');
      }
    });
  });

  modalOverlays.forEach(function (overlay) {
    const closeBtn = overlay.querySelector('.modal-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', function () {
        closeModal(overlay);
      });
    }

    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) {
        closeModal(overlay);
      }
    });
  });

  window.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      modalOverlays.forEach(function (modal) {
        closeModal(modal);
      });
    }
  });

})();


