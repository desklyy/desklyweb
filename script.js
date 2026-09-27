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
  // SCROLL REVEAL (Efecto de deslizamiento y aparición de secciones)
  // ==========================================================================
  const revealEls = document.querySelectorAll('.reveal');

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.12,
        rootMargin: '0px 0px -40px 0px'
      }
    );

    revealEls.forEach(function (el) {
      observer.observe(el);
    });
  } else {
    revealEls.forEach(function (el) {
      el.classList.add('visible');
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
  // CAMBIO DINÁMICO DE CABECERA AL HACER SCROLL
  // ==========================================================================
  const header = document.querySelector('.header');
  window.addEventListener('scroll', function () {
    if (window.scrollY > 40) {
      header.style.background = 'rgba(7, 9, 15, 0.92)';
      header.style.borderBottomColor = 'rgba(232, 236, 245, 0.14)';
    } else {
      header.style.background = 'rgba(7, 9, 15, 0.75)';
      header.style.borderBottomColor = 'rgba(232, 236, 245, 0.08)';
    }
  });

})();
