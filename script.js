(function () {
  'use strict';

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));

  /* ========================================================================
     REVELADO AL HACER SCROLL
     ======================================================================== */
  const revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !reduceMotion) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add('visible');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add('visible'));
  }

  /* ========================================================================
     CABECERA, MENÚ MÓVIL Y ANCLAS
     ======================================================================== */
  const header = document.getElementById('header');
  const onScroll = () => header && header.classList.toggle('scrolled', window.scrollY > 24);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  const burger = document.getElementById('burger-toggle');
  const nav = document.getElementById('nav-menu');
  function setMenu(open) {
    if (!burger || !nav) return;
    burger.classList.toggle('active', open);
    nav.classList.toggle('active', open);
    header.classList.toggle('menu-open', open);
    burger.setAttribute('aria-expanded', String(open));
  }
  if (burger && nav) {
    burger.addEventListener('click', () => setMenu(!nav.classList.contains('active')));
    nav.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => setMenu(false)));
  }

  const cleanUrlHash = () => {
    if (window.history && window.history.replaceState) {
      window.history.replaceState(null, null, window.location.pathname + window.location.search);
    }
  };

  // Si la página se abre con un hash antiguo pegado (ej. #procesos), desplaza y limpia la URL
  if (window.location.hash) {
    const initialTarget = document.querySelector(window.location.hash);
    if (initialTarget) {
      setTimeout(() => {
        const y = initialTarget.getBoundingClientRect().top + window.pageYOffset - 64;
        window.scrollTo({ top: y, behavior: 'smooth' });
      }, 100);
    }
    cleanUrlHash();
  }

  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href');
      if (id === '#' || id === '#top') {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: 'smooth' });
        cleanUrlHash();
        return;
      }
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      const y = target.getBoundingClientRect().top + window.pageYOffset - 64;
      window.scrollTo({ top: y, behavior: 'smooth' });
      cleanUrlHash();
    });
  });

  /* ========================================================================
     TICKER: duplicar logos para bucle continuo
     ======================================================================== */
  const track = document.getElementById('ticker-track');
  if (track) {
    Array.from(track.children).forEach((img) => {
      const clone = img.cloneNode(true);
      clone.setAttribute('aria-hidden', 'true');
      clone.alt = '';
      track.appendChild(clone);
    });
  }

  /* ========================================================================
     FAQ: solo uno abierto
     ======================================================================== */
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach((item) => {
    item.addEventListener('toggle', () => {
      if (item.open) faqItems.forEach((o) => { if (o !== item) o.open = false; });
    });
  });

  /* ========================================================================
     MODALES LEGALES
     ======================================================================== */
  const overlays = document.querySelectorAll('.modal-overlay');
  const closeModal = (m) => { m.classList.remove('active'); m.setAttribute('aria-hidden', 'true'); };
  document.querySelectorAll('.legal-btn, .legal-inline-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const m = document.getElementById(btn.dataset.modal);
      if (m) { m.classList.add('active'); m.setAttribute('aria-hidden', 'false'); }
    });
  });
  overlays.forEach((o) => {
    o.addEventListener('click', (e) => { if (e.target === o) closeModal(o); });
    const c = o.querySelector('.modal-close');
    if (c) c.addEventListener('click', () => closeModal(o));
  });
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') { overlays.forEach(closeModal); setMenu(false); }
  });

  /* ========================================================================
     HERO: CONSULTA EN DIRECTO
     ======================================================================== */
  const qf = document.getElementById('query-flow');
  if (qf) {
    const qEl = document.getElementById('qf-q');
    const timerEl = document.getElementById('qf-timer');
    const answerEl = document.getElementById('qf-answer');
    const answerText = document.getElementById('qf-answer-text');
    const answerMeta = document.getElementById('qf-answer-meta');
    const sources = {};
    qf.querySelectorAll('[data-src]').forEach((li) => { sources[li.dataset.src] = li; });

    const queries = [
      {
        q: '¿Cuánto stock queda de la válvula V-12?',
        src: [['erp', 0.4]],
        total: 1.2,
        a: '142 unidades en el almacén central. 30 están reservadas para Talleres García.',
        meta: 'Fuente: ERP · inventario'
      },
      {
        q: 'Crea una orden de reparación para la máquina 3, prioridad alta.',
        src: [['docs', 0.3], ['erp', 0.5]],
        total: 1.6,
        a: 'Orden OR-2291 creada y asignada al equipo de mantenimiento del turno de tarde.',
        meta: '<strong>Acción ejecutada</strong> · ERP · órdenes de trabajo'
      },
      {
        q: '¿Qué hago si salta la alarma de presión en la línea 3?',
        src: [['docs', 0.6]],
        total: 1.1,
        a: 'Cierra la válvula V-04 y avisa al jefe de turno (ext. 402). Registra la lectura del barómetro.',
        meta: 'Fuente: PR-SEG-L3 v4, página 14'
      },
      {
        q: 'Añade una nota al cliente Pérez: reunión el martes a las 10.',
        src: [['crm', 0.4], ['cal', 0.3]],
        total: 1.4,
        a: 'Nota añadida en el CRM y cita creada en tu calendario para el martes a las 10:00.',
        meta: '<strong>Acción ejecutada</strong> · CRM · Calendario'
      }
    ];

    const fmt = (n) => n.toFixed(1).replace('.', ',') + ' s';

    function resetSources() {
      Object.values(sources).forEach((li) => {
        li.classList.remove('active', 'done');
        li.querySelector('.qf-src-state').textContent = 'en espera';
      });
    }

    async function typeText(text) {
      qEl.textContent = '';
      for (const ch of text) {
        qEl.textContent += ch;
        await wait(ch === ' ' ? 30 : 38 + Math.random() * 30);
      }
    }

    function runTimer(totalSec) {
      const start = performance.now();
      timerEl.classList.remove('done');
      return new Promise((resolve) => {
        function frame(now) {
          const t = Math.min((now - start) / 1000, totalSec);
          timerEl.textContent = fmt(t);
          if (t < totalSec) requestAnimationFrame(frame);
          else { timerEl.classList.add('done'); resolve(); }
        }
        requestAnimationFrame(frame);
      });
    }

    async function play(item) {
      resetSources();
      answerEl.classList.remove('show');
      timerEl.textContent = fmt(0);
      timerEl.classList.remove('done');
      await typeText(item.q);
      await wait(350);

      const timer = runTimer(item.total);
      for (const [key, secs] of item.src) {
        const li = sources[key];
        li.classList.add('active');
        li.querySelector('.qf-src-state').textContent = 'consultando';
        await wait(secs * 1000);
        li.classList.remove('active');
        li.classList.add('done');
        li.querySelector('.qf-src-state').textContent = fmt(secs);
      }
      await timer;

      answerText.textContent = item.a;
      answerMeta.innerHTML = item.meta;
      answerEl.classList.add('show');
      await wait(4200);
    }

    if (reduceMotion) {
      const item = queries[0];
      qEl.textContent = item.q;
      sources.erp.classList.add('done');
      sources.erp.querySelector('.qf-src-state').textContent = fmt(0.4);
      timerEl.textContent = fmt(item.total);
      answerText.textContent = item.a;
      answerMeta.innerHTML = item.meta;
      answerEl.classList.add('show');
    } else {
      (async function loop() {
        let i = 0;
        // pequeña espera para que se vea la entrada del hero
        await wait(600);
        while (true) {
          await play(queries[i % queries.length]);
          i++;
        }
      })();
    }
  }

  /* ========================================================================
     DEMO INTERACTIVA
     ======================================================================== */
  const stream = document.getElementById('app-stream');
  if (stream) {
    const titleEl = document.getElementById('app-title');
    const tabs = Array.from(document.querySelectorAll('.demo-tab'));
    const AUTOPLAY_MS = 8000;

    const scenarios = {
      odoo: {
        title: 'Consulta ERP',
        system: 'ERP',
        user: '¿Cómo va el pedido de Talleres García? ¿Tenemos válvulas suficientes?',
        text: 'El pedido está en tránsito y hay stock de sobra. Te dejo el detalle:',
        card: 'Pedido PV-1187', badge: 'ERP',
        rows: [
          ['Cliente', 'Talleres García S.L.'],
          ['Estado', 'En tránsito, entrega mañana a las 10:30'],
          ['Stock válvula V-12', '142 unidades disponibles']
        ],
        actions: [['Ver albarán', true], ['Avisar a almacén', false]],
        sources: 'ERP · inventario, pedidos de venta'
      },
      outlook: {
        title: 'Agendar cita',
        system: 'Email / Calendario',
        user: 'Agéndame una reunión con Alberto el martes a las 16:00',
        text: 'He preparado la cita en el calendario. Revísala y confírmala:',
        card: 'Cita en calendario', badge: 'Email / Calendario',
        rows: [
          ['Asunto', 'Reunión con Alberto'],
          ['Cuándo', 'Martes 20 de octubre, 16:00 – 17:00'],
          ['Asistentes', 'alberto@empresa.com']
        ],
        actions: [['Confirmar', true], ['Cambiar hora', false]],
        sources: 'Calendario corporativo'
      },
      hubspot: {
        title: 'Facturación del mes',
        system: 'CRM',
        user: '¿Cuánto hemos facturado este mes y qué oportunidades hay abiertas?',
        text: 'Este mes vais por encima del objetivo. Resumen:',
        card: 'Resumen comercial', badge: 'CRM',
        rows: [
          ['Facturación', '148.500 € (+12 % vs. mes anterior)'],
          ['Previsión', '172.000 € al cierre'],
          ['Oportunidades', 'Grupo Industriales 18.500 € · Automoción 12.000 €']
        ],
        actions: [['Descargar informe', true], ['Ver por comercial', false]],
        sources: 'CRM · ventas y oportunidades'
      },
      iso: {
        title: 'Protocolo de seguridad',
        system: 'Documentos',
        user: '¿Qué protocolo sigo si salta la alarma de presión en la línea 3?',
        text: 'Lo he encontrado en el manual de seguridad de planta:',
        card: 'Protocolo PR-SEG-L3', badge: 'Documentos',
        rows: [
          ['Paso 1', 'Accionar la válvula manual V-04'],
          ['Paso 2', 'Avisar al responsable de turno (ext. 402)'],
          ['Paso 3', 'Registrar la lectura del barómetro']
        ],
        actions: [['Abrir PDF', true], ['Registrar incidencia', false]],
        sources: 'PR-SEG-2026-L3 v4.pdf, página 14'
      }
    };

    // barra de progreso en cada pestaña
    tabs.forEach((t) => {
      const bar = document.createElement('span');
      bar.className = 'demo-progress';
      t.appendChild(bar);
      t.style.setProperty('--dur', AUTOPLAY_MS + 'ms');
    });

    let runId = 0;
    let autoplay = !reduceMotion;
    let autoTimer = null;

    const esc = (s) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

    function botHTML(sc) {
      const rows = sc.rows.map(([k, v]) => `<div class="result-row"><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join('');
      const acts = sc.actions.map(([t, p]) => `<button type="button" class="${p ? 'primary' : ''}">${esc(t)}</button>`).join('');
      return `
        <div class="msg-bot">
          <img src="assets/logo.jpg" alt="">
          <div class="msg-bot-body">
            <p class="msg-bot-text">${esc(sc.text)}</p>
            <div class="result-card">
              <div class="result-head">${esc(sc.card)}<span>${esc(sc.badge)}</span></div>
              <dl class="result-rows">${rows}</dl>
              <div class="result-actions">${acts}</div>
            </div>
            <p class="msg-sources">Fuentes: ${esc(sc.sources)}</p>
          </div>
        </div>`;
    }

    async function show(key) {
      const sc = scenarios[key];
      if (!sc) return;
      const id = ++runId;

      tabs.forEach((t) => {
        const on = t.dataset.scenario === key;
        t.classList.toggle('active', on);
        t.setAttribute('aria-selected', String(on));
        t.classList.remove('autoplay');
      });
      titleEl.textContent = sc.title;

      stream.innerHTML = `<div class="msg-user">${esc(sc.user)}</div>`;
      if (!reduceMotion) {
        await wait(450);
        if (id !== runId) return;
        stream.insertAdjacentHTML('beforeend',
          `<div class="thinking"><img src="assets/logo.jpg" alt=""><span>Consultando ${esc(sc.system)}</span><span class="thinking-bar"></span></div>`);
        await wait(1100);
        if (id !== runId) return;
        stream.querySelector('.thinking')?.remove();
      }
      stream.insertAdjacentHTML('beforeend', botHTML(sc));

      if (autoplay) {
        const active = tabs.find((t) => t.dataset.scenario === key);
        void active.offsetWidth; // reinicia la animación
        active.classList.add('autoplay');
        clearTimeout(autoTimer);
        autoTimer = setTimeout(() => {
          const idx = tabs.indexOf(active);
          show(tabs[(idx + 1) % tabs.length].dataset.scenario);
        }, AUTOPLAY_MS);
      }
    }

    tabs.forEach((t) => t.addEventListener('click', () => {
      autoplay = false; // el usuario toma el control
      clearTimeout(autoTimer);
      show(t.dataset.scenario);
    }));

    // arrancar cuando la demo entra en pantalla
    const demo = document.getElementById('demo');
    let started = false;
    const start = () => { if (!started) { started = true; show('odoo'); } };
    if ('IntersectionObserver' in window) {
      const dio = new IntersectionObserver((en) => {
        if (en[0].isIntersecting) { start(); dio.disconnect(); }
      }, { threshold: 0.3 });
      dio.observe(demo);
    } else {
      start();
    }
  }

  /* ========================================================================
     FORMULARIO DE DIAGNÓSTICO OPERATIVO (Resend / API)
     ======================================================================== */
  const form = document.getElementById('diagnostic-form');
  const formSuccess = document.getElementById('form-success');
  const formStatus = document.getElementById('form-status');
  const submitBtn = document.getElementById('diag-submit');
  const resetBtn = document.getElementById('btn-reset-form');
  const successCompany = document.getElementById('success-company');

  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (formStatus) {
        formStatus.className = 'form-status';
        formStatus.textContent = '';
      }

      const name = form.name ? form.name.value.trim() : '';
      const company = form.company ? form.company.value.trim() : '';
      const email = form.email ? form.email.value.trim() : '';
      const phone = form.phone ? form.phone.value.trim() : '';
      const privacy = form.privacy ? form.privacy.checked : false;

      if (!name || !company || !email) {
        if (formStatus) {
          formStatus.className = 'form-status error';
          formStatus.textContent = 'Por favor, completa los campos requeridos (*).';
        }
        return;
      }

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        if (formStatus) {
          formStatus.className = 'form-status error';
          formStatus.textContent = 'Por favor, introduce un correo electrónico válido.';
        }
        return;
      }

      if (!privacy) {
        if (formStatus) {
          formStatus.className = 'form-status error';
          formStatus.textContent = 'Debes aceptar la política de privacidad para solicitar el diagnóstico.';
        }
        return;
      }

      const tools = Array.from(form.querySelectorAll('input[name="tools"]:checked')).map((c) => c.value);
      const bottlenecks = form.bottlenecks ? form.bottlenecks.value.trim() : '';

      if (submitBtn) {
        submitBtn.classList.add('loading');
        submitBtn.disabled = true;
      }

      try {
        const payload = { name, company, email, phone, tools, bottlenecks };
        let ok = false;

        try {
          const res = await fetch('/api/diagnostic', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });
          const data = await res.json();
          if (res.ok && data.success) {
            ok = true;
          } else {
            throw new Error(data.error || 'Error al procesar la solicitud');
          }
        } catch (fetchErr) {
          // Si estamos en entorno de desarrollo local Vite donde /api/diagnostic no está montado como serverless
          if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            console.log('Modo local/dev: Solicitud simulada con éxito para Resend:', payload);
            await wait(600); // feedback visual de envío
            ok = true;
          } else {
            throw fetchErr;
          }
        }

        if (ok) {
          form.reset();
          form.style.display = 'none';
          if (successCompany) successCompany.textContent = company;
          if (formSuccess) formSuccess.hidden = false;
        }
      } catch (err) {
        if (formStatus) {
          formStatus.className = 'form-status error';
          formStatus.textContent = err.message || 'Hubo un error al enviar el formulario. Inténtalo de nuevo o escríbenos a contacto@desklyy.com';
        }
      } finally {
        if (submitBtn) {
          submitBtn.classList.remove('loading');
          submitBtn.disabled = false;
        }
      }
    });

    if (resetBtn && formSuccess) {
      resetBtn.addEventListener('click', () => {
        formSuccess.hidden = true;
        form.style.display = '';
        if (formStatus) {
          formStatus.className = 'form-status';
          formStatus.textContent = '';
        }
      });
    }
  }

  /* ========================================================================
     INDICADORES DE SCROLL LATERAL IMPLÍCITOS (Arquitectura y Comparativa)
     ======================================================================== */
  const setupHorizontalScrollCue = (wrapSelector, scrollElSelector) => {
    const wrap = document.querySelector(wrapSelector);
    const scroller = scrollElSelector ? document.querySelector(scrollElSelector) : wrap;
    if (!wrap || !scroller) return;

    const updateCue = () => {
      const isEnd = scroller.scrollLeft + scroller.clientWidth >= scroller.scrollWidth - 12;
      wrap.classList.toggle('scrolled-end', isEnd);
    };

    scroller.addEventListener('scroll', updateCue, { passive: true });
    window.addEventListener('resize', updateCue, { passive: true });
    updateCue();
  };

  setupHorizontalScrollCue('.arch-wrap', '#arch-scroll');
  setupHorizontalScrollCue('.table-wrap');
})();

