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

  // ==========================================================================
  // DEMO INTERACTIVA DE CHAT DESKLY (Cambio de Escenarios y Animación)
  // ==========================================================================
  const demoContainer = document.getElementById('deskly-chat-demo');
  if (demoContainer) {
    const scenarios = [
      {
        userText: 'Hola, ¿cuál ha sido la facturación de este mes y qué previsión tenemos para el mes que viene?',
        execText: 'Consultando contabilidad en SAP y pipeline en Salesforce CRM... [0.18s]',
        botHTML: `
          <div class="chat-conversational-response">
            <p class="chat-p">Este mes de septiembre hemos alcanzado una facturación de <strong class="highlight-val">148.500 €</strong>, lo que supone un cumplimiento del <strong>100% del objetivo</strong> y un crecimiento del <strong>+12%</strong> respecto al mes pasado.</p>
            
            <p class="chat-p">Para el mes de octubre, la previsión estimada es de <strong class="highlight-val">172.000 €</strong> (+15,8% adicional). El incremento se debe principalmente a tres motivos:</p>
            
            <ul class="chat-reasons-list">
              <li><strong>1. Contrato recurrente:</strong> Firma confirmada con Grupo Industriales (+18.500 €).</li>
              <li><strong>2. Renovaciones programadas:</strong> 4 cuentas anuales activadas en CRM (+9.000 €).</li>
              <li><strong>3. Repunte estacional:</strong> Tendencia histórica positiva al inicio del Q4.</li>
            </ul>
          </div>

          <div class="res-actions">
            <span class="res-action-btn primary">Descargar Informe de Previsión PDF</span>
            <span class="res-action-btn">Ver Desglose por Cliente</span>
          </div>
        `,
        inputText: 'Preguntar sobre facturación, previsiones o margen de beneficio...'
      },
      {
        userText: '¿Cuál es el estado del pedido #8492 de Talleres García y el stock disponible en almacén?',
        execText: 'Indexando datos en SAP S/4HANA y Salesforce CRM... [0.24s]',
        botHTML: `
          <div class="res-row">
            <span class="res-label">CLIENTE / RAZÓN SOCIAL:</span>
            <span class="res-val">Talleres García S.L. (ID CRM: #9931)</span>
          </div>
          <div class="res-row">
            <span class="res-label">PEDIDO #8492:</span>
            <span class="res-val status-badge-ok">[EN TRÁNSITO] Entrega estimada: Mañana 10:30h</span>
          </div>
          <div class="res-row">
            <span class="res-label">DISPONIBILIDAD ALMACÉN B:</span>
            <span class="res-val">142 unidades en stock (Ubicación: Estantería A-12)</span>
          </div>
          <div class="res-actions">
            <span class="res-action-btn primary">Ver Albarán Oficial PDF</span>
            <span class="res-action-btn">Notificar Estado a Cliente (API)</span>
          </div>
        `,
        inputText: 'Introducir comando de consulta ERP, expediente o procedimiento...'
      },
      {
        userText: 'Encuentra la factura de mantenimiento del robot de soldadura de Mayo.',
        execText: 'Búsqueda vectorial RAG en Servidor Documental... [0.19s]',
        botHTML: `
          <div class="res-row">
            <span class="res-label">DOCUMENTO REGISTRADO:</span>
            <span class="res-val">Factura_Mantenimiento_Robot_SOL-402.pdf</span>
          </div>
          <div class="res-row">
            <span class="res-label">FECHA / IMPORTE:</span>
            <span class="res-val">14 Mayo 2026 · 1.480,00 € (Contabilidad Vuelcada)</span>
          </div>
          <div class="res-row">
            <span class="res-label">PROVEEDOR:</span>
            <span class="res-val">Industriales S.A. (CIF B-882910)</span>
          </div>
          <div class="res-actions">
            <span class="res-action-btn primary">Descargar Expediente PDF</span>
            <span class="res-action-btn">Ver Ficha de Proveedor</span>
          </div>
        `,
        inputText: 'Buscar facturas, contratos o expedientes...'
      },
      {
        userText: '¿Qué protocolo de seguridad seguir si salta la alarma de presión en línea 3?',
        execText: 'Consultando Manual de Operaciones ISO 9001 & Seguridad... [0.22s]',
        botHTML: `
          <div class="res-row">
            <span class="res-label">NORMATIVA ISO:</span>
            <span class="res-val status-badge-ok">PR-SEG-2026-L3 (Revisión V4 Aprobada)</span>
          </div>
          <div class="res-row">
            <span class="res-label">PASO 1 (INMEDIATO):</span>
            <span class="res-val">Accionar válvula de despresurización V-04</span>
          </div>
          <div class="res-row">
            <span class="res-label">PASO 2 (NOTIFICACIÓN):</span>
            <span class="res-val">Avisar a responsable de turno (Juan P. · Ext. 402)</span>
          </div>
          <div class="res-actions">
            <span class="res-action-btn primary">Registrar Incidencia de Seguridad</span>
            <span class="res-action-btn">Abrir Manual ISO 9001</span>
          </div>
        `,
        inputText: 'Consultar procedimientos o normativa interna...'
      }
    ];

    const tabs = demoContainer.querySelectorAll('.demo-tab');
    const userTextEl = document.getElementById('demo-user-text');
    const execTextEl = document.getElementById('demo-exec-text');
    const botContentEl = document.getElementById('demo-bot-content');
    const inputTextEl = document.getElementById('demo-input-text');
    const execPill = document.getElementById('demo-exec-pill');
    const botMsg = document.getElementById('demo-bot-msg');

    let currentIdx = 0;
    let autoInterval = null;

    function loadScenario(idx, isManual = false) {
      if (isManual && autoInterval) {
        clearInterval(autoInterval);
      }

      currentIdx = idx;
      tabs.forEach((tab, i) => {
        const isActive = i === idx;
        tab.classList.toggle('active', isActive);
        tab.setAttribute('aria-selected', isActive ? 'true' : 'false');
      });

      const sc = scenarios[idx];

      if (botMsg) botMsg.style.opacity = '0.3';
      if (execPill) execPill.style.opacity = '0.5';

      setTimeout(() => {
        if (userTextEl) userTextEl.textContent = sc.userText;
        if (execTextEl) execTextEl.textContent = sc.execText;
        if (botContentEl) botContentEl.innerHTML = sc.botHTML;
        if (inputTextEl) inputTextEl.textContent = sc.inputText;

        if (botMsg) botMsg.style.opacity = '1';
        if (execPill) execPill.style.opacity = '1';
      }, 180);
    }

    tabs.forEach((tab) => {
      tab.addEventListener('click', function () {
        const idx = parseInt(this.getAttribute('data-scenario'), 10);
        loadScenario(idx, true);
      });
    });

    autoInterval = setInterval(() => {
      currentIdx = (currentIdx + 1) % scenarios.length;
      loadScenario(currentIdx, false);
    }, 5000);
  }

})();


