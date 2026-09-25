/**
 * Origin 6 Core Business Pillars Engine
 * Manages the 6 floating strategy blocks:
 * 1. Market Size
 * 2. Customer Segments
 * 3. Business Model
 * 4. Unit Economics
 * 5. USP & Moat
 * 6. Branding
 *
 * Provides real-time reactive SVG graph rendering, user value adjustment,
 * AI strategic analysis injection, and interactive MCQ questionnaire parsing.
 */

const OriginPillars = (function () {
  'use strict';

  // Pillar State
  const pillars = {
    market_size: {
      id: 'market_size',
      title: 'Market Size',
      subtitle: 'Bottom-Up TAM, SAM & SOM Inflection',
      dock: 'left',
      icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.21 15.89A10 10 0 1 1 8 2.83"></path><path d="M22 12A10 10 0 0 0 12 2v10z"></path></svg>`,
      badge: 'Awaiting Intake',
      badgeClass: 'idle',
      values: {
        targetAccounts: 32000,
        acv: 45000,
        tamVal: 1.44, // In Billions
        samVal: 480,  // In Millions
        somVal: 38,   // In Millions
        cagr: 23.4
      },
      analysis: 'Describe your business or answer the diagnostic questions to calculate your verified addressable market sizing, pricing elasticity, and 3-year market penetration milestones.',
      generated: false
    },
    customer_segments: {
      id: 'customer_segments',
      title: 'Customer Segments',
      subtitle: 'ICP Segmentation & Willingness-to-Pay',
      dock: 'left',
      icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>`,
      badge: 'Awaiting Intake',
      badgeClass: 'idle',
      values: {
        enterprisePct: 55,
        midMarketPct: 35,
        smbPct: 10,
        primaryIcp: 'Enterprise VP / Director of Operations',
        workaround: 'Manual Spreadsheets & Fragmented Legacy ERPs'
      },
      analysis: 'Customer segmentation model mapping buyers by urgency, budget authority, current workaround pain, and payback velocity.',
      generated: false
    },
    business_model: {
      id: 'business_model',
      title: 'Business Model',
      subtitle: 'Monetization Architecture & Flywheel',
      dock: 'left',
      icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>`,
      badge: 'Awaiting Intake',
      badgeClass: 'idle',
      values: {
        subShare: 70,
        usageShare: 20,
        serviceShare: 10,
        pricingModel: 'Hybrid Platform Subscription + Consumption Metric',
        expansionTrigger: 'Volume of Automated Workflows'
      },
      analysis: 'Monetization structure aligned with Brian Balfour’s Channel-Model Fit, ensuring predictable recurring ARR paired with volume-based net retention expansion.',
      generated: false
    },
    unit_economics: {
      id: 'unit_economics',
      title: 'Unit Economics',
      subtitle: 'LTV:CAC, Payback & Gross Margins',
      dock: 'right',
      icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>`,
      badge: 'Awaiting Intake',
      badgeClass: 'idle',
      values: {
        cac: 8500,
        ltv: 42500,
        paybackMonths: 8.5,
        grossMargin: 82,
        netRetention: 128
      },
      analysis: 'Capital efficiency baseline modeling blended CAC against 3-year enterprise LTV, ensuring sub-12 month payback and durable gross margin resilience.',
      generated: false
    },
    usp_moat: {
      id: 'usp_moat',
      title: 'USP & Moat',
      subtitle: "Hamilton Helmer's 7 Powers & Dunford Moat",
      dock: 'right',
      icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>`,
      badge: 'Awaiting Intake',
      badgeClass: 'idle',
      values: {
        switchingCosts: 88,
        counterPositioning: 84,
        networkEffects: 72,
        scaleEconomies: 62,
        corneredResource: 75,
        brandPower: 70,
        processPower: 65,
        overallMoatScore: 82
      },
      analysis: 'Competitive defensibility analysis against status-quo inertia and incumbent vendor lock-in, grounded in high workflow switching costs and counter-positioning.',
      generated: false
    },
    branding: {
      id: 'branding',
      title: 'Branding',
      subtitle: 'Brand Health & Market Resonance',
      dock: 'right',
      icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="7"></circle><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"></polyline></svg>`,
      badge: 'Awaiting Intake',
      badgeClass: 'idle',
      values: {
        healthScore: 88,
        distinctiveness: 92,
        resonance: 89,
        antiGenericScore: 94,
        archetype: 'The Sovereign Architect',
        tone: 'Institutional, Sharp, Authoritative'
      },
      analysis: 'Strategic brand architecture, executive positioning narrative, and anti-generic visual identity to achieve premium market resonance and pricing power.',
      generated: false
    }
  };

  const defaultPillars = JSON.parse(JSON.stringify(pillars));

  let activeModalPillarId = null;
  let stagedIntakeData = null;

  function stageIntakeData(data) {
    if (!data) return;
    stagedIntakeData = Object.assign({}, stagedIntakeData || {}, JSON.parse(JSON.stringify(data)));
  }

  function getStagedData() {
    return stagedIntakeData;
  }

  function showPillars() {
    const leftDock = document.getElementById('floatingDockLeft');
    const rightDock = document.getElementById('floatingDockRight');
    const wrapper = document.getElementById('floatingPillarDocksWrapper');
    if (leftDock) leftDock.classList.add('visible');
    if (rightDock) rightDock.classList.add('visible');
    if (wrapper) wrapper.classList.add('visible');
  }

  function hidePillars() {
    const leftDock = document.getElementById('floatingDockLeft');
    const rightDock = document.getElementById('floatingDockRight');
    const wrapper = document.getElementById('floatingPillarDocksWrapper');
    if (leftDock) leftDock.classList.remove('visible');
    if (rightDock) rightDock.classList.remove('visible');
    if (wrapper) wrapper.classList.remove('visible');
  }

  function hasGeneratedPillars() {
    return Object.values(pillars).some(p => p.generated === true);
  }

  function resetPillars() {
    stagedIntakeData = null;
    for (const key of Object.keys(pillars)) {
      pillars[key].generated = false;
      pillars[key].badge = 'Awaiting Intake';
      pillars[key].badgeClass = 'idle';
      if (defaultPillars[key]) {
        pillars[key].values = JSON.parse(JSON.stringify(defaultPillars[key].values));
        pillars[key].analysis = defaultPillars[key].analysis;
      }
    }
    renderFloatingDocks();
    hidePillars();
    closeModal();
  }

  function exportPillarData() {
    const exported = {};
    for (const [key, p] of Object.entries(pillars)) {
      if (p.generated) {
        exported[key] = {
          badge: p.badge,
          values: { ...p.values },
          analysis: p.analysis
        };
      }
    }
    return Object.keys(exported).length > 0 ? exported : null;
  }

  // Initialize and render floating docks in DOM
  function init() {
    renderFloatingDocks();
    if (hasGeneratedPillars()) {
      showPillars();
    } else {
      hidePillars();
    }

    // Escape key listener to close parchment folio modal
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        const modal = document.getElementById('pillarDetailModal');
        if (modal && modal.classList.contains('visible')) {
          closeModal();
        }
      }
    });
  }

  // Render Left (3) and Right (3) floating docks
  function renderFloatingDocks() {
    const leftDock = document.getElementById('floatingDockLeft');
    const rightDock = document.getElementById('floatingDockRight');

    if (!leftDock || !rightDock) return;

    const leftKeys = ['market_size', 'customer_segments', 'business_model'];
    const rightKeys = ['unit_economics', 'usp_moat', 'branding'];

    leftDock.innerHTML = leftKeys.map(k => renderPillarCardHtml(pillars[k])).join('');
    rightDock.innerHTML = rightKeys.map(k => renderPillarCardHtml(pillars[k])).join('');
  }

  const romanLetterMeta = {
    market_size: { roman: 'I', latin: 'I · MERCATUS' },
    customer_segments: { roman: 'II', latin: 'II · CLIENTELA' },
    business_model: { roman: 'III', latin: 'III · NEGOTIUM' },
    unit_economics: { roman: 'IV', latin: 'IV · VECTIGAL' },
    usp_moat: { roman: 'V', latin: 'V · PRAESIDIUM' },
    branding: { roman: 'VI', latin: 'VI · INSIGNE' }
  };

  function renderPillarCardHtml(pillar) {
    const meta = romanLetterMeta[pillar.id] || { roman: 'I', latin: 'I · PILLAR' };
    return `
      <div class="floating-pillar-card roman-letter-card ${pillar.generated ? 'active' : ''}" id="pillar-card-${pillar.id}" onclick="OriginPillars.openModal('${pillar.id}')" title="Inspect ${pillar.title} Fragment">
        <!-- Top Paper Rubric with Stamped Carmine Wax Seal -->
        <div class="letter-top-crest">
          <span class="letter-rubric-text">${meta.latin}</span>
          <div class="letter-wax-seal" title="Sigillum ${meta.roman}">
            <span class="wax-seal-numeral">${meta.roman}</span>
          </div>
        </div>
        
        <!-- Main Paper Content -->
        <div class="letter-body-content">
          <div class="pillar-card-title">${pillar.title}</div>
          <div class="letter-crease-rule"></div>
          <div class="letter-status-row">
            <span class="pillar-card-badge ${pillar.badgeClass}" id="badge-${pillar.id}">${pillar.badge}</span>
            <span class="letter-scroll-hint">&#10022; APERIRE</span>
          </div>
        </div>

        <div class="pillar-card-spark">
          <div class="spark-bar"></div>
        </div>
      </div>
    `;
  }

  // Update a single pillar's badge in the floating card
  function updateCardBadge(id, text, isGenerated = true) {
    const p = pillars[id];
    if (!p) return;
    p.badge = text;
    p.generated = isGenerated;
    p.badgeClass = isGenerated ? 'active' : 'idle';

    const badgeEl = document.getElementById(`badge-${id}`);
    const cardEl = document.getElementById(`pillar-card-${id}`);
    if (badgeEl) {
      badgeEl.textContent = text;
      badgeEl.className = `pillar-card-badge ${p.badgeClass}`;
    }
    if (cardEl) {
      cardEl.classList.toggle('active', isGenerated);
    }
  }

  // Open the detail modal for a pillar (emerging organically from clicked card)
  function openModal(id) {
    const p = pillars[id];
    if (!p) return;
    activeModalPillarId = id;

    const modal = document.getElementById('pillarDetailModal');
    const wrapper = document.getElementById('pillarModalWrapper');
    if (!modal) return;

    // Header content
    const titleEl = document.getElementById('modalPillarTitle');
    const subtitleEl = document.getElementById('modalPillarSubtitle');
    const iconEl = document.getElementById('modalPillarIcon');
    const badgeEl = document.getElementById('modalPillarBadge');
    const numeralEl = document.getElementById('modalPillarNumeral');
    const rubricEl = document.getElementById('modalPillarRubric');

    if (titleEl) titleEl.textContent = p.title;
    if (subtitleEl) subtitleEl.textContent = p.subtitle;
    if (iconEl) iconEl.innerHTML = p.icon;
    if (badgeEl) badgeEl.textContent = p.badge;

    const meta = romanLetterMeta[id] || { roman: 'I', latin: 'I · PILLAR' };
    if (numeralEl) numeralEl.textContent = meta.roman;
    if (rubricEl) rubricEl.textContent = `${meta.latin} · CODEX STRATEGICUS`;

    // Render interactive graph & controls
    renderModalGraph(id);
    renderModalControls(id);
    renderModalAnalysis(id);

    // Calculate exact viewport coordinates of the clicked pillar card
    if (wrapper) {
      const cardEl = document.getElementById(`pillar-card-${id}`);
      if (cardEl) {
        const cardRect = cardEl.getBoundingClientRect();
        if (cardRect.width > 0 && cardRect.height > 0) {
          const cardCenterX = cardRect.left + cardRect.width / 2;
          const cardCenterY = cardRect.top + cardRect.height / 2;

          const vwCenter = window.innerWidth / 2;
          const vhCenter = window.innerHeight / 2;

          const deltaX = Math.round(cardCenterX - vwCenter);
          const deltaY = Math.round(cardCenterY - vhCenter);

          const targetW = Math.min(window.innerWidth * 0.96, 1050);
          const targetH = Math.min(window.innerHeight * 0.94, 700);
          const scaleX = cardRect.width / targetW;
          const scaleY = cardRect.height / targetH;
          const startScale = Math.max(0.16, Math.min(scaleX, scaleY));

          const isLeft = deltaX < 0;
          const startRot = isLeft ? '-2deg' : '2deg';

          wrapper.style.setProperty('--card-origin-x', `${deltaX}px`);
          wrapper.style.setProperty('--card-origin-y', `${deltaY}px`);
          wrapper.style.setProperty('--card-scale', startScale.toFixed(3));
          wrapper.style.setProperty('--card-rot', startRot);
        } else {
          wrapper.style.setProperty('--card-origin-x', '0px');
          wrapper.style.setProperty('--card-origin-y', '30px');
          wrapper.style.setProperty('--card-scale', '0.7');
          wrapper.style.setProperty('--card-rot', '0deg');
        }
      } else {
        wrapper.style.setProperty('--card-origin-x', '0px');
        wrapper.style.setProperty('--card-origin-y', '30px');
        wrapper.style.setProperty('--card-scale', '0.7');
        wrapper.style.setProperty('--card-rot', '0deg');
      }

      // Restart animation cleanly if re-opened
      wrapper.style.animation = 'none';
      void wrapper.offsetWidth;
      wrapper.style.animation = '';
    }

    modal.classList.remove('closing');
    requestAnimationFrame(() => {
      modal.classList.add('visible');
    });
  }

  function closeModal() {
    const modal = document.getElementById('pillarDetailModal');
    if (!modal || !modal.classList.contains('visible')) return;

    modal.classList.add('closing');
    setTimeout(() => {
      modal.classList.remove('visible');
      modal.classList.remove('closing');
      activeModalPillarId = null;
    }, 280);
  }

  // ==========================================================================
  // DYNAMIC SVG GRAPHS GENERATORS (Illuminated Parchment Codex Theme)
  // ==========================================================================

  function renderModalGraph(id) {
    const container = document.getElementById('modalGraphContainer');
    if (!container) return;

    const p = pillars[id];
    let svgHtml = '';

    if (id === 'market_size') {
      const v = p.values;
      const tam = (v.targetAccounts * v.acv / 1e9).toFixed(2);
      const sam = (tam * 0.35 * 1000).toFixed(0);
      const som = (sam * 0.08).toFixed(1);

      svgHtml = `
        <svg viewBox="0 0 520 280" class="pillar-svg-graph">
          <defs>
            <linearGradient id="tamGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="#2d4f7c" stop-opacity="0.95"/>
              <stop offset="100%" stop-color="#1e3452" stop-opacity="0.75"/>
            </linearGradient>
            <linearGradient id="samGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="#2c6e80" stop-opacity="0.95"/>
              <stop offset="100%" stop-color="#1d4854" stop-opacity="0.75"/>
            </linearGradient>
            <linearGradient id="somGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="#8b1818" stop-opacity="0.95"/>
              <stop offset="100%" stop-color="#580d0d" stop-opacity="0.8"/>
            </linearGradient>
          </defs>

          <!-- Antique Grid Lines -->
          <line x1="50" y1="230" x2="480" y2="230" stroke="rgba(130,95,55,0.32)" stroke-width="1.2"/>
          <line x1="50" y1="160" x2="480" y2="160" stroke="rgba(130,95,55,0.18)" stroke-dasharray="4,4"/>
          <line x1="50" y1="90" x2="480" y2="90" stroke="rgba(130,95,55,0.18)" stroke-dasharray="4,4"/>

          <!-- Bars -->
          <!-- TAM Bar (Lapis Lazuli) -->
          <g class="graph-bar-group">
            <rect x="90" y="50" width="80" height="180" rx="6" fill="url(#tamGrad)" stroke="#233e61" stroke-width="1.5"/>
            <text x="130" y="40" fill="#1c140a" font-family="'Cinzel', serif" font-size="14" font-weight="800" text-anchor="middle">$${tam}B</text>
            <text x="130" y="250" fill="#3b2b1b" font-family="'Cinzel', serif" font-size="11" font-weight="700" text-anchor="middle">TAM</text>
            <text x="130" y="265" fill="#6f563d" font-size="9.5" text-anchor="middle">Total Universe</text>
          </g>

          <!-- SAM Bar (Florentine Azure) -->
          <g class="graph-bar-group">
            <rect x="220" y="115" width="80" height="115" rx="6" fill="url(#samGrad)" stroke="#1f4f5c" stroke-width="1.5"/>
            <text x="260" y="105" fill="#1c140a" font-family="'Cinzel', serif" font-size="14" font-weight="800" text-anchor="middle">$${sam}M</text>
            <text x="260" y="250" fill="#3b2b1b" font-family="'Cinzel', serif" font-size="11" font-weight="700" text-anchor="middle">SAM</text>
            <text x="260" y="265" fill="#6f563d" font-size="9.5" text-anchor="middle">Fit Target (35%)</text>
          </g>

          <!-- SOM Bar (Imperial Carmine) -->
          <g class="graph-bar-group">
            <rect x="350" y="180" width="80" height="50" rx="6" fill="url(#somGrad)" stroke="#580d0d" stroke-width="1.5"/>
            <text x="390" y="170" fill="#8b1818" font-family="'Cinzel', serif" font-size="14" font-weight="900" text-anchor="middle">$${som}M</text>
            <text x="390" y="250" fill="#8b1818" font-family="'Cinzel', serif" font-size="11" font-weight="800" text-anchor="middle">SOM (Year 2)</text>
            <text x="390" y="265" fill="#6f563d" font-size="9.5" text-anchor="middle">Initial Beachhead</text>
          </g>

          <!-- Inflection Curve connecting tops -->
          <path d="M 130 50 Q 260 100 390 180" fill="none" stroke="#8b1818" stroke-width="2" stroke-dasharray="5,5" opacity="0.75"/>
          <circle cx="390" cy="180" r="5" fill="#8b1818" stroke="#fdfbf7" stroke-width="2"/>
        </svg>
      `;
    } else if (id === 'customer_segments') {
      const v = p.values;
      const entW = Math.max(10, v.enterprisePct * 3.8);
      const midW = Math.max(10, v.midMarketPct * 3.8);
      const smbW = Math.max(10, (100 - v.enterprisePct - v.midMarketPct) * 3.8);

      svgHtml = `
        <svg viewBox="0 0 520 280" class="pillar-svg-graph">
          <text x="40" y="35" fill="#1c140a" font-family="'Cinzel', serif" font-size="13" font-weight="800">ICP Revenue Share Distribution</text>
          
          <rect x="40" y="55" width="440" height="28" rx="6" fill="rgba(140,105,65,0.15)" stroke="rgba(140,105,65,0.25)"/>
          
          <rect x="40" y="55" width="${entW}" height="28" rx="4" fill="#8b1818"/>
          <rect x="${40 + entW}" y="55" width="${midW}" height="28" fill="#2d4f7c"/>
          <rect x="${40 + entW + midW}" y="55" width="${smbW}" height="28" rx="4" fill="#236343"/>

          <!-- Tier Cards -->
          <!-- Enterprise -->
          <g transform="translate(40, 105)">
            <rect width="135" height="142" rx="8" fill="rgba(255,255,255,0.75)" stroke="rgba(139,24,24,0.3)" stroke-width="1.2"/>
            <circle cx="20" cy="22" r="6" fill="#8b1818"/>
            <text x="32" y="26" fill="#1c140a" font-family="'Cinzel', serif" font-size="10.5" font-weight="700">Tier 1: Enterprise</text>
            <text x="14" y="52" fill="#8b1818" font-family="'Cinzel', serif" font-size="18" font-weight="900">${v.enterprisePct}%</text>
            <text x="14" y="74" fill="#523f2d" font-size="10.5">ACV: $45k - $120k</text>
            <text x="14" y="94" fill="#523f2d" font-size="10.5">Cycle: 90-120 days</text>
            <text x="14" y="118" fill="#8b1818" font-size="9.5" font-weight="700">Primary Core Wedge</text>
          </g>

          <!-- Mid-Market -->
          <g transform="translate(192, 105)">
            <rect width="135" height="142" rx="8" fill="rgba(255,255,255,0.75)" stroke="rgba(45,79,124,0.3)" stroke-width="1.2"/>
            <circle cx="20" cy="22" r="6" fill="#2d4f7c"/>
            <text x="32" y="26" fill="#1c140a" font-family="'Cinzel', serif" font-size="10.5" font-weight="700">Tier 2: Mid-Market</text>
            <text x="14" y="52" fill="#2d4f7c" font-family="'Cinzel', serif" font-size="18" font-weight="900">${v.midMarketPct}%</text>
            <text x="14" y="74" fill="#523f2d" font-size="10.5">ACV: $12k - $35k</text>
            <text x="14" y="94" fill="#523f2d" font-size="10.5">Cycle: 30-45 days</text>
            <text x="14" y="118" fill="#2d4f7c" font-size="9.5" font-weight="700">Expansion Velocity</text>
          </g>

          <!-- SMB -->
          <g transform="translate(345, 105)">
            <rect width="135" height="142" rx="8" fill="rgba(255,255,255,0.75)" stroke="rgba(35,99,67,0.3)" stroke-width="1.2"/>
            <circle cx="20" cy="22" r="6" fill="#236343"/>
            <text x="32" y="26" fill="#1c140a" font-family="'Cinzel', serif" font-size="10.5" font-weight="700">Tier 3: SMB</text>
            <text x="14" y="52" fill="#236343" font-family="'Cinzel', serif" font-size="18" font-weight="900">${100 - v.enterprisePct - v.midMarketPct}%</text>
            <text x="14" y="74" fill="#523f2d" font-size="10.5">ACV: $2k - $6k</text>
            <text x="14" y="94" fill="#523f2d" font-size="10.5">Cycle: Self-serve</text>
            <text x="14" y="118" fill="#236343" font-size="9.5" font-weight="700">Organic Inflow</text>
          </g>
        </svg>
      `;
    } else if (id === 'business_model') {
      const v = p.values;
      svgHtml = `
        <svg viewBox="0 0 520 280" class="pillar-svg-graph">
          <text x="40" y="30" fill="#1c140a" font-family="'Cinzel', serif" font-size="13" font-weight="800">Revenue Stream Mix & Monetization Flywheel</text>

          <!-- Donut / Concentric Flow -->
          <g transform="translate(130, 150)">
            <!-- Outer Ring (SaaS Platform) -->
            <circle r="70" fill="none" stroke="rgba(140,105,65,0.14)" stroke-width="18"/>
            <circle r="70" fill="none" stroke="#8b1818" stroke-width="18" stroke-dasharray="${v.subShare * 4.4} 440" stroke-linecap="round"/>
            <!-- Middle Ring (Consumption) -->
            <circle r="48" fill="none" stroke="#2d4f7c" stroke-width="12" stroke-dasharray="${v.usageShare * 3.0} 300" stroke-linecap="round"/>
            <text x="0" y="5" fill="#1c140a" font-family="'Cinzel', serif" font-size="18" font-weight="900" text-anchor="middle">${v.subShare}%</text>
            <text x="0" y="22" fill="#6f563d" font-size="9.5" font-weight="700" text-anchor="middle">Recurring</text>
          </g>

          <!-- Legend & Flywheel Nodes -->
          <g transform="translate(260, 65)">
            <g transform="translate(0, 0)">
              <rect width="12" height="12" rx="3" fill="#8b1818"/>
              <text x="22" y="10" fill="#1c140a" font-size="12" font-weight="700">Platform SaaS Sub: ${v.subShare}%</text>
              <text x="22" y="24" fill="#6f563d" font-size="10">Base annual recurring software seats</text>
            </g>

            <g transform="translate(0, 48)">
              <rect width="12" height="12" rx="3" fill="#2d4f7c"/>
              <text x="22" y="10" fill="#1c140a" font-size="12" font-weight="700">Usage & API Compute: ${v.usageShare}%</text>
              <text x="22" y="24" fill="#6f563d" font-size="10">Elastic consumption tied to workflow depth</text>
            </g>

            <g transform="translate(0, 96)">
              <rect width="12" height="12" rx="3" fill="#236343"/>
              <text x="22" y="10" fill="#1c140a" font-size="12" font-weight="700">Enterprise Add-ons: ${100 - v.subShare - v.usageShare}%</text>
              <text x="22" y="24" fill="#6f563d" font-size="10">SLA, custom model training, governance</text>
            </g>

            <g transform="translate(0, 145)">
              <rect width="230" height="34" rx="6" fill="rgba(255,255,255,0.75)" stroke="rgba(140,105,65,0.3)"/>
              <text x="115" y="21" fill="#3b2b1b" font-family="'Cinzel', serif" font-size="9.5" font-weight="700" text-anchor="middle">Flywheel: Land Platform ➔ Expand Usage ➔ High NRR</text>
            </g>
          </g>
        </svg>
      `;
    } else if (id === 'unit_economics') {
      const v = p.values;
      const ratio = (v.ltv / v.cac).toFixed(1);
      const cacH = 50;
      const ltvH = Math.min(180, Math.max(60, cacH * (ratio / 2)));

      svgHtml = `
        <svg viewBox="0 0 520 280" class="pillar-svg-graph">
          <text x="40" y="30" fill="#1c140a" font-family="'Cinzel', serif" font-size="13" font-weight="800">Capital Efficiency: LTV vs CAC & Payback Velocity</text>

          <!-- CAC vs LTV Comparison Bars -->
          <g transform="translate(80, 230)">
            <!-- Baseline -->
            <line x1="-30" y1="0" x2="380" y2="0" stroke="rgba(130,95,55,0.35)" stroke-width="1.5"/>

            <!-- CAC Bar -->
            <rect x="20" y="-${cacH}" width="65" height="${cacH}" rx="6" fill="#5c4a38"/>
            <text x="52" y="-${cacH + 10}" fill="#1c140a" font-family="'Cinzel', serif" font-size="13" font-weight="800" text-anchor="middle">$${(v.cac/1000).toFixed(1)}k</text>
            <text x="52" y="20" fill="#523f2d" font-family="'Cinzel', serif" font-size="11" font-weight="700" text-anchor="middle">CAC</text>

            <!-- LTV Bar -->
            <rect x="130" y="-${ltvH}" width="65" height="${ltvH}" rx="6" fill="url(#somGrad)" stroke="#580d0d" stroke-width="1.5"/>
            <text x="162" y="-${ltvH + 10}" fill="#8b1818" font-family="'Cinzel', serif" font-size="15" font-weight="900" text-anchor="middle">$${(v.ltv/1000).toFixed(1)}k</text>
            <text x="162" y="20" fill="#8b1818" font-family="'Cinzel', serif" font-size="11" font-weight="800" text-anchor="middle">3-Yr LTV</text>

            <!-- Multiplier Badge -->
            <g transform="translate(230, -110)">
              <rect width="145" height="90" rx="8" fill="rgba(139,24,24,0.08)" stroke="rgba(139,24,24,0.3)" stroke-width="1.2"/>
              <text x="72" y="26" fill="#6f563d" font-family="'Cinzel', serif" font-size="10" font-weight="700" text-anchor="middle">LTV : CAC RATIO</text>
              <text x="72" y="58" fill="#8b1818" font-family="'Cinzel', serif" font-size="28" font-weight="900" text-anchor="middle">${ratio}x</text>
              <text x="72" y="78" fill="#1b5e3a" font-size="9.5" font-weight="700" text-anchor="middle">Institutional (&gt;3.0x)</text>
            </g>

            <!-- Payback Gauge Pill -->
            <g transform="translate(230, -10)">
              <text x="0" y="-8" fill="#2d2114" font-size="11" font-weight="600">Payback Period: <tspan fill="#2c6e80" font-weight="800">${v.paybackMonths} Months</tspan></text>
              <rect x="0" y="2" width="145" height="6" rx="3" fill="rgba(140,105,65,0.2)"/>
              <rect x="0" y="2" width="${Math.min(145, v.paybackMonths * 10.3)}" height="6" rx="3" fill="#2c6e80"/>
            </g>
          </g>
        </svg>
      `;
    } else if (id === 'usp_moat') {
      const v = p.values;
      const powers = [
        { name: 'Switching Costs', score: v.switchingCosts, desc: 'ERP & Workflow embeddedness' },
        { name: 'Counter-Positioning', score: v.counterPositioning, desc: 'Legacy SAP/Oracle pricing friction' },
        { name: 'Network Effects', score: v.networkEffects, desc: 'Cross-organization risk data density' },
        { name: 'Cornered Resource', score: v.corneredResource, desc: 'Proprietary enterprise graph' },
        { name: 'Brand Power', score: v.brandPower, desc: 'Institutional trust & authority' }
      ];

      svgHtml = `
        <svg viewBox="0 0 520 280" class="pillar-svg-graph">
          <text x="40" y="30" fill="#1c140a" font-family="'Cinzel', serif" font-size="13" font-weight="800">Hamilton Helmer's 7 Powers Defensibility Radar</text>

          <g transform="translate(40, 55)">
            ${powers.map((pow, i) => `
              <g transform="translate(0, ${i * 42})">
                <text x="0" y="12" fill="#1c140a" font-size="11" font-weight="700">${pow.name}</text>
                <text x="380" y="12" fill="#8b1818" font-family="'Cinzel', serif" font-size="12" font-weight="800" text-anchor="end">${pow.score}/100</text>
                <rect x="0" y="20" width="380" height="8" rx="4" fill="rgba(140,105,65,0.15)"/>
                <rect x="0" y="20" width="${pow.score * 3.8}" height="8" rx="4" fill="url(#somGrad)"/>
                <text x="0" y="38" fill="#6f563d" font-size="9.5">${pow.desc}</text>
              </g>
            `).join('')}

            <!-- Overall Moat Badge -->
            <g transform="translate(400, 20)">
              <rect width="70" height="150" rx="8" fill="rgba(255,255,255,0.75)" stroke="rgba(140,105,65,0.3)"/>
              <text x="35" y="35" fill="#6f563d" font-family="'Cinzel', serif" font-size="10" font-weight="700" text-anchor="middle">MOAT</text>
              <text x="35" y="70" fill="#8b1818" font-family="'Cinzel', serif" font-size="24" font-weight="900" text-anchor="middle">${v.overallMoatScore}</text>
              <text x="35" y="90" fill="#2d2114" font-family="'Cinzel', serif" font-size="10" font-weight="700" text-anchor="middle">Score</text>
              <text x="35" y="120" fill="#1b5e3a" font-size="8.5" font-weight="800" text-anchor="middle">DEFENSIBLE</text>
            </g>
          </g>
        </svg>
      `;
    } else if (id === 'branding') {
      const v = p.values;
      svgHtml = `
        <svg viewBox="0 0 520 280" class="pillar-svg-graph">
          <text x="40" y="30" fill="#1c140a" font-family="'Cinzel', serif" font-size="13" font-weight="800">Brand Architecture & Sovereign Market Resonance</text>

          <!-- Circular Brand Health Dial -->
          <g transform="translate(130, 150)">
            <circle r="75" fill="none" stroke="rgba(140,105,65,0.15)" stroke-width="14"/>
            <circle r="75" fill="none" stroke="#8b1818" stroke-width="14" stroke-dasharray="${v.healthScore * 4.7} 471" stroke-linecap="round"/>
            <text x="0" y="8" fill="#1c140a" font-family="'Cinzel', serif" font-size="28" font-weight="900" text-anchor="middle">${v.healthScore}</text>
            <text x="0" y="28" fill="#6f563d" font-family="'Cinzel', serif" font-size="10" font-weight="700" text-anchor="middle">/ 100 HEALTH</text>
          </g>

          <!-- Brand Metrics & Positioning Matrix -->
          <g transform="translate(250, 60)">
            <g transform="translate(0, 0)">
              <text x="0" y="10" fill="#6f563d" font-family="'Cinzel', serif" font-size="10" font-weight="700">BRAND ARCHETYPE</text>
              <text x="0" y="28" fill="#1c140a" font-size="13.5" font-weight="800">${v.archetype}</text>
            </g>

            <g transform="translate(0, 50)">
              <text x="0" y="10" fill="#6f563d" font-family="'Cinzel', serif" font-size="10" font-weight="700">DISTINCTIVENESS VS STATUS QUO</text>
              <rect x="0" y="18" width="220" height="8" rx="4" fill="rgba(140,105,65,0.15)"/>
              <rect x="0" y="18" width="${v.distinctiveness * 2.2}" height="8" rx="4" fill="#8b1818"/>
              <text x="225" y="26" fill="#8b1818" font-family="'Cinzel', serif" font-size="10.5" font-weight="800">${v.distinctiveness}%</text>
            </g>

            <g transform="translate(0, 95)">
              <text x="0" y="10" fill="#6f563d" font-family="'Cinzel', serif" font-size="10" font-weight="700">EXECUTIVE AUDIENCE RESONANCE</text>
              <rect x="0" y="18" width="220" height="8" rx="4" fill="rgba(140,105,65,0.15)"/>
              <rect x="0" y="18" width="${v.resonance * 2.2}" height="8" rx="4" fill="#2d4f7c"/>
              <text x="225" y="26" fill="#2d4f7c" font-family="'Cinzel', serif" font-size="10.5" font-weight="800">${v.resonance}%</text>
            </g>

            <g transform="translate(0, 145)">
              <rect width="240" height="32" rx="6" fill="rgba(139,24,24,0.08)" stroke="rgba(139,24,24,0.3)"/>
              <text x="120" y="21" fill="#8b1818" font-family="'Cinzel', serif" font-size="10" font-weight="800" text-anchor="middle">Anti-Generic Defense: Sovereign Authority</text>
            </g>
          </g>
        </svg>
      `;
    }

    container.innerHTML = svgHtml;
  }

  // Render reactive sliders & input controls for the pillar
  function renderModalControls(id) {
    const container = document.getElementById('modalControlsContainer');
    if (!container) return;

    const p = pillars[id];
    let controlsHtml = '';

    if (id === 'market_size') {
      controlsHtml = `
        <div class="pillar-control-group">
          <label class="control-label">
            <span>Target Accounts (TAM Universe):</span>
            <strong id="val-accounts">${p.values.targetAccounts.toLocaleString()}</strong>
          </label>
          <input type="range" min="5000" max="100000" step="1000" value="${p.values.targetAccounts}"
            oninput="OriginPillars.updateValue('market_size', 'targetAccounts', parseInt(this.value)); document.getElementById('val-accounts').textContent = parseInt(this.value).toLocaleString();" />
        </div>

        <div class="pillar-control-group">
          <label class="control-label">
            <span>Annual Contract Value (ACV):</span>
            <strong id="val-acv">$${p.values.acv.toLocaleString()}</strong>
          </label>
          <input type="range" min="5000" max="150000" step="2500" value="${p.values.acv}"
            oninput="OriginPillars.updateValue('market_size', 'acv', parseInt(this.value)); document.getElementById('val-acv').textContent = '$' + parseInt(this.value).toLocaleString();" />
        </div>
      `;
    } else if (id === 'customer_segments') {
      controlsHtml = `
        <div class="pillar-control-group">
          <label class="control-label">
            <span>Enterprise Segment Mix (%):</span>
            <strong id="val-ent">${p.values.enterprisePct}%</strong>
          </label>
          <input type="range" min="20" max="80" step="5" value="${p.values.enterprisePct}"
            oninput="OriginPillars.updateValue('customer_segments', 'enterprisePct', parseInt(this.value)); document.getElementById('val-ent').textContent = this.value + '%';" />
        </div>

        <div class="pillar-control-group">
          <label class="control-label">
            <span>Mid-Market Segment Mix (%):</span>
            <strong id="val-mid">${p.values.midMarketPct}%</strong>
          </label>
          <input type="range" min="10" max="60" step="5" value="${p.values.midMarketPct}"
            oninput="OriginPillars.updateValue('customer_segments', 'midMarketPct', parseInt(this.value)); document.getElementById('val-mid').textContent = this.value + '%';" />
        </div>
      `;
    } else if (id === 'business_model') {
      controlsHtml = `
        <div class="pillar-control-group">
          <label class="control-label">
            <span>Subscription Platform Share (%):</span>
            <strong id="val-sub">${p.values.subShare}%</strong>
          </label>
          <input type="range" min="30" max="90" step="5" value="${p.values.subShare}"
            oninput="OriginPillars.updateValue('business_model', 'subShare', parseInt(this.value)); document.getElementById('val-sub').textContent = this.value + '%';" />
        </div>

        <div class="pillar-control-group">
          <label class="control-label">
            <span>Usage / Consumption Share (%):</span>
            <strong id="val-usage">${p.values.usageShare}%</strong>
          </label>
          <input type="range" min="5" max="50" step="5" value="${p.values.usageShare}"
            oninput="OriginPillars.updateValue('business_model', 'usageShare', parseInt(this.value)); document.getElementById('val-usage').textContent = this.value + '%';" />
        </div>
      `;
    } else if (id === 'unit_economics') {
      controlsHtml = `
        <div class="pillar-control-group">
          <label class="control-label">
            <span>Customer Acquisition Cost (CAC):</span>
            <strong id="val-cac">$${p.values.cac.toLocaleString()}</strong>
          </label>
          <input type="range" min="1000" max="30000" step="500" value="${p.values.cac}"
            oninput="OriginPillars.updateValue('unit_economics', 'cac', parseInt(this.value)); document.getElementById('val-cac').textContent = '$' + parseInt(this.value).toLocaleString();" />
        </div>

        <div class="pillar-control-group">
          <label class="control-label">
            <span>3-Year Enterprise LTV:</span>
            <strong id="val-ltv">$${p.values.ltv.toLocaleString()}</strong>
          </label>
          <input type="range" min="10000" max="150000" step="2500" value="${p.values.ltv}"
            oninput="OriginPillars.updateValue('unit_economics', 'ltv', parseInt(this.value)); document.getElementById('val-ltv').textContent = '$' + parseInt(this.value).toLocaleString();" />
        </div>
      `;
    } else if (id === 'usp_moat') {
      controlsHtml = `
        <div class="pillar-control-group">
          <label class="control-label">
            <span>Switching Costs Power (0-100):</span>
            <strong id="val-sc">${p.values.switchingCosts}/100</strong>
          </label>
          <input type="range" min="20" max="100" step="2" value="${p.values.switchingCosts}"
            oninput="OriginPillars.updateValue('usp_moat', 'switchingCosts', parseInt(this.value)); document.getElementById('val-sc').textContent = this.value + '/100';" />
        </div>

        <div class="pillar-control-group">
          <label class="control-label">
            <span>Counter-Positioning Advantage:</span>
            <strong id="val-cp">${p.values.counterPositioning}/100</strong>
          </label>
          <input type="range" min="20" max="100" step="2" value="${p.values.counterPositioning}"
            oninput="OriginPillars.updateValue('usp_moat', 'counterPositioning', parseInt(this.value)); document.getElementById('val-cp').textContent = this.value + '/100';" />
        </div>
      `;
    } else if (id === 'branding') {
      controlsHtml = `
        <div class="pillar-control-group">
          <label class="control-label">
            <span>Anti-Generic Distinctiveness:</span>
            <strong id="val-dist">${p.values.distinctiveness}%</strong>
          </label>
          <input type="range" min="40" max="100" step="2" value="${p.values.distinctiveness}"
            oninput="OriginPillars.updateValue('branding', 'distinctiveness', parseInt(this.value)); document.getElementById('val-dist').textContent = this.value + '%';" />
        </div>

        <div class="pillar-control-group">
          <label class="control-label">
            <span>Audience Resonance Score:</span>
            <strong id="val-res">${p.values.resonance}%</strong>
          </label>
          <input type="range" min="40" max="100" step="2" value="${p.values.resonance}"
            oninput="OriginPillars.updateValue('branding', 'resonance', parseInt(this.value)); document.getElementById('val-res').textContent = this.value + '%';" />
        </div>
      `;
    }

    container.innerHTML = controlsHtml;
  }

  // Render the AI Strategic write-up inside the open modal
  function renderModalAnalysis(id) {
    const textEl = document.getElementById('modalPillarAnalysis');
    if (!textEl) return;
    const p = pillars[id];
    textEl.innerHTML = (typeof marked !== 'undefined' && marked.parse) ? marked.parse(p.analysis) : `<p>${p.analysis}</p>`;
  }

  // Update a value dynamically and redraw graph in real time
  function updateValue(id, key, newVal) {
    const p = pillars[id];
    if (!p) return;
    p.values[key] = newVal;
    p.generated = true;

    // Recalculate badge if needed
    if (id === 'market_size') {
      const tam = (p.values.targetAccounts * p.values.acv / 1e9).toFixed(1);
      p.badge = `$${tam}B TAM`;
    } else if (id === 'unit_economics') {
      const ratio = (p.values.ltv / p.values.cac).toFixed(1);
      p.badge = `${ratio}x LTV:CAC`;
    } else if (id === 'usp_moat') {
      p.badge = `${p.values.overallMoatScore}/100 Moat`;
    } else if (id === 'branding') {
      p.badge = `${p.values.healthScore}/100 Brand`;
    } else if (id === 'customer_segments') {
      p.badge = `${p.values.enterprisePct}% Enterprise`;
    } else if (id === 'business_model') {
      p.badge = `${p.values.subShare}% SaaS Sub`;
    }

    updateCardBadge(id, p.badge, true);

    if (activeModalPillarId === id) {
      renderModalGraph(id);
      document.getElementById('modalPillarBadge').textContent = p.badge;
    }
  }

  // Calibrate pillars from MCQ diagnostic answers (supports object map or raw user answer text)
  function calibrateFromMcq(answers = selectedMcqAnswers) {
    if (!answers) return;

    let icpAns = '';
    let pricingAns = '';
    let moatAns = '';
    let stageAns = '';

    if (typeof answers === 'string') {
      const text = answers.toLowerCase();
      // Match 1. Target Customer Segment
      const icpMatch = text.match(/(?:target customer segment|primary target customer)[^:]*:\s*(?:👉\s*)?([^\n\d]+)/i);
      if (icpMatch) icpAns = icpMatch[1].trim().toLowerCase();
      else if (text.includes('asset manager') || text.includes('hedge fund') || text.includes('enterprise')) icpAns = 'enterprise';

      // Match 2. Monetization
      const prMatch = text.match(/(?:monetization architecture|monetization)[^:]*:\s*(?:👉\s*)?([^\n\d]+)/i);
      if (prMatch) pricingAns = prMatch[1].trim().toLowerCase();
      else if (text.includes('hybrid') || text.includes('platform fee')) pricingAns = 'hybrid';

      // Match 3. Moat
      const moatMatch = text.match(/(?:competitive moat|unfair advantage)[^:]*:\s*(?:👉\s*)?([^\n\d]+)/i);
      if (moatMatch) moatAns = moatMatch[1].trim().toLowerCase();
      else if (text.includes('data integration') || text.includes('controls monitoring') || text.includes('network')) moatAns = 'data network';

      // Match 4. Stage
      const stgMatch = text.match(/(?:operational stage)[^:]*:\s*(?:👉\s*)?([^\n\d]+)/i);
      if (stgMatch) stageAns = stgMatch[1].trim().toLowerCase();
      else if (text.includes('prototype') || text.includes('beta') || text.includes('design partner')) stageAns = 'prototype beta';
    } else if (typeof answers === 'object') {
      icpAns = String(answers.q_icp || answers['0'] || answers[0] || '').toLowerCase();
      pricingAns = String(answers.q_pricing || answers['1'] || answers[1] || '').toLowerCase();
      moatAns = String(answers.q_moat || answers['2'] || answers[2] || '').toLowerCase();
      stageAns = String(answers.q_stage || answers['3'] || answers[3] || '').toLowerCase();
    }

    // 1. Target Customer Segment -> Customer Segments pillar
    if (icpAns.includes('enterprise') || icpAns.includes('specialized') || icpAns.includes('asset manager') || icpAns.includes('hedge fund')) {
      pillars.customer_segments.values.enterprisePct = 75;
      pillars.customer_segments.values.midMarketPct = 20;
      pillars.customer_segments.values.smbPct = 5;
      pillars.customer_segments.badge = '75% Enterprise';
    } else if (icpAns.includes('mid-market')) {
      pillars.customer_segments.values.enterprisePct = 25;
      pillars.customer_segments.values.midMarketPct = 60;
      pillars.customer_segments.values.smbPct = 15;
      pillars.customer_segments.badge = '60% Mid-Market';
    } else if (icpAns.includes('smb') || icpAns.includes('prosumer')) {
      pillars.customer_segments.values.enterprisePct = 10;
      pillars.customer_segments.values.midMarketPct = 30;
      pillars.customer_segments.values.smbPct = 60;
      pillars.customer_segments.badge = '60% SMB / Self';
    } else if (icpAns.includes('consumer') || icpAns.includes('b2c')) {
      pillars.customer_segments.values.enterprisePct = 0;
      pillars.customer_segments.values.midMarketPct = 10;
      pillars.customer_segments.values.smbPct = 90;
      pillars.customer_segments.badge = '90% Consumer';
    }

    // 2. Monetization -> Business Model pillar
    if (pricingAns.includes('subscription') || pricingAns.includes('saas')) {
      pillars.business_model.values.subShare = 80;
      pillars.business_model.values.usageShare = 15;
      pillars.business_model.values.serviceShare = 5;
      pillars.business_model.badge = '80% SaaS Sub';
    } else if (pricingAns.includes('usage') || pricingAns.includes('consumption')) {
      pillars.business_model.values.subShare = 30;
      pillars.business_model.values.usageShare = 65;
      pillars.business_model.values.serviceShare = 5;
      pillars.business_model.badge = '65% Usage Rev';
    } else if (pricingAns.includes('hybrid') || pricingAns.includes('platform fee') || pricingAns.includes('professional services')) {
      pillars.business_model.values.subShare = 55;
      pillars.business_model.values.usageShare = 30;
      pillars.business_model.values.serviceShare = 15;
      pillars.business_model.badge = 'Hybrid Base+Use';
    } else if (pricingAns.includes('marketplace') || pricingAns.includes('take-rate')) {
      pillars.business_model.values.subShare = 10;
      pillars.business_model.values.usageShare = 85;
      pillars.business_model.values.serviceShare = 5;
      pillars.business_model.badge = 'Take-Rate Fly';
    }

    // 3. Competitive Moat -> USP & Moat pillar
    if (moatAns.includes('switching')) {
      pillars.usp_moat.values.switchingCosts = 95;
      pillars.usp_moat.values.overallMoatScore = 88;
      pillars.usp_moat.badge = '95/100 Switch';
    } else if (moatAns.includes('counter')) {
      pillars.usp_moat.values.counterPositioning = 94;
      pillars.usp_moat.values.overallMoatScore = 87;
      pillars.usp_moat.badge = '94/100 Counter';
    } else if (moatAns.includes('network') || moatAns.includes('data') || moatAns.includes('integration') || moatAns.includes('controls')) {
      pillars.usp_moat.values.networkEffects = 92;
      pillars.usp_moat.values.overallMoatScore = 86;
      pillars.usp_moat.badge = '92/100 NetEff';
    } else if (moatAns.includes('process')) {
      pillars.usp_moat.values.processPower = 90;
      pillars.usp_moat.values.overallMoatScore = 84;
      pillars.usp_moat.badge = '90/100 Process';
    }

    // 4. Operational Stage -> Unit Economics pillar
    if (stageAns.includes('ideation')) {
      pillars.unit_economics.values.paybackMonths = 12.0;
      pillars.unit_economics.badge = 'Discovery Phase';
    } else if (stageAns.includes('prototype') || stageAns.includes('beta') || stageAns.includes('design partner')) {
      pillars.unit_economics.values.paybackMonths = 8.5;
      pillars.unit_economics.badge = '5.0x LTV:CAC';
    } else if (stageAns.includes('traction') || stageAns.includes('mrr')) {
      pillars.unit_economics.values.paybackMonths = 6.2;
      pillars.unit_economics.badge = '6.8x LTV:CAC';
    } else if (stageAns.includes('scaling')) {
      pillars.unit_economics.values.paybackMonths = 4.5;
      pillars.unit_economics.badge = '8.2x LTV:CAC';
    }
  }

  // Batch update from AI payload
  function syncPillarsFromAI(data, mcqAnswers) {
    // 1. Merge incoming data over staged intake baseline (ensures truncated fields retain baseline)
    const combined = Object.assign({}, stagedIntakeData || {}, data || {});

    // Explicitly activate all 6 pillars
    Object.keys(pillars).forEach(k => {
      pillars[k].generated = true;
    });

    // 2. Calibrate from MCQ selections if available
    calibrateFromMcq(mcqAnswers || selectedMcqAnswers);

    // 3. Market Size
    if (combined.market_size) {
      const ms = combined.market_size;
      if (ms.targetAccounts) pillars.market_size.values.targetAccounts = parseInt(ms.targetAccounts);
      if (ms.acv) pillars.market_size.values.acv = parseInt(ms.acv);
      if (ms.tam) pillars.market_size.badge = ms.tam + ' TAM';
      else {
        const tam = (pillars.market_size.values.targetAccounts * pillars.market_size.values.acv / 1e9).toFixed(1);
        pillars.market_size.badge = `$${tam}B TAM`;
      }
      if (ms.analysis) pillars.market_size.analysis = ms.analysis;
    }
    updateCardBadge('market_size', pillars.market_size.badge, true);

    // 4. Customer Segments
    if (combined.customer_segments) {
      const cs = combined.customer_segments;
      if (cs.enterprisePct) pillars.customer_segments.values.enterprisePct = parseInt(cs.enterprisePct);
      if (cs.midMarketPct) pillars.customer_segments.values.midMarketPct = parseInt(cs.midMarketPct);
      if (cs.summary) pillars.customer_segments.badge = cs.summary.slice(0, 16);
      else pillars.customer_segments.badge = `${pillars.customer_segments.values.enterprisePct}% Enterprise`;
      if (cs.analysis) pillars.customer_segments.analysis = cs.analysis;
    }
    updateCardBadge('customer_segments', pillars.customer_segments.badge, true);

    // 5. Business Model
    if (combined.business_model) {
      const bm = combined.business_model;
      const sub = bm.subShare || bm.platformShare;
      if (sub) pillars.business_model.values.subShare = parseInt(sub);
      if (bm.usageShare) pillars.business_model.values.usageShare = parseInt(bm.usageShare);
      if (bm.summary) pillars.business_model.badge = bm.summary.slice(0, 18);
      else pillars.business_model.badge = `${pillars.business_model.values.subShare}% SaaS Sub`;
      if (bm.analysis) pillars.business_model.analysis = bm.analysis;
    }
    updateCardBadge('business_model', pillars.business_model.badge, true);

    // 6. Unit Economics
    if (combined.unit_economics) {
      const ue = combined.unit_economics;
      if (ue.cac) pillars.unit_economics.values.cac = parseInt(ue.cac.toString().replace(/[^0-9]/g, '')) || 8500;
      if (ue.ltv) pillars.unit_economics.values.ltv = parseInt(ue.ltv.toString().replace(/[^0-9]/g, '')) || 42500;
      if (ue.ratio) pillars.unit_economics.badge = `${ue.ratio} LTV:CAC`;
      else {
        const ratio = (pillars.unit_economics.values.ltv / pillars.unit_economics.values.cac).toFixed(1);
        pillars.unit_economics.badge = `${ratio}x LTV:CAC`;
      }
      if (ue.analysis) pillars.unit_economics.analysis = ue.analysis;
    } else {
      const ratio = (pillars.unit_economics.values.ltv / pillars.unit_economics.values.cac).toFixed(1);
      pillars.unit_economics.badge = `${ratio}x LTV:CAC`;
    }
    updateCardBadge('unit_economics', pillars.unit_economics.badge, true);

    // 7. USP & Moat
    if (combined.usp_moat) {
      const um = combined.usp_moat;
      const score = um.overallMoatScore || um.score || (um.switchingCosts ? Math.round((parseInt(um.switchingCosts) + (parseInt(um.counterPositioning) || 80) + (parseInt(um.networkEffects) || 70)) / 3) : null);
      if (score) {
        pillars.usp_moat.values.overallMoatScore = parseInt(score);
        pillars.usp_moat.badge = `${parseInt(score)}/100 Moat`;
      }
      if (um.switchingCosts) pillars.usp_moat.values.switchingCosts = parseInt(um.switchingCosts);
      if (um.counterPositioning) pillars.usp_moat.values.counterPositioning = parseInt(um.counterPositioning);
      if (um.analysis) pillars.usp_moat.analysis = um.analysis;
    } else {
      pillars.usp_moat.badge = `${pillars.usp_moat.values.overallMoatScore}/100 Moat`;
    }
    updateCardBadge('usp_moat', pillars.usp_moat.badge, true);

    // 8. Branding
    if (combined.branding) {
      const br = combined.branding;
      const score = br.healthScore || br.score || br.distinctiveness;
      if (score) {
        pillars.branding.values.healthScore = parseInt(score);
        pillars.branding.badge = `${parseInt(score)}/100 Brand`;
      }
      if (br.distinctiveness) pillars.branding.values.distinctiveness = parseInt(br.distinctiveness);
      if (br.resonance) pillars.branding.values.resonance = parseInt(br.resonance);
      if (br.analysis) pillars.branding.analysis = br.analysis;
    } else {
      pillars.branding.badge = `${pillars.branding.values.healthScore}/100 Brand`;
    }
    updateCardBadge('branding', pillars.branding.badge, true);

    // Ensure DOM floating cards are rendered
    const leftDock = document.getElementById('floatingDockLeft');
    const rightDock = document.getElementById('floatingDockRight');
    if (!leftDock || !leftDock.children.length || !rightDock || !rightDock.children.length) {
      renderFloatingDocks();
    }

    // Reveal the 6 floating pillar fragments once populated
    showPillars();

    // If modal is open, re-render currently viewed pillar
    if (activeModalPillarId) {
      renderModalGraph(activeModalPillarId);
      renderModalControls(activeModalPillarId);
      renderModalAnalysis(activeModalPillarId);
      const badgeEl = document.getElementById('modalPillarBadge');
      if (badgeEl) badgeEl.textContent = pillars[activeModalPillarId].badge;
    }
  }

  // ==========================================================================
  // INTERACTIVE MCQ QUESTIONNAIRE COMPONENT
  // ==========================================================================

  function renderMcqCardHtml(mcqData) {
    if (!mcqData || !mcqData.questions || !mcqData.questions.length) return '';
    const qList = mcqData.questions;

    return `
      <div class="origin-mcq-container" id="mcqContainer">
        <div class="mcq-header">
          <div class="mcq-title-box">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2.5"><polyline points="9 11 12 14 22 4"></polyline><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path></svg>
            <span>${mcqData.title || 'Origin Venture Intake Diagnostic'}</span>
          </div>
          <span class="mcq-badge">Interactive MCQ Intake</span>
        </div>
        <p class="mcq-subtitle">${mcqData.subtitle || 'Select the options that best match your venture so Origin can quantify all 6 core business pillars:'}</p>

        <div class="mcq-questions-list">
          ${qList.map((q, idx) => {
            const qText = q.text || q.question || q.prompt || `Question ${idx + 1}`;
            return `
            <div class="mcq-question-item" data-question-id="${q.id || idx}">
              <div class="mcq-q-label">
                <span class="mcq-num">Q${idx + 1}</span>
                <span class="mcq-q-text">${qText}</span>
              </div>
              <div class="mcq-options-grid">
                ${(q.options || []).map((opt, optIdx) => {
                  const optLabel = (typeof opt === 'object' && opt !== null) ? (opt.label || opt.value) : opt;
                  const optVal = (typeof opt === 'object' && opt !== null) ? (opt.value || opt.label) : opt;
                  return `
                  <button type="button" class="mcq-option-pill" onclick="OriginPillars.selectMcqOption(this, '${q.id || idx}', '${escapeString(optVal)}')">
                    <span class="opt-bullet">${String.fromCharCode(65 + optIdx)}</span>
                    <span class="opt-text">${optLabel}</span>
                  </button>
                  `;
                }).join('')}
              </div>
            </div>
            `;
          }).join('')}
        </div>

        <div class="mcq-footer">
          <button type="button" class="mcq-submit-action-btn" id="mcqSubmitBtn" onclick="OriginPillars.submitMcqAnswers()">
            <span>Submit Answers to Origin & Generate Strategy</span>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
          </button>
        </div>
      </div>
    `;
  }

  const selectedMcqAnswers = {};

  function selectMcqOption(btnEl, questionId, optionValue) {
    const parent = btnEl.closest('.mcq-question-item');
    if (parent) {
      parent.querySelectorAll('.mcq-option-pill').forEach(b => b.classList.remove('selected'));
    }
    btnEl.classList.add('selected');
    selectedMcqAnswers[questionId] = optionValue;
  }

  function submitMcqAnswers() {
    const questions = document.querySelectorAll('.mcq-question-item');
    if (!questions.length) return;

    let summaryText = 'Here are our verified venture diagnostic answers:\n\n';
    questions.forEach((qEl, idx) => {
      const qText = qEl.querySelector('.mcq-q-text')?.textContent || `Question ${idx + 1}`;
      const selected = qEl.querySelector('.mcq-option-pill.selected .opt-text')?.textContent || 'Default Option A';
      summaryText += `${idx + 1}. **${qText}**:\n   👉 ${selected}\n\n`;
    });

    summaryText += 'Please synthesize this data, calculate our 6 Core Business Pillars (Market Size, Customer Segments, Business Model, Unit Economics, USP & Moat, Branding), update the live graphs, and formulate our full strategy architecture.';

    // Feed to main app chat input and send
    if (typeof window.triggerStarterPrompt === 'function') {
      window.triggerStarterPrompt(summaryText);
    } else {
      const input = document.getElementById('userInput');
      if (input) {
        input.value = summaryText;
        if (typeof window.submitUserMessage === 'function') {
          window.submitUserMessage();
        }
      }
    }

    const container = document.getElementById('mcqContainer');
    if (container) {
      container.innerHTML = `
        <div style="padding: 16px; text-align: center; color: #10b981; font-weight: 600; font-size: 13px;">
          ✓ Diagnostic submitted to Origin. Synthesizing 6 Core Pillars & Strategic Models...
        </div>
      `;
    }
  }

  function escapeString(val) {
    if (typeof val === 'object' && val !== null) {
      val = val.value || val.label || JSON.stringify(val);
    }
    return String(val || '').replace(/'/g, "\\'").replace(/"/g, '&quot;');
  }

  return {
    init,
    pillars,
    openModal,
    closeModal,
    getActiveModalPillarId: () => activeModalPillarId,
    updateValue,
    syncPillarsFromAI,
    stageIntakeData,
    getStagedData,
    calibrateFromMcq,
    renderMcqCardHtml,
    selectMcqOption,
    submitMcqAnswers,
    getSelectedMcqAnswers: () => selectedMcqAnswers,
    showPillars,
    hidePillars,
    hasGeneratedPillars,
    resetPillars,
    exportPillarData
  };
})();

// Auto-mount on load
if (typeof window !== 'undefined') {
  window.OriginPillars = OriginPillars;
  document.addEventListener('DOMContentLoaded', () => {
    OriginPillars.init();
  });
}
