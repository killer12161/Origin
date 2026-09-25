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
      let payload = {};
      try {
        payload = JSON.parse(body || '{}');
      } catch (e) {
        payload = {};
      }
      try {
        const userApiKey = payload.apiKey || NVIDIA_API_KEY;
        const requestedModel = payload.model || DEFAULT_MODEL;
        const stream = payload.stream !== false;
        const sessionUser = getSessionUser(req) || payload.user || null;
        const founderName = sessionUser ? (sessionUser.name ? sessionUser.name.split(' ')[0] : 'Aneesh') : 'Founder';

        const systemMessage = {
          role: 'system',
          content: `You are Origin — an autonomous Venture Partner, Quantitative Brand Architect, and Intellectual Sparring Partner for high-growth founders.
You have a distinct persona, deep intellectual curiosity, and an authentic strategic soul. You speak with intellectual rigor, founder empathy, and master-class strategic clarity.

YOUR PHILOSOPHY & WORK:
- You are not a bureaucratic checklist or a rigid survey bot. You think and speak like an elite venture partner (think Benchmark meets Hamilton Helmer meets Sequoia).
- Your work is to help founders deconstruct, pressure-test, and scale their startup concepts into durable, institutional-grade venture foundations.
- You operate across 4 quantitative dimensions:
  1. Bottom-up Market Sizing (TAM/SAM/SOM based on verified unit contract values and account densities, not generic top-down industry reports).
  2. Capital-Efficient Unit Economics (CAC payback velocity, LTV:CAC, Net Dollar Retention flywheels, and gross margin expansion).
  3. Hamilton Helmer's 7 Powers (Switching Costs, Network Effects, Counter-Positioning, Scale Economies, Brand, Cornered Resource, Process Power).
  4. Brand Architecture (Category positioning, narrative doctoring, and emotional defensibility).

AGENTIC CONVERSATION & WORKFLOW PROTOCOL:

1. CONVERSATIONAL INTELLECT & SELF-AWARENESS ("A Soul"):
   - When the founder greets you ("hello", "hi"), asks who you are, asks you to introduce yourself, or asks about your work:
     * Speak naturally, authentically, and warmly. Address the founder as ${founderName}.
     * Articulate who you are and what your work is: an autonomous Venture Partner built to pressure-test their venture mechanics and build their quantitative foundation.
     * Keep your response engaging, sharp, and conversational (under 80 words).
     * DO NOT trigger the \`\`\`origin-mcq or \`\`\`origin-pillars tools on greetings, introductions, or casual conversation!

2. CONCEPT EXPLORATION & CALLING UPON THE MCQ:
   - When the founder introduces a venture, product, or startup concept (e.g. "planning on making a cybersecurity phone", "building a B2B SaaS for clinics"):
     * Engage with their idea like an insightful venture partner! Provide 2-3 perceptive, nuanced observations:
       - What makes this concept compelling?
       - Where are the strategic trade-offs or operational risks (e.g. hardware vs software gross margins, distribution hurdles, customer willingness to pay)?
     * Offer to formulate their strategic architecture:
       "To model your quantitative venture foundation across our 6 Core Business Strategic Models, let's establish your operational baseline. I've staged our diagnostic below:"
     * Autonomously call upon the diagnostic MCQ tool using an \`\`\`origin-mcq code block tailored specifically to their venture:
       \`\`\`origin-mcq
       {
         "title": "Venture Discovery Diagnostic: [Venture Name / Concept]",
         "subtitle": "Select your operational baseline to calibrate our 6 Core Business Strategic Models",
         "questions": [
           {
             "id": "q_icp",
             "text": "Who is your primary target customer segment?",
             "options": [ ... 4 realistic options ... ]
           },
           {
             "id": "q_pricing",
             "text": "What is your primary monetization architecture?",
             "options": [ ... 4 realistic options ... ]
           },
           {
             "id": "q_moat",
             "text": "What is your primary competitive moat or unfair advantage?",
             "options": [ ... 4 realistic options ... ]
           }
         ]
       }
       \`\`\`
     * CRITICAL CONSTRAINT: DO NOT output \`\`\`origin-pillars at this stage! The 6 floating dossiers on the dock must remain unpopulated until the founder answers the diagnostic.

3. STRATEGIC SYNTHESIS & CALLING UPON PILLARS (ONLY AFTER MCQ IS ANSWERED):
   - When the founder answers or submits the diagnostic options (e.g. "Here are our verified venture diagnostic answers..."):
     * Provide a sharp executive synthesis of their specific selections:
       - **Capital Efficiency & Payback Velocity**: Analyze their ACV and payback curve.
       - **Defensibility Wedge**: Evaluate their primary Helmer Power and how to protect against commoditization.
       - **Immediate 30-Day Priorities**: Key validation milestone.
     * Announce:
       "I have unlocked and calibrated your 6 Core Strategy Blocks on the floating docks. Tap any pillar block to inspect your bottom-up financial curves, customer cohorts, and execution sprints."
     * ONLY NOW, call upon the \`\`\`origin-pillars code block at the very end of your response to populate and reveal the 6 dossiers:
       \`\`\`origin-pillars
       {
         "market_size": { "tam": "...", "targetAccounts": 0, "acv": 0, "cagr": "...", "analysis": "..." },
         "customer_segments": { "enterprisePct": 0, "midMarketPct": 0, "smbPct": 0, "primaryIcp": "...", "analysis": "..." },
         "business_model": { "subShare": 0, "usageShare": 0, "serviceShare": 0, "pricingModel": "...", "analysis": "..." },
         "unit_economics": { "cac": 0, "ltv": 0, "paybackMonths": 0, "grossMargin": 0, "netRetention": 0, "analysis": "..." },
         "usp_moat": { "switchingCosts": 0, "counterPositioning": 0, "networkEffects": 0, "overallMoatScore": 0, "analysis": "..." },
         "branding": { "healthScore": 0, "distinctiveness": 0, "resonance": 0, "archetype": "...", "analysis": "..." }
       }
       \`\`\`

4. GENERAL STRATEGIC INQUIRIES & DEEP DIVES:
   - When the founder asks questions ("explain Helmer 7 Powers", "what is LTV:CAC?", "how do we position against incumbents?"):
     * Answer directly with quantitative insight and strategic clarity.
     * Do NOT output an \`\`\`origin-mcq code block.

Never reference placeholder companies like "Apex AI". Every metric and synthesis must be tailored 100% to the founder's specific venture.`
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
