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
  // RÉPLICA INTERACTIVA DE LA APLICACIÓN REAL DE DESKLY
  // ==========================================================================
  const appContainer = document.getElementById('deskly-real-app');
  if (appContainer) {
    const convTitleEl = document.getElementById('deskly-conv-title');
    const viewViewport = document.getElementById('deskly-view-viewport');
    const infoBodyEl = document.getElementById('deskly-info-body');
    const infoPanel = document.getElementById('deskly-info-panel');
    const toggleInfoBtn = document.getElementById('btn-toggle-info-panel');
    const closeInfoBtn = document.getElementById('btn-close-info-panel');
    const sidebarEl = document.getElementById('deskly-sidebar');
    const toggleSidebarBtn = document.getElementById('sidebar-toggle-btn');
    const scenarioTabs = document.querySelectorAll('.scenario-nav-tab');
    const sidebarNavBtns = document.querySelectorAll('.sidebar-nav-btn, .btn-new-chat');

    const appScenarios = {
      home: {
        title: 'Nueva conversación',
        type: 'home',
        rightPanelHTML: `
          <div class="info-block">
            <div class="info-block-title">CONVERSACIÓN</div>
            <div class="info-block-item"><span>Estado:</span> <span class="info-block-badge">Nueva sesión</span></div>
            <div class="info-block-item"><span>Iniciada:</span> <strong>Ahora</strong></div>
          </div>
          <div class="info-block">
            <div class="info-block-title">CONEXIONES ACTIVAS</div>
            <div class="info-block-item"><span class="badge-dot" style="width:6px;height:6px;background:#27C93F;border-radius:50%;display:inline-block;"></span> Odoo ERP</div>
            <div class="info-block-item"><span class="badge-dot" style="width:6px;height:6px;background:#27C93F;border-radius:50%;display:inline-block;"></span> HubSpot CRM</div>
            <div class="info-block-item"><span class="badge-dot" style="width:6px;height:6px;background:#27C93F;border-radius:50%;display:inline-block;"></span> Outlook Calendario</div>
            <div class="info-block-item"><span class="badge-dot" style="width:6px;height:6px;background:#27C93F;border-radius:50%;display:inline-block;"></span> Servidor RAG Local</div>
          </div>
          <div class="info-block">
            <div class="info-block-title">MODO DE OPERACIÓN</div>
            <div class="info-block-item">Lectura y ejecución directa sin almacenamiento en nubes públicas de terceros.</div>
          </div>
        `
      },
      outlook: {
        title: 'Reunión con Alberto el martes a las 16:00',
        type: 'chat',
        userText: 'agendame una reunion cn alberto para el martes a las 16',
        assistantText: 'He preparado la reunión con Alberto para el martes 20 de octubre, de 16:00 a 17:00. Revísala y confírmala en la tarjeta.',
        cardTitle: 'Reunión preparada',
        cardBadge: 'Outlook',
        cardRows: [
          { label: 'Asunto:', val: 'Reunión con Alberto' },
          { label: 'Cuándo:', val: 'martes, 20 de octubre de 2026, 16:00 – 17:00' },
          { label: 'Asistentes:', val: 'alberto@desklyy.com' }
        ],
        cardStatusNote: 'Descartado: no se ha hecho nada en el calendario aún.',
        cardActions: [
          { text: 'Confirmar en Outlook', primary: true },
          { text: 'Modificar horario', primary: false }
        ],
        sources: ['Outlook · agenda', 'Outlook · preparar evento'],
        suggestions: [
          '¿Puedes añadir un tema a la reunión?',
          '¿Quieres que la prepare por Microsoft Teams?'
        ],
        rightPanelHTML: `
          <div class="info-block">
            <div class="info-block-title">CONVERSACIÓN</div>
            <div class="info-block-item"><span>Preguntas:</span> <strong>1</strong></div>
            <div class="info-block-item"><span>Empezada:</span> <strong>15 oct 2026</strong></div>
          </div>
          <div class="info-block">
            <div class="info-block-title">DOCUMENTOS CITADOS</div>
            <div class="info-block-item" style="color:#94A3B8;">Ninguno</div>
          </div>
          <div class="info-block">
            <div class="info-block-title">HERRAMIENTAS USADAS</div>
            <div class="info-block-item"><span class="info-block-badge">Outlook · agenda</span></div>
            <div class="info-block-item"><span class="info-block-badge">Outlook · preparar evento</span></div>
          </div>
          <div class="info-block">
            <div class="info-block-title">ACCIONES PREPARADAS</div>
            <div class="info-block-item">Reunión con Alberto (preparada)</div>
          </div>
        `
      },
      odoo: {
        title: 'Consulta ERP (Odoo)',
        type: 'chat',
        userText: '¿Cuál es el estado del pedido de Talleres García y el stock de válvulas en almacén?',
        assistantText: 'He consultado el inventario y el pedido en curso de Talleres García en Odoo ERP:',
        cardTitle: 'Consulta Odoo ERP',
        cardBadge: 'Odoo ERP',
        cardRows: [
          { label: 'Cliente:', val: 'Talleres García S.L.' },
          { label: 'Estado del pedido:', val: 'En tránsito (entrega estimada: mañana 10:30h)' },
          { label: 'Stock en almacén:', val: '142 unidades de válvula titanio disponibles' }
        ],
        cardStatusNote: 'Albarán verificado con firma de almacén.',
        cardActions: [
          { text: 'Ver albarán en PDF', primary: true },
          { text: 'Notificar a almacén', primary: false }
        ],
        sources: ['Odoo · inventario', 'Odoo · pedidos_venta'],
        suggestions: [
          '¿Reservar más unidades para Talleres García?',
          '¿Enviar aviso con el tracking de entrega?'
        ],
        rightPanelHTML: `
          <div class="info-block">
            <div class="info-block-title">CONVERSACIÓN</div>
            <div class="info-block-item"><span>Preguntas:</span> <strong>1</strong></div>
            <div class="info-block-item"><span>Empezada:</span> <strong>Hoy 11:42</strong></div>
          </div>
          <div class="info-block">
            <div class="info-block-title">HERRAMIENTAS USADAS</div>
            <div class="info-block-item"><span class="info-block-badge">Odoo · inventario</span></div>
            <div class="info-block-item"><span class="info-block-badge">Odoo · pedidos_venta</span></div>
          </div>
          <div class="info-block">
            <div class="info-block-title">ACCIONES EJECUTADAS</div>
            <div class="info-block-item">Consulta de stock (0.19s)</div>
            <div class="info-block-item">Sincronización de albarán</div>
          </div>
        `
      },
      hubspot: {
        title: 'Pipeline CRM (HubSpot)',
        type: 'chat',
        userText: '¿Cuál ha sido la facturación de este mes y qué oportunidades clave tenemos en HubSpot?',
        assistantText: 'He analizado las cuentas activas en HubSpot CRM y la facturación en contabilidad:',
        cardTitle: 'Pipeline Comercial HubSpot',
        cardBadge: 'HubSpot CRM',
        cardRows: [
          { label: 'Facturación:', val: '148.500 € (+12% vs mes anterior, objetivo cumplido)' },
          { label: 'Previsión:', val: '172.000 € proyectados para el próximo cierre' },
          { label: 'Oportunidades:', val: 'Grupo Industriales (18.500 €) · Renovaciones (9.000 €) · Automoción (12.000 €)' }
        ],
        cardStatusNote: 'Datos consolidados con dirección comercial y servidor local.',
        cardActions: [
          { text: 'Descargar informe en PDF', primary: true },
          { text: 'Ver desglose por comercial', primary: false }
        ],
        sources: ['HubSpot · deals', 'HubSpot · contactos', 'ERP · Contabilidad'],
        suggestions: [
          '¿Preparo borrador de seguimiento para Grupo Industriales?',
          '¿Ver desglose de cobros pendientes de vencimiento?'
        ],
        rightPanelHTML: `
          <div class="info-block">
            <div class="info-block-title">CONVERSACIÓN</div>
            <div class="info-block-item"><span>Preguntas:</span> <strong>1</strong></div>
            <div class="info-block-item"><span>Empezada:</span> <strong>Ayer</strong></div>
          </div>
          <div class="info-block">
            <div class="info-block-title">HERRAMIENTAS USADAS</div>
            <div class="info-block-item"><span class="info-block-badge">HubSpot · deals</span></div>
            <div class="info-block-item"><span class="info-block-badge">HubSpot · contactos</span></div>
            <div class="info-block-item"><span class="info-block-badge">ERP · Finanzas</span></div>
          </div>
          <div class="info-block">
            <div class="info-block-title">ACCIONES EJECUTADAS</div>
            <div class="info-block-item">Consolidación de ingresos Q3</div>
          </div>
        `
      },
      iso: {
        title: 'Protocolos & Normativa ISO',
        type: 'chat',
        userText: '¿Qué protocolo seguir si salta la alarma de presión en línea 3?',
        assistantText: 'Localizado en el repositorio documental corporativo (ISO 9001):',
        cardTitle: 'Protocolo de Seguridad ISO 9001',
        cardBadge: 'Manuales RAG',
        cardRows: [
          { label: 'Documento:', val: 'PR-SEG-2026-L3_v4.pdf (pág. 14, art. 8.2)' },
          { label: 'Paso 1:', val: 'Accionar válvula manual de despresurización V-04' },
          { label: 'Paso 2:', val: 'Notificar al responsable de turno (ext. 402)' },
          { label: 'Paso 3:', val: 'Registrar la lectura del barómetro digital' }
        ],
        cardStatusNote: 'Revisión V4 aprobada por dirección de planta y prevención de riesgos.',
        cardActions: [
          { text: 'Ver procedimiento en PDF', primary: true },
          { text: 'Registrar aviso', primary: false }
        ],
        sources: ['Servidor RAG Local', 'PR-SEG-2026-L3_v4.pdf'],
        suggestions: [
          '¿Registro la incidencia automáticamente en el sistema?',
          '¿Ver contactos de emergencia del turno de noche?'
        ],
        rightPanelHTML: `
          <div class="info-block">
            <div class="info-block-title">CONVERSACIÓN</div>
            <div class="info-block-item"><span>Preguntas:</span> <strong>1</strong></div>
            <div class="info-block-item"><span>Empezada:</span> <strong>18 oct 2026</strong></div>
          </div>
          <div class="info-block">
            <div class="info-block-title">DOCUMENTOS CITADOS</div>
            <div class="info-block-item"><strong>PR-SEG-2026-L3_v4.pdf</strong> (pág. 14)</div>
          </div>
          <div class="info-block">
            <div class="info-block-title">HERRAMIENTAS USADAS</div>
            <div class="info-block-item"><span class="info-block-badge">Motor RAG · Búsqueda Vectorial</span></div>
          </div>
          <div class="info-block">
            <div class="info-block-title">ACCIONES DISPONIBLES</div>
            <div class="info-block-item">Registro directo de aviso</div>
          </div>
        `
      }
    };

    function renderHomeView() {
      return `
        <div class="app-home-view">
          <div class="home-center-hero">
            <div class="home-logo-wrap">
              <img src="assets/logo.jpg" alt="Deskly Logo" class="home-logo-img">
            </div>
            <h1 class="home-hero-title">Buenas tardes, Noé.</h1>
            <h2 class="home-hero-subtitle">¿Qué necesitas encontrar?</h2>

            <div class="home-search-container">
              <div class="consult-tag-row">
                <span class="consult-label">Consultará también:</span>
                <span class="system-pill">Odoo <button type="button" class="pill-remove">×</button></span>
                <span class="system-pill">HubSpot <button type="button" class="pill-remove">×</button></span>
                <span class="system-pill">Outlook <button type="button" class="pill-remove">×</button></span>
                <span class="system-pill">Internet <button type="button" class="pill-remove">×</button></span>
              </div>

              <div class="home-input-prompt">
                <span class="home-input-placeholder">Pregunta lo que necesites...</span>
              </div>

              <div class="home-search-toolbar">
                <div class="toolbar-left">
                  <button class="tool-btn" title="Adjuntar archivo">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"></path></svg>
                  </button>
                  <button class="tool-btn-text">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>
                    <span>Plantillas</span>
                  </button>
                </div>
                <div class="toolbar-right">
                  <button class="tool-btn-pill">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path></svg>
                    <span>Herramientas ∨</span>
                  </button>
                  <button class="tool-btn-pill">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>
                    <span>Internet</span>
                  </button>
                  <button class="tool-btn-send" title="Enviar">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="19" x2="12" y2="5"></line><polyline points="5 12 12 5 19 12"></polyline></svg>
                  </button>
                </div>
              </div>
            </div>

            <div class="home-quick-questions-grid">
              <button class="quick-question-card" data-scenario="iso">
                <span>¿Cuántos días de vacaciones tengo al año?</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="7" y1="17" x2="17" y2="7"></line><polyline points="7 7 17 7 17 17"></polyline></svg>
              </button>
              <button class="quick-question-card" data-scenario="outlook">
                <span>¿Cómo pido un permiso o una baja?</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="7" y1="17" x2="17" y2="7"></line><polyline points="7 7 17 7 17 17"></polyline></svg>
              </button>
              <button class="quick-question-card" data-scenario="iso">
                <span>¿Qué documentos hay sobre prevención de riesgos?</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="7" y1="17" x2="17" y2="7"></line><polyline points="7 7 17 7 17 17"></polyline></svg>
              </button>
              <button class="quick-question-card" data-scenario="hubspot">
                <span>Resúmeme la política de gastos y dietas</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="7" y1="17" x2="17" y2="7"></line><polyline points="7 7 17 7 17 17"></polyline></svg>
              </button>
            </div>

            <div class="home-tip-note">
              <span>Pon las preguntas de tu empresa para que tu equipo sepa por dónde empezar</span>
            </div>

            <div class="home-templates-section">
              <h3 class="templates-heading">Plantillas frecuentes</h3>
              <div class="templates-grid">
                <div class="template-card" data-scenario="iso">
                  <div class="template-icon">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>
                  </div>
                  <div class="template-title">Resumir documento</div>
                  <div class="template-desc">Adjunta el archivo o nombra uno interno</div>
                </div>
                <div class="template-card" data-scenario="hubspot">
                  <div class="template-icon">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                  </div>
                  <div class="template-title">Redactar correo</div>
                  <div class="template-desc">A partir de unas notas rápidas</div>
                </div>
                <div class="template-card" data-scenario="odoo">
                  <div class="template-icon">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>
                  </div>
                  <div class="template-title">Comparar datos</div>
                  <div class="template-desc">Contrasta pedidos con stock vivo</div>
                </div>
                <div class="template-card" data-scenario="outlook">
                  <div class="template-icon">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                  </div>
                  <div class="template-title">Resumen de semana</div>
                  <div class="template-desc">Sincronizado con tu calendario Outlook</div>
                </div>
                <div class="template-card" data-scenario="outlook">
                  <div class="template-icon">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path><rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect></svg>
                  </div>
                  <div class="template-title">Acta de reunión</div>
                  <div class="template-desc">Convierte notas en acta ejecutiva</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      `;
    }

    function renderChatView(sc) {
      const rowsHTML = sc.cardRows.map(r => `
        <div class="card-detail-row">
          <span class="card-detail-label">${r.label}</span>
          <span class="card-detail-val">${r.val}</span>
        </div>
      `).join('');

      const actionsHTML = sc.cardActions.map(a => `
        <button class="btn-card-action ${a.primary ? 'primary' : ''}">${a.text}</button>
      `).join('');

      const sourcesHTML = sc.sources.map(s => `
        <span class="source-badge">${s}</span>
      `).join('');

      const suggestionsHTML = sc.suggestions.map(sg => `
        <button class="suggestion-chip" type="button">↳ ${sg}</button>
      `).join('');

      return `
        <div class="app-chat-stream">
          <div class="chat-message-row user-row">
            <div class="user-bubble">
              ${sc.userText}
            </div>
          </div>

          <div class="chat-message-row assistant-row">
            <div class="assistant-avatar">
              <img src="assets/logo.jpg" alt="Deskly">
            </div>
            <div class="assistant-content">
              <p class="assistant-text">${sc.assistantText}</p>
              
              <div class="structured-app-card">
                <div class="card-top">
                  <div class="card-header-left">
                    <span>${sc.cardTitle}</span>
                  </div>
                  <span class="card-service-tag">${sc.cardBadge}</span>
                </div>
                <div class="card-body-content">
                  ${rowsHTML}
                  <div class="card-status-note">${sc.cardStatusNote}</div>
                </div>
                <div class="card-action-bar">
                  ${actionsHTML}
                </div>
              </div>

              <div class="chat-sources-row">
                <span class="sources-label">Fuentes:</span>
                ${sourcesHTML}
              </div>

              <div class="chat-suggestions-row">
                ${suggestionsHTML}
              </div>

              <div class="chat-feedback-row">
                <button class="feedback-icon" title="Copiar"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg></button>
                <button class="feedback-icon" title="Me gusta"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path></svg></button>
                <button class="feedback-icon" title="No me gusta"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3zm7-13h3a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2h-3"></path></svg></button>
              </div>
            </div>
          </div>

          <div class="chat-fixed-input-container">
            <div class="home-search-container">
              <div class="consult-tag-row">
                <span class="consult-label">Consultará también:</span>
                <span class="system-pill">Odoo <button type="button" class="pill-remove">×</button></span>
                <span class="system-pill">HubSpot <button type="button" class="pill-remove">×</button></span>
                <span class="system-pill">Outlook <button type="button" class="pill-remove">×</button></span>
                <span class="system-pill">Internet <button type="button" class="pill-remove">×</button></span>
              </div>
              <div class="home-input-prompt">
                <span class="home-input-placeholder">Pregunta lo que necesites...</span>
              </div>
              <div class="home-search-toolbar">
                <div class="toolbar-left">
                  <button class="tool-btn"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"></path></svg></button>
                  <button class="tool-btn-text"><span>Plantillas</span></button>
                </div>
                <div class="toolbar-right">
                  <button class="tool-btn-pill"><span>Herramientas ∨</span></button>
                  <button class="tool-btn-pill"><span>Internet</span></button>
                  <button class="tool-btn-send"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="19" x2="12" y2="5"></line><polyline points="5 12 12 5 19 12"></polyline></svg></button>
                </div>
              </div>
            </div>
            <div class="chat-disclaimer">Deskly es una inteligencia artificial y puede equivocarse. Comprueba lo importante en la fuente citada.</div>
          </div>
        </div>
      `;
    }

    function switchScenario(key) {
      const sc = appScenarios[key] || appScenarios.home;

      if (convTitleEl) {
        convTitleEl.textContent = sc.title;
      }

      if (viewViewport) {
        if (sc.type === 'home') {
          viewViewport.innerHTML = renderHomeView();
        } else {
          viewViewport.innerHTML = renderChatView(sc);
        }
      }

      if (infoBodyEl) {
        infoBodyEl.innerHTML = sc.rightPanelHTML;
      }

      scenarioTabs.forEach(tab => {
        const isCurrent = tab.getAttribute('data-scenario') === key;
        tab.classList.toggle('active', isCurrent);
        tab.setAttribute('aria-selected', isCurrent ? 'true' : 'false');
      });

      sidebarNavBtns.forEach(item => {
        const itemKey = item.getAttribute('data-scenario');
        item.classList.toggle('active', itemKey === key);
      });
    }

    // Tabs de navegación superior
    scenarioTabs.forEach(tab => {
      tab.addEventListener('click', function () {
        const scKey = this.getAttribute('data-scenario');
        switchScenario(scKey);
      });
    });

    // Botones de la barra lateral
    sidebarNavBtns.forEach(item => {
      item.addEventListener('click', function () {
        const scKey = this.getAttribute('data-scenario');
        if (scKey) {
          switchScenario(scKey);
        }
      });
    });

    // Clicks en preguntas rápidas o plantillas
    if (viewViewport) {
      viewViewport.addEventListener('click', function (e) {
        const clickable = e.target.closest('[data-scenario]');
        if (clickable) {
          const scKey = clickable.getAttribute('data-scenario');
          if (scKey && appScenarios[scKey]) {
            switchScenario(scKey);
          }
        }
      });
    }

    // Toggle panel derecho
    if (toggleInfoBtn && infoPanel) {
      toggleInfoBtn.addEventListener('click', function () {
        infoPanel.classList.toggle('hidden');
      });
    }
    if (closeInfoBtn && infoPanel) {
      closeInfoBtn.addEventListener('click', function () {
        infoPanel.classList.add('hidden');
      });
    }

    // Toggle barra lateral
    if (toggleSidebarBtn && sidebarEl) {
      toggleSidebarBtn.addEventListener('click', function () {
        sidebarEl.classList.toggle('collapsed');
      });
    }

    // Iniciar con la vista de reunión
    switchScenario('outlook');
  }

})();


