const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');
const crypto = require('crypto');
const db = require('./db.js');

// Load .env securely on backend
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
    if (match) {
      const key = match[1];
      let value = match[2] || '';
      value = value.trim().replace(/^['"](.*)['"]$/, '$1');
      process.env[key] = value;
    }
  });
}

const PORT = process.env.PORT || 3000;
const NVIDIA_API_KEY = process.env.NVIDIA_API_KEY || '';
const NVIDIA_BASE_URL = 'https://integrate.api.nvidia.com/v1';
const DEFAULT_MODEL = 'nvidia/nemotron-3-ultra-550b-a55b';
const FALLBACK_MODEL = 'nvidia/nemotron-3-super-120b-a12b';

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.mp4': 'video/mp4',
  '.pdf': 'application/pdf',
  '.ico': 'image/x-icon'
};

function parseJsonBody(req) {
  return new Promise((resolve) => {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        resolve(JSON.parse(body || '{}'));
      } catch (e) {
        resolve({});
      }
    });
    req.on('error', () => resolve({}));
  });
}

function getSessionUser(req) {
  const authHeader = req.headers['authorization'] || '';
  let token = '';
  if (authHeader.startsWith('Bearer ')) {
    token = authHeader.slice(7).trim();
  } else if (req.headers.cookie) {
    const match = req.headers.cookie.match(/(?:origin_session|stratum_session)=([^;]+)/);
    if (match) token = match[1];
  }
  if (token) {
    const user = db.getUserBySession(token);
    if (user) return user;
  }

  // Cross-domain or client token fallback via X-User-Email header
  const userEmail = req.headers['x-user-email'];
  if (userEmail && typeof userEmail === 'string' && userEmail.includes('@')) {
    let user = db.getUserByEmail(userEmail);
    if (!user) {
      const name = req.headers['x-user-name'] || userEmail.split('@')[0];
      user = db.findOrCreateUserByGoogle({
        email: userEmail,
        name: decodeURIComponent(name),
        sub: userEmail
      });
    }
    return user;
  }

  return null;
}

const server = http.createServer(async (req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;

  // CORS headers for local and remote cross-domain requests
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-User-Email, X-User-Name');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // 1. API: /api/chat (Proxies to NVIDIA NIM with streaming)
  if (pathname === '/api/chat' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', async () => {
      try {
        const payload = JSON.parse(body || '{}');
        const userApiKey = payload.apiKey || NVIDIA_API_KEY;
        const requestedModel = payload.model || DEFAULT_MODEL;
        const stream = payload.stream !== false;
        const sessionUser = getSessionUser(req) || payload.user || null;
        const founderName = sessionUser ? (sessionUser.name ? sessionUser.name.split(' ')[0] : 'Aneesh') : 'Founder';

        const systemMessage = {
          role: 'system',
          content: `You are Origin — an elite Venture Strategist, Brand Architect, and Quantitative Venture Partner AI.
You are strictly trained on the comprehensive methodologies from "Business Strategy Framework Research" and the "Origin Venture Intelligence Platform":

CONVERSATIONAL, SIMPLIFIED & TOKEN-EFFICIENT PROTOCOL:
1. GREETING & CASUAL CONVERSATION:
   - When the user first says "hello", "hi", "hey", or engages in casual greeting:
     * Greet them warmly and professionally by name (e.g. Hello ${founderName}).
     * Keep your response strictly under 40 words to conserve tokens.
     * Invite them to describe the business, product, or startup concept they are building.
     * CRITICAL PROHIBITION: DO NOT output any \`\`\`origin-mcq code blocks or \`\`\`origin-pillars code blocks on simple greetings! Zero MCQs on greetings.

2. CONVERSATIONAL & STRATEGIC QUERIES:
   - When the founder asks questions (e.g. "what is LTV:CAC?", "how do you work?", "who are you?"):
     * Answer directly, concisely, and quantitatively without MCQs.
     * DO NOT output any \`\`\`origin-mcq code blocks on general inquiries.

3. VENTURE CONCEPT INTAKE & DIAGNOSTIC:
   - ONLY when the founder describes a specific business, startup, or product concept they are building:

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
     "market_size": {
       "tam": "$[TAM, e.g. $1.8B]",
       "targetAccounts": [number, e.g. 40000],
       "acv": [number, e.g. 45000],
       "cagr": "[e.g. 24.5%]",
       "analysis": "Bottom-up market sizing modeled specifically for [Venture]..."
     },
     "customer_segments": {
       "enterprisePct": [number, e.g. 55],
       "midMarketPct": [number, e.g. 35],
       "smbPct": [number, e.g. 10],
       "primaryIcp": "[Primary ICP role]",
       "analysis": "Segmentation and customer urgency breakdown for [Venture]..."
     },
     "business_model": {
       "subShare": [number, e.g. 70],
       "usageShare": [number, e.g. 25],
       "serviceShare": [number, e.g. 5],
       "pricingModel": "[Pricing Model Name]",
       "analysis": "Monetization flywheel and revenue expansion triggers for [Venture]..."
     },
     "unit_economics": {
       "cac": [number, e.g. 8500],
       "ltv": [number, e.g. 42500],
       "paybackMonths": [number, e.g. 8.2],
       "grossMargin": [number, e.g. 82],
       "netRetention": [number, e.g. 128],
       "analysis": "Capital efficiency baseline and payback curve for [Venture]..."
     },
     "usp_moat": {
       "switchingCosts": [number 0-100, e.g. 88],
       "counterPositioning": [number 0-100, e.g. 84],
       "networkEffects": [number 0-100, e.g. 72],
       "overallMoatScore": [number 0-100, e.g. 82],
       "analysis": "Defensibility analysis grounded in Hamilton Helmer's 7 Powers for [Venture]..."
     },
     "branding": {
       "healthScore": [number 0-100, e.g. 88],
       "distinctiveness": [number 0-100, e.g. 92],
       "resonance": [number 0-100, e.g. 89],
       "archetype": "[Brand Archetype]",
       "analysis": "Brand resonance and category positioning architecture for [Venture]..."
     }
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

6. TOKEN CONSERVATION PROTOCOL:
   - Strict token economy: keep all messages high-density, concise, and eliminate repetitive pleasantries.
   - Never output duplicate code blocks.

Never reference generic placeholder companies like "Apex AI". Every metric and name must be 100% specific to the user's venture.`
        };

        const incomingMessages = payload.messages || [];
        const finalMessages = [systemMessage, ...incomingMessages];

        // Call NVIDIA NIM helper with automatic cascade
        async function fetchNvidiaCompletion(modelName) {
          return await fetch(`${NVIDIA_BASE_URL}/chat/completions`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${userApiKey}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              model: modelName,
              messages: finalMessages,
              temperature: payload.temperature !== undefined ? payload.temperature : 0.2,
              max_tokens: payload.max_tokens || 3072,
              stream: stream
            })
          });
        }

        let activeModel = requestedModel;
        let nvidiaRes = await fetchNvidiaCompletion(activeModel);

        // Check if 550b returns 503 or error
        if ((!nvidiaRes.ok || nvidiaRes.status === 503) && activeModel === DEFAULT_MODEL) {
          console.warn(`NVIDIA 550B returned status ${nvidiaRes.status}. Cascading to ${FALLBACK_MODEL}...`);
          activeModel = FALLBACK_MODEL;
          nvidiaRes = await fetchNvidiaCompletion(activeModel);
        }

        if (!nvidiaRes.ok) {
          const errText = await nvidiaRes.text();
          console.error('NVIDIA NIM API Error:', nvidiaRes.status, errText);
          res.writeHead(nvidiaRes.status, { 'Content-Type': 'application/json' });
          res.end(errText);
          return;
        }

        if (stream && nvidiaRes.body) {
          const reader = nvidiaRes.body.getReader();
          const firstChunk = await reader.read();

          if (firstChunk.done) {
            res.writeHead(200, { 'Content-Type': 'text/event-stream' });
            res.end();
            return;
          }

          const firstText = new TextDecoder('utf-8').decode(firstChunk.value);

          // If stream returned an embedded error (e.g. 503 overloaded inside 200 OK SSE)
          if ((firstText.includes('"error"') || firstText.includes('Service temporarily overloaded')) && activeModel === DEFAULT_MODEL) {
            console.warn(`NVIDIA 550B returned overloaded SSE error. Cascading to ${FALLBACK_MODEL}...`);
            activeModel = FALLBACK_MODEL;
            const fallbackRes = await fetchNvidiaCompletion(activeModel);
            if (!fallbackRes.ok) {
              const errText = await fallbackRes.text();
              res.writeHead(fallbackRes.status, { 'Content-Type': 'application/json' });
              res.end(errText);
              return;
            }

            res.writeHead(200, {
              'Content-Type': 'text/event-stream; charset=utf-8',
              'Cache-Control': 'no-cache',
              'Connection': 'keep-alive'
            });

            const fbReader = fallbackRes.body.getReader();
            while (true) {
              const { done, value } = await fbReader.read();
              if (done) break;
              res.write(value);
            }
            res.end();
            return;
          }

          // Otherwise stream normally
          res.writeHead(200, {
            'Content-Type': 'text/event-stream; charset=utf-8',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive'
          });
          res.write(firstChunk.value);

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            res.write(value);
          }
          res.end();
        } else {
          const data = await nvidiaRes.json();
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify(data));
        }
      } catch (err) {
        console.error('Server error handling /api/chat:', err);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: err.message }));
      }
    });
    return;
  }

  // 2. API: /api/models (Returns active NVIDIA NIM models)
  if (pathname === '/api/models' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      current: DEFAULT_MODEL,
      models: [
        { id: 'nvidia/nemotron-3-ultra-550b-a55b', name: 'NVIDIA Nemotron 3 Ultra 550B (Active)', speed: '550B Massive Reasoning', context: '128k', status: 'selected_primary' },
        { id: 'nvidia/nemotron-3-super-120b-a12b', name: 'NVIDIA Nemotron 3 Super 120B', speed: 'Ultra Fast & High IQ', context: '128k', status: 'active_verified' },
        { id: 'meta/llama-3.2-11b-vision-instruct', name: 'Llama 3.2 11B Vision (NVIDIA NIM)', speed: 'Instant / Low Latency', context: '128k', status: 'verified_active' },
        { id: 'writer/palmyra-fin-70b-32k', name: 'Palmyra Financial 70B (NVIDIA NIM)', speed: 'Specialized FinTech', context: '32k', status: 'available' }
      ]
    }));
    return;
  }

  // 3. API: /api/config
  if (pathname === '/api/config' && req.method === 'GET') {
    res.writeHead(200, { 
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache, no-store, must-revalidate'
    });
    res.end(JSON.stringify({
      status: 'ready',
      defaultModel: DEFAULT_MODEL,
      googleClientId: process.env.GOOGLE_CLIENT_ID || ''
    }));
    return;
  }

  // ============================================================================
  // GOOGLE OAUTH & SESSION ENDPOINTS
  // ============================================================================

  // POST /api/auth/google
  if (pathname === '/api/auth/google' && req.method === 'POST') {
    try {
      const payload = await parseJsonBody(req);
      const credential = payload.credential;
      if (!credential) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Missing Google credential token' }));
        return;
      }

      // Verify token with Google's official public tokeninfo endpoint
      const googleResp = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(credential)}`);
      if (!googleResp.ok) {
        const errText = await googleResp.text();
        res.writeHead(401, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Invalid Google token', details: errText }));
        return;
      }

      const googleUser = await googleResp.json();
      
      // Find or create user in persistent DB
      const user = db.findOrCreateUserByGoogle(googleUser);
      const sessionToken = db.createSession(user.id);

      res.writeHead(200, {
        'Content-Type': 'application/json',
        'Set-Cookie': `origin_session=${sessionToken}; Path=/; HttpOnly; SameSite=Lax; Max-Age=2592000`
      });
      res.end(JSON.stringify({
        ok: true,
        user,
        token: sessionToken
      }));
    } catch (err) {
      console.error('Google auth error:', err);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: err.message }));
    }
    return;
  }

  // GET /api/auth/me
  if (pathname === '/api/auth/me' && req.method === 'GET') {
    const user = getSessionUser(req);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      authenticated: !!user,
      user: user || null
    }));
    return;
  }

  // POST /api/auth/logout
  if (pathname === '/api/auth/logout' && req.method === 'POST') {
    const authHeader = req.headers['authorization'] || '';
    let token = '';
    if (authHeader.startsWith('Bearer ')) {
      token = authHeader.slice(7).trim();
    } else if (req.headers.cookie) {
      const match = req.headers.cookie.match(/(?:origin_session|stratum_session)=([^;]+)/);
      if (match) token = match[1];
    }
    if (token) {
      db.deleteSession(token);
    }
    res.writeHead(200, {
      'Content-Type': 'application/json',
      'Set-Cookie': ['origin_session=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0', 'stratum_session=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0']
    });
    res.end(JSON.stringify({ ok: true }));
    return;
  }

  // ============================================================================
  // CHAT HISTORY & PINNED SESSIONS ENDPOINTS
  // ============================================================================

  // GET /api/chats
  if (pathname === '/api/chats' && req.method === 'GET') {
    const user = getSessionUser(req);
    const userId = user ? user.id : 'guest';
    const chats = db.getUserChats(userId);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(chats));
    return;
  }

  // POST /api/chats (Save/Update conversation)
  if (pathname === '/api/chats' && req.method === 'POST') {
    const user = getSessionUser(req);
    const userId = user ? user.id : 'guest';
    const payload = await parseJsonBody(req);
    const saved = db.saveChat(payload, userId);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(saved));
    return;
  }

  // POST /api/chats/:id/pin (Toggle Pin status)
  const pinMatch = pathname.match(/^\/api\/chats\/([^/]+)\/pin$/);
  if (pinMatch && req.method === 'POST') {
    const user = getSessionUser(req);
    const userId = user ? user.id : 'guest';
    const chatId = pinMatch[1];
    const updated = db.togglePinChat(chatId, userId);
    if (!updated) {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Chat not found' }));
      return;
    }
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(updated));
    return;
  }

  // GET or DELETE /api/chats/:id
  const chatMatch = pathname.match(/^\/api\/chats\/([^/]+)$/);
  if (chatMatch) {
    const user = getSessionUser(req);
    const userId = user ? user.id : 'guest';
    const chatId = chatMatch[1];

    if (req.method === 'GET') {
      const chat = db.getChatById(chatId, userId);
      if (!chat) {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Chat not found' }));
        return;
      }
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(chat));
      return;
    }

    if (req.method === 'DELETE') {
      const deleted = db.deleteChat(chatId, userId);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ ok: deleted }));
      return;
    }
  }


  // 4. Video Streaming with HTTP 206 Partial Content (Range Support)
  if (pathname === '/video' || pathname === '/the-crown-of-thorns-moewalls-com.mp4') {
    const videoPath = path.join(__dirname, 'the-crown-of-thorns-moewalls-com.mp4');
    if (!fs.existsSync(videoPath)) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Video not found');
      return;
    }

    const stat = fs.statSync(videoPath);
    const fileSize = stat.size;
    const range = req.headers.range;

    if (range) {
      const parts = range.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

      if (start >= fileSize) {
        res.writeHead(416, {
          'Content-Range': `bytes */${fileSize}`
        });
        return res.end();
      }

      const chunksize = (end - start) + 1;
      const file = fs.createReadStream(videoPath, { start, end });
      const head = {
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunksize,
        'Content-Type': 'video/mp4',
        'Cache-Control': 'public, max-age=3600'
      };

      res.writeHead(206, head);
      file.pipe(res);
    } else {
      const head = {
        'Content-Length': fileSize,
        'Accept-Ranges': 'bytes',
        'Content-Type': 'video/mp4',
        'Cache-Control': 'public, max-age=3600'
      };
      res.writeHead(200, head);
      fs.createReadStream(videoPath).pipe(res);
    }
    return;
  }

  // 5. Static File Serving
  let filePath = path.join(__dirname, pathname === '/' ? 'index.html' : pathname);
  
  // Security check: ensure path is within directory and block dotfiles (.env) and database data
  if (!filePath.startsWith(__dirname) || path.basename(filePath).startsWith('.') || filePath.startsWith(path.join(__dirname, 'data'))) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      // Fallback to index.html for SPA if not found
      filePath = path.join(__dirname, 'index.html');
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    fs.readFile(filePath, (readErr, content) => {
      if (readErr) {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end(`Server Error: ${readErr.message}`);
        return;
      }
      res.writeHead(200, {
        'Content-Type': contentType,
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      });
      res.end(content);
    });
  });
});

server.listen(PORT, () => {
  console.log(`Origin Platform Server listening at http://localhost:${PORT}`);
});
