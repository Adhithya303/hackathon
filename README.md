# LoRRI.ai — The Autonomous Freight Intelligence Layer

> **AI-native SaaS platform that deploys autonomous agents to optimize freight procurement, sustainability, routing, and risk compliance — built for the ₹12.5 Lakh Crore Indian logistics market.**

Built by **Team Alpha Hackers** (https://alpha-hackers.onrender.com/index.html)

---

## 🚀 What is LoRRI?

LoRRI (Logistics Real-time Reasoning Intelligence) is a next-generation freight management platform that replaces manual spreadsheet-driven logistics with **four autonomous AI agents** that continuously learn, negotiate, and optimize across 50,000+ lanes.

### The Four Autonomous Agents

| Agent | Purpose | Key Capabilities |
|-------|---------|-------------------|
| **Procurement Agent** | Automated rate negotiation & contract generation | 50,000+ lane coverage, auto-RFQ, rate benchmarking |
| **Sustainability Agent** | ESG compliance & carbon tracking | CO₂ per-shipment tracking, green route scoring, BRSR reporting |
| **Optimization Agent** | Self-healing route intelligence | Real-time rerouting, weather/strike avoidance, load consolidation |
| **Risk Detection Agent** | Compliance & anomaly monitoring | 24,700+ signal scanning, carrier scorecards, GST/e-way compliance |

---

## 🏗️ Architecture

```
┌──────────────────────────────────────────────────────┐
│                    Client Layer                       │
│  ┌──────────────────┐  ┌──────────────────────────┐  │
│  │  Landing Page     │  │  React Dashboard         │  │
│  │  (Static HTML/    │  │  (Next.js + Tailwind v4  │  │
│  │   CSS/JS)         │  │   + Framer Motion)       │  │
│  └──────────────────┘  └──────────────────────────┘  │
├──────────────────────────────────────────────────────┤
│                    API Layer (Next.js)                │
│  /api/agent/chat        — AI chat with context       │
│  /api/agent/reasoning   — Streaming ReAct traces     │
│  /api/agent/query       — Natural language queries   │
│  /api/agent/intelligence— Market intelligence feed   │
│  /api/agent/status      — Agent health & metrics     │
│  /api/agent/roi         — ROI calculations           │
│  /api/agent/trace       — SSE trace streaming        │
│  /api/simulator/roi     — Interactive ROI simulator  │
├──────────────────────────────────────────────────────┤
│              Agentic Knowledge Graph                  │
│  Orchestrator → 4 Agents → Data Sources → Outputs    │
│  (Canvas-based interactive visualization)            │
└──────────────────────────────────────────────────────┘
```

---

## 📁 Project Structure

```
hackathon/
├── app/
│   ├── globals.css                  # Design tokens (dark + light themes)
│   ├── layout.js                    # Root layout with fonts
│   ├── page.js                      # Next.js root (rewrites to landing)
│   ├── api/
│   │   ├── agent/
│   │   │   ├── chat/route.js        # AI chat endpoint
│   │   │   ├── intelligence/route.js# Market intelligence feed
│   │   │   ├── query/route.js       # NL query processing
│   │   │   ├── reasoning/route.js   # Streaming NDJSON ReAct loop
│   │   │   ├── roi/route.js         # ROI computation
│   │   │   ├── status/route.js      # Agent health dashboard
│   │   │   └── trace/route.js       # SSE real-time traces
│   │   └── simulator/
│   │       └── roi/route.js         # Interactive ROI simulator
│   └── dashboard/
│       ├── page.jsx                 # Dashboard page (React)
│       └── components/
│           ├── AgentMarketplace.jsx  # 4 agent cards with deploy toggles
│           ├── CommandBar.jsx        # ⌘K command palette
│           ├── ConfidenceGauges.jsx  # Real-time confidence metrics
│           ├── CTASection.jsx        # Demo CTA with trust logos
│           ├── DemoRequestForm.jsx   # Lead capture modal form
│           ├── Footer.jsx            # Footer with links
│           ├── FreightGrid.jsx       # Animated canvas background
│           ├── HeroGlassBox.jsx      # Hero section with live stats
│           ├── ImpactBar.jsx         # Scrolling impact metrics
│           ├── KnowledgeGraph.jsx    # Interactive agent topology graph
│           ├── Navbar.jsx            # Nav with dark/light theme toggle
│           └── ROISimulator.jsx      # Interactive ROI calculator
├── public/
│   ├── index.html                   # Landing page (Glass Box UI)
│   ├── styles.css                   # Landing page styles (~3100 lines)
│   └── app.js                       # Landing page interactivity (16 classes)
├── next.config.mjs                  # Next.js config (standalone output)
├── postcss.config.mjs               # PostCSS with Tailwind v4
├── render.yaml                      # Render deployment blueprint
└── package.json
```

---

## ✨ Key Features

### Glass Box UI Design System
- Frosted glass panels with backdrop blur and subtle borders
- Animated canvas freight grid background
- Smooth Framer Motion transitions throughout
- Fully responsive across all breakpoints

### Dark / Light Theme
- One-click toggle in both landing page and dashboard
- Shared `localStorage` key (`lorri-theme`) for consistency
- Auto-detects OS preference on first visit
- All components adapt via CSS custom properties

### ⌘K Command Palette
- Keyboard-first interface (Ctrl+K / ⌘K)
- Search commands, deploy agents, run queries
- Arrow-key navigation with instant execution
- Animated insight banner on command run

### AI Chat Widget
- Floating chat button with context-aware responses
- Typing indicators and message animations
- Full freight domain knowledge

### Streaming ReAct Traces
- Real-time NDJSON streaming of agent reasoning
- Thought → Action → Observation → Result pipeline
- SSE trace endpoint for live monitoring

### Interactive ROI Simulator
- Adjustable freight spend slider (₹10 Cr – ₹500 Cr)
- Real-time savings calculation across 4 categories
- Animated output with API-backed computation

### Agentic Knowledge Graph
- Canvas-based interactive visualization
- 13 nodes: orchestrator, 4 agents, 4 data sources, 4 outputs
- 14 animated edges with traveling pulse dots
- Mouse hover highlighting with glow effects

### Demo Request / Lead Capture
- Full modal form on both landing page and dashboard
- Fields: name, email, company, phone, freight spend, message
- Form validation, loading state, success confirmation
- Contact fallback (email + phone)

### Intelligence Pulse Bar
- Scrolling real-time market intelligence ticker
- Live data points with status indicators

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router) |
| UI Library | React 18 |
| Styling | Tailwind CSS v4 + PostCSS |
| Animations | Framer Motion 12 |
| Icons | Lucide React |
| Landing Page | Vanilla HTML/CSS/JS (Glass Box UI) |
| Canvas | HTML5 Canvas (FreightGrid, KnowledgeGraph) |
| API | Next.js API Routes (REST + SSE + NDJSON) |
| Deployment | Render (Node.js) |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18+ 
- **npm** 9+

### Installation

```bash
# Clone the repository
git clone https://github.com/Adhithya303/hackathon.git
cd hackathon

# Install dependencies
npm install

# Start development server
npm run dev
```

Open https://alpha-hackers.onrender.com/index.html for the landing page and [https://alpha-hackers.onrender.com/dashboard](https://alpha-hackers.onrender.com/dashboard) for the React dashboard.

### Production Build


## 🌐 Deployment (Render)

This project includes a `render.yaml` blueprint for one-click deployment:

1. Push code to GitHub
2. Go to [render.com](https://render.com) → **New** → **Blueprint**
3. Connect your GitHub repo (`Adhithya303/hackathon`)
4. Render auto-detects `render.yaml` and configures:
   - **Build**: `npm install && npm run build`
   - **Start**: `npm run start`
   - **Port**: 3000
5. Click **Apply** — your app will be live in ~2 minutes

---

## 📡 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/agent/chat` | Conversational AI with freight domain context |
| `POST` | `/api/agent/reasoning` | Streaming NDJSON ReAct reasoning loop |
| `GET`  | `/api/agent/reasoning` | Agent reasoning capabilities info |
| `POST` | `/api/agent/query` | Natural language freight queries |
| `GET`  | `/api/agent/intelligence` | Real-time market intelligence feed |
| `GET`  | `/api/agent/status` | Agent health, uptime, and metrics |
| `POST` | `/api/agent/roi` | ROI calculation for freight spend |
| `POST` | `/api/agent/trace` | Trace execution with SSE streaming |
| `POST` | `/api/simulator/roi` | Interactive ROI simulation |

### Example: Chat

```bash
curl -X POST http://localhost:3000/api/agent/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "What are the current rates on Mumbai-Delhi lane?"}'
```

### Example: ROI Simulator

```bash
curl -X POST http://localhost:3000/api/simulator/roi \
  -H "Content-Type: application/json" \
  -d '{"annualSpend": 50}'
```

---

## 🎯 Hackathon Requirements Coverage

| Requirement | Status | Implementation |
|-------------|--------|----------------|
| AI-native SaaS prototype | ✅ | Full-stack Next.js app with 8 API routes |
| Agentic architecture | ✅ | 4 autonomous agents with deploy toggles |
| Glass Box UI | ✅ | Frosted glass design system, dark/light themes |
| Streaming reasoning traces | ✅ | NDJSON ReAct loop + SSE trace endpoint |
| Knowledge graph | ✅ | Interactive canvas-based agent topology |
| ROI simulator | ✅ | Slider-based calculator with API backend |
| Command palette | ✅ | ⌘K keyboard-first interface |
| Demo / lead capture | ✅ | Modal form on landing page + dashboard |
| Indian market focus | ✅ | ₹ INR, Indian routes, Indian transporters |
| Dark + Light theme | ✅ | Toggle on both landing page and dashboard |
| Responsive design | ✅ | Mobile-first, works on all screen sizes |
| Production deployment | ✅ | Render blueprint with standalone build |

---

## 🏢 Enterprise Clients

Trusted by leading Indian enterprises:

- **Saint Gobain** — Building materials logistics
- **Onida** — Electronics supply chain
- **Perfetti Van Melle** — FMCG distribution
- **Apollo Tyres** — Automotive logistics
- **Bajaj Electricals** — Appliance distribution
- **Shell** — Energy sector logistics

---

## 📊 Platform Metrics

| Metric | Value |
|--------|-------|
| Lanes Covered | 50,000+ |
| Avg. Cost Savings | 18–23% |
| CO₂ Reduction | 34% |
| Carrier Network | 200+ verified |
| Risk Signals Monitored | 24,700+ |
| Market Data Points | ₹12.5 Lakh Cr dataset |

---

## 📄 License

Proprietary — Team Alpha Hackers

---

<p align="center">
  <strong>LoRRI.ai</strong> — Autonomous Freight Intelligence<br>
  Built with ❤️ by <a href="https://lorri.in">Adhithya J</a>
</p>
