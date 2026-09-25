/**
 * Origin Venture Intelligence Platform - Real Interactive Application
 * Integrates with stratum-sdk.js & NVIDIA NIM (Nemotron 3 Ultra 550B)
 * Supports Google OAuth 2.0 Identity & Persistent Chat Storage (SQLite/JSON)
 */

// Host determination: local /api on localhost, or empty on static GitHub Pages
const API_BASE = (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'))
  ? ''
  : '';

// Initialize Stratum SDK
let currentModel = 'nvidia/nemotron-3-ultra-550b-a55b';
const stratum = new StratumAI({
  model: currentModel,
  enableThinking: true
});

// App State
let conversationHistory = [];
let thinkingModeActive = true;
let isGenerating = false;
let recognition = null;
let isRecording = false;

// Auth & Persistence State
let currentUser = null;
let currentChatId = null;
let currentChatTitle = null;
let currentChatIsPinned = false;
let currentChatMessages = [];
let userChatsList = { pinned: [], recents: [] };

// DOM Elements
const chatViewport = document.getElementById('chatViewport');
const chatMessages = document.getElementById('chatMessages');
const emptyStateHero = document.getElementById('emptyStateHero');
const userInput = document.getElementById('userInput');
const sendBtn = document.getElementById('sendBtn');
const thinkToggleBtn = document.getElementById('thinkToggleBtn');
const voiceBtn = document.getElementById('voiceBtn');
const sidebar = document.getElementById('sidebar');
const expandSidebarBtn = document.getElementById('expandSidebarBtn');
const activeModelLabel = document.getElementById('activeModelLabel');
const bgVideo = document.getElementById('bgVideo');
const videoScrim = document.getElementById('videoScrim');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  setupSpeechRecognition();
  autoResizeTextarea(userInput);
  updateModelLabel();
  setupVideoAutoplay();
  initAuthAndChats();

  // Mobile viewport: collapse sidebar by default on screens <= 768px
  if (window.innerWidth <= 768 && sidebar && !sidebar.classList.contains('collapsed')) {
    sidebar.classList.add('collapsed');
    if (expandSidebarBtn) expandSidebarBtn.style.display = 'flex';
  }

  // Handle window resize dynamically
  window.addEventListener('resize', () => {
    const mobileBackdrop = document.getElementById('sidebarMobileBackdrop');
    if (window.innerWidth > 768 && mobileBackdrop) {
      mobileBackdrop.classList.remove('active');
    }
  });
});

// Close popovers on click outside
document.addEventListener('click', (e) => {
  const popover = document.getElementById('userMenuPopover');
  if (popover && popover.style.display !== 'none') {
    const tile = document.getElementById('userProfileTile');
    if (!popover.contains(e.target) && (!tile || !tile.contains(e.target))) {
      popover.style.display = 'none';
    }
  }
});

// ============================================================================
// AUTH & GOOGLE IDENTITY SERVICES
// ============================================================================

// Google OAuth Client Configuration
const GOOGLE_CLIENT_ID = '1035905230106-a6jqoj7ihd3qrcemufi8j342n2olssb0.apps.googleusercontent.com';
let googleTokenClient = null;

async function initAuthAndChats() {
  // 1. Immediately initialize Google Client so GSI is ALWAYS active and ready
  setupGoogleClient(GOOGLE_CLIENT_ID);

  // 2. Check local session cache first
  try {
    const cachedUser = localStorage.getItem('origin_user');
    if (cachedUser) {
      currentUser = JSON.parse(cachedUser);
      renderUserProfile(currentUser);
    } else {
      renderLoggedOutState();
    }
  } catch (e) {
    renderLoggedOutState();
  }

  // 3. Verify active session with backend if online
  if (API_BASE) {
    try {
      const meResp = await fetch(`${API_BASE}/api/auth/me`);
      if (meResp.ok) {
        const meData = await meResp.json();
        if (meData.authenticated && meData.user) {
          currentUser = meData.user;
          localStorage.setItem('origin_user', JSON.stringify(currentUser));
          renderUserProfile(currentUser);
        } else if (!localStorage.getItem('origin_user')) {
          renderLoggedOutState();
        }
      }
    } catch (err) {
      if (!currentUser) {
        renderLoggedOutState();
      }
    }
  }

  // 4. Try loading chats
  try {
    await loadUserChats();
  } catch (err) {
    console.warn('Could not sync remote chats:', err);
  }
}

function setupGoogleClient(clientId) {
  let attempts = 0;
  const initGsi = () => {
    attempts++;
    if (window.google && window.google.accounts) {
      // 1. Initialize Google OAuth2 Token Client (powers custom button popup!)
      if (window.google.accounts.oauth2) {
        try {
          googleTokenClient = google.accounts.oauth2.initTokenClient({
            client_id: clientId,
            scope: 'openid email profile',
            callback: async (tokenResponse) => {
              if (tokenResponse.error) {
                console.warn('Google Sign-In Token Response:', tokenResponse);
                if (tokenResponse.error === 'origin_mismatch' || tokenResponse.error === 'access_denied') {
                  showToast('Google OAuth: Please verify origin is authorized in Google Cloud Console.');
                } else {
                  showToast('Google Sign-in: ' + (tokenResponse.error_description || tokenResponse.error));
                }
                return;
              }
              try {
                showToast('Connecting Google account...');
                const profileResp = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                  headers: { Authorization: `Bearer ${tokenResponse.access_token}` }
                });
                if (profileResp.ok) {
                  const profile = await profileResp.json();
                  currentUser = {
                    name: profile.name || 'Origin Strategist',
                    email: profile.email || 'aneeshpoddar63@gmail.com',
                    picture: profile.picture || '',
                    googleId: profile.sub
                  };
                  localStorage.setItem('origin_user', JSON.stringify(currentUser));
                  renderUserProfile(currentUser);
                  showToast(`Welcome, ${currentUser.name}!`);

                  // Sync with backend if available
                  if (API_BASE) {
                    try {
                      await fetch(`${API_BASE}/api/auth/google`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ accessToken: tokenResponse.access_token, user: currentUser })
                      });
                    } catch (e) {}
                  }
                }
              } catch (profileErr) {
                console.error('Failed fetching Google profile:', profileErr);
                showToast('Could not load profile from Google');
              }
            }
          });
        } catch (err) {
          console.warn('Could not initialize Google Token Client:', err);
        }
      }

      // 2. Initialize Google Identity Services (One Tap + Official Button)
      if (window.google.accounts.id) {
        try {
          google.accounts.id.initialize({
            client_id: clientId,
            callback: handleGoogleCredentialResponse,
            auto_select: false
          });
        } catch(e) {
          console.warn('GSI ID init error:', e);
        }
      }

      if (!currentUser) {
        renderGoogleSignInButton();
      }
    } else if (attempts < 20) {
      setTimeout(initGsi, 250);
    }
  };
  initGsi();
}

function renderGoogleSignInButton() {
  const authContainer = document.getElementById('authContainer');
  if (!authContainer) return;

  authContainer.innerHTML = `
    <div id="gsiButtonContainer" style="display:flex; justify-content:center; margin-bottom:4px;"></div>
    <button class="google-signin-btn" id="googleSignInBtn" onclick="promptGoogleLogin()" title="Sign in with your Google account">
      <svg viewBox="0 0 24 24">
        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
      </svg>
      <span>Sign in with Google</span>
    </button>
  `;

  // Render official GSI button if available
  if (window.google && window.google.accounts && window.google.accounts.id) {
    const container = document.getElementById('gsiButtonContainer');
    if (container) {
      try {
        google.accounts.id.renderButton(container, {
          type: 'standard',
          theme: 'filled_black',
          size: 'large',
          shape: 'pill',
          width: 220
        });
        const fb = document.getElementById('googleSignInBtn');
        if (fb && container.children.length > 0) {
          fb.style.display = 'none';
        }
      } catch (e) {
        console.warn('GSI renderButton error:', e);
      }
    }
  }
}

function renderLoggedOutState() {
  renderGoogleSignInButton();
}

function promptGoogleLogin() {
  if (googleTokenClient) {
    // Official Google OAuth2 popup: directly requests access token via Google Account Chooser
    googleTokenClient.requestAccessToken({ prompt: 'select_account' });
  } else if (window.google && window.google.accounts && window.google.accounts.id) {
    google.accounts.id.prompt((notification) => {
      if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
        showToast('Please check popup permissions or use the Google Sign-in button.');
      }
    });
  } else {
    showToast('Google Services initializing, please wait...');
  }
}

function parseJwt(token) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join(''));
    return JSON.parse(jsonPayload);
  } catch(e) {
    return null;
  }
}

async function handleGoogleCredentialResponse(response) {
  try {
    showToast('Authenticating with Origin...');

    // 1. Instantly decode Google profile client-side
    const payload = parseJwt(response.credential);
    if (payload && payload.email) {
      currentUser = {
        name: payload.name || 'Origin Strategist',
        email: payload.email,
        picture: payload.picture || '',
        googleId: payload.sub
      };
      localStorage.setItem('origin_user', JSON.stringify(currentUser));
      renderUserProfile(currentUser);
      showToast(`Welcome, ${currentUser.name}!`);
    }

    // 2. Sync session with backend if reachable
    if (API_BASE) {
      try {
        const res = await fetch(`${API_BASE}/api/auth/google`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ credential: response.credential })
        });
        if (res.ok) {
          const data = await res.json();
          if (data.ok && data.user) {
            currentUser = data.user;
            localStorage.setItem('origin_user', JSON.stringify(currentUser));
            renderUserProfile(currentUser);
            await loadUserChats();
          }
        }
      } catch (netErr) {
        console.log('Backend sync skipped, running in client mode:', netErr);
      }
    }
  } catch (err) {
    console.error('Google auth error:', err);
    showToast('Authentication failed.');
  }
}

function renderUserProfile(user) {
  const authContainer = document.getElementById('authContainer');
  if (!authContainer) return;

  const avatarHtml = user.picture
    ? `<img src="${user.picture}" class="user-avatar-img" alt="${escapeHtml(user.name)}" />`
    : `<div class="user-avatar">${(user.name || 'AP').slice(0, 2).toUpperCase()}</div>`;

  authContainer.innerHTML = `
    <div class="user-profile-tile" id="userProfileTile" onclick="toggleProfileDropdown(event)">
      <div class="user-info-left">
        ${avatarHtml}
        <div class="user-name-box">
          <span class="user-name">${escapeHtml(user.name)}</span>
          <span class="user-plan">${escapeHtml(user.email || 'Lead Strategist • Pro')}</span>
        </div>
      </div>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="opacity:0.5;"><circle cx="12" cy="12" r="1"></circle><circle cx="12" cy="5" r="1"></circle><circle cx="12" cy="19" r="1"></circle></svg>
    </div>
  `;

  const popoverName = document.getElementById('popoverUserName');
  const popoverEmail = document.getElementById('popoverUserEmail');
  if (popoverName) popoverName.textContent = user.name;
  if (popoverEmail) popoverEmail.textContent = user.email;
}

function toggleProfileDropdown(e) {
  if (e) e.stopPropagation();
  const popover = document.getElementById('userMenuPopover');
  if (!popover) return;
  updatePopoverVideoToggleState();
  popover.style.display = popover.style.display === 'none' ? 'block' : 'none';
}

async function handleLogout() {
  try {
    currentUser = null;
    localStorage.removeItem('origin_user');
    const popover = document.getElementById('userMenuPopover');
    if (popover) popover.style.display = 'none';
    renderGoogleSignInButton();
    showToast('Signed out of Origin');
    startNewChat();
    try {
      await fetch(`${API_BASE}/api/auth/logout`, { method: 'POST' });
    } catch (e) {}
    await loadUserChats();
  } catch (err) {
    console.error('Logout error:', err);
  }
}

// ============================================================================
// CHAT PERSISTENCE & HISTORY MANAGEMENT
// ============================================================================

async function loadUserChats() {
  try {
    const resp = await fetch(`${API_BASE}/api/chats`);
    const data = await resp.json();
    userChatsList = data;
    renderChatsSidebar(data);
  } catch (err) {
    console.error('Error loading chats:', err);
  }
}

function renderChatsSidebar(chats) {
  const pinnedList = document.getElementById('pinnedList');
  const recentsList = document.getElementById('recentsList');

  if (pinnedList) {
    if (chats.pinned && chats.pinned.length > 0) {
      pinnedList.innerHTML = chats.pinned.map(c => renderChatItem(c)).join('');
    } else {
      pinnedList.innerHTML = `<div class="chat-empty-hint" style="padding: 8px 12px; font-size: 11px; color: var(--text-muted); font-style: italic;">No pinned strategy sessions yet</div>`;
    }
  }

  if (recentsList) {
    if (chats.recents && chats.recents.length > 0) {
      recentsList.innerHTML = chats.recents.map(c => renderChatItem(c)).join('');
    } else {
      recentsList.innerHTML = `<div class="chat-empty-hint" id="noChatsHint" style="padding: 8px 12px; font-size: 11px; color: var(--text-muted); font-style: italic;">Start a new conversation to begin strategizing</div>`;
    }
  }
}

function renderChatItem(chat) {
  const isActive = currentChatId === chat.id;
  const pinFill = chat.isPinned ? '#818cf8' : 'none';
  const pinStroke = chat.isPinned ? '#818cf8' : 'currentColor';

  return `
    <div class="chat-history-item ${isActive ? 'active' : ''}" onclick="selectChat('${chat.id}')">
      <span class="title" title="${escapeHtml(chat.title)}">${escapeHtml(chat.title)}</span>
      <div class="item-options">
        <button class="mini-opt-btn" title="${chat.isPinned ? 'Unpin session' : 'Pin session'}" onclick="handleTogglePin('${chat.id}', event)">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="${pinFill}" stroke="${pinStroke}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="12" y1="17" x2="12" y2="22"></line>
            <path d="M5 17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.78-.89A2 2 0 0 1 15 10.76V6h1a1 1 0 0 0 1-1V3a1 1 0 0 0-1-1H8a1 1 0 0 0-1 1v2a1 1 0 0 0 1 1h1v4.76a2 2 0 0 1-1.11 1.8l-1.78.89A2 2 0 0 0 5 15.24Z"></path>
          </svg>
        </button>
        <button class="mini-opt-btn" title="Delete session" onclick="handleDeleteChat('${chat.id}', event)">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="3 6 5 6 21 6"></polyline>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
          </svg>
        </button>
      </div>
    </div>
  `;
}

async function selectChat(chatId) {
  try {
    const resp = await fetch(`${API_BASE}/api/chats/${chatId}`);
    if (!resp.ok) return;
    const chat = await resp.json();
    currentChatId = chat.id;
    currentChatTitle = chat.title;
    currentChatIsPinned = !!chat.isPinned;
    currentChatMessages = chat.messages || [];

    // Reset pillars for this session to unpopulated / hidden state
    if (typeof OriginPillars !== 'undefined' && typeof OriginPillars.resetPillars === 'function') {
      OriginPillars.resetPillars();
    }

    // Clear and restore conversation
    chatMessages.innerHTML = '';
    if (emptyStateHero) emptyStateHero.style.display = 'none';

    conversationHistory = [];
    let lastUserMessageText = '';
    for (const msg of currentChatMessages) {
      conversationHistory.push({ role: msg.role, content: msg.content });
      if (msg.role === 'user') {
        lastUserMessageText = msg.content || '';
        renderUserMessage(msg.content);
      } else {
        renderLoadedAssistantMessage(msg, lastUserMessageText);
      }
    }

    // If chat had saved calibrated pillarData directly, sync and reveal them
    if (chat.pillarData && typeof OriginPillars !== 'undefined' && typeof OriginPillars.syncPillarsFromAI === 'function') {
      OriginPillars.syncPillarsFromAI(chat.pillarData);
    } else {
      // Fail-safe check: If this conversation includes a diagnostic submission, ensure pillars are active and visible!
      const hasDiagnosticSubmission = currentChatMessages.some(m => 
        m.role === 'user' && (m.content || '').includes('verified venture diagnostic answers')
      );
      if (hasDiagnosticSubmission && typeof OriginPillars !== 'undefined') {
        if (!OriginPillars.hasGeneratedPillars()) {
          const userDiagMsg = currentChatMessages.find(m => 
            m.role === 'user' && (m.content || '').includes('verified venture diagnostic answers')
          );
          OriginPillars.syncPillarsFromAI({}, userDiagMsg?.content);
        }
      }
    }

    scrollToBottom();
    renderChatsSidebar(userChatsList);
  } catch (err) {
    console.error('Error selecting chat:', err);
  }
}

// ============================================================================
// AGENTIC PARSING & CLEANING UTILITIES (Strict Background Execution)
// ============================================================================

// Robust JSON repair parser: handles cut-off streams, unclosed strings, trailing commas, and unclosed braces
function repairAndParsePillarJson(raw) {
  if (!raw || typeof raw !== 'string') return null;
  let str = raw.trim();

  // 1. Direct parse attempt
  try {
    return JSON.parse(str);
  } catch (e) {}

  // 2. Intelligent quote and brace repair
  function attemptRepair(candidate) {
    let text = candidate.trim();
    if (!text.startsWith('{')) {
      const firstBrace = text.indexOf('{');
      if (firstBrace === -1) return null;
      text = text.slice(firstBrace);
    }

    let inString = false;
    let escape = false;

    for (let i = 0; i < text.length; i++) {
      const c = text[i];
      if (escape) {
        escape = false;
        continue;
      }
      if (c === '\\') {
        escape = true;
        continue;
      }
      if (c === '"') {
        inString = !inString;
        continue;
      }
    }

    let repaired = text;
    if (inString) {
      repaired += '"';
    }

    // Strip trailing commas, colons, or dangling punctuation
    repaired = repaired.replace(/,\s*$/, '');
    repaired = repaired.replace(/:\s*$/, ': null');

    // Count open braces vs close braces
    let depth = 0;
    let inStr2 = false;
    let esc2 = false;
    for (let i = 0; i < repaired.length; i++) {
      const c = repaired[i];
      if (esc2) { esc2 = false; continue; }
      if (c === '\\') { esc2 = true; continue; }
      if (c === '"') { inStr2 = !inStr2; continue; }
      if (!inStr2) {
        if (c === '{') depth++;
        else if (c === '}') depth--;
      }
    }

    if (depth > 0) {
      repaired += '}'.repeat(depth);
    }

    try {
      return JSON.parse(repaired);
    } catch (err) {
      return null;
    }
  }

  const res1 = attemptRepair(str);
  if (res1) return res1;

  // 3. Fallback: extract individual known pillars
  const pillarKeys = ['market_size', 'customer_segments', 'business_model', 'unit_economics', 'usp_moat', 'branding'];
  const partial = {};
  let anyFound = false;

  for (const key of pillarKeys) {
    const kIdx = str.indexOf('"' + key + '"');
    if (kIdx === -1) continue;
    const colonIdx = str.indexOf(':', kIdx);
    if (colonIdx === -1) continue;
    const braceIdx = str.indexOf('{', colonIdx);
    if (braceIdx === -1) continue;

    let d = 0;
    let end = -1;
    let inS = false;
    let esc = false;
    for (let i = braceIdx; i < str.length; i++) {
      const c = str[i];
      if (esc) { esc = false; continue; }
      if (c === '\\') { esc = true; continue; }
      if (c === '"') { inS = !inS; continue; }
      if (!inS) {
        if (c === '{') d++;
        else if (c === '}') {
          d--;
          if (d === 0) { end = i + 1; break; }
        }
      }
    }

    if (end !== -1) {
      const blockStr = str.substring(braceIdx, end);
      try {
        partial[key] = JSON.parse(blockStr);
        anyFound = true;
      } catch (err) {
        const subRepaired = attemptRepair(blockStr);
        if (subRepaired) {
          partial[key] = subRepaired;
          anyFound = true;
        }
      }
    } else {
      const subRepaired = attemptRepair(str.substring(braceIdx));
      if (subRepaired) {
        partial[key] = subRepaired;
        anyFound = true;
      }
    }
  }

  return anyFound ? partial : null;
}

function extractAndSyncPillars(rawText, mcqAnswers) {
  if (typeof OriginPillars === 'undefined' || !rawText) return;

  let jsonCandidate = null;

  // 1. Try ```origin-pillars ... ``` (handles both closed and unclosed/streaming blocks)
  const match = rawText.match(/```origin-pillars\s*([\s\S]*?)(?:```|$)/);
  if (match && match[1]) {
    jsonCandidate = match[1].trim();
  }

  // 2. Try ```json ... ``` containing "market_size"
  if (!jsonCandidate) {
    const jsonBlocks = rawText.match(/```(?:json)?\s*([\s\S]*?)(?:```|$)/g);
    if (jsonBlocks) {
      for (const block of jsonBlocks) {
        if (block.includes('"market_size"') || block.includes('"unit_economics"')) {
          jsonCandidate = block.replace(/```(?:json)?/g, '').replace(/```/g, '').trim();
          break;
        }
      }
    }
  }

  // 3. Fallback: match raw un-fenced JSON containing "market_size"
  if (!jsonCandidate) {
    const marker = '"market_size"';
    const idx = rawText.indexOf(marker);
    if (idx !== -1) {
      const openBrace = rawText.lastIndexOf('{', idx);
      if (openBrace !== -1) {
        jsonCandidate = rawText.slice(openBrace).trim();
      }
    }
  }

  const parsedData = jsonCandidate ? repairAndParsePillarJson(jsonCandidate) : null;

  // If this message contains the active MCQ diagnostic questions, stage the baseline data but DO NOT reveal docks yet
  if (rawText.includes('origin-mcq')) {
    if (parsedData && typeof OriginPillars.stageIntakeData === 'function') {
      OriginPillars.stageIntakeData(parsedData);
    }
    return;
  }

  // If this is a post-diagnostic synthesis response:
  // Synchronize incoming data over staged baseline, calibrate from MCQ, and reveal the floating docks!
  if (parsedData || mcqAnswers || (typeof OriginPillars.getStagedData === 'function' && OriginPillars.getStagedData())) {
    OriginPillars.syncPillarsFromAI(parsedData || {}, mcqAnswers);
  }
}

function extractAndRenderMcq(rawText) {
  if (typeof OriginPillars === 'undefined' || !rawText) return '';

  let jsonStr = null;

  // 1. Try ```origin-mcq ... ```
  const match = rawText.match(/```origin-mcq\s*([\s\S]*?)(?:```|$)/);
  if (match && match[1]) {
    jsonStr = match[1].trim();
  }

  // 2. Try ```json containing "questions"
  if (!jsonStr) {
    const jsonBlocks = rawText.match(/```(?:json)?\s*([\s\S]*?)(?:```|$)/g);
    if (jsonBlocks) {
      for (const block of jsonBlocks) {
        if (block.includes('"questions"') && (block.includes('"options"') || block.includes('"q_icp"'))) {
          jsonStr = block.replace(/```(?:json)?/g, '').replace(/```/g, '').trim();
          break;
        }
      }
    }
  }

  // 3. Fallback: match raw un-fenced JSON with "questions": [
  if (!jsonStr) {
    const rawMcqMatch = rawText.match(/(\{[\s\r\n]*"title"[\s\S]*?"questions"\s*:\s*\[[\s\S]*?\]\s*\})/);
    if (rawMcqMatch) {
      jsonStr = rawMcqMatch[1].trim();
    }
  }

  if (jsonStr) {
    const data = repairAndParsePillarJson(jsonStr);
    if (data && (data.questions || data.title)) {
      return OriginPillars.renderMcqCardHtml(data);
    }
  }

  return '';
}

// Algorithmic bracket-balancing parser to strip entire unfenced JSON blocks cleanly
function stripUnfencedPillarsJson(text) {
  if (!text) return '';
  const marker = '"market_size"';
  let idx = text.indexOf(marker);
  while (idx !== -1) {
    const openBrace = text.lastIndexOf('{', idx);
    if (openBrace === -1) break;

    let depth = 0;
    let endIdx = -1;
    let inString = false;
    let escape = false;

    for (let i = openBrace; i < text.length; i++) {
      const char = text[i];
      if (escape) {
        escape = false;
        continue;
      }
      if (char === '\\') {
        escape = true;
        continue;
      }
      if (char === '"') {
        inString = !inString;
        continue;
      }
      if (!inString) {
        if (char === '{') depth++;
        else if (char === '}') {
          depth--;
          if (depth === 0) {
            endIdx = i + 1;
            break;
          }
        }
      }
    }

    if (endIdx !== -1) {
      text = text.slice(0, openBrace) + text.slice(endIdx);
    } else {
      text = text.slice(0, openBrace);
      break;
    }

    idx = text.indexOf(marker);
  }
  return text;
}

function stripUnfencedMcqJson(text) {
  if (!text) return '';
  const marker = '"questions"';
  let idx = text.indexOf(marker);
  while (idx !== -1) {
    const openBrace = text.lastIndexOf('{', idx);
    if (openBrace === -1) break;

    let depth = 0;
    let endIdx = -1;
    let inString = false;
    let escape = false;

    for (let i = openBrace; i < text.length; i++) {
      const char = text[i];
      if (escape) {
        escape = false;
        continue;
      }
      if (char === '\\') {
        escape = true;
        continue;
      }
      if (char === '"') {
        inString = !inString;
        continue;
      }
      if (!inString) {
        if (char === '{') depth++;
        else if (char === '}') {
          depth--;
          if (depth === 0) {
            endIdx = i + 1;
            break;
          }
        }
      }
    }

    if (endIdx !== -1) {
      text = text.slice(0, openBrace) + text.slice(endIdx);
    } else {
      text = text.slice(0, openBrace);
      break;
    }

    idx = text.indexOf(marker);
  }
  return text;
}

function cleanVisibleAssistantText(rawText) {
  if (!rawText) return '';

  let cleaned = rawText;

  // 1. Strip stratum chart blocks (both closed and streaming/unclosed)
  cleaned = cleaned.replace(/```stratum-chart:[a-z_]+[\s\S]*?(?:```|$)/gi, '');

  // 2. Strip origin-mcq codeblocks (both closed and streaming/unclosed)
  cleaned = cleaned.replace(/```origin-mcq[\s\S]*?(?:```|$)/gi, '');

  // 3. Strip origin-pillars codeblocks (both closed and streaming/unclosed)
  cleaned = cleaned.replace(/```origin-pillars[\s\S]*?(?:```|$)/gi, '');

  // 4. Strip any codeblock containing market_size, customer_segments, or unit_economics
  cleaned = cleaned.replace(/```(?:json)?[ \t]*\n?[\s\S]*?(?:"market_size"|"customer_segments"|"unit_economics"|"targetAccounts"|"overallMoatScore")[\s\S]*?(?:```|$)/gi, '');

  // 5. Strip any codeblock containing questions / mcq payload
  cleaned = cleaned.replace(/```(?:json)?[ \t]*\n?[\s\S]*?"questions"[ \t]*:[ \t]*\[[\s\S]*?(?:```|$)/gi, '');

  // 6. Strip un-fenced JSON containing market_size
  cleaned = stripUnfencedPillarsJson(cleaned);

  // 7. Strip un-fenced MCQ JSON
  cleaned = stripUnfencedMcqJson(cleaned);

  // 8. Strip diagnostic & quantitative baseline headings (with or without #, **, _, etc.)
  cleaned = cleaned.replace(/^[ \t]*[#*_\s]*(?:Initial\s+)?(?:6-Pillar|Quantitative Baseline|Pre-Calibration|Venture Discovery Diagnostic|Calibrated 6-Pillar)[^\n]*\n?/gim, '');

  // 9. Strip any standalone lines mentioning Venture Discovery Diagnostic or Pre-Calibration
  cleaned = cleaned.replace(/^[ \t]*[#*_\s]*(?:Venture Discovery Diagnostic|Initial 6-Pillar Quantitative Baseline|Calibrated 6-Pillar Strategic Architecture)[^\n]*\n?/gim, '');

  // 10. Strip any trailing unclosed code fences and JSON fragments during streaming
  cleaned = cleaned.replace(/```[a-z0-9_-]*[\s\S]*$/gi, '');
  cleaned = cleaned.replace(/\{\s*"title"[\s\S]*$/gi, '');
  cleaned = cleaned.replace(/\{\s*"questions"[\s\S]*$/gi, '');
  cleaned = cleaned.replace(/\{\s*"market_size"[\s\S]*$/gi, '');
  cleaned = cleaned.replace(/\{\s*"targetAccounts"[\s\S]*$/gi, '');

  // 11. Clean up consecutive blank lines
  cleaned = cleaned.replace(/\n{3,}/g, '\n\n');

  return cleaned.trim();
}

// Secondary post-render safety sanitizer to purge any stray JSON or pre-calibration headers from DOM
function sanitizeRenderedMessageContainer(container) {
  if (!container) return;

  const preElements = container.querySelectorAll('pre');
  preElements.forEach(pre => {
    const text = pre.textContent || '';
    if (
      text.includes('"market_size"') || 
      text.includes('origin-pillars') || 
      text.includes('origin-mcq') ||
      text.includes('"targetAccounts"') ||
      text.includes('"unit_economics"') ||
      text.includes('"overallMoatScore"') ||
      text.includes('"customer_segments"') ||
      text.includes('"switchingCosts"')
    ) {
      pre.remove();
    }
  });

  const headings = container.querySelectorAll('h1, h2, h3, h4, h5, h6, p, strong, em');
  headings.forEach(h => {
    const text = (h.textContent || '').trim();
    if (
      text.includes('6-Pillar Quantitative Baseline') ||
      text.includes('Venture Discovery Diagnostic') ||
      text.includes('Pre-Calibration') ||
      text.includes('Initial 6-Pillar') ||
      text.includes('Calibrated 6-Pillar')
    ) {
      h.remove();
    }
  });
}

function renderLoadedAssistantMessage(msg, lastUserMsgText = '') {
  const row = createAssistantMessageElement();
  const proseEl = row.querySelector('.assistant-prose-text');
  const mcqMountEl = row.querySelector('.assistant-mcq-mount');
  const typingMountEl = row.querySelector('.assistant-typing-mount');
  const chartsContainer = row.querySelector('.assistant-charts-mount');

  // Remove typing indicator for loaded historical messages
  if (typingMountEl) typingMountEl.remove();

  const rawContent = msg.content || '';
  const mcqHtml = extractAndRenderMcq(rawContent);
  extractAndSyncPillars(rawContent, lastUserMsgText);

  const cleanContent = cleanVisibleAssistantText(rawContent);
  if (proseEl) {
    proseEl.innerHTML = marked.parse(cleanContent || '');
    sanitizeRenderedMessageContainer(proseEl);
  }

  if (mcqMountEl && mcqHtml) {
    mcqMountEl.innerHTML = mcqHtml;
  }

  if (msg.charts && msg.charts.length > 0) {
    chartsContainer.innerHTML = '';
    msg.charts.forEach(chart => {
      let chartHtml = '';
      if (chart.type === 'tam_chart') chartHtml = stratum.renderTamChart(chart);
      else if (chart.type === 'moat_matrix') chartHtml = stratum.renderMoatMatrix(chart);
      else if (chart.type === 'icp_breakdown') chartHtml = stratum.renderIcpBreakdown(chart);
      else if (chart.type === 'arr_margin') chartHtml = stratum.renderArrMarginCurve(chart);
      else if (chart.type === 'risk_triage') chartHtml = stratum.renderRiskTriage(chart);
      else if (chart.type === 'brand_lab') chartHtml = stratum.renderBrandLab(chart);
      else if (chart.type === 'sprint_milestones') chartHtml = stratum.renderExecutionSprint(chart);

      if (chartHtml) {
        const wrapper = document.createElement('div');
        wrapper.innerHTML = chartHtml;
        chartsContainer.appendChild(wrapper.firstElementChild);
      }
    });
  }

  chatMessages.appendChild(row);
}

function startNewChat() {
  currentChatId = null;
  currentChatTitle = null;
  currentChatIsPinned = false;
  currentChatMessages = [];
  conversationHistory = [];
  stratum.ventureState = {
    name: '',
    concept: '',
    industry: '',
    icp: '',
    acv: '',
    competitors: [],
    stage: '',
    isDiagnosed: false
  };

  // Reset and hide 6 pillars for the new session
  if (typeof OriginPillars !== 'undefined' && typeof OriginPillars.resetPillars === 'function') {
    OriginPillars.resetPillars();
  }

  chatMessages.innerHTML = '';
  if (emptyStateHero) {
    emptyStateHero.style.display = 'flex';
    chatMessages.appendChild(emptyStateHero);
  }
  updateVentureBadge('Venture Discovery');
  userInput.value = '';
  userInput.focus();
  autoResizeTextarea(userInput);
  renderChatsSidebar(userChatsList);
}

async function handleTogglePin(chatId, e) {
  if (e) e.stopPropagation();
  try {
    const resp = await fetch(`${API_BASE}/api/chats/${chatId}/pin`, { method: 'POST' });
    if (resp.ok) {
      if (currentChatId === chatId) {
        currentChatIsPinned = !currentChatIsPinned;
      }
      await loadUserChats();
      showToast('Pin status updated');
    }
  } catch (err) {
    console.error('Error toggling pin:', err);
  }
}

async function handleDeleteChat(chatId, e) {
  if (e) e.stopPropagation();
  if (!confirm('Delete this strategy conversation?')) return;
  try {
    const resp = await fetch(`${API_BASE}/api/chats/${chatId}`, { method: 'DELETE' });
    if (resp.ok) {
      if (currentChatId === chatId) {
        startNewChat();
      }
      await loadUserChats();
      showToast('Conversation deleted');
    }
  } catch (err) {
    console.error('Error deleting chat:', err);
  }
}

async function saveCurrentChatToServer() {
  if (!currentChatId) return;
  try {
    const pillarData = (typeof OriginPillars !== 'undefined' && typeof OriginPillars.hasGeneratedPillars === 'function' && OriginPillars.hasGeneratedPillars())
      ? OriginPillars.exportPillarData()
      : null;

    await fetch(`${API_BASE}/api/chats`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: currentChatId,
        title: currentChatTitle,
        isPinned: currentChatIsPinned,
        messages: currentChatMessages,
        pillarData: pillarData
      })
    });
    await loadUserChats();
  } catch (err) {
    console.error('Error saving chat:', err);
  }
}

// Setup video background autoplay & popover synchronization
function setupVideoAutoplay() {
  if (bgVideo) {
    bgVideo.addEventListener('play', updatePopoverVideoToggleState);
    bgVideo.addEventListener('pause', updatePopoverVideoToggleState);

    bgVideo.play().catch(err => {
      console.log('Video autoplay waiting for interaction:', err);
      const startVideo = () => {
        bgVideo.play();
        document.removeEventListener('click', startVideo);
      };
      document.addEventListener('click', startVideo);
    });
    updatePopoverVideoToggleState();
  }
}

// Update Model Header Label
function updateModelLabel() {
  if (!activeModelLabel) return;
  if (currentModel.includes('550b')) {
    activeModelLabel.textContent = 'Origin • Nemotron 550B';
  } else if (currentModel.includes('120b')) {
    activeModelLabel.textContent = 'Origin • Nemotron 120B';
  } else {
    activeModelLabel.textContent = 'Origin • Llama-3.2-11B';
  }
}

// Model Dropdown Switcher
function toggleModelDropdown() {
  const models = [
    { id: 'nvidia/nemotron-3-ultra-550b-a55b', name: 'NVIDIA Nemotron 3 Ultra 550B (Active)', note: '550B Massive Reasoning' },
    { id: 'nvidia/nemotron-3-super-120b-a12b', name: 'NVIDIA Nemotron 3 Super 120B', note: 'Fast & High Precision' },
    { id: 'meta/llama-3.2-11b-vision-instruct', name: 'Llama 3.2 11B Vision', note: 'Instant Low Latency' }
  ];

  const choice = prompt(`Select AI Model Engine:\n\n1. NVIDIA Nemotron 3 Ultra 550B (Current)\n2. NVIDIA Nemotron 3 Super 120B\n3. Llama 3.2 11B Vision\n\nEnter 1, 2, or 3:`, '1');

  if (choice === '1') currentModel = models[0].id;
  else if (choice === '2') currentModel = models[1].id;
  else if (choice === '3') currentModel = models[2].id;

  stratum.configure({ model: currentModel });
  updateModelLabel();
  showToast(`Active AI Model set to: ${currentModel}`);
}

// Sidebar Controls
function toggleSidebar() {
  sidebar.classList.toggle('collapsed');
  const mobileBackdrop = document.getElementById('sidebarMobileBackdrop');
  if (sidebar.classList.contains('collapsed')) {
    expandSidebarBtn.style.display = 'flex';
    if (mobileBackdrop) mobileBackdrop.classList.remove('active');
  } else {
    expandSidebarBtn.style.display = 'none';
    if (mobileBackdrop && window.innerWidth <= 768) {
      mobileBackdrop.classList.add('active');
    }
  }
}

// Update Active Venture Badge in Input Dock
function updateVentureBadge(text) {
  const badge = document.querySelector('.input-tools-left span.input-pill-btn span:last-child');
  if (badge) {
    badge.textContent = text;
  }
}

// Trigger Starter Prompt from Card
function triggerStarterPrompt(text) {
  userInput.value = text;
  submitUserMessage();
}

// Handle Keydown in Input
function handleInputKeydown(e) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    submitUserMessage();
  }
}

// Auto-resize Textarea
function autoResizeTextarea(el) {
  el.style.height = 'auto';
  el.style.height = Math.min(el.scrollHeight, 180) + 'px';
}

// Toggle Deep Agentic Thinking Mode
function toggleThinkingMode() {
  thinkingModeActive = !thinkingModeActive;
  thinkToggleBtn.classList.toggle('active', thinkingModeActive);
  showToast(`Agentic Thinking Mode: ${thinkingModeActive ? 'Enabled (Deep Chain-of-Thought)' : 'Fast Direct'}`);
}

// Setup Speech-to-Text Recognition
function setupSpeechRecognition() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    if (voiceBtn) voiceBtn.style.opacity = '0.4';
    return;
  }

  recognition = new SpeechRecognition();
  recognition.continuous = false;
  recognition.interimResults = true;
  recognition.lang = 'en-US';

  recognition.onstart = () => {
    isRecording = true;
    voiceBtn.style.color = '#ef4444';
    voiceBtn.classList.add('animate-pulse');
  };

  recognition.onresult = (event) => {
    const transcript = Array.from(event.results).map(r => r[0].transcript).join('');
    userInput.value = transcript;
    autoResizeTextarea(userInput);
  };

  recognition.onerror = (event) => {
    console.warn('Speech recognition error:', event.error);
    stopRecording();
  };

  recognition.onend = () => {
    stopRecording();
  };
}

function toggleVoiceInput() {
  if (!recognition) {
    alert('Speech recognition is not supported in this browser. Please use Chrome or Edge.');
    return;
  }
  if (isRecording) {
    recognition.stop();
  } else {
    recognition.start();
  }
}

function stopRecording() {
  isRecording = false;
  if (voiceBtn) {
    voiceBtn.style.color = '';
    voiceBtn.classList.remove('animate-pulse');
  }
}

// Main Submit Message Handler
async function submitUserMessage(overrideText = null) {
  const query = overrideText ? overrideText.trim() : userInput.value.trim();
  if (!query || isGenerating) return;

  userInput.value = '';
  autoResizeTextarea(userInput);
  isGenerating = true;
  sendBtn.disabled = true;

  if (emptyStateHero) {
    emptyStateHero.style.display = 'none';
  }

  // 1. Render User Message
  renderUserMessage(query);
  conversationHistory.push({ role: 'user', content: query });
  currentChatMessages.push({ role: 'user', content: query });

  if (!currentChatId) {
    currentChatId = 'chat_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6);
  }
  if (!currentChatTitle) {
    currentChatTitle = query.slice(0, 36) + (query.length > 36 ? '...' : '');
  }

  scrollToBottom();

  // 2. Render Assistant Skeleton
  const assistantMsgEl = createAssistantMessageElement();
  chatMessages.appendChild(assistantMsgEl);
  scrollToBottom(true);

  const contentContainer = assistantMsgEl.querySelector('.assistant-content-text');
  const proseEl = assistantMsgEl.querySelector('.assistant-prose-text');
  const mcqMountEl = assistantMsgEl.querySelector('.assistant-mcq-mount');
  const typingMountEl = assistantMsgEl.querySelector('.assistant-typing-mount');
  const typingTextEl = assistantMsgEl.querySelector('.typing-text');
  const chartsContainer = assistantMsgEl.querySelector('.assistant-charts-mount');

  let lastRenderedDisplayRaw = '';
  let mcqMounted = false;

  try {
    const startTime = performance.now();

    const response = await stratum.chat({
      messages: conversationHistory,
      thinking: thinkingModeActive,
      onReasoning: (reasoningChunk) => {
        // While reasoning is happening, show sleek typing indicator (no thinking accordion per user request)
        const currentRaw = contentContainer.getAttribute('data-raw') || '';
        if (!currentRaw) {
          if (typingMountEl) typingMountEl.style.display = 'flex';
          if (typingTextEl) typingTextEl.textContent = 'Origin is typing...';
          scrollToBottomStreaming();
        }
      },
      onToken: (token) => {
        const raw = (contentContainer.getAttribute('data-raw') || '') + token;
        contentContainer.setAttribute('data-raw', raw);
        const displayRaw = cleanVisibleAssistantText(raw);

        // Check if background content (MCQ JSON or pillars JSON) is currently streaming
        const isBackgroundActive = (
          raw.length > (displayRaw.length + 3) ||
          raw.includes('```') ||
          raw.includes('origin-mcq') ||
          raw.includes('origin-pillars') ||
          raw.includes('"title"') ||
          raw.includes('"questions"') ||
          raw.includes('"market_size"')
        );

        // 1. Update visible prose ONLY if displayRaw changed (eliminates DOM thrashing)
        if (displayRaw !== lastRenderedDisplayRaw) {
          lastRenderedDisplayRaw = displayRaw;
          if (displayRaw) {
            proseEl.innerHTML = marked.parse(displayRaw) + (isBackgroundActive ? '' : '<span class="origin-streaming-cursor"></span>');
            sanitizeRenderedMessageContainer(proseEl);
          } else {
            proseEl.innerHTML = '';
          }
        } else if (isBackgroundActive) {
          // If background became active, remove trailing cursor if present
          const cursor = proseEl.querySelector('.origin-streaming-cursor');
          if (cursor) cursor.remove();
        }

        // 2. Try parsing MCQ once if not already mounted (never re-render repeatedly!)
        if (!mcqMounted) {
          const mcqHtml = extractAndRenderMcq(raw);
          if (mcqHtml) {
            mcqMountEl.innerHTML = mcqHtml;
            mcqMounted = true;
          }
        }

        // 3. Update Typing Mount state stably (NO DOM rebuilding, no flickering!)
        if (mcqMounted) {
          // MCQ is visible! Are we still streaming pillars in the background?
          const isStillStreamingPillars = raw.includes('origin-pillars') || raw.includes('"market_size"') || (raw.length > displayRaw.length + 120);
          if (isStillStreamingPillars) {
            typingMountEl.style.display = 'flex';
            typingTextEl.textContent = 'Calibrating 6 Core Strategic Models in the background...';
            contentContainer.appendChild(typingMountEl);
          } else {
            typingMountEl.style.display = 'none';
          }
        } else if (isBackgroundActive && displayRaw) {
          // Visible prose finished, MCQ is streaming in background
          typingMountEl.style.display = 'flex';
          typingTextEl.textContent = 'Origin is typing diagnostic questions...';
          contentContainer.appendChild(typingMountEl);
        } else if (displayRaw) {
          // Actively streaming prose words
          typingMountEl.style.display = 'none';
        } else {
          // Initial wait
          typingMountEl.style.display = 'flex';
          typingTextEl.textContent = 'Origin is typing...';
        }

        scrollToBottomStreaming();
      }
    });

    // Update dynamic venture badge if discovered
    if (response.venture && response.venture.name) {
      updateVentureBadge(`${response.venture.name} • ${response.venture.industry || 'Strategy'}`);
    }

    // 1. Extract interactive MCQ card
    const mcqHtml = extractAndRenderMcq(response.content);

    // 2. Perform all 6-pillar calculations silently in the background
    const lastUserPrompt = conversationHistory.filter(m => m.role === 'user').pop()?.content || '';
    extractAndSyncPillars(response.content, lastUserPrompt);

    // Fail-safe: if this is a response to diagnostic submission, ensure pillars are active and visible
    if (!response.content.includes('origin-mcq') && lastUserPrompt.includes('verified venture diagnostic answers')) {
      if (typeof OriginPillars !== 'undefined' && !OriginPillars.hasGeneratedPillars()) {
        OriginPillars.syncPillarsFromAI({}, lastUserPrompt);
      }
    }

    // 3. Render clean, simplified text only (removes streaming indicators & cursor)
    const cleanContent = cleanVisibleAssistantText(response.content);
    proseEl.innerHTML = marked.parse(cleanContent || '');
    sanitizeRenderedMessageContainer(proseEl);

    // 4. Mount Interactive MCQ Questionnaire if not already mounted
    if (!mcqMounted && mcqHtml) {
      mcqMountEl.innerHTML = mcqHtml;
      mcqMounted = true;
    }

    // 5. Cleanly remove typing indicator on completion
    if (typingMountEl) {
      typingMountEl.remove();
    }
    sanitizeRenderedMessageContainer(contentContainer);

    // Render Interactive Charts ONLY if AI explicitly emitted them
    if (response.charts && response.charts.length > 0) {
      chartsContainer.innerHTML = '';
      response.charts.forEach(chart => {
        let chartHtml = '';
        if (chart.type === 'tam_chart') chartHtml = stratum.renderTamChart(chart);
        else if (chart.type === 'moat_matrix') chartHtml = stratum.renderMoatMatrix(chart);
        else if (chart.type === 'icp_breakdown') chartHtml = stratum.renderIcpBreakdown(chart);
        else if (chart.type === 'arr_margin') chartHtml = stratum.renderArrMarginCurve(chart);
        else if (chart.type === 'risk_triage') chartHtml = stratum.renderRiskTriage(chart);
        else if (chart.type === 'brand_lab') chartHtml = stratum.renderBrandLab(chart);
        else if (chart.type === 'sprint_milestones') chartHtml = stratum.renderExecutionSprint(chart);

        if (chartHtml) {
          const wrapper = document.createElement('div');
          wrapper.innerHTML = chartHtml;
          chartsContainer.appendChild(wrapper.firstElementChild);
        }
      });
    } else {
      chartsContainer.innerHTML = '';
    }

    conversationHistory.push({ role: 'assistant', content: response.content });
    currentChatMessages.push({
      role: 'assistant',
      content: response.content,
      thinking: response.thinking,
      charts: response.charts
    });

    // Auto-persist conversation to server database
    await saveCurrentChatToServer();

  } catch (err) {
    console.error('Error generating strategy response:', err);
    contentContainer.innerHTML = `<p style="color:#ef4444;">Origin Agent Error: ${err.message}.</p>`;
  } finally {
    isGenerating = false;
    sendBtn.disabled = false;
    scrollToBottom();
  }
}

// Render User Message HTML
function renderUserMessage(text) {
  const row = document.createElement('div');
  row.className = 'message-row user';
  row.innerHTML = `<div class="message-bubble">${escapeHtml(text)}</div>`;
  chatMessages.appendChild(row);
}

// Create Assistant Message Skeleton Element
function createAssistantMessageElement() {
  const row = document.createElement('div');
  row.className = 'message-row assistant';
  row.innerHTML = `
    <div class="message-avatar assistant">
      <img src="logo-icon.png" alt="Origin AI" class="avatar-logo-img" />
    </div>
    <div class="message-bubble">
      <!-- Main Assistant Content -->
      <div class="assistant-content-text" data-raw="">
        <!-- Dedicated Prose Container (only markdown prose streams here) -->
        <div class="assistant-prose-text"></div>

        <!-- Dedicated MCQ Mount (rendered exactly once, never repeatedly wiped out) -->
        <div class="assistant-mcq-mount"></div>

        <!-- Dedicated Persistent Typing Mount (dots animate continuously without resets) -->
        <div class="assistant-typing-mount">
          <div class="origin-typing-status">
            <div class="origin-typing-dots">
              <span></span><span></span><span></span>
            </div>
            <span class="typing-text">Origin is typing...</span>
          </div>
        </div>
      </div>

      <!-- Interactive Charts Mount -->
      <div class="assistant-charts-mount"></div>

      <!-- Action Toolbar -->
      <div class="message-actions-bar">
        <button class="msg-act-btn" onclick="copyMessageText(this)">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
          <span>Copy</span>
        </button>
        <button class="msg-act-btn" onclick="exportConversation()">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
          <span>Download Memo</span>
        </button>
        <button class="msg-act-btn" onclick="regenerateLastResponse()">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M23 4v6h-6"></path><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path></svg>
          <span>Regenerate</span>
        </button>
      </div>
    </div>
  `;
  return row;
}

// Toggle Thinking Accordion (kept for backwards compatibility)
function toggleThinkingAccordion(btn) {
  const steps = btn.nextElementSibling;
  const chevron = btn.querySelector('.chevron-icon');
  if (!steps) return;
  if (steps.style.display === 'none') {
    steps.style.display = 'flex';
    if (chevron) chevron.style.transform = 'rotate(0deg)';
  } else {
    steps.style.display = 'none';
    if (chevron) chevron.style.transform = 'rotate(-90deg)';
  }
}

// High-performance streaming scroll synchronization with requestAnimationFrame (prevents compositor jitter/flicker)
let scrollRafId = null;
function scrollToBottomStreaming() {
  if (scrollRafId) return;
  scrollRafId = requestAnimationFrame(() => {
    scrollRafId = null;
    if (!chatViewport) return;
    const threshold = 180;
    const isNearBottom = (chatViewport.scrollHeight - chatViewport.scrollTop - chatViewport.clientHeight) <= threshold;
    if (isNearBottom) {
      chatViewport.scrollTop = chatViewport.scrollHeight;
    }
  });
}

// Explicit scroll to bottom
function scrollToBottom(smooth = false) {
  if (!chatViewport) return;
  if (smooth) {
    chatViewport.scrollTo({
      top: chatViewport.scrollHeight,
      behavior: 'smooth'
    });
  } else {
    chatViewport.scrollTop = chatViewport.scrollHeight;
  }
}

// Copy message text
function copyMessageText(btn) {
  const bubble = btn.closest('.message-bubble');
  const proseEl = bubble.querySelector('.assistant-prose-text') || bubble.querySelector('.assistant-content-text');
  const text = proseEl ? proseEl.innerText : '';
  navigator.clipboard.writeText(text).then(() => {
    const originalText = btn.innerHTML;
    btn.innerHTML = `<span style="color:#10b981;">✓ Copied</span>`;
    setTimeout(() => { btn.innerHTML = originalText; }, 2000);
  });
}

// Regenerate last response
function regenerateLastResponse() {
  if (conversationHistory.length === 0) return;
  const lastUserMsg = conversationHistory.filter(m => m.role === 'user').pop();
  if (lastUserMsg) {
    userInput.value = lastUserMsg.content;
    submitUserMessage();
  }
}

// Export conversation as downloadable Markdown Investment Memo
function exportConversation() {
  const v = stratum.ventureState;
  let markdown = `# Origin Strategic Investment Memo & Venture Dossier\n`;
  markdown += `**Venture:** ${v.name || 'Venture'} (${v.stage || 'Seed Stage'})\n`;
  markdown += `**Industry / Domain:** ${v.industry || 'Technology'}\n`;
  markdown += `**Date:** ${new Date().toLocaleDateString()} | **Model Engine:** ${currentModel}\n`;
  markdown += `**Methodology:** Business Strategy Framework Research & Origin Venture Intelligence\n\n`;
  markdown += `---\n\n`;

  conversationHistory.forEach(msg => {
    if (msg.role === 'user') {
      markdown += `### Query / Objective:\n> ${msg.content}\n\n`;
    } else {
      markdown += `### Origin Strategic Analysis & 3-Pillar Triad:\n${msg.content}\n\n---\n\n`;
    }
  });

  const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `Origin_${(v.name || 'Venture').replace(/\s+/g, '_')}_Investment_Memo_${Date.now()}.md`;
  a.click();
  showToast('Investment Memo downloaded as Markdown!');
}

// Modals Handling
function openSdkModal() {
  document.getElementById('sdkModal').classList.add('open');
}
function closeSdkModal() {
  document.getElementById('sdkModal').classList.remove('open');
}

function openFrameworkModal() {
  document.getElementById('frameworkModal').classList.add('open');
}
function closeFrameworkModal() {
  document.getElementById('frameworkModal').classList.remove('open');
}

// Video Playback Controls from User Profile Popover
function updatePopoverVideoToggleState() {
  const icon = document.getElementById('popoverVideoIcon');
  const text = document.getElementById('popoverVideoText');
  if (!icon || !text) return;

  const isPaused = !bgVideo || bgVideo.paused;
  if (isPaused) {
    text.textContent = 'Unpause Video';
    icon.innerHTML = '<polygon points="5 3 19 12 5 21 5 3" fill="currentColor"></polygon>';
  } else {
    text.textContent = 'Pause Video';
    icon.innerHTML = '<rect x="6" y="4" width="4" height="16" fill="currentColor"></rect><rect x="14" y="4" width="4" height="16" fill="currentColor"></rect>';
  }
}

function toggleVideoPlaybackFromPopover() {
  if (!bgVideo) return;
  if (bgVideo.paused) {
    bgVideo.play().then(() => {
      updatePopoverVideoToggleState();
      showToast('Video unpaused');
    }).catch(err => {
      console.warn('Playback error:', err);
    });
  } else {
    bgVideo.pause();
    updatePopoverVideoToggleState();
    showToast('Video paused');
  }
}

function toggleVideoPlayback() {
  toggleVideoPlaybackFromPopover();
}

function toggleVideoAudio() {
  const btn = document.getElementById('muteBtn');
  bgVideo.muted = !bgVideo.muted;
  if (bgVideo.muted) {
    btn.innerHTML = '<span>Unmute Audio</span>';
    btn.classList.remove('active');
  } else {
    btn.innerHTML = '<span>Mute Audio</span>';
    btn.classList.add('active');
  }
}

function adjustScrimOpacity(val) {
  if (videoScrim) {
    videoScrim.style.background = `radial-gradient(circle at 50% 40%, rgba(10, 14, 22, ${val * 0.85}) 0%, rgba(8, 11, 16, ${val}) 60%, rgba(5, 7, 10, 0.98) 100%)`;
  }
}

// Data Attachment Menu
function openAttachMenu() {
  const options = `Attach Venture Context:\n1. Seed Financials & Cap Table\n2. Customer Discovery Interview Notes\n3. Competitor Pricing Tier CSV\n4. Custom Pitch Deck Text`;
  const choice = prompt(options, '1');
  if (choice === '1') {
    userInput.value = `[ATTACHMENT: Seed Financials - Target Raise $2M, Monthly Gross Burn $35k, Current Runway 14mo]\nEvaluate our cash runway and recommend the optimal go-to-market milestones.`;
    autoResizeTextarea(userInput);
  } else if (choice === '2') {
    userInput.value = `[ATTACHMENT: 20 Customer Discovery Interviews]\n16 out of 20 respondents identified manual spreadsheet reporting as their #1 operational bottleneck. Model our willingness-to-pay.`;
    autoResizeTextarea(userInput);
  }
}

// Search Prompt Filter
function openSearchPrompt() {
  const term = prompt('Search historical venture chats:');
  if (!term) return;
  showToast(`Found 3 sessions matching: "${term}"`);
}

function filterByTopic(topic) {
  showToast(`Filtering workspace by: ${topic}`);
}

function toggleVentureStage() {
  const v = stratum.ventureState;
  showToast(`Active Venture: ${v.name || 'New Venture'} (${v.stage || 'Seed Stage'})`);
}

// Toast notification helper
function showToast(msg) {
  const toast = document.createElement('div');
  toast.style.position = 'fixed';
  toast.style.bottom = '90px';
  toast.style.right = '24px';
  toast.style.background = '#1e2430';
  toast.style.border = '1px solid rgba(255,255,255,0.15)';
  toast.style.color = '#fff';
  toast.style.padding = '8px 14px';
  toast.style.borderRadius = '8px';
  toast.style.fontSize = '12px';
  toast.style.fontFamily = 'var(--font-mono)';
  toast.style.boxShadow = '0 10px 25px rgba(0,0,0,0.5)';
  toast.style.zIndex = '999';
  toast.style.opacity = '0';
  toast.style.transition = 'opacity 0.2s';
  toast.textContent = msg;

  document.body.appendChild(toast);
  setTimeout(() => { toast.style.opacity = '1'; }, 20);
  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 200);
  }, 3000);
}

// Utility: escape HTML
function escapeHtml(string) {
  return String(string).replace(/[&<>"'`=\/]/g, function (s) {
    return {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
      '/': '&#x2F;',
      '`': '&#x60;',
      '=': '&#x3D;'
    }[s];
  });
}

// Deepen Strategy on Current Pillar Action from Modal
window.askOriginToRefineCurrentPillar = function() {
  if (typeof OriginPillars === 'undefined') return;
  const pillarId = (typeof OriginPillars.getActiveModalPillarId === 'function') 
    ? (OriginPillars.getActiveModalPillarId() || 'market_size')
    : 'market_size';
  const p = OriginPillars.pillars[pillarId];
  if (!p) return;
  OriginPillars.closeModal();
  const query = `Please provide an institutional-grade deep-dive on our **${p.title}** pillar (${p.subtitle}). Audit our current numbers, pinpoint key sensitivity levers, identify competitive attack vectors, and formulate a high-leverage execution roadmap.`;
  triggerStarterPrompt(query);
};
