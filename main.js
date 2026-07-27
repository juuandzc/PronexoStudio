'use strict';

/* ============================================================
   CONFIG — sustituye estos valores antes de publicar
   ============================================================ */
const CONFIG = {
  // 1) Crea un formulario gratis en https://formspree.io, copia su ID
  //    y sustitúyelo aquí. Se usa tanto para el formulario de contacto
  //    como para el diagnóstico gratuito y el lead del chatbot demo.
  FORMSPREE_ENDPOINT: 'https://formspree.io/f/maqrazlp',

  // 2) Analytics — deja vacío para no cargar nada. Rellena para activar.
  GA_MEASUREMENT_ID: '',   // ej: 'G-XXXXXXXXXX'
  META_PIXEL_ID: '',       // ej: '1234567890123456'
};

/* ============================================================
   ANALYTICS LOADER (solo se activa si se rellena un ID arriba)
   ============================================================ */
(function loadAnalytics() {
  if (CONFIG.GA_MEASUREMENT_ID) {
    const s = document.createElement('script');
    s.async = true;
    s.src = `https://www.googletagmanager.com/gtag/js?id=${CONFIG.GA_MEASUREMENT_ID}`;
    document.head.appendChild(s);
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { dataLayer.push(arguments); };
    gtag('js', new Date());
    gtag('config', CONFIG.GA_MEASUREMENT_ID);
  }
  if (CONFIG.META_PIXEL_ID) {
    /* Pegar aquí el snippet oficial de Meta Pixel usando CONFIG.META_PIXEL_ID
       cuando esté disponible. Se deja fuera por defecto para no cargar
       scripts de terceros sin consentimiento activo. */
  }
})();

document.addEventListener('DOMContentLoaded', () => {
  initProgressBar();
  initHeader();
  initMobileNav();
  initReveal();
  initFaq();
  initContactForm();
  initLeadMagnet();
  initChatbot();
  initExitIntent();
  initSmoothAnchors();
});

/* ============================================================
   PROGRESS BAR
   ============================================================ */
function initProgressBar() {
  const bar = document.getElementById('progress-bar');
  if (!bar) return;
  window.addEventListener('scroll', () => {
    const h = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.width = (h > 0 ? (window.scrollY / h) * 100 : 0) + '%';
  }, { passive: true });
}

/* ============================================================
   HEADER — sticky state
   ============================================================ */
function initHeader() {
  const header = document.getElementById('site-header');
  if (!header) return;
  const toggle = () => header.classList.toggle('scrolled', window.scrollY > 40);
  toggle();
  window.addEventListener('scroll', toggle, { passive: true });
}

/* ============================================================
   MOBILE NAV — menú hamburguesa
   ============================================================ */
function initMobileNav() {
  const toggle = document.getElementById('nav-toggle');
  const panel = document.getElementById('mobile-nav');
  const icon = document.getElementById('nav-toggle-icon');
  if (!toggle || !panel) return;

  function setOpen(open) {
    panel.classList.toggle('open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
    if (icon) icon.setAttribute('href', open ? '#icon-x' : '#icon-menu');
    document.body.classList.toggle('no-scroll', open);
  }

  toggle.addEventListener('click', () => setOpen(!panel.classList.contains('open')));
  panel.querySelectorAll('a').forEach(a => a.addEventListener('click', () => setOpen(false)));
  document.addEventListener('keydown', e => { if (e.key === 'Escape') setOpen(false); });
  window.addEventListener('resize', () => { if (window.innerWidth > 760) setOpen(false); });
}

/* ============================================================
   SMOOTH ANCHOR SCROLL (respects header offset)
   ============================================================ */
function initSmoothAnchors() {
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const id = a.getAttribute('href').slice(1);
      const target = document.getElementById(id);
      if (!target) return;
      e.preventDefault();
      const y = target.getBoundingClientRect().top + window.scrollY - 84;
      window.scrollTo({ top: y, behavior: 'smooth' });
      if (id === 'chatbot-demo') {
        const input = document.getElementById('chat-input');
        if (input) setTimeout(() => input.focus({ preventScroll: true }), 550);
      }
    });
  });
}

/* ============================================================
   SCROLL REVEAL
   ============================================================ */
function initReveal() {
  const items = document.querySelectorAll('.reveal');
  if (!('IntersectionObserver' in window) || !items.length) {
    items.forEach(el => el.classList.add('in'));
    return;
  }
  const obs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in');
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: .12, rootMargin: '0px 0px -60px 0px' });
  items.forEach(el => obs.observe(el));
}

/* ============================================================
   FAQ ACCORDION
   ============================================================ */
function initFaq() {
  document.querySelectorAll('.faq-item').forEach(item => {
    const btn = item.querySelector('.faq-q');
    const answer = item.querySelector('.faq-a');
    if (!btn || !answer) return;
    btn.addEventListener('click', () => {
      const isOpen = item.getAttribute('aria-expanded') === 'true';
      document.querySelectorAll('.faq-item').forEach(other => {
        other.setAttribute('aria-expanded', 'false');
        other.querySelector('.faq-a').style.maxHeight = null;
      });
      if (!isOpen) {
        item.setAttribute('aria-expanded', 'true');
        answer.style.maxHeight = answer.scrollHeight + 'px';
      }
    });
  });
}

/* ============================================================
   VALIDATION HELPERS
   ============================================================ */
function isValidEmail(v) {
  return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(v.trim());
}
function isValidName(v) {
  return v.trim().length >= 2 && v.trim().length <= 100 && !/[<>{}]/.test(v);
}
function sanitize(v) {
  return String(v).replace(/[<>]/g, '').trim().slice(0, 600);
}
function setFieldError(field, message) {
  const wrap = field.closest('.field');
  if (!wrap) return;
  const err = wrap.querySelector('.field-error');
  wrap.classList.toggle('has-error', !!message);
  if (err) err.textContent = message || '';
}

async function postToFormspree(payload) {
  if (CONFIG.FORMSPREE_ENDPOINT.includes('TU_FORM_ID')) {
    // Formspree aún no configurado: simulamos éxito para no romper la demo,
    // pero avisamos en consola para que se recuerde configurarlo.
    console.warn('[Pronexo Studio] Formspree no configurado. Ver CONFIG.FORMSPREE_ENDPOINT en main.js.');
    return { ok: true, simulated: true };
  }
  const res = await fetch(CONFIG.FORMSPREE_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify(payload),
  });
  return { ok: res.ok, simulated: false };
}

/* ============================================================
   CONTACT FORM (CTA final)
   ============================================================ */
function initContactForm() {
  const form = document.getElementById('contact-form');
  if (!form) return;
  const status = document.getElementById('contact-status');
  let lastSubmit = 0;
  let submitting = false;

  form.addEventListener('submit', async e => {
    e.preventDefault();
    if (submitting) return;
    if (Date.now() - lastSubmit < 12000) {
      showStatus(status, 'error', 'Espera unos segundos antes de volver a enviar.');
      return;
    }

    const nameEl = document.getElementById('contact-name');
    const emailEl = document.getElementById('contact-email');
    const needEl = document.getElementById('contact-need');
    const msgEl = document.getElementById('contact-message');
    const honeypot = document.getElementById('contact-honeypot');

    [nameEl, emailEl, needEl].forEach(f => setFieldError(f, ''));

    if (honeypot && honeypot.value !== '') return; // bot trap

    let valid = true;
    if (!isValidName(nameEl.value)) { setFieldError(nameEl, 'Introduce tu nombre (2-100 caracteres).'); valid = false; }
    if (!isValidEmail(emailEl.value)) { setFieldError(emailEl, 'Introduce un email válido.'); valid = false; }
    if (!needEl.value) { setFieldError(needEl, 'Selecciona qué necesitas.'); valid = false; }
    if (!valid) return;

    submitting = true;
    const btn = form.querySelector('button[type="submit"]');
    const original = btn.textContent;
    btn.disabled = true;
    btn.textContent = 'Enviando…';

    try {
      const result = await postToFormspree({
        form: 'Contacto — CTA final',
        nombre: sanitize(nameEl.value),
        email: sanitize(emailEl.value),
        necesidad: needEl.value,
        mensaje: sanitize(msgEl.value || 'Sin mensaje adicional'),
      });
      if (result.ok) {
        showStatus(status, 'success', 'Mensaje enviado correctamente. Te contactamos en menos de 24h.');
        form.reset();
        lastSubmit = Date.now();
      } else {
        showStatus(status, 'error', 'No se pudo enviar. Escríbenos directamente a pronexostudio@hotmail.com');
      }
    } catch (err) {
      showStatus(status, 'error', 'Sin conexión. Escríbenos a pronexostudio@hotmail.com');
    } finally {
      submitting = false;
      btn.disabled = false;
      btn.textContent = original;
    }
  });
}

function showStatus(el, type, message) {
  if (!el) return;
  el.textContent = message;
  el.className = `form-status show ${type}`;
}

/* ============================================================
   LEAD MAGNET — Diagnóstico gratuito de presencia digital
   ============================================================ */
function initLeadMagnet() {
  const form = document.getElementById('lead-form');
  if (!form) return;
  const resultEl = document.getElementById('lead-result');
  let submitting = false;
  let lastSubmit = 0;

  form.addEventListener('submit', async e => {
    e.preventDefault();
    if (submitting) return;
    if (Date.now() - lastSubmit < 3000) return;

    const nameEl = document.getElementById('lead-name');
    const emailEl = document.getElementById('lead-email');
    const q1 = document.getElementById('lead-q1'); // ¿tienes web?
    const q2 = document.getElementById('lead-q2'); // ¿respondes fuera de horario?
    const q3 = document.getElementById('lead-q3'); // ¿apareces en Google?
    const honeypot = document.getElementById('lead-honeypot');

    [nameEl, emailEl, q1, q2, q3].forEach(f => setFieldError(f, ''));
    if (honeypot && honeypot.value !== '') return;

    let valid = true;
    if (!isValidName(nameEl.value)) { setFieldError(nameEl, 'Introduce tu nombre.'); valid = false; }
    if (!isValidEmail(emailEl.value)) { setFieldError(emailEl, 'Introduce un email válido.'); valid = false; }
    if (!q1.value) { setFieldError(q1, 'Selecciona una opción.'); valid = false; }
    if (!q2.value) { setFieldError(q2, 'Selecciona una opción.'); valid = false; }
    if (!q3.value) { setFieldError(q3, 'Selecciona una opción.'); valid = false; }
    if (!valid) return;

    submitting = true;
    const btn = form.querySelector('button[type="submit"]');
    const original = btn.textContent;
    btn.disabled = true;
    btn.textContent = 'Analizando…';

    const diagnosis = buildDiagnosis(q1.value, q2.value, q3.value);

    try {
      await postToFormspree({
        form: 'Diagnóstico gratuito de presencia digital',
        nombre: sanitize(nameEl.value),
        email: sanitize(emailEl.value),
        tiene_web: q1.value,
        responde_fuera_horario: q2.value,
        aparece_en_google: q3.value,
        diagnostico_generado: diagnosis.plain,
      });
    } catch (err) {
      // seguimos mostrando el resultado aunque falle el envío del lead
    }

    resultEl.innerHTML = diagnosis.html;
    resultEl.classList.add('show');
    resultEl.setAttribute('tabindex', '-1');
    resultEl.focus({ preventScroll: false });
    lastSubmit = Date.now();
    btn.disabled = false;
    btn.textContent = 'Ver mi diagnóstico';
    submitting = false;
  });
}

function buildDiagnosis(hasWeb, respondsOffHours, appearsGoogle) {
  const gaps = [];
  if (hasWeb === 'no') gaps.push('no cuentas con una web propia donde los clientes puedan encontrarte y confiar en tu negocio');
  if (respondsOffHours === 'no') gaps.push('los mensajes fuera de tu horario laboral quedan sin respuesta hasta el día siguiente');
  if (appearsGoogle !== 'si') gaps.push('tu negocio no aparece de forma clara cuando alguien te busca en Google');

  let level, advice;
  if (gaps.length >= 2) {
    level = 'Prioridad alta';
    advice = 'Tu negocio probablemente está perdiendo clientes potenciales de forma recurrente frente a competidores con mejor presencia digital.';
  } else if (gaps.length === 1) {
    level = 'Prioridad media';
    advice = 'Tu presencia digital tiene una base, pero hay un punto concreto que conviene resolver pronto para no perder oportunidades.';
  } else {
    level = 'Buena base';
    advice = 'Tu presencia digital está en buen punto de partida. El siguiente paso es automatizar la atención para no depender de estar siempre disponible.';
  }

  const gapsHtml = gaps.length
    ? `<ul style="margin:.6rem 0 0 1.1rem;padding:0">${gaps.map(g => `<li style="margin-bottom:.3rem">${g.charAt(0).toUpperCase() + g.slice(1)}.</li>`).join('')}</ul>`
    : '';

  return {
    plain: `${level}. ${advice} ${gaps.join('; ')}`,
    html: `<strong>${level}.</strong> ${advice}${gapsHtml}<div style="margin-top:.9rem;font-size:.82rem;color:var(--muted)">Te enviamos este diagnóstico también por email. Si quieres, lo revisamos juntos sin compromiso.</div>`,
  };
}

/* ============================================================
   CHATBOT DEMO — respuestas simuladas + captura de lead
   Estructura preparada para conectar la API de Anthropic vía
   una función serverless propia (nunca exponer la API key en
   el navegador). Ver comentario al final de este bloque.
   ============================================================ */
function initChatbot() {
  const body = document.getElementById('chat-body');
  const input = document.getElementById('chat-input');
  const sendBtn = document.getElementById('chat-send');
  const chipsWrap = document.getElementById('chat-suggestions');
  if (!body || !input || !sendBtn) return;

  const KB = [
    { keys: ['precio', 'cuesta', 'cuanto', 'coste', 'vale'], reply: 'La web profesional y el chatbot con IA cuestan 59€ cada uno (pago único). El combo de ambos sale por 99€, con 19€ de ahorro. También ofrecemos mantenimiento mensual opcional por 19€/mes, sin permanencia.' },
    { keys: ['plazo', 'tarda', 'tiempo', 'entrega', 'dias'], reply: 'La web o el chatbot se entregan en 7 días. Si contratas el combo completo, el plazo es de 10 días porque integramos ambos servicios juntos.' },
    { keys: ['chatbot', 'bot', 'ia', 'inteligencia'], reply: 'Nuestro chatbot con IA se entrena con la información real de tu negocio: servicios, horarios y precios. Responde preguntas frecuentes las 24 horas y recoge nombre, email y necesidad de cada visitante como lead cualificado.' },
    { keys: ['web', 'pagina', 'sitio'], reply: 'La web profesional se diseña a medida para tu negocio, optimizada para móvil, con SEO básico y formulario de contacto. Pensada para transmitir seriedad desde el primer segundo.' },
    { keys: ['combo', 'ambos', 'los dos', 'juntos'], reply: 'El combo Web + Chatbot es la opción más elegida: por 99€ tienes ambos servicios integrados, frente a 118€ si los compras por separado. Se entrega en 10 días.' },
    { keys: ['mantenimiento', 'soporte', 'actualiz'], reply: 'El mantenimiento mensual (19€/mes, sin permanencia) incluye actualizaciones, revisión del chatbot y pequeños cambios de contenido. Puedes cancelarlo cuando quieras.' },
    { keys: ['sector', 'electricista', 'fontanero', 'estetica', 'peluqueria', 'fotografo'], reply: 'Trabajamos con autónomos y pequeños negocios de toda España: electricistas, fontaneros, centros de estética, peluquerías, fotógrafos, hostelería y entrenadores personales, entre otros.' },
    { keys: ['garantia', 'resultado', 'funciona'], reply: 'No prometemos resultados que no dependen de nosotros, pero sí garantizamos calidad de entrega, ajustes tras la revisión inicial y cero permanencia si contratas mantenimiento.' },
    { keys: ['contacto', 'hablar', 'llamar', 'email', 'whatsapp'], reply: 'Claro, puedo ayudarte a dejar tus datos para que el equipo te contacte directamente. ¿Cómo te llamas?' },
  ];

  const CONTACT_TRIGGERS = ['contacto', 'hablar', 'llamar', 'email', 'whatsapp', 'contactar', 'quiero que me contacteis', 'contactadme'];

  let state = 'chat'; // chat | ask_name | ask_email | ask_need | done
  let lead = { nombre: '', email: '', necesidad: '' };
  let lastLeadSubmit = 0;

  function addMessage(text, from) {
    const msg = document.createElement('div');
    msg.className = `chat-msg ${from}`;
    msg.textContent = text;
    body.appendChild(msg);
    body.scrollTop = body.scrollHeight;
    return msg;
  }

  function showTyping() {
    const el = document.createElement('div');
    el.className = 'chat-typing';
    el.innerHTML = '<span></span><span></span><span></span>';
    body.appendChild(el);
    body.scrollTop = body.scrollHeight;
    return el;
  }

  function botSay(text, delay = 550) {
    const typing = showTyping();
    return new Promise(resolve => {
      setTimeout(() => {
        typing.remove();
        addMessage(text, 'bot');
        resolve();
      }, delay);
    });
  }

  function normalize(text) {
    // Quita diacríticos (acentos) tras descomponer Unicode (NFD), para
    // que "contactéis" y "contacteis" se traten como equivalentes.
    return text
      .toLowerCase()
      .normalize('NFD')
      .split('')
      .filter(ch => { const c = ch.charCodeAt(0); return c < 0x0300 || c > 0x036f; })
      .join('');
  }

  function matchKB(text) {
    const t = normalize(text);
    const hit = KB.find(entry => entry.keys.some(k => t.includes(k)));
    return hit ? hit.reply : null;
  }

  async function handleUserText(raw) {
    const text = sanitize(raw);
    if (!text) return;
    addMessage(text, 'user');
    input.value = '';

    if (state === 'ask_name') {
      lead.nombre = text;
      state = 'ask_email';
      await botSay(`Encantados, ${text.split(' ')[0]}. ¿Cuál es tu email para que te contactemos?`);
      return;
    }
    if (state === 'ask_email') {
      if (!isValidEmail(text)) {
        await botSay('Ese email no parece válido. ¿Puedes escribirlo de nuevo? (ej: nombre@negocio.com)');
        return;
      }
      lead.email = text;
      state = 'ask_need';
      await botSay('Perfecto. Por último, ¿qué necesitas: web, chatbot, el combo o tienes dudas todavía?');
      return;
    }
    if (state === 'ask_need') {
      lead.necesidad = text;
      state = 'done';
      await botSay(`Gracias, ${lead.nombre.split(' ')[0]}. Hemos registrado tu consulta (${lead.necesidad}) y el equipo de Pronexo Studio te escribirá a ${lead.email} en menos de 24h.`);
      if (Date.now() - lastLeadSubmit > 3000) {
        lastLeadSubmit = Date.now();
        try {
          await postToFormspree({
            form: 'Lead desde chatbot demo',
            nombre: sanitize(lead.nombre),
            email: sanitize(lead.email),
            necesidad: sanitize(lead.necesidad),
          });
        } catch (err) { /* no bloqueamos la demo si falla el envío */ }
      }
      return;
    }

    const wantsContact = CONTACT_TRIGGERS.some(k => normalize(text).includes(k));
    if (wantsContact) {
      state = 'ask_name';
      await botSay('Claro, puedo ayudarte a dejar tus datos para que el equipo te contacte directamente. ¿Cómo te llamas?');
      return;
    }

    const known = matchKB(text);
    if (known) {
      await botSay(known);
    } else {
      await botSay('Buena pregunta. En esta demo respondo sobre precios, plazos, servicios y sectores de Pronexo Studio — o puedo pasar tus datos al equipo si prefieres hablar directamente. ¿Qué te gustaría saber?');
    }
  }

  sendBtn.addEventListener('click', () => handleUserText(input.value));
  input.addEventListener('keydown', e => {
    if (e.key === 'Enter') handleUserText(input.value);
  });
  if (chipsWrap) {
    chipsWrap.querySelectorAll('.chat-chip').forEach(chip => {
      chip.addEventListener('click', () => handleUserText(chip.textContent));
    });
  }

  /* ── Conexión real con la API de Anthropic (pendiente de activar) ──
     Esta demo funciona 100% en el cliente con respuestas predefinidas.
     Para conectar la API real de Claude:
       1. Crea una función serverless (Vercel/Netlify) que reciba el
          mensaje del usuario y llame a la API de Anthropic con tu
          API key guardada como variable de entorno del servidor
          (nunca en este archivo ni en el navegador).
       2. Sustituye matchKB()/handleUserText() por un fetch a esa
          función serverless, p.ej.:
          const res = await fetch('/api/chat', { method:'POST',
            headers:{'Content-Type':'application/json'},
            body: JSON.stringify({ message: text }) });
       3. Muestra la respuesta devuelta por tu función igual que
          se hace ahora con botSay().
  ───────────────────────────────────────────────────────────────── */
}

/* ============================================================
   EXIT INTENT POPUP
   ============================================================ */
function initExitIntent() {
  const overlay = document.getElementById('exit-overlay');
  if (!overlay) return;
  const STORAGE_KEY = 'pronexo_exit_shown';
  let shown = false;

  const shouldShow = () => !shown && !sessionStorage.getItem(STORAGE_KEY);

  const trigger = () => {
    if (!shouldShow()) return;
    shown = true;
    sessionStorage.setItem(STORAGE_KEY, '1');
    overlay.classList.add('show');
    document.body.classList.add('no-scroll');
  };

  document.addEventListener('mouseout', e => {
    if (e.clientY <= 0 && shouldShow()) trigger();
  });

  // Fallback para móvil/tablet: tras scroll profundo + tiempo en página.
  let mobileTimer = null;
  window.addEventListener('scroll', () => {
    if (window.scrollY > document.documentElement.scrollHeight * 0.5 && !mobileTimer && shouldShow()) {
      mobileTimer = setTimeout(trigger, 20000);
    }
  }, { passive: true });

  function close() {
    overlay.classList.remove('show');
    document.body.classList.remove('no-scroll');
  }
  overlay.querySelectorAll('[data-exit-close]').forEach(el => el.addEventListener('click', close));
  overlay.addEventListener('click', e => { if (e.target === overlay) close(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
}
