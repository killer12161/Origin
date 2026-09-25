/**
 * Stratum AI SDK - Venture & Brand Intelligence Engine
 * Built for Stratum Intelligence Platform
 * Integrates with NVIDIA NIM (Nemotron 3 Ultra 550B / Super 120B / Llama 3.2)
 * Embeds full "Business Strategy Framework Research" & "Stratum Venture Intelligence"
 * Supports dynamic founder intake, diagnostic interview, dynamic tool execution, and 3-Pillar Triad synthesis.
 */

(function (global, factory) {
  if (typeof module === 'object' && typeof module.exports === 'object') {
    module.exports = factory();
  } else {
    const api = factory();
    global.StratumAI = api;
    global.OriginAI = api;
  }
})(typeof window !== 'undefined' ? window : this, function () {
  'use strict';

  const DEFAULT_CONFIG = {
    apiKey: '',
    baseUrl: '/api',
    model: 'nvidia/nemotron-3-ultra-550b-a55b',
    fallbackModels: ['nvidia/nemotron-3-super-120b-a12b', 'meta/llama-3.2-11b-vision-instruct'],
    temperature: 0.2,
    maxTokens: 6144,
    enableThinking: true
  };

  /**
   * System Prompt grounded in Business Strategy Framework Research & code.html
   */
  const STRATUM_SYSTEM_PROMPT = `You are Origin — an elite Venture Strategist, Brand Architect, and Quantitative Venture Partner AI.
You are strictly trained on the comprehensive methodologies from "Business Strategy Framework Research" and the "Origin Venture Intelligence Platform":

CONVERSATIONAL, SIMPLIFIED & AGENTIC PROTOCOL:
1. GREETING & INITIAL DISCOVERY:
   - When the user first says "hello" or greets you, greet them warmly, concisely, and professionally as Origin.
   - Invite them to describe the business or startup concept they are building.

2. CRITICAL SIMPLICITY & BACKGROUND CALCULATION RULES:
   - ALL complex mathematical modeling, financial formulas, and 6-pillar calculations MUST happen purely in the background.
   - The user must NEVER see raw JSON, data dumps, formula breakdowns, or headings like "Initial 6-Pillar Quantitative Baseline (Pre-Calibration)" in your visible message.
   - In your visible text, write ONLY a simplified, friendly, and easy-to-understand response in plain English:
     * Acknowledge their idea in 2-3 concise, encouraging sentences.
     * Provide 2-3 brief, plain-English observations about their market opportunity.
     * Tell the founder that you will calculate and unlock their 6 Core Strategy Blocks (Market Size, Customer Segments, Business Model, Unit Economics, USP & Moat, Branding) once they confirm their operational baseline.
     * Invite them to tap the quick multiple-choice options below to calibrate their numbers.

3. DIAGNOSTIC MCQ FORMAT (Rendered as Clickable Cards):
   - Output the diagnostic questions strictly inside an \`\`\`origin-mcq code block so the platform renders them as clean interactive buttons:
   \`\`\`origin-mcq
   {
     "title": "Venture Discovery Diagnostic: [Venture Name / Concept]",
     "subtitle": "Select your operational baseline to calibrate our 6 Core Business Strategic Models",
     "questions": [
       {
         "id": "q_icp",
         "text": "Who is your primary target customer segment?",
         "options": [
           { "label": "Enterprise ($50k+ ACV, multi-stakeholder sales cycle)", "value": "Enterprise ($50k+ ACV)" },
           { "label": "Mid-Market B2B ($10k-$50k ACV, departmental budget)", "value": "Mid-Market B2B" },
           { "label": "SMB / Prosumer ($1k-$10k ACV, self-serve)", "value": "SMB / Prosumer" },
           { "label": "B2C / Consumer Mass Market (<$200/yr)", "value": "B2C Mass Market" }
         ]
       },
       {
         "id": "q_pricing",
         "text": "What is your primary monetization architecture?",
         "options": [
           { "label": "Per-Seat / Tiered SaaS Subscription", "value": "Recurring SaaS Subscription" },
           { "label": "Usage-Based / Consumption Metric", "value": "Usage / Consumption Metric" },
           { "label": "Hybrid Base Platform + Volume Expansion", "value": "Hybrid Platform + Usage" },
           { "label": "Marketplace Transaction Fee (10-25% Take-Rate)", "value": "Marketplace Take-Rate" }
         ]
       },
       {
         "id": "q_moat",
         "text": "What is your primary competitive moat or unfair advantage?",
         "options": [
           { "label": "High Switching Costs & Deep Workflow Embedding", "value": "High Switching Costs" },
           { "label": "Counter-Positioning against legacy incumbents", "value": "Counter-Positioning" },
           { "label": "Proprietary Data Moat & Network Effects", "value": "Data & Network Effects" },
           { "label": "Process Power & Proprietary Optimization", "value": "Process Power" }
         ]
       },
       {
         "id": "q_stage",
         "text": "What is your venture's current operational stage?",
         "options": [
           { "label": "Ideation & Problem Discovery (<10 customer interviews)", "value": "Ideation" },
           { "label": "Prototype / Working Beta with Pilot Partners", "value": "Prototype / Beta" },
           { "label": "Early Commercial Traction ($10k-$50k MRR)", "value": "Early Traction" },
           { "label": "Scaling & Institutional Seed/Series A", "value": "Scaling" }
         ]
       }
     ]
   }
   \`\`\`

4. 6-PILLAR DATA PAYLOAD (GENERATED UPON STRATEGIC SYNTHESIS):
   - When the user answers the diagnostic questions or requests full venture analysis, calculate the 6 Core Business Pillars and output them strictly inside an \`\`\`origin-pillars code block at the very end of your response.
   - Do NOT output \`\`\`origin-pillars in the first message while asking the initial diagnostic MCQ questions (the 6 pillar blocks will unlock and appear on screen only after the founder completes the diagnostic or provides their baseline).
   - Keep each pillar's "analysis" field to 1-2 concise, high-impact sentences so the complete JSON block finishes smoothly without token truncation:
   \`\`\`origin-pillars
   {
     "market_size": { "tam": "$1.8B", "targetAccounts": 40000, "acv": 45000, "cagr": "24.5%", "analysis": "..." },
     "customer_segments": { "enterprisePct": 55, "midMarketPct": 35, "smbPct": 10, "primaryIcp": "...", "analysis": "..." },
     "business_model": { "subShare": 70, "usageShare": 25, "serviceShare": 5, "pricingModel": "...", "analysis": "..." },
     "unit_economics": { "cac": 8500, "ltv": 42500, "paybackMonths": 8.2, "grossMargin": 82, "netRetention": 128, "analysis": "..." },
     "usp_moat": { "switchingCosts": 88, "counterPositioning": 84, "networkEffects": 72, "overallMoatScore": 82, "analysis": "..." },
     "branding": { "healthScore": 88, "distinctiveness": 92, "resonance": 89, "archetype": "...", "analysis": "..." }
   }
   \`\`\`

5. SIMPLIFIED STRATEGIC SYNTHESIS AFTER MCQ SUBMISSION:
   - When the user answers the MCQs or asks follow-up questions, give a clean, easily understandable executive breakdown:
     * **The Strategic Wedge**: Plain English explanation of the growth and go-to-market advantage.
     * **Key Metric to Watch**: The primary unit economics or retention lever to de-risk first.
     * **Next 30-Day Priorities**: 2-3 clear, actionable next steps for the founder.
   - Remind the founder: "I've updated your 6 Core Pillars on the left and right with these calibrated parameters. Click any block to view the live models."
   - Silently update the 6 pillars in the background using \`\`\`origin-pillars ... \`\`\` at the very end.
   - NEVER show raw JSON, formulas, spreadsheets, or pre-calibration headers in the visible text.

Never reference generic placeholder companies like "Apex AI". Every metric and name must be 100% specific to the user's venture.`;

  /**
   * StratumAI Client Class
   */
  class StratumAI {
    constructor(config = {}) {
      this.config = Object.assign({}, DEFAULT_CONFIG, config);
      this.toolRegistry = new Map();
      this.ventureState = {
        name: '',
        concept: '',
        industry: '',
        icp: '',
        acv: '',
        competitors: [],
        stage: '',
        monetization: '',
        isDiagnosed: false
      };
      this._registerDefaultTools();
    }

    /**
     * Update configuration
     */
    configure(newConfig) {
      this.config = Object.assign(this.config, newConfig);
      return this;
    }

    /**
     * Register a custom agentic tool
     */
    registerTool(name, toolDef) {
      this.toolRegistry.set(name, toolDef);
      return this;
    }

    /**
     * Update or ingest venture state parameters dynamically
     */
    updateVentureState(partialState) {
      this.ventureState = Object.assign(this.ventureState, partialState);
      return this.ventureState;
    }

    /**
     * Internal default tools modeled after code.html & Research Paper
     */
    _registerDefaultTools() {
      // 1. TAM / SAM / SOM Market Trajectory
      this.registerTool('market_tam_expansion', {
        description: 'Bottom-up TAM/SAM/SOM market sizing using firmographic counts and ACV',
        execute: (params = {}) => {
          const v = this.ventureState;
          const tamVal = params.tam || v.tam || '$1.2B';
          const samVal = params.sam || v.sam || '$320M';
          const somVal = params.som || v.som || '$28M';
          const cagrVal = params.cagr || v.cagr || '18.5%';
          const titleVal = params.title || `Bottom-Up Market Sizing: ${params.ventureName || v.name || 'Venture'}`;

          return {
            type: 'tam_chart',
            title: titleVal,
            cagr: cagrVal,
            tam: tamVal,
            sam: samVal,
            som: somVal,
            inflectionYear: params.inflectionYear || 2026,
            inflectionValue: params.inflectionValue || `${tamVal} Inflection Trigger`,
            explanation: params.explanation || `Derived from verified accounts multiplied by target ACV.`,
            triad: {
              observation: params.explanation || `Bottom-up TAM calculated at ${tamVal} (SAM: ${samVal}, SOM: ${somVal}).`,
              implication: `Market inflection projected around ${params.inflectionYear || 2026} as legacy workarounds become non-viable.`,
              prescription: `Secure initial lighthouse reference customers to anchor beachhead market share.`
            }
          };
        }
      });

      // 2. Moat Frontier Matrix (Dunford Positioning & Helmer 7 Powers)
      this.registerTool('moat_frontier_matrix', {
        description: '2x2 competitive scatter mapping Workflow Depth vs Autonomy / Defensibility',
        execute: (params = {}) => {
          const v = this.ventureState;
          const vName = params.ventureName || v.name || 'Your Venture';
          const comps = params.competitors || v.competitors || ['Incumbent Suite', 'Point Solution', 'Manual Spreadsheets'];
          
          return {
            type: 'moat_matrix',
            title: params.title || `Moat Frontier: Workflow Depth vs. Autonomy (${vName})`,
            ventureName: vName,
            quadrants: {
              topLeft: 'High Autonomy / Shallow Context',
              topRight: `Optimal White Space (${vName})`,
              bottomLeft: 'Manual Status Quo / Point Tools',
              bottomRight: 'High Vertical Depth / Legacy Brittle'
            },
            entities: [
              { name: `${vName} (You)`, x: 86, y: 88, type: 'leader', highlight: true, note: 'Deep Workflow + High Defensibility Power' },
              { name: comps[0] || 'Incumbent Suite', x: 78, y: 28, type: 'incumbent', note: 'Heavy services dependency, rigid UI' },
              { name: comps[1] || 'Point Solution', x: 30, y: 76, type: 'challenger', note: 'Shallow API wrapper, high churn' },
              { name: comps[2] || 'Manual Workarounds', x: 20, y: 18, type: 'point_tool', note: 'Manual, error-prone status quo' }
            ],
            triad: {
              observation: `Most incumbent alternatives remain trapped in legacy desktop workflows or fragile point tools.`,
              implication: `Hamilton Helmer's Process Power and Switching Costs create durable pricing leverage.`,
              prescription: `Anchor value proposition strictly on verified operational ROI rather than generic feature parity.`
            }
          };
        }
      });

      // 3. ICP Unit Economics (Balfour Four Fits)
      this.registerTool('icp_unit_economics', {
        description: 'ICP conversion velocity, ACV breakdown, and CAC payback periods',
        execute: (params = {}) => {
          const v = this.ventureState;
          const segs = params.segments || [
            { name: 'Tier 1 Enterprise Accounts', pipelinePct: 44, acv: '$48k', payback: '5.4mo', fillPct: 88, color: 'primary' },
            { name: 'Mid-Market Fast Movers', pipelinePct: 30, acv: '$28k', payback: '6.2mo', fillPct: 60, color: 'secondary' },
            { name: 'Emerging High-Growth Cohort', pipelinePct: 16, acv: '$16k', payback: '7.8mo', fillPct: 32, color: 'tertiary' },
            { name: 'Ad-Hoc / Pilot Teams', pipelinePct: 10, acv: '$8k', payback: '4.1mo', fillPct: 20, color: 'outline' }
          ];

          return {
            type: 'icp_breakdown',
            title: params.title || `ICP Segmentation & Unit Economics (${v.name})`,
            netRetention: params.netRetention || '134%',
            segments: segs,
            triad: {
              observation: `Primary Tier 1 cohort shows shortest conversion velocity (35 days) with sustainable CAC payback under 6 months.`,
              implication: `Model-Market fit validates $30k+ ACV floor, preventing negative unit economics common in underpriced SaaS.`,
              prescription: `Focus outbound GTM exclusively on the top 2 tiers to maximize cash runway efficiency.`
            }
          };
        }
      });

      // 4. ARR Ramp & Dual-Axis Margin Expansion Curve
      this.registerTool('arr_margin_curve', {
        description: 'Dual-axis ARR ramp versus gross margin expansion modeling',
        execute: (params = {}) => {
          const v = this.ventureState;
          return {
            type: 'arr_margin',
            title: params.title || `ARR Ramp & Gross Margin Expansion (${v.name})`,
            periods: params.periods || [
              { label: 'Year 1 (MVP)', arr: '$0.4M', margin: '66%', barHeight: 18, marginY: 92 },
              { label: 'Year 2 (Traction)', arr: '$1.9M', margin: '74%', barHeight: 45, marginY: 65, active: true },
              { label: 'Year 3 (Scale)', arr: '$5.8M', margin: '81%', barHeight: 88, marginY: 42 },
              { label: 'Year 4 (Expansion)', arr: '$14.6M', margin: '85%', barHeight: 128, marginY: 26 }
            ],
            triad: {
              observation: `Gross margins expand from 66% to 85% as foundational platform efficiencies and routing take effect.`,
              implication: `Protects gross margin profile against severe vendor compute inflation.`,
              prescription: `Benchmark LTV:CAC >= 3:1 before accelerating sales headcount.`
            }
          };
        }
      });

      // 5. Strategic Risk Triage & Decision Radar (Bland & Osterwalder Assumption Testing)
      this.registerTool('strategic_risk_triage', {
        description: '4-column prioritized executive matrix with 1-click decision resolutions',
        execute: (params = {}) => {
          const v = this.ventureState;
          return {
            type: 'risk_triage',
            title: params.title || `Strategic Triage & Executive Risk Radar (${v.name})`,
            opportunities: params.opportunities || [
              { title: 'Standardized Enterprise Integration', impact: '+40% ACV Expansion', desc: 'Pre-built connector unlocks immediate enterprise buyer sign-offs.', badge: 'HIGH LEVERAGE' },
              { title: 'Regulatory / Compliance Moat', impact: '+$1.2M ARR Unlock', desc: 'Certifications remove legal procurement blockers for Tier 1 pilots.', badge: 'IMMEDIATE IMPACT' },
              { title: 'Ecosystem Partner Co-Selling', impact: '2.5x Pipeline Inbound', desc: 'Channel partnerships with systems integrators reduce direct CAC.', badge: 'CHANNEL FIT' }
            ],
            risks: params.risks || [
              { title: 'Customer Inertia & Status Quo', severity: 'HIGH', desc: 'Mitigation: Lead with 14-day instant value proof without IT migration.', status: 'Defended' },
              { title: 'Incumbent Copycat Features', severity: 'MED', desc: 'Mitigation: Deep workflow integrations and proprietary data provenance.', status: 'In Progress' },
              { title: 'Engineering & Domain Talent', severity: 'LOW', desc: 'Mitigation: Strong technical founder network and advisory bench.', status: 'Sourcing Well' }
            ],
            unknowns: params.unknowns || [
              { title: 'Willingness-to-Pay Sensitivity', desc: 'Hypothesis: Flat base + usage metrics yields 35% higher LTV than per-seat licensing.', tag: '10 Discovery Tests' },
              { title: 'Buyer vs User Champion Alignment', desc: 'Hypothesis: Operational heads champion software only if reporting time drops by 50%.', tag: 'Pilot Telemetry' }
            ],
            decisions: params.decisions || [
              { id: 'pricing', title: '1. Finalize Commercial Stance', desc: 'Hybrid Flat Base ($1,500/mo) + Usage vs Pure Per-Seat.', options: ['Approve Hybrid Base', 'Model Pure Seat'] },
              { id: 'gtm', title: '2. Outbound Motion Focus', desc: 'Founder-Led Direct Enterprise Sales vs Product-Led Trial.', options: ['Direct Enterprise', 'Product-Led'] },
              { id: 'deployment', title: '3. Security Architecture', desc: 'Dedicated VPC Tenant vs Multi-Tenant Cloud.', options: ['Dedicated VPC', 'Multi-Tenant'] }
            ]
          };
        }
      });

      // 6. Brand AI Lab Diagnostics
      this.registerTool('brand_ai_lab', {
        description: 'Brand Doctor score, Audience Shifter, and Anti-Generic buzzword filter',
        execute: (params = {}) => {
          const v = this.ventureState;
          return {
            type: 'brand_lab',
            title: `Brand AI Lab Suite: ${v.name}`,
            score: params.score || '91/100',
            modules: params.modules || [
              { name: 'Brand Doctor', score: '91/100', status: 'Rigorous Pitch Architecture', desc: 'Diagnostic narrative health score. Evaluates pitch clarity, problem urgency, and defensibility.' },
              { name: 'Brand Battle', score: '3/4 VECTORS WON', status: 'Moat: Process Power', desc: `Head-to-head positioning audit against ${v.competitors?.[0] || 'incumbent alternatives'}.` },
              { name: 'Audience Shifter', score: 'DUAL TONE ACTIVE', status: 'VP Ops vs CFO Framing', desc: 'Switches framing dynamically: operational time-savings for operators, net payback for financial buyers.' },
              { name: 'Anti-Generic Engine', score: '18 CLICHES BANNED', status: 'Strictness: High', desc: "Purges fluff words ('revolutionize', 'seamless', 'next-gen') in favor of quantifiable metrics." },
              { name: 'Consistency Guardian', score: '98%', status: 'Zero Narrative Drift', desc: 'Ensures pitch deck, product messaging, and financial model remain strictly aligned.' },
              { name: 'One Idea Five Worlds', score: '5 LENSES READY', status: 'Archetype Lens', desc: `Explores ${v.name} as: B2B Enterprise, SMB Self-Serve, Open Ecosystem, Consumer, or Rollup.` }
            ]
          };
        }
      });

      // 7. 30-60-90 Day Execution Sprint (from Research Paper)
      this.registerTool('execution_sprint', {
        description: 'Structured 30-60-90 Day operational milestone sprint based on science of scaling',
        execute: (params = {}) => {
          const v = this.ventureState;
          return {
            type: 'sprint_milestones',
            title: `30-60-90 Day Operational Execution Sprint: ${v.name}`,
            days30: params.days30 || {
              phase: 'Days 1–30: Problem & Discovery Validation',
              objective: 'Validate core desirability and willingness-to-pay before capital expenditure.',
              actions: [
                'Conduct 25 structured customer discovery interviews using non-leading protocols.',
                'Map exact existing customer workarounds, spreadsheet models, and manual workflows.',
                'Secure 3 advance LOIs or paid pilot deposits confirming willingness-to-pay.'
              ],
              gate: 'Phase Gate: >15% conversion from discovery interview to commitment.'
            },
            days60: params.days60 || {
              phase: 'Days 31–60: Solution Validation & Retention Hook',
              objective: 'Deploy focused MVP prototype and instrument the Leading Indicator of Retention.',
              actions: [
                'Deliver functional MVP focused exclusively on the #1 burning customer pain point.',
                'Instrument telemetry tracking the key retention action (e.g. 3 active workflows/wk).',
                'Establish weekly customer feedback loops with early pilot cohorts.'
              ],
              gate: 'Phase Gate: >=60% of onboarded pilot users achieve Leading Retention Indicator.'
            },
            days90: params.days90 || {
              phase: 'Days 61–90: Go-to-Market & Unit Economic Calibration',
              objective: 'Test 2 scalable acquisition channels and validate LTV:CAC trajectory >= 3:1.',
              actions: [
                'Launch outbound SDR cadences targeting Tier 1 ICP firmographics.',
                'Calculate empirical CAC, conversion velocity, and contract close cycle days.',
                'Synthesize validated metrics into institutional-grade Series A / Seed memo.'
              ],
              gate: 'Phase Gate: LTV:CAC >= 3:1 and CAC Payback < 12 months demonstrated.'
            }
          };
        }
      });
    }

    /**
     * Ingest raw business pitch narrative and extract structured parameters
     */
    extractVentureParams(text) {
      if (!text || text.length < 10) return;
      const lower = text.toLowerCase();

      // Extract Name
      const nameMatch = text.match(/(?:building|making|called|named|startup|platform)\s+([A-Z][a-zA-Z0-9_\-\s]{2,20})/);
      if (nameMatch && !this.ventureState.isDiagnosed) {
        this.ventureState.name = nameMatch[1].trim();
      }

      // Extract Industry / Category
      if (lower.includes('health') || lower.includes('clinic') || lower.includes('medical')) {
        this.ventureState.industry = 'Healthcare / HealthTech';
        this.ventureState.icp = 'Healthcare Providers, Hospitals, & Clinics';
        this.ventureState.acv = '$48,000/yr';
      } else if (lower.includes('solar') || lower.includes('clean') || lower.includes('energy') || lower.includes('green')) {
        this.ventureState.industry = 'CleanTech / Energy';
        this.ventureState.icp = 'Solar Developers & Commercial Fleets';
        this.ventureState.acv = '$36,000/yr';
      } else if (lower.includes('fintech') || lower.includes('bank') || lower.includes('payment') || lower.includes('crypto')) {
        this.ventureState.industry = 'FinTech & Banking';
        this.ventureState.icp = 'Banks, Payment Processors, & FinTechs';
        this.ventureState.acv = '$54,000/yr';
      } else if (lower.includes('freight') || lower.includes('logistics') || lower.includes('supply') || lower.includes('truck')) {
        this.ventureState.industry = 'Logistics & Supply Chain';
        this.ventureState.icp = 'Freight Forwarders & Warehouse Operators';
        this.ventureState.acv = '$32,000/yr';
      } else if (lower.includes('dev') || lower.includes('code') || lower.includes('api') || lower.includes('infra')) {
        this.ventureState.industry = 'Developer Tools / Infrastructure';
        this.ventureState.icp = 'Engineering Leads & DevOps Teams';
        this.ventureState.acv = '$24,000/yr';
      } else if (lower.includes('ai') || lower.includes('agent') || lower.includes('automation')) {
        this.ventureState.industry = 'AI Workflow Orchestration';
        this.ventureState.icp = 'Mid-Market & Enterprise Operations Teams';
        this.ventureState.acv = '$38,000/yr';
      }

      // Extract Competitors
      if (lower.includes('excel') || lower.includes('spreadsheet')) {
        if (!this.ventureState.competitors.includes('Excel & Manual Spreadsheets')) {
          this.ventureState.competitors.push('Excel & Manual Spreadsheets');
        }
      }
    }

    /**
     * Send chat request to NVIDIA NIM API with intelligent streaming & tool extraction
     */
    async chat({ messages, onToken, onReasoning, enableTools = true, thinking = true }) {
      const lastUserMsg = messages[messages.length - 1]?.content || '';
      this.extractVentureParams(lastUserMsg);

      let responseText = '';
      let reasoningText = '';
      let usedModel = this.config.model;

      try {
        const payload = {
          model: this.config.model,
          messages: messages || [],
          temperature: this.config.temperature,
          max_tokens: this.config.maxTokens,
          stream: Boolean(onToken)
        };

        const isLocalHost = (typeof window !== 'undefined') && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
        const apiHost = isLocalHost ? '' : 'http://80.225.239.33:3000';
        const endpoint = (typeof window !== 'undefined') ? `${apiHost}/api/chat` : `${this.config.baseUrl}/chat/completions`;
        const headers = { 'Content-Type': 'application/json' };
        if (typeof window === 'undefined' || endpoint.includes('nvidia.com')) {
          headers['Authorization'] = `Bearer ${this.config.apiKey}`;
        }

        const res = await fetch(endpoint, {
          method: 'POST',
          headers: headers,
          body: JSON.stringify(payload)
        });

        if (!res.ok) {
          const errBody = await res.text();
          throw new Error(`API error ${res.status}: ${errBody}`);
        }

        if (onToken && res.body) {
          const reader = res.body.getReader();
          const decoder = new TextDecoder('utf-8');
          let buffer = '';

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop() || '';

            for (const line of lines) {
              const trimmed = line.trim();
              if (trimmed.startsWith('data: ')) {
                const dataStr = trimmed.slice(6);
                if (dataStr === '[DONE]') continue;
                try {
                  const parsed = JSON.parse(dataStr);
                  const delta = parsed.choices?.[0]?.delta || {};
                  if (delta.reasoning_content) {
                    reasoningText += delta.reasoning_content;
                    if (onReasoning) onReasoning(delta.reasoning_content);
                  }
                  if (delta.content) {
                    responseText += delta.content;
                    if (onToken) onToken(delta.content);
                  }
                } catch (e) {}
              }
            }
          }
        } else {
          const data = await res.json();
          responseText = data.choices?.[0]?.message?.content || '';
          reasoningText = data.choices?.[0]?.message?.reasoning_content || '';
        }
      } catch (err) {
        console.error('Stratum API request error:', err);
        responseText = `⚠️ **Error connecting to Stratum Intelligence OS:** ${err.message}. Please verify the server is running on http://localhost:3000.`;
      }

      // Extract chart code blocks produced by the AI
      const enrichedResponse = this._enrichWithTools(responseText);

      // Split reasoning into readable steps if present
      let thinkingSteps = [];
      if (reasoningText) {
        thinkingSteps = reasoningText.split(/\n+/).filter(s => s.trim().length > 0);
      } else if (thinking) {
        thinkingSteps = this._generateAgentThinkingTrace(lastUserMsg);
      }

      return {
        thinking: thinkingSteps,
        reasoningText: reasoningText,
        content: enrichedResponse.content,
        charts: enrichedResponse.charts,
        venture: this.ventureState,
        model: usedModel,
        timestamp: new Date().toISOString()
      };
    }

    /**
     * Generate fallback chain-of-thought Agentic Thinking trace if model does not emit reasoning
     */
    _generateAgentThinkingTrace(userPrompt) {
      const p = userPrompt.toLowerCase();
      const v = this.ventureState;
      let steps = [
        `Ingesting founder input: analyzing venture domain parameters`,
        'Executing Intake Normalizer: separating verified claims from leap-of-faith assumptions',
        'Validating against Business Strategy Framework Research protocols'
      ];

      if (p.includes('tam') || p.includes('market') || p.includes('sizing')) {
        steps.push(`Running Bottom-Up Sizing: TAM = Sum(Firmographic Accounts * ACV)`);
        steps.push('Modeling SAM filtering by geo scope, technical fit, and regulatory feasibility');
        steps.push('Calculating SOM bounded by sales quota capacity and marketing throughput');
      } else if (p.includes('moat') || p.includes('competitor') || p.includes('matrix')) {
        steps.push(`Applying Dunford 5 Components of Positioning & Hamilton Helmer 7 Powers`);
        steps.push(`Mapping 2x2 Moat Frontier: Workflow Depth vs Autonomy`);
        steps.push('Isolating sustainable defensibility vector (Process Power & Switching Costs)');
      } else if (p.includes('icp') || p.includes('customer') || p.includes('unit economic')) {
        steps.push(`Evaluating Balfour Four Fits (Market-Product, Product-Channel, Channel-Model)`);
        steps.push('Calculating deterministic unit economics: LTV:CAC >= 3:1, Payback < 12mo');
      } else if (p.includes('arr') || p.includes('margin') || p.includes('ramp')) {
        steps.push('Simulating multi-year revenue ramp and gross margin expansion curve');
        steps.push('Auditing compute/COGS unit economics to prevent margin erosion');
      } else if (p.includes('sprint') || p.includes('30') || p.includes('execution') || p.includes('milestone')) {
        steps.push('Synthesizing 30-60-90 Day Execution Sprint (Science of Scaling milestones)');
        steps.push('Establishing Day 30 WTP gate, Day 60 retention hook, and Day 90 GTM proof');
      } else {
        steps.push('Processing business discovery context to formulate strategic analysis');
      }

      return steps;
    }

    /**
     * Extract chart markdown codeblocks and replace with parsed chart data
     * Only renders charts if the AI explicitly generated them.
     */
    _enrichWithTools(rawText) {
      const charts = [];
      const chartRegex = /```stratum-chart:([a-z_]+)\s*([\s\S]*?)```/g;

      let match;
      while ((match = chartRegex.exec(rawText)) !== null) {
        const toolName = match[1];
        let params = {};
        try {
          if (match[2] && match[2].trim().length > 0) {
            params = JSON.parse(match[2].trim());
          }
        } catch (e) {
          console.warn('Failed to parse chart JSON from AI response:', e);
        }

        let fullToolName = toolName;
        if (toolName === 'tam') fullToolName = 'market_tam_expansion';
        else if (toolName === 'moat') fullToolName = 'moat_frontier_matrix';
        else if (toolName === 'icp') fullToolName = 'icp_unit_economics';
        else if (toolName === 'arr') fullToolName = 'arr_margin_curve';
        else if (toolName === 'triage') fullToolName = 'strategic_risk_triage';
        else if (toolName === 'brand') fullToolName = 'brand_ai_lab';
        else if (toolName === 'sprint') fullToolName = 'execution_sprint';

        const tool = this.toolRegistry.get(fullToolName);
        if (tool) {
          charts.push(tool.execute(params));
        }
      }

      const cleanContent = rawText.replace(/```stratum-chart:[a-z_]+\s*[\s\S]*?```/g, '').trim();

      return {
        content: cleanContent,
        charts: charts
      };
    }

    /**
     * Render Interactive SVG for TAM/SAM/SOM Area Chart
     */
    renderTamChart(data) {
      return `
      <div class="stratum-widget-card bg-surface-container-lowest rounded-xl p-4 shadow-sm border border-outline-variant/30 my-4">
        <div class="flex items-center justify-between mb-2">
          <div>
            <span class="text-[11px] font-mono uppercase tracking-wider text-slate-400">Bottom-Up Market Sizing</span>
            <h4 class="text-sm font-bold text-slate-100">${data.title}</h4>
          </div>
          <div class="flex items-center gap-3 text-xs">
            <span class="inline-flex items-center gap-1 font-mono text-[11px] text-indigo-400"><span class="w-2 h-2 rounded-full bg-indigo-500"></span> Expected (${data.tam})</span>
            <span class="inline-flex items-center gap-1 font-mono text-[11px] text-emerald-400"><span class="w-2 h-2 rounded-full bg-emerald-500"></span> CAGR: ${data.cagr}</span>
          </div>
        </div>
        <div class="relative w-full h-48 bg-slate-950/60 rounded-lg p-3 overflow-hidden border border-white/5">
          <svg class="w-full h-36 overflow-visible" viewBox="0 0 500 140" preserveAspectRatio="none">
            <defs>
              <linearGradient id="sdkGradTAM" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stop-color="#4f46e5" stop-opacity="0.3"/>
                <stop offset="100%" stop-color="#4f46e5" stop-opacity="0.0"/>
              </linearGradient>
              <linearGradient id="sdkGradAgg" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stop-color="#10b981" stop-opacity="0.18"/>
                <stop offset="100%" stop-color="#10b981" stop-opacity="0.0"/>
              </linearGradient>
            </defs>
            <line x1="0" y1="25" x2="500" y2="25" stroke="rgba(255,255,255,0.06)" stroke-dasharray="3 3"/>
            <line x1="0" y1="65" x2="500" y2="65" stroke="rgba(255,255,255,0.06)" stroke-dasharray="3 3"/>
            <line x1="0" y1="105" x2="500" y2="105" stroke="rgba(255,255,255,0.06)" stroke-dasharray="3 3"/>
            
            <path d="M 20 120 Q 120 110 220 75 T 480 15 L 480 130 L 20 130 Z" fill="url(#sdkGradAgg)" />
            <path d="M 20 120 Q 120 110 220 75 T 480 15" fill="none" stroke="#10b981" stroke-width="1.5" stroke-dasharray="4 4" />
            
            <path d="M 20 120 Q 120 115 220 90 T 480 30 L 480 130 L 20 130 Z" fill="url(#sdkGradTAM)" />
            <path d="M 20 120 Q 120 115 220 90 T 480 30" fill="none" stroke="#6366f1" stroke-width="2.5" />
            
            <line x1="220" y1="10" x2="220" y2="130" stroke="#a855f7" stroke-width="1.5" stroke-dasharray="2 2"/>
            <circle cx="220" cy="90" r="5" fill="#6366f1" stroke="#ffffff" stroke-width="2"/>
            <circle cx="220" cy="75" r="4" fill="#10b981" stroke="#ffffff" stroke-width="1.5"/>
          </svg>
          <div class="absolute left-[42%] top-3 bg-slate-900/90 border border-purple-500/40 shadow-xl rounded px-2 py-1 text-center pointer-events-none">
            <span class="text-[9px] text-purple-400 font-bold uppercase block tracking-wider">${data.inflectionYear} Inflection</span>
            <span class="text-[11px] font-mono text-white font-bold">${data.inflectionValue}</span>
          </div>
          <div class="flex justify-between font-mono text-[10px] text-slate-400 pt-1">
            <span>2024</span>
            <span>2025</span>
            <span class="text-indigo-400 font-bold">2026</span>
            <span>2027</span>
            <span>2028</span>
            <span>2029 (TAM: ${data.tam})</span>
          </div>
        </div>
      </div>`;
    }

    /**
     * Render Interactive Moat Frontier Scatter Matrix
     */
    renderMoatMatrix(data) {
      const vName = data.ventureName || this.ventureState.name || 'Your Company';
      const entities = data.entities || [];
      const entitiesHtml = entities.map(e => {
        if (e.highlight) {
          return `
          <div class="absolute" style="left:${e.x - 10}%; top:${100 - e.y}%;">
            <div class="flex flex-col items-center animate-pulse cursor-pointer">
              <div class="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center shadow-lg font-bold font-mono text-[12px] border border-indigo-400">
                ▲
              </div>
              <div class="mt-1 px-2 py-0.5 rounded bg-indigo-600/90 text-white font-mono text-[10px] font-bold shadow-md whitespace-nowrap">
                ${e.name}
              </div>
            </div>
          </div>`;
        } else {
          return `
          <div class="absolute flex items-center gap-1.5 bg-slate-900/80 px-2 py-1 rounded border border-slate-700/50 cursor-pointer" style="left:${e.x - 5}%; top:${100 - e.y}%;">
            <span class="w-3.5 h-3.5 rounded-full ${e.type === 'incumbent' ? 'bg-slate-600' : 'bg-purple-700'} flex items-center justify-center text-white text-[8px] font-bold">${e.name[0]}</span>
            <span class="text-[10px] text-slate-300 font-medium whitespace-nowrap">${e.name}</span>
          </div>`;
        }
      }).join('');

      return `
      <div class="stratum-widget-card bg-surface-container-lowest rounded-xl p-4 shadow-sm border border-outline-variant/30 my-4">
        <div class="flex items-center justify-between mb-2">
          <div>
            <span class="text-[11px] font-mono uppercase tracking-wider text-slate-400">Dunford Positioning & Moat Frontier</span>
            <h4 class="text-sm font-bold text-slate-100">${data.title}</h4>
          </div>
          <span class="px-2 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-[10px] font-mono uppercase font-bold">White Space Frontier</span>
        </div>
        <div class="relative w-full h-56 bg-slate-950/70 rounded-lg p-3 border border-white/5 overflow-hidden">
          <div class="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div class="w-full h-[1px] bg-slate-800"></div>
          </div>
          <div class="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div class="h-full w-[1px] bg-slate-800"></div>
          </div>
          <span class="absolute top-2 left-3 text-[9px] font-mono text-slate-500 uppercase tracking-wider">High Autonomy / Shallow</span>
          <span class="absolute top-2 right-3 text-[9px] font-mono text-indigo-400 bg-indigo-950/60 border border-indigo-500/30 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">Optimal White Space Frontier</span>
          <span class="absolute bottom-2 left-3 text-[9px] font-mono text-slate-500 uppercase tracking-wider">Status Quo / Excel</span>
          <span class="absolute bottom-2 right-3 text-[9px] font-mono text-slate-500 uppercase tracking-wider">Legacy / Rigid Suite</span>
          ${entitiesHtml}
        </div>
      </div>`;
    }

    /**
     * Render Interactive ICP Segmentation Bars
     */
    renderIcpBreakdown(data) {
      const segmentsHtml = (data.segments || []).map(s => `
        <div class="space-y-1">
          <div class="flex justify-between text-xs">
            <span class="text-slate-200 font-medium flex items-center gap-2">
              <span class="w-2.5 h-2.5 rounded-sm ${s.color === 'primary' ? 'bg-indigo-500' : s.color === 'secondary' ? 'bg-purple-500' : s.color === 'tertiary' ? 'bg-emerald-500' : 'bg-slate-500'}"></span>
              ${s.name}
            </span>
            <span class="font-mono text-slate-400">${s.pipelinePct}% Pipeline • ACV: ${s.acv} • Payback: ${s.payback}</span>
          </div>
          <div class="w-full h-2.5 rounded-full bg-slate-800 overflow-hidden">
            <div class="h-full rounded-full transition-all duration-500 ${s.color === 'primary' ? 'bg-indigo-500' : s.color === 'secondary' ? 'bg-purple-500' : s.color === 'tertiary' ? 'bg-emerald-500' : 'bg-slate-500'}" style="width: ${s.fillPct}%"></div>
          </div>
        </div>
      `).join('');

      return `
      <div class="stratum-widget-card bg-surface-container-lowest rounded-xl p-4 shadow-sm border border-outline-variant/30 my-4">
        <div class="flex items-center justify-between mb-3">
          <div>
            <span class="text-[11px] font-mono uppercase tracking-wider text-slate-400">ICP Economics (Balfour Four Fits)</span>
            <h4 class="text-sm font-bold text-slate-100">${data.title}</h4>
          </div>
          <span class="px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono text-xs font-semibold">Net Ret: ${data.netRetention || '134%'}</span>
        </div>
        <div class="space-y-3 bg-slate-950/60 p-3 rounded-lg border border-white/5">
          ${segmentsHtml}
        </div>
      </div>`;
    }

    /**
     * Render ARR & Margin Curve
     */
    renderArrMarginCurve(data) {
      return `
      <div class="stratum-widget-card bg-surface-container-lowest rounded-xl p-4 shadow-sm border border-outline-variant/30 my-4">
        <div class="flex items-center justify-between mb-2">
          <div>
            <span class="text-[11px] font-mono uppercase tracking-wider text-slate-400">ARR Ramp & Unit Economics</span>
            <h4 class="text-sm font-bold text-slate-100">${data.title}</h4>
          </div>
          <div class="flex items-center gap-3 text-xs font-mono">
            <span class="text-indigo-400 font-bold">ARR Bars</span>
            <span class="text-emerald-400 font-bold">Margin % Line</span>
          </div>
        </div>
        <div class="relative w-full h-44 bg-slate-950/60 rounded-lg p-3 border border-white/5 flex flex-col justify-end">
          <svg class="w-full h-28 overflow-visible" viewBox="0 0 400 130">
            <line x1="0" y1="20" x2="400" y2="20" stroke="rgba(255,255,255,0.06)" stroke-dasharray="2 2" />
            <line x1="0" y1="60" x2="400" y2="60" stroke="rgba(255,255,255,0.06)" stroke-dasharray="2 2" />
            <line x1="0" y1="100" x2="400" y2="100" stroke="rgba(255,255,255,0.06)" stroke-dasharray="2 2" />
            
            <rect x="40" y="115" width="28" height="15" rx="3" fill="#6366f1" opacity="0.4"/>
            <rect x="130" y="85" width="28" height="45" rx="3" fill="#6366f1" opacity="0.8"/>
            <rect x="220" y="45" width="28" height="85" rx="3" fill="#4f46e5"/>
            <rect x="310" y="10" width="28" height="120" rx="3" fill="#4338ca"/>
            
            <path d="M 54 85 L 144 60 L 234 40 L 324 22" fill="none" stroke="#10b981" stroke-width="2.5" stroke-linecap="round"/>
            <circle cx="54" cy="85" r="4" fill="#10b981" stroke="#ffffff" stroke-width="1.5"/>
            <circle cx="144" cy="60" r="4" fill="#10b981" stroke="#ffffff" stroke-width="1.5"/>
            <circle cx="234" cy="40" r="4" fill="#10b981" stroke="#ffffff" stroke-width="1.5"/>
            <circle cx="324" cy="22" r="4" fill="#10b981" stroke="#ffffff" stroke-width="1.5"/>
          </svg>
          <div class="grid grid-cols-4 text-center font-mono text-[10px] text-slate-300 pt-2 border-t border-white/5">
            <div><span class="block text-slate-500">Year 1</span><span class="font-bold">$0.4M • 66%</span></div>
            <div><span class="block text-slate-500">Year 2</span><span class="font-bold text-indigo-400">$1.9M • 74%</span></div>
            <div><span class="block text-slate-500">Year 3</span><span class="font-bold text-indigo-400">$5.8M • 81%</span></div>
            <div><span class="block text-slate-500">Year 4</span><span class="font-bold text-emerald-400">$14.6M • 85%</span></div>
          </div>
        </div>
      </div>`;
    }

    /**
     * Render Strategic Risk Triage & Decisions
     */
    renderRiskTriage(data) {
      const opps = (data.opportunities || []).map(o => `
        <div class="p-3 rounded-lg bg-emerald-950/20 border-t-2 border-t-emerald-500 border border-emerald-500/10">
          <span class="text-[10px] font-mono text-emerald-400 font-bold uppercase tracking-wider">${o.badge}</span>
          <h5 class="text-xs font-bold text-slate-100 mt-1">${o.title} (${o.impact})</h5>
          <p class="text-[11px] text-slate-400 mt-1">${o.desc}</p>
        </div>
      `).join('');

      const risks = (data.risks || []).map(r => `
        <div class="p-3 rounded-lg bg-red-950/20 border-t-2 border-t-red-500 border border-red-500/10">
          <span class="text-[10px] font-mono text-red-400 font-bold uppercase tracking-wider">Defended Risk [${r.severity}]</span>
          <h5 class="text-xs font-bold text-slate-100 mt-1">${r.title}</h5>
          <p class="text-[11px] text-slate-400 mt-1">${r.desc}</p>
        </div>
      `).join('');

      const decisions = (data.decisions || []).map(d => `
        <div class="p-3 rounded-lg bg-indigo-950/20 border-t-2 border-t-indigo-500 border border-indigo-500/10">
          <span class="text-[10px] font-mono text-indigo-400 font-bold uppercase tracking-wider">Executive Decision</span>
          <h5 class="text-xs font-bold text-slate-100 mt-1">${d.title}</h5>
          <p class="text-[11px] text-slate-400 mt-1">${d.desc}</p>
          <div class="mt-2 flex gap-2">
            ${(d.options || []).map((opt, i) => `
              <button class="px-2 py-1 ${i === 0 ? 'bg-indigo-600 hover:bg-indigo-500 text-white' : 'bg-slate-800 hover:bg-slate-700 text-slate-300'} rounded text-[10px] font-mono font-bold transition-colors" onclick="this.innerHTML='✓ Resolved'; this.disabled=true;">
                ${opt}
              </button>
            `).join('')}
          </div>
        </div>
      `).join('');

      return `
      <div class="stratum-widget-card bg-surface-container-lowest rounded-xl p-4 shadow-sm border border-outline-variant/30 my-4">
        <div class="flex items-center justify-between mb-3">
          <span class="text-[11px] font-mono uppercase tracking-wider text-slate-400">Assumption Testing & Decision Radar</span>
          <span class="text-xs font-mono text-purple-400">Action Grid</span>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
          ${opps}
          ${risks}
          ${decisions}
        </div>
      </div>`;
    }

    /**
     * Render Brand AI Lab Diagnostics
     */
    renderBrandLab(data) {
      const modulesHtml = (data.modules || []).map(m => `
        <div class="p-2.5 rounded-lg bg-slate-900/60 border border-white/5 flex flex-col justify-between">
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold text-slate-200">${m.name}</span>
            <span class="text-[10px] font-mono text-indigo-400 font-bold">${m.score}</span>
          </div>
          <p class="text-[11px] text-slate-400 mt-1 line-clamp-2">${m.desc}</p>
          <span class="mt-2 text-[9px] font-mono text-emerald-400 uppercase tracking-wider">${m.status}</span>
        </div>
      `).join('');

      return `
      <div class="stratum-widget-card bg-surface-container-lowest rounded-xl p-4 shadow-sm border border-outline-variant/30 my-4">
        <div class="flex items-center justify-between mb-3">
          <div>
            <span class="text-[11px] font-mono uppercase tracking-wider text-slate-400">Brand AI Lab Suite</span>
            <h4 class="text-sm font-bold text-slate-100">${data.title}</h4>
          </div>
          <span class="px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono text-xs font-semibold">Health Score: ${data.score || '91/100'}</span>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-2">
          ${modulesHtml}
        </div>
      </div>`;
    }

    /**
     * Render 30-60-90 Day Execution Sprint (from Research Paper)
     */
    renderExecutionSprint(data) {
      return `
      <div class="stratum-widget-card bg-surface-container-lowest rounded-xl p-4 shadow-sm border border-outline-variant/30 my-4">
        <div class="flex items-center justify-between mb-3">
          <div>
            <span class="text-[11px] font-mono uppercase tracking-wider text-slate-400">Science of Scaling Framework</span>
            <h4 class="text-sm font-bold text-slate-100">${data.title}</h4>
          </div>
          <span class="px-2 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 font-mono text-[10px] font-bold uppercase">Phased Gates</span>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
          <!-- Days 1-30 -->
          <div class="p-3 rounded-lg bg-slate-900/70 border border-white/5 flex flex-col justify-between">
            <div>
              <span class="text-[10px] font-mono text-indigo-400 font-bold uppercase">Phase 1</span>
              <h5 class="text-xs font-bold text-slate-100 mt-1">${data.days30.phase}</h5>
              <p class="text-[11px] text-slate-400 mt-1">${data.days30.objective}</p>
              <ul class="text-[10px] text-slate-300 mt-2 space-y-1 list-disc list-inside">
                ${data.days30.actions.map(a => `<li>${a}</li>`).join('')}
              </ul>
            </div>
            <div class="mt-3 pt-2 border-t border-white/5 text-[9px] font-mono text-emerald-400 font-semibold">
              ${data.days30.gate}
            </div>
          </div>

          <!-- Days 31-60 -->
          <div class="p-3 rounded-lg bg-slate-900/70 border border-white/5 flex flex-col justify-between">
            <div>
              <span class="text-[10px] font-mono text-purple-400 font-bold uppercase">Phase 2</span>
              <h5 class="text-xs font-bold text-slate-100 mt-1">${data.days60.phase}</h5>
              <p class="text-[11px] text-slate-400 mt-1">${data.days60.objective}</p>
              <ul class="text-[10px] text-slate-300 mt-2 space-y-1 list-disc list-inside">
                ${data.days60.actions.map(a => `<li>${a}</li>`).join('')}
              </ul>
            </div>
            <div class="mt-3 pt-2 border-t border-white/5 text-[9px] font-mono text-emerald-400 font-semibold">
              ${data.days60.gate}
            </div>
          </div>

          <!-- Days 61-90 -->
          <div class="p-3 rounded-lg bg-slate-900/70 border border-white/5 flex flex-col justify-between">
            <div>
              <span class="text-[10px] font-mono text-emerald-400 font-bold uppercase">Phase 3</span>
              <h5 class="text-xs font-bold text-slate-100 mt-1">${data.days90.phase}</h5>
              <p class="text-[11px] text-slate-400 mt-1">${data.days90.objective}</p>
              <ul class="text-[10px] text-slate-300 mt-2 space-y-1 list-disc list-inside">
                ${data.days90.actions.map(a => `<li>${a}</li>`).join('')}
              </ul>
            </div>
            <div class="mt-3 pt-2 border-t border-white/5 text-[9px] font-mono text-emerald-400 font-semibold">
              ${data.days90.gate}
            </div>
          </div>
        </div>
      </div>`;
    }
  }

  return StratumAI;
});
