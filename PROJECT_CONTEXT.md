# Origin Venture Intelligence Platform — Complete Project Context & Architecture

> **Purpose of this document:** Provide a comprehensive, full-fidelity overview of the entire codebase, design decisions, features, and runtime architecture so that an AI assistant in a fresh chat can immediately understand and work with this project with zero missing context.

---

## 1. Project Overview & Identity
- **Project Name:** Origin
- **Core Value Proposition:** An institutional-grade Venture Capital AI platform and Startup Evaluator. It assesses venture hypotheses, market sizing, defensibility moats, customer segments, and financial payback curves using foundational strategic frameworks (Hamilton Helmer's 7 Powers, Michael Porter's Competitive Advantage, Clayton Christensen's Disruptive Innovation, etc.).
- **Primary AI Backbone:** NVIDIA NIM API utilizing **NVIDIA Nemotron-3 Ultra 550B** (primary reasoning model) with automatic fallback to **Nemotron-3 Super 120B** and **Llama-3.2-11B-Vision**.

---

## 2. Technology Stack & Key Guidelines
1. **Frontend Architecture:**
   - **HTML5:** Semantic, clean document structure in [`index.html`](file:///d:/stitch_venture_intelligence_platform/index.html).
   - **CSS3:** Pure Vanilla CSS in [`style.css`](file:///d:/stitch_venture_intelligence_platform/style.css). **Do NOT use TailwindCSS or CSS frameworks.** Full carbon black theme, custom CSS variables, glassmorphic filters, and hand-crafted medieval parchment textures.
   - **JavaScript:** Pure Vanilla ES6+ across modular files ([`app.js`](file:///d:/stitch_venture_intelligence_platform/app.js), [`origin-pillars.js`](file:///d:/stitch_venture_intelligence_platform/origin-pillars.js), [`stratum-sdk.js`](file:///d:/stitch_venture_intelligence_platform/stratum-sdk.js)). No React/Vue/Vite/bundlers needed.
2. **Backend Architecture:**
   - **Runtime:** Node.js (v18+) without heavy external dependencies.
   - **Server:** [`server.js`](file:///d:/stitch_venture_intelligence_platform/server.js) — pure Node HTTP server serving static files with HTTP 206 partial range streaming (for video scrubbing), proxying AI requests to NVIDIA NIM, and managing auth/chats.
   - **Database:** [`db.js`](file:///d:/stitch_venture_intelligence_platform/db.js) — robust JSON file-backed atomic database stored in `data/origin.json` (swaps `.tmp` files atomically to avoid corruption).
3. **Execution Command:**
   ```bash
   node server.js
   ```
   Listens on `http://localhost:3000` (port defined by `PORT` in `.env` or defaults to `3000`).

---

## 3. Core File Breakdown

### `server.js` (Backend API & Static Server)
- **Static File Serving:** Serves `.html`, `.css`, `.js`, `.json`, `.png`, `.svg`, and `.mp4` video. Handles HTTP `Range` headers (HTTP 206) for video seeking.
- **AI Streaming Proxy (`/api/chat`):**
  - Proxies requests to NVIDIA NIM API (`https://integrate.api.nvidia.com/v1/chat/completions`).
  - Implements Server-Sent Events (SSE) streaming with support for `<thought>` thinking blocks.
  - Injects the master **Origin System Prompt**, instructing the AI to act as a Tier-1 VC partner and format structured diagnostic questions and pillar payloads.
- **Authentication Routes:**
  - `GET /api/auth/me`: Verifies active session token via cookie.
  - `POST /api/auth/google`: Handles Google Identity Services ID token verification and creates user sessions in `db.js`.
  - `POST /api/auth/logout`: Clears session cookie and invalidates session.
- **Chat Persistence Routes:**
  - `GET /api/chats`: Retrieves user chat sessions (pinned & recents).
  - `POST /api/chats`: Saves or creates a chat session.
  - `GET /api/chats/:id`, `PUT /api/chats/:id`, `DELETE /api/chats/:id`: Manages individual chats (including title rename and pin/unpin).

### `index.html` (Application UI Structure)
- **Left Sidebar (`aside.sidebar`):**
  - Top header with Origin logo and "+ New Chat" button.
  - Navigation actions (Workspace, Search, Attach).
  - Pinned chats & Recent chats list (`#chatHistoryList`) with rename and delete options.
  - User profile tile at bottom (`#authContainer` / `#userProfileTile`) with user avatar, name, and three-dots icon.
  - User menu popover (`#userMenuPopover`): Contains user info, "Pause Video / Unpause Video" toggle button (`#popoverVideoToggleBtn`), and "Sign out" button.
  - *Note:* The previous "Atmosphere Settings" button and modal have been intentionally removed.
- **Main Chat Container (`main.main-chat-container`):**
  - **Chat Topbar:** Active model indicator (`#activeModelLabel`), framework research button, export investment memo button, and collapse sidebar toggle.
  - **Video Background Layer (`.video-canvas-layer`):** Contained strictly inside the chat section (to the right of the sidebar). Runs `<video id="bgVideo" src="/the-crown-of-thorns-moewalls-com.mp4">` with dark glass scrim (`#videoScrim`) and ambient grid overlay.
  - **6 Floating Business Strategy Blocks:**
    - Left Dock (`#floatingDockLeft`): Market Size, Customer Segments, Business Model.
    - Right Dock (`#floatingDockRight`): Unit Economics, USP & Moat, Branding & Positioning.
    - Hidden by default; only unlocked after diagnostic MCQ completion.
  - **Chat Area:**
    - Empty state hero (`#emptyStateHero`) with starter prompts.
    - Chat message stream (`#chatMessages`).
    - Input section (`#inputSection`): Carbon black typing area, slightly pulled down near chat, with attachment trigger, speech recognition mic button, and think mode toggle.
- **Modals:**
  - `sdkModal`: SDK reference and model parameters.
  - `frameworkModal`: Embedded strategic framework dossier (`code.html`).
  - `pillarDetailModal`: Detailed analytics modal matching the torn-paper parchment theme.

### `origin-pillars.js` (The 6 Core Business Pillars Engine)
- Manages the state, calculations, rendering, and interactions of the 6 pillars:
  1. **Market Size**: TAM, target accounts, ACV, CAGR, bottom-up sizing.
  2. **Customer Segments**: Enterprise / Mid-Market / SMB splits, primary ICP persona.
  3. **Business Model**: Subscription vs usage vs services revenue shares, monetization flywheel.
  4. **Unit Economics**: CAC, LTV, Payback months, Gross margin, Net retention.
  5. **USP & Defensibility Moat**: Hamilton Helmer's 7 Powers (Switching Costs, Counter-Positioning, Network Effects, Moat Score).
  6. **Branding & Positioning**: Health score, distinctiveness, brand archetype, positioning strategy.
- **Pillar Appearance Rules:**
  - The pillars are **hidden on initial load**.
  - When the AI generates an ```` ```origin-pillars ```` JSON code block (after the diagnostic questions are submitted or when venture analysis is complete), `origin-pillars.js` parses the data, populates metrics, and reveals the left and right docks with a smooth entrance animation.
- **Visual Design:**
  - Styled as authentic **medieval Roman torn-paper parchment cards** (`#f4edd9` background, rough deckled edges via SVG mask/pseudo-elements, vintage serif typography, wax seal-like badges, and subtle drop shadows).
  - Clicking any card opens `pillarDetailModal` which matches the parchment aesthetic with interactive sensitivity sliders, radar graphs, and an **"Ask Origin to Refine This Pillar"** action button.

### `style.css` (Design System & Theme)
- **Color Palette:** Carbon Black (`#08090b`, `#0e1015`, `#161922`, `#1a1d26`) across all major surfaces, with rich crimson (`#ef4444`) and indigo/purple accents.
- **Typography:**
  - Interface: `'Inter'`, sans-serif.
  - Strategic titles & Parchment: `'Cinzel'`, `'Playfair Display'`, serif.
  - Code & Metrics: `'JetBrains Mono'`, monospace.
- **Layout & Positioning:**
  - Sidebar width: `260px` (`--sidebar-width`).
  - Popover (`.user-menu-popover`): Positioned at `bottom: 60px; left: 12px; width: 236px;` perfectly above the user profile tile.
  - Responsive breakpoints for mobile/tablet sidebar collapsing.

### `app.js` (Client-Side Controller)
- **Chat Lifecycle:** Handles sending prompts, auto-resizing textareas, streaming markdown responses, rendering code blocks, and updating conversation history.
- **Interactive MCQ Diagnostic Parser:**
  - Looks for ```` ```origin-diagnostic ```` in AI output.
  - Renders interactive MCQ cards inside the chat bubble with selectable option chips and a "Submit Diagnostic Baseline" button.
  - Submitting sends an automated follow-up prompt to Origin, prompting the AI to unlock the 6 pillars.
- **Pillar Integration:**
  - Intercepts ```` ```origin-pillars ```` payload in responses.
  - Calls `OriginPillars.updateData(data)` to update and reveal the docks.
- **Video Controls from Profile Popover:**
  - Function `toggleVideoPlaybackFromPopover()` toggles `bgVideo.play()` and `bgVideo.pause()`.
  - Function `updatePopoverVideoToggleState()` updates button text between `"Pause Video"` (when playing) and `"Unpause Video"` (when paused) with corresponding SVG icons.
  - Syncs on `bgVideo` `play` and `pause` events and whenever the 3-dots profile menu is clicked.
- **Voice Recognition:** Web Speech API integration (`SpeechRecognition`) on the microphone button.
- **Investment Memo Export:** Downloads full structured conversation as a Markdown memo.

---

## 4. Environment Variables (`.env`)
```ini
PORT=3000
NVIDIA_API_KEY=nvapi-your-key-here
GOOGLE_CLIENT_ID=your-google-oauth-client-id.apps.googleusercontent.com
```

---

## 5. Recent Key Updates & User Preferences to Preserve
1. **Pillars Appearance:** Pillars must **NOT** appear when opening a new chat. They only appear **after** the AI fills in the data following the MCQ diagnostic phase.
2. **Pillars Aesthetic:** Must retain the medieval Roman torn-paper parchment vibe (`#f4edd9` cream color, deckled torn edges, matching theme inside detail modal).
3. **Background Video:**
   - Must remain strictly inside the main chat area (right of the sidebar).
   - "Atmosphere Settings" and the sidebar bottom button are permanently removed.
   - Profile popover (3-dots menu) contains **"Pause Video"** (switches to **"Unpause Video"** when paused).
4. **Theme:** Carbon black for dark parts (`#08090b` to `#111318`), avoiding washed-out grays. Subtle transparency on chat input container.
