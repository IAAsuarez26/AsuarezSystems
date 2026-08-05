/* ==========================================================================
   ASUAREZ SYSTEMS - INTERACTIVE APPLICATION ENGINE
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  // --- 1. HEADER SCROLL & MOBILE MENU ---
  const siteHeader = document.getElementById('siteHeader');
  const navToggle = document.getElementById('navToggle');
  const mainNav = document.getElementById('mainNav');
  const navOverlay = document.getElementById('navOverlay');
  const navLinks = document.querySelectorAll('.nav-link');

  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      siteHeader.classList.add('scrolled');
    } else {
      siteHeader.classList.remove('scrolled');
    }

    // Active Nav Indicator based on scroll position
    const sections = document.querySelectorAll('section[id]');
    const scrollPos = window.scrollY + 120;

    sections.forEach(section => {
      const top = section.offsetTop;
      const height = section.offsetHeight;
      const id = section.getAttribute('id');
      const link = document.querySelector(`.nav-link[href="#${id}"]`);

      if (scrollPos >= top && scrollPos < top + height) {
        navLinks.forEach(l => l.classList.remove('active'));
        if (link) link.classList.add('active');
      }
    });
  });

  const toggleMobileMenu = () => {
    mainNav.classList.toggle('active');
    navOverlay.classList.toggle('active');
    const expanded = navToggle.getAttribute('aria-expanded') === 'true' || false;
    navToggle.setAttribute('aria-expanded', !expanded);
  };

  if (navToggle) {
    navToggle.addEventListener('click', toggleMobileMenu);
  }

  if (navOverlay) {
    navOverlay.addEventListener('click', toggleMobileMenu);
  }

  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      if (mainNav.classList.contains('active')) {
        toggleMobileMenu();
      }
    });
  });

  // --- 2. DARK / LIGHT THEME TOGGLE ---
  const themeToggle = document.getElementById('themeToggle');
  const savedTheme = localStorage.getItem('asuarez_theme') || 'dark';
  document.documentElement.setAttribute('data-theme', savedTheme);

  themeToggle.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('asuarez_theme', newTheme);
  });

  // --- 2.1 LANGUAGE SWITCHER (ES / EN) ---
  const langBtns = document.querySelectorAll('.lang-btn');
  let currentLang = localStorage.getItem('asuarez_lang') || 'es';

  const applyTranslations = (lang) => {
    currentLang = lang;
    localStorage.setItem('asuarez_lang', lang);
    document.documentElement.setAttribute('lang', lang);

    langBtns.forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-lang') === lang);
    });

    if (typeof translations !== 'undefined' && translations[lang]) {
      const dict = translations[lang];
      document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (dict[key]) {
          el.innerHTML = dict[key];
        }
      });
      document.querySelectorAll('[data-i18n-ph]').forEach(el => {
        const key = el.getAttribute('data-i18n-ph');
        if (dict[key]) {
          el.placeholder = dict[key];
        }
      });
    }

    if (typeof updateCalculator === 'function') {
      updateCalculator();
    }
  };

  langBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const selectedLang = btn.getAttribute('data-lang');
      applyTranslations(selectedLang);
    });
  });

  // --- 3. HERO SLIDER CAROUSEL ---
  const slides = document.querySelectorAll('.hero-slide');
  const dots = document.querySelectorAll('.slider-dots .dot');
  const heroPrev = document.getElementById('heroPrev');
  const heroNext = document.getElementById('heroNext');
  let currentSlide = 0;
  let slideInterval;

  const showSlide = (index) => {
    slides.forEach((slide, i) => {
      slide.classList.toggle('active', i === index);
    });
    dots.forEach((dot, i) => {
      dot.classList.toggle('active', i === index);
    });
    currentSlide = index;
  };

  const nextSlide = () => {
    let next = (currentSlide + 1) % slides.length;
    showSlide(next);
  };

  const prevSlide = () => {
    let prev = (currentSlide - 1 + slides.length) % slides.length;
    showSlide(prev);
  };

  if (heroNext && heroPrev) {
    heroNext.addEventListener('click', () => {
      nextSlide();
      resetSlideTimer();
    });
    heroPrev.addEventListener('click', () => {
      prevSlide();
      resetSlideTimer();
    });

    dots.forEach(dot => {
      dot.addEventListener('click', (e) => {
        const targetIndex = parseInt(e.target.getAttribute('data-slide-target'));
        showSlide(targetIndex);
        resetSlideTimer();
      });
    });

    const startSlideTimer = () => {
      slideInterval = setInterval(nextSlide, 7000);
    };

    const resetSlideTimer = () => {
      clearInterval(slideInterval);
      startSlideTimer();
    };

    startSlideTimer();
  }

  // --- 4. ANIMATED STAT COUNTERS ---
  const statNumbers = document.querySelectorAll('.stat-num, .stat-number');
  let animated = false;

  const animateCounters = () => {
    statNumbers.forEach(stat => {
      const target = parseFloat(stat.getAttribute('data-target'));
      const isDecimal = target % 1 !== 0;
      const duration = 1800; // ms
      const startTime = performance.now();

      const updateCount = (currentTime) => {
        const elapsedTime = currentTime - startTime;
        const progress = Math.min(elapsedTime / duration, 1);
        const value = progress * target;

        stat.textContent = isDecimal ? value.toFixed(1) : Math.floor(value);

        if (progress < 1) {
          requestAnimationFrame(updateCount);
        } else {
          stat.textContent = isDecimal ? target.toFixed(1) : target;
        }
      };

      requestAnimationFrame(updateCount);
    });
  };

  const observerOptions = { threshold: 0.4 };
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !animated) {
        animateCounters();
        animated = true;
      }
    });
  }, observerOptions);

  const statsSection = document.querySelector('.stats-bar');
  if (statsSection) observer.observe(statsSection);

  // --- 5. PRODUCTS FILTER & MODAL ---
  const filterBtns = document.querySelectorAll('.filter-btn');
  const productCards = document.querySelectorAll('.product-card');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.getAttribute('data-filter');

      productCards.forEach(card => {
        const category = card.getAttribute('data-category');
        if (filter === 'all' || filter === category) {
          card.style.display = 'flex';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });

  // Product Modals Data
  const productsData = {
    'rag-widget': {
      es: {
        category: 'IA & Chatbots',
        title: 'Smart RAG Assistant Widget',
        price: '$290 USD',
        desc: 'Widget liviano de chat entrenado sobre la base de datos de tu empresa con arquitectura RAG (Retrieval-Augmented Generation). Permite responder preguntas frecuentes, calificar prospectos y enviar leads directamente a WhatsApp.',
        features: [
          'Modelo embebible con 1 sola línea de script HTML',
          'Conexión nativa a OpenAI (GPT-4o) / Anthropic / Gemini',
          'Soporte multi-idioma automático',
          'Panel para subir archivos PDF, manuales y enlaces',
          'Integración con WhatsApp y Webhooks'
        ],
        featuresTitle: 'Características Incluidas:',
        btnText: 'Cotizar / Adquirir por WhatsApp',
        whatsappMsg: 'Hola Asuarez Systems, quiero adquirir o cotizar la implementación del *Smart RAG Assistant Widget ($290 USD)*.'
      },
      en: {
        category: 'AI & Chatbots',
        title: 'Smart RAG Assistant Widget',
        price: '$290 USD',
        desc: 'Lightweight embeddable chat widget trained on your company knowledge base using RAG (Retrieval-Augmented Generation) architecture. Responds to FAQs, qualifies prospects, and routes leads to WhatsApp 24/7.',
        features: [
          'Embeddable widget with just 1 line of HTML script',
          'Native connection to OpenAI (GPT-4o) / Anthropic / Gemini',
          'Automatic multi-language support',
          'Admin panel to upload PDFs, manuals, and URLs',
          'Direct integration with WhatsApp and Webhooks'
        ],
        featuresTitle: 'Included Features:',
        btnText: 'Inquire / Purchase via WhatsApp',
        whatsappMsg: 'Hello Asuarez Systems, I would like to inquire about/purchase the *Smart RAG Assistant Widget ($290 USD)*.'
      }
    },
    'saas-starter': {
      es: {
        category: 'SaaS Boilerplates',
        title: 'Enterprise Next.js 14 SaaS Starter',
        price: '$490 USD',
        desc: 'Plantilla de producción construida con Next.js App Router, Tailwind CSS, TypeScript, Supabase Auth, pasarela Stripe integrada y sistema de gestión de organizaciones.',
        features: [
          'Autenticación completa (Email, Google, OAuth)',
          'Suscripciones recurrentes y pagos únicos con Stripe',
          'Dashboard de usuarios y roles (Admin, Member)',
          'Dark Theme nativo y componentes accesibles',
          'Optimización SEO y despliegue instantáneo en Vercel'
        ],
        featuresTitle: 'Características Incluidas:',
        btnText: 'Cotizar / Adquirir por WhatsApp',
        whatsappMsg: 'Hola Asuarez Systems, quiero adquirir el código fuente de *Enterprise Next.js 14 SaaS Starter ($490 USD)*.'
      },
      en: {
        category: 'SaaS Boilerplates',
        title: 'Enterprise Next.js 14 SaaS Starter',
        price: '$490 USD',
        desc: 'Production-ready boilerplate built with Next.js App Router, Tailwind CSS, TypeScript, Supabase Auth, integrated Stripe checkout, and organization role management.',
        features: [
          'Complete Auth system (Email, Google, OAuth)',
          'Recurring subscriptions and one-time payments via Stripe',
          'User & Role Dashboard (Admin, Member)',
          'Native Dark Theme with accessible UI components',
          'SEO optimized & instant deployment on Vercel'
        ],
        featuresTitle: 'Included Features:',
        btnText: 'Inquire / Purchase via WhatsApp',
        whatsappMsg: 'Hello Asuarez Systems, I want to purchase the source code for *Enterprise Next.js 14 SaaS Starter ($490 USD)*.'
      }
    },
    'n8n-kit': {
      es: {
        category: 'Kits de Automatización',
        title: 'n8n Auto-Lead Capture & CRM Sync Kit',
        price: '$180 USD',
        desc: 'Paquete de 5 flujos n8n listos para importar en tu propia instancia. Conecta anuncios de Facebook, formularios web, calificación con IA y registro automático en CRM.',
        features: [
          'Flujo 1: Meta Lead Ads -> WhatsApp Notification',
          'Flujo 2: Web Form -> IA qualification -> HubSpot CRM',
          'Flujo 3: OCR PDF Invoice -> Excel / Sheets',
          'Flujo 4: Calendar Booking Auto-Reminder',
          'Guía de instalación paso a paso en PDF'
        ],
        featuresTitle: 'Características Incluidas:',
        btnText: 'Cotizar / Adquirir por WhatsApp',
        whatsappMsg: 'Hola Asuarez Systems, quiero comprar el *n8n Auto-Lead Capture Kit ($180 USD)*.'
      },
      en: {
        category: 'Automation Kits',
        title: 'n8n Auto-Lead Capture & CRM Sync Kit',
        price: '$180 USD',
        desc: 'Package of 5 pre-built n8n workflows ready to import into your self-hosted instance. Connects Facebook Ads, web forms, AI lead scoring, and automatic CRM entry.',
        features: [
          'Workflow 1: Meta Lead Ads -> WhatsApp Notification',
          'Workflow 2: Web Form -> AI qualification -> HubSpot CRM',
          'Workflow 3: OCR PDF Invoice -> Excel / Sheets',
          'Workflow 4: Calendar Booking Auto-Reminder',
          'Step-by-step PDF installation guide'
        ],
        featuresTitle: 'Included Features:',
        btnText: 'Inquire / Purchase via WhatsApp',
        whatsappMsg: 'Hello Asuarez Systems, I want to buy the *n8n Auto-Lead Capture Kit ($180 USD)*.'
      }
    },
    'exec-dashboard': {
      es: {
        category: 'Dashboards & Admin',
        title: 'Executive KPI & Operations Dashboard',
        price: '$350 USD',
        desc: 'Panel de control ejecutivo de alto rendimiento para monitorear ventas, rendimiento de agentes de soporte y métricas operativas en tiempo real.',
        features: [
          'Gráficos interactivos con Chart.js / Recharts',
          'Exportación automatizada de reportes a PDF & CSV',
          'Conexión simplificada a bases de datos PostgreSQL / MySQL',
          'Filtros dinámicos por rango de fechas y sucursal',
          'Diseño Glassmorphism Premium'
        ],
        featuresTitle: 'Características Incluidas:',
        btnText: 'Cotizar / Adquirir por WhatsApp',
        whatsappMsg: 'Hola Asuarez Systems, estoy interesado en el *Executive KPI Dashboard ($350 USD)*.'
      },
      en: {
        category: 'Dashboards & Admin',
        title: 'Executive KPI & Operations Dashboard',
        price: '$350 USD',
        desc: 'High-performance executive control dashboard for real-time monitoring of sales, support agent performance, and operational KPIs.',
        features: [
          'Interactive charts powered by Chart.js / Recharts',
          'Automated PDF & CSV report export',
          'Simplified database connection to PostgreSQL / MySQL',
          'Dynamic filters by date range and business branch',
          'Premium Glassmorphism interface'
        ],
        featuresTitle: 'Included Features:',
        btnText: 'Inquire / Purchase via WhatsApp',
        whatsappMsg: 'Hello Asuarez Systems, I am interested in the *Executive KPI Dashboard ($350 USD)*.'
      }
    }
  };

  const productModalBackdrop = document.getElementById('productModalBackdrop');
  const modalCloseBtn = document.getElementById('modalCloseBtn');
  const modalBody = document.getElementById('modalBody');

  const openProductModal = (productId) => {
    const rawData = productsData[productId];
    if (!rawData) return;
    const data = rawData[currentLang] || rawData['es'];

    modalBody.innerHTML = `
      <span class="section-tag">${data.category}</span>
      <h2 style="font-size: 1.8rem; margin: 0.4rem 0 1rem 0;">${data.title}</h2>
      <div style="font-size: 1.8rem; font-weight: 800; color: var(--primary); margin-bottom: 1.2rem;">${data.price}</div>
      <p style="color: var(--text-muted); margin-bottom: 1.5rem;">${data.desc}</p>

      <h4 style="margin-bottom: 0.8rem; font-size: 1.1rem;">${data.featuresTitle}</h4>
      <ul style="margin-bottom: 2rem;">
        ${data.features.map(f => `<li style="margin-bottom: 0.5rem; color: var(--text-main);">✓ ${f}</li>`).join('')}
      </ul>

      <a href="https://wa.me/584123301755?text=${encodeURIComponent(data.whatsappMsg)}" target="_blank" rel="noopener" class="btn btn-primary btn-glow btn-full">
        ${data.btnText}
      </a>
    `;

    productModalBackdrop.classList.add('active');
  };

  document.querySelectorAll('.open-product-modal').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const targetBtn = e.currentTarget || e.target.closest('.open-product-modal');
      const pId = targetBtn ? targetBtn.getAttribute('data-product') : null;
      openProductModal(pId);
    });
  });

  if (modalCloseBtn) {
    modalCloseBtn.addEventListener('click', () => {
      productModalBackdrop.classList.remove('active');
    });
  }

  if (productModalBackdrop) {
    productModalBackdrop.addEventListener('click', (e) => {
      if (e.target === productModalBackdrop) {
        productModalBackdrop.classList.remove('active');
      }
    });
  }

  // --- 6. AUTOMATION SIMULATOR TABS ---
  const simTabs = document.querySelectorAll('.sim-tab');
  const flowContents = document.querySelectorAll('.flow-content');

  simTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      simTabs.forEach(t => t.classList.remove('active'));
      flowContents.forEach(c => c.classList.remove('active'));

      tab.classList.add('active');
      const flowId = tab.getAttribute('data-flow');
      document.getElementById(`flow-${flowId}`).classList.add('active');
    });
  });

  // --- 7. INTERACTIVE BUDGET & ROI CALCULATOR ---
  function updateCalculator() {
    const calcType = document.getElementById('calcType');
    const calcAddons = document.querySelectorAll('.calc-addon');
    const calcAuto = document.getElementById('calcAuto');

    const calcTotal = document.getElementById('calcTotal');
    const calcTime = document.getElementById('calcTime');
    const calcSaving = document.getElementById('calcSaving');
    const calcQuoteBtn = document.getElementById('calcQuoteBtn');

    if (!calcType || !calcAuto || !calcTotal) return;

    let total = 0;

    // Base Type
    const baseOpt = calcType.options[calcType.selectedIndex];
    total += parseInt(baseOpt.value);
    const timeText = baseOpt.getAttribute('data-time');

    // Addons
    let selectedAddons = [];
    calcAddons.forEach(addon => {
      if (addon.checked) {
        total += parseInt(addon.value);
        selectedAddons.push(addon.getAttribute('data-name'));
      }
    });

    // Automation Level
    const autoOpt = calcAuto.options[calcAuto.selectedIndex];
    total += parseInt(autoOpt.value);
    const savingText = autoOpt.getAttribute('data-saving');

    // Render results
    calcTotal.textContent = `$${total.toLocaleString()} USD`;
    const labelTime = currentLang === 'en' ? 'Estimated timeline:' : 'Tiempo estimado:';
    const translatedTime = currentLang === 'en' ? timeText.replace('semanas', 'weeks') : timeText;
    calcTime.textContent = `${labelTime} ${translatedTime}`;
    const translatedSaving = currentLang === 'en' ? savingText.replace('hrs/mes', 'hrs/mo') : savingText;
    calcSaving.textContent = translatedSaving;

    // Update WhatsApp link target
    const isEn = currentLang === 'en';
    const summaryMsg = isEn 
      ? `Hello Asuarez Systems, I used the *ROI Calculator* on your website:\n- *Project:* ${baseOpt.text.split('(')[0]}\n- *Add-ons:* ${selectedAddons.length > 0 ? selectedAddons.join(', ') : 'None'}\n- *Automation Level:* ${autoOpt.text.split('(')[0]}\n- *Calculated Estimate:* $${total} USD (${translatedTime})\nI would like an official proposal.`
      : `Hola Asuarez Systems, estuve utilizando la *Calculadora ROI* en su sitio web:\n- *Proyecto:* ${baseOpt.text.split('(')[0]}\n- *Módulos:* ${selectedAddons.length > 0 ? selectedAddons.join(', ') : 'Ninguno'}\n- *Nivel de Automatización:* ${autoOpt.text.split('(')[0]}\n- *Estimación Calculada:* $${total} USD (${timeText})\nQuiero recibir una propuesta oficial.`;

    if (calcQuoteBtn) {
      calcQuoteBtn.onclick = () => {
        window.open(`https://wa.me/584123301755?text=${encodeURIComponent(summaryMsg)}`, '_blank');
      };
    }
  }

  const calcTypeEl = document.getElementById('calcType');
  const calcAutoEl = document.getElementById('calcAuto');
  const calcAddonsEls = document.querySelectorAll('.calc-addon');

  if (calcTypeEl && calcAutoEl) {
    calcTypeEl.addEventListener('change', updateCalculator);
    calcAutoEl.addEventListener('change', updateCalculator);
    calcAddonsEls.forEach(chk => chk.addEventListener('change', updateCalculator));
    updateCalculator();
  }

  // --- 8. FAQ ACCORDION ---
  const faqQuestions = document.querySelectorAll('.faq-question');

  faqQuestions.forEach(q => {
    q.addEventListener('click', () => {
      const item = q.parentElement;
      const isActive = item.classList.contains('active');

      document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('active'));

      if (!isActive) {
        item.classList.add('active');
      }
    });
  });

  // --- 9. CONTACT FORM HANDLING ---
  const contactForm = document.getElementById('contactForm');

  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('contactName').value;
      const email = document.getElementById('contactEmail').value;
      const service = document.getElementById('contactService').value;
      const message = document.getElementById('contactMessage').value;

      const formattedMsg = `Hola Asuarez Systems, mi nombre es *${name}* (${email}).\nEstoy interesado en *${service}*.\nDetalles: ${message}`;

      window.open(`https://wa.me/584123301755?text=${encodeURIComponent(formattedMsg)}`, '_blank');
    });
  }

  // --- 9.1 FLOATING BACK TO TOP BUTTON ---
  const backToTopBtn = document.getElementById('backToTop');

  if (backToTopBtn) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 350) {
        backToTopBtn.classList.add('visible');
      } else {
        backToTopBtn.classList.remove('visible');
      }
    });

    backToTopBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // --- 9.2 INTERACTIVE AI LIVE DEMO WIDGET ---
  const aiPromptInput = document.getElementById('aiPromptInput');
  const aiGenerateBtn = document.getElementById('aiGenerateBtn');
  const presetBtns = document.querySelectorAll('.preset-btn');
  const aiCodeResult = document.getElementById('aiCodeResult');

  const presetArchitectures = {
    leads: {
      prompt: "Capturar leads de Meta Ads (Facebook/Instagram), calificar intención con GPT-4o y enviar notificación WhatsApp al vendedor + registro en HubSpot.",
      output: `{\n  "workflow_id": "flow_meta_lead_sync_092",\n  "status": "ACTIVE_PRODUCTION",\n  "triggers": [\n    {\n      "source": "Meta Ads Webhook",\n      "event": "leadgen.form_submit",\n      "latency_ms": 140\n    }\n  ],\n  "pipeline": [\n    {\n      "step": 1,\n      "agent": "Data Enrichment & Cleaning",\n      "action": "Parse phone + validate corporate email"\n    },\n    {\n      "step": 2,\n      "agent": "GPT-4o Qualifier Agent",\n      "prompt": "Evaluate budget & intent score (0-100)",\n      "score": 94,\n      "priority": "HIGH_HOT_LEAD"\n    },\n    {\n      "step": 3,\n      "action": "HubSpot CRM Direct Sync",\n      "record_created": true,\n      "owner": "Enterprise Sales Team"\n    },\n    {\n      "step": 4,\n      "action": "WhatsApp Cloud API Notification",\n      "recipient": "+58 412 3301755",\n      "delivered": true\n    }\n  ],\n  "efficiency_gain": "98.4% reduction in response latency (from 45 mins to 2.8s)"\n}`
    },
    invoices: {
      prompt: "Procesar facturas electrónicas en PDF recibidas por correo, extraer datos fiscales con OCR e IA, y registrar asiento contable en QuickBooks / SAP.",
      output: `{\n  "workflow_id": "flow_ocr_invoice_parsing_401",\n  "status": "ACTIVE_PRODUCTION",\n  "triggers": [\n    {\n      "source": "IMAP / Gmail Enterprise Monitor",\n      "filter": "has:attachment filename:pdf invoice",\n      "latency_ms": 320\n    }\n  ],\n  "pipeline": [\n    {\n      "step": 1,\n      "agent": "Document Parser & Vision OCR",\n      "extracted": {\n        "vendor_tax_id": "J-30948571-0",\n        "invoice_number": "FACT-2026-8841",\n        "total_amount_usd": 1250.00,\n        "tax_amount": 160.00\n      }\n    },\n    {\n      "step": 2,\n      "agent": "Financial Verification Engine",\n      "action": "Match PO #8841 with bank balance & approve"\n    },\n    {\n      "step": 3,\n      "action": "ERP Direct Posting (QuickBooks API)",\n      "journal_entry_id": "JE-99201",\n      "status": "SUCCESS"\n    }\n  ],\n  "accuracy_rate": "99.85% verified OCR accuracy (Zero manual entry errors)"\n}`
    },
    support: {
      prompt: "Implementar asistente de soporte RAG entrenado sobre documentación técnica de la empresa para resolver dudas 24/7 en WhatsApp y Web.",
      output: `{\n  "workflow_id": "flow_rag_support_assistant_771",\n  "status": "ACTIVE_PRODUCTION",\n  "knowledge_base": {\n    "vector_store": "Supabase pgvector / Pinecone",\n    "indexed_documents": 1420,\n    "embedding_model": "text-embedding-3-large"\n  },\n  "pipeline": [\n    {\n      "step": 1,\n      "source": "WhatsApp Business / Embedded Web Chat",\n      "user_query": "¿Cómo integro la API de facturación automática?"\n    },\n    {\n      "step": 2,\n      "agent": "Vector Similarity Retriever",\n      "top_k_chunks": 3,\n      "relevance_score": 0.96\n    },\n    {\n      "step": 3,\n      "agent": "Gemini 1.5 Pro Contextual Responder",\n      "response": "Para integrar la API de facturación, debes incluir la clave API en el header Authorization: Bearer <TOKEN>...",\n      "citations_included": true\n    }\n  ],\n  "resolution_rate": "84% of tier-1 support tickets closed without human intervention"\n}`
    }
  };

  const typeOutputAnimation = (text) => {
    if (!aiCodeResult) return;
    aiCodeResult.textContent = "";
    let index = 0;
    const speed = 6;

    const timer = setInterval(() => {
      if (index < text.length) {
        aiCodeResult.textContent += text.charAt(index);
        index++;
      } else {
        clearInterval(timer);
      }
    }, speed);
  };

  presetBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const presetKey = btn.getAttribute('data-preset');
      const presetData = presetArchitectures[presetKey];
      if (presetData) {
        aiPromptInput.value = presetData.prompt;
        typeOutputAnimation(presetData.output);
      }
    });
  });

  if (aiGenerateBtn && aiPromptInput) {
    aiGenerateBtn.addEventListener('click', () => {
      const userText = aiPromptInput.value.trim();
      if (!userText) {
        const isEn = currentLang === 'en';
        aiPromptInput.placeholder = isEn ? "Please enter a prompt first..." : "Por favor escribe un requerimiento primero...";
        return;
      }

      const isEn = currentLang === 'en';
      const customOutput = `{\n  "workflow_id": "flow_custom_${Math.floor(1000 + Math.random() * 9000)}",\n  "status": "SIMULATED_SUCCESS",\n  "input_requirement": "${userText.replace(/"/g, '\\"')}",\n  "architecture": {\n    "frontend_layer": "Next.js 14 / Glassmorphism UI",\n    "ai_engine": "OpenAI GPT-4o + Gemini Pro Hybrid",\n    "automation_orchestrator": "n8n Self-Hosted Pipeline",\n    "database": "Supabase PostgreSQL + pgvector",\n    "integrations": ["WhatsApp Business API", "Stripe Checkout", "HubSpot CRM"]\n  },\n  "estimated_delivery": "2 - 3 ${isEn ? 'weeks' : 'semanas'}",\n  "projected_efficiency": "+75% ${isEn ? 'speed boost' : 'incremento en eficiencia'}"\n}`;

      typeOutputAnimation(customOutput);
    });
  }

  // --- 10. INITIAL TRANSLATION RUNNER ---
  applyTranslations(currentLang);
});
