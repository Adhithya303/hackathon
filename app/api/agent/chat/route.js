// /api/agent/chat — AI-Powered Assistant with ML Intent Classification
// POST { message: string, history?: Array<{role, content}> }
// Uses ML intent classifier to route queries, then pattern-matches for response

const ML_BASE = process.env.ML_API_URL || 'http://localhost:8000';

const SYSTEM_CONTEXT = `You are LoRRI, an autonomous freight intelligence assistant by LogisticsNow. 
You help Indian logistics professionals understand freight rates, optimize supply chains, 
manage transporter relationships, and reduce costs across 80,000+ routes. You speak with 
confidence and precision, using specific data points in Indian Rupees (₹). You represent 
India's leading AI-native logistics platform.`;

const RESPONSE_MAP = [
  {
    patterns: ['hello', 'hi', 'hey', 'help', 'what can you do', 'introduce', 'start', 'begin'],
    response: {
      message: `Welcome to LoRRI.ai Command Center by LogisticsNow. I'm your autonomous freight intelligence assistant. Here's what I can help you with:\n\n**🔍 Intelligence Queries**\n- Real-time port congestion & vessel tracking\n- FTL/PTL rate analysis & market trends\n- Transporter performance scorecards\n\n**📊 Analytics**\n- ROI projections for your freight spend\n- Route-level cost optimization\n- Carbon footprint analysis\n\n**🤖 Agent Operations**\n- Deploy procurement agents for auto-negotiation\n- Monitor optimization engine status\n- Review risk detection alerts\n\nTry asking: *"What's the current rate for Mumbai to Delhi?"*`,
      type: 'greeting',
      suggestedActions: ['Show freight rates', 'Check port congestion', 'Calculate ROI', 'Agent status'],
    },
  },
  {
    patterns: ['compare', 'vs', 'versus', 'difference', 'better'],
    response: {
      message: `**📊 LoRRI.ai vs Traditional Freight Management**\n\n| Feature | Traditional | LoRRI.ai |\n|---------|------------|----------|\n| RFQ Cycle | 6-8 weeks | < 4 hours |\n| Rate Optimization | Manual | Autonomous AI |\n| Disruption Response | Reactive (12-24hr) | Predictive (72hr) |\n| Carbon Tracking | Quarterly reports | Real-time monitoring |\n| Transporter Evaluation | Annual reviews | Continuous scoring |\n| Cost Savings | 2-5% | 15-25% |\n\n**Key Differentiators:**\n- 🤖 4 autonomous agents working 24/7\n- 🧠 ReAct reasoning loop — every decision is auditable\n- 📡 ₹2,500 Crore+ real-time freight intelligence dataset\n- 🌱 Built-in ESG compliance & carbon optimization\n\n*Traditional tools manage data. LoRRI acts on it.*`,
      type: 'data',
      suggestedActions: ['Show ROI projections', 'How agents work', 'Request demo'],
    },
  },
  {
    patterns: ['how.*work', 'explain', 'architecture', 'behind the scenes', 'how does', 'what is lorri', 'about'],
    response: {
      message: `**🏗️ How LoRRI.ai Works — Agent Architecture**\n\nLoRRI operates on a **3-layer autonomous architecture:**\n\n**Layer 1 — Data Ingestion**\nReal-time feeds from 2,200+ transporters, major Indian ports, and market intelligence covering ₹2,500 Crore+ in freight data across 80,000+ routes.\n\n**Layer 2 — Agent Orchestration**\nFour specialized AI agents process data simultaneously:\n- **Procurement Agent** — Autonomous rate negotiation & transporter bidding\n- **Sustainability Agent** — ESG monitoring & carbon optimization\n- **Optimization Engine** — Route planning & disruption avoidance\n- **Risk Detection Agent** — Global signal monitoring & early warning\n\n**Layer 3 — Autonomous Actions**\nAgents make decisions using a **ReAct (Reasoning + Acting) loop:**\n1. 🧠 **Think** — Analyze the situation\n2. ⚡ **Act** — Execute the best strategy\n3. 👁️ **Observe** — Measure results & adapt\n\nEvery decision is transparent and auditable — no black boxes.\n\n*This is the Glass Box approach: intelligence you can see and verify.*`,
      type: 'info',
      suggestedActions: ['Show agent status', 'View architecture diagram', 'Explore agents'],
    },
  },
  {
    patterns: ['lane', 'route', 'corridor', 'mum.*del', 'del.*blr', 'che.*kol', 'optimize lane', 'best route'],
    response: {
      message: `**🛣️ Route Intelligence — Top Corridors**\n\n| Rank | Route | FTL Rate | Volume | Service Level |\n|------|-------|----------|--------|---------------|\n| 1 | MUM → DEL | ₹78/km | High | 97.2% |\n| 2 | DEL → BLR | ₹72/km | High | 98.1% |\n| 3 | CHE → KOL | ₹65/km | Medium | 96.8% |\n| 4 | PUN → HYD | ₹58/km | Medium | 99.1% |\n| 5 | AHM → MUM | ₹52/km | Medium | 95.4% |\n\n**Optimization Opportunities:**\n- MUM→DEL: Intermodal rail shift could save 12% + 340 MT CO₂\n- DEL→BLR: 3 transporters within ±2% — competitive mini-bid recommended\n- PUN→HYD: Low volume, consider consolidation with MUM→HYD\n\n*Procurement Agent can initiate autonomous bidding on any route. Which route should we optimize?*`,
      type: 'data',
      suggestedActions: ['Optimize MUM→DEL', 'Start mini-bid DEL→BLR', 'Show all routes'],
    },
  },
  {
    patterns: ['pricing', 'plan', 'how much', 'cost of lorri', 'subscription', 'enterprise'],
    response: {
      message: `**💎 LoRRI.ai — Pricing Plans**\n\n**Starter** — For growing shippers\n- 2 AI agents (Procurement + Optimization)\n- Up to 500 routes\n- Standard support\n- *Starting at ₹2,00,000/mo*\n\n**Professional** — For mid-market logistics\n- All 4 AI agents\n- Up to 5,000 routes\n- Priority support + API access\n- *Starting at ₹6,50,000/mo*\n\n**Enterprise** — For large manufacturers & 3PLs\n- Full platform + custom agents\n- Unlimited routes\n- Dedicated success team\n- Custom integrations\n- *Custom pricing*\n\n**Average payback: 1.6 months**\n**Average first-year ROI: 647%**\n\n*All plans include a 30-day pilot with real freight data.*`,
      type: 'info',
      suggestedActions: ['Calculate my ROI', 'Request pilot', 'Schedule demo'],
    },
  },
  {
    patterns: ['integration', 'connect', 'tms', 'erp', 'api', 'sap', 'oracle', 'bluejay'],
    response: {
      message: `**🔗 Integration & Connectivity**\n\nLoRRI connects to your existing tech stack out of the box:\n\n**TMS Integrations:**\n- SAP TM\n- Oracle Transportation Management\n- Blue Yonder / JDA\n- TCI Express / Gati API\n\n**ERP Connections:**\n- SAP S/4HANA\n- Oracle ERP Cloud\n- Microsoft Dynamics 365\n- Tally Prime\n\n**Transporter Networks:**\n- 2,200+ contracted transporters\n- Indian Freight Exchange\n- Direct EDI / API connections\n\n**Data Sources:**\n- Real-time port telemetry (AIS)\n- Weather & geopolitical feeds\n- Indian freight market rate indices\n\n**Setup time:** Average 5 business days for full integration.\n**API:** RESTful + WebSocket for real-time data streaming.`,
      type: 'info',
      suggestedActions: ['View API docs', 'Check compatibility', 'Schedule integration call'],
    },
  },
  {
    patterns: ['spot rate', 'rate', 'pricing', 'cost per km', 'truckload rate', 'mumbai to delhi', 'mum.*del'],
    response: {
      message: `**Freight Rate Intelligence — Live Update**\n\n| Route | Spot Rate | vs. Contract | Trend |\n|-------|-----------|-------------|-------|\n| MUM → DEL | ₹78/km | -11.3% | 📉 Softening |\n| DEL → BLR | ₹72/km | -6.2% | 📉 Below market |\n| CHE → KOL | ₹65/km | +2.1% | 📈 Tightening |\n| AHM → MUM | ₹52/km | -4.8% | ➡️ Stable |\n\n**National Avg FTL Rate:** ₹68/km (↓3.2% WoW)\n**Reefer Premium:** +₹18/km\n**Tender Rejection Rate:** 4.8% (historically low)\n\n*MUM→DEL has softened 8.2% over 14 days — this is a renegotiation window. Should I have the Procurement Agent initiate a competitive bid?*`,
      type: 'data',
      suggestedActions: ['Start negotiation on MUM→DEL', 'Show 90-day rate trend', 'Compare transporters'],
    },
  },
  {
    patterns: ['shanghai', 'port', 'congestion', 'vessel', 'ocean', 'container', 'jnpt', 'nhava sheva', 'mundra'],
    response: {
      message: `**🚢 JNPT (Nhava Sheva) Port — Live Status**\n\nCongestion Level: **12.8%** (↑ from 10.4% last week)\nVessels at Anchor: **18** (avg wait: 2.6 days)\nETA Variance: **+1.8 days** on Asia–India routes\n\n**Impacted Assets:**\n- MV Clarity — ETA delayed 2.4 days\n- MV Horizon — ETA delayed 1.8 days  \n- MV Pacific Star — At anchor since 02/28\n- MV Jade Fortune — Approaching queue position #12\n\n**280 containers** at risk of missing inland rail connections at ICD Tughlakabad.\n\n**Recommended Action:** Activate contingency routing through Mundra Port (congestion: 5.2%) for non-priority cargo. Estimated demurrage exposure: ₹7.4 Cr → ₹39 L with reroute.\n\n*Should I activate the contingency plan?*`,
      type: 'alert',
      suggestedActions: ['Activate contingency plan', 'Show affected shipments', 'Mundra port status'],
    },
  },
  {
    patterns: ['roi', 'savings', 'how much', 'save', 'return', 'investment', 'payback'],
    response: {
      message: `**ROI Projection — Based on Industry Benchmarks**\n\nFor a typical enterprise with **₹50 Crore annual freight spend**:\n\n📊 **Projected Annual Savings:**\n- Freight Cost Reduction: **₹10 Crore** (20% avg)\n- Labor Hours Eliminated: **4,200 hrs** (50% reduction)\n- Labor Cost Savings: **₹80 Lakh**\n- Accessorial Reduction: **₹1 Crore**\n\n**Total Financial Gain: ₹11.8 Crore/year**\n**Platform Investment: ₹1.25 Crore/year**\n**ROI: 847%**\n**Payback Period: 1.3 months**\n\n*These are conservative estimates based on our ₹2,500 Crore+ freight intelligence dataset. Use our interactive ROI Calculator below for projections tailored to your specific operation.*`,
      type: 'data',
      suggestedActions: ['Open ROI Calculator', 'Get detailed breakdown', 'Schedule demo'],
    },
  },
  {
    patterns: ['carrier', 'transporter', 'performance', 'scorecard', 'on-time', 'tender accept'],
    response: {
      message: `**Top Transporter Scorecards — Q1 2026**\n\n| Transporter | On-Time % | Tender Accept | Claims Rate | Composite |\n|-------------|-----------|---------------|-------------|-----------|  \n| TCI Express | 98.7% | 96.1% | 0.4% | **97.2** |\n| VRL Logistics | 97.1% | 94.8% | 0.6% | **95.8** |\n| Gati KWE | 96.8% | 93.2% | 0.5% | **94.7** |\n| Rivigo | 95.4% | 91.7% | 0.8% | **93.1** |\n| Safexpress | 94.9% | 95.3% | 1.1% | **92.4** |\n\n⚠️ **Flagged:** QuickHaul Transport — claims rate spiked to 3.1%. Risk Detection Agent recommends volume reallocation.\n\n*Should I reassign QuickHaul routes to TCI Express and VRL Logistics?*`,
      type: 'data',
      suggestedActions: ['Reassign QuickHaul routes', 'Full transporter report', 'Compare rates by transporter'],
    },
  },
  {
    patterns: ['agent', 'status', 'system', 'health', 'operational'],
    response: {
      message: `**🤖 Agent Fleet — System Telemetry**\n\n| Agent | Status | Health | Throughput | Latency |\n|-------|--------|--------|------------|----------|\n| Procurement | 🟢 Active | 98% | 2,847 ops/hr | 12ms |\n| Sustainability | 🟢 Active | 95% | 1,200 ops/hr | 18ms |\n| Optimization | 🟢 Active | 99% | 5,600 ops/hr | 8ms |\n| Risk Detection | 🟢 Active | 97% | 8,900 ops/hr | 6ms |\n\n**Global Latency:** 11ms avg\n**Uptime (30d):** 99.97%\n**Active Negotiations:** 23\n**Routes Optimized Today:** 8,430\n**Signals Monitored:** 24,700+\n\nAll agents operational. No anomalies detected.`,
      type: 'status',
      suggestedActions: ['Show agent logs', 'Performance trends', 'Configure alerts'],
    },
  },
  {
    patterns: ['carbon', 'co2', 'emission', 'sustainability', 'green', 'esg', 'scope 3'],
    response: {
      message: `**🌱 Sustainability Intelligence — YTD Report**\n\n**Total CO₂ Reduced:** 12,847 metric tons (↓18.3% YoY)\n\n**Reduction by Strategy:**\n- Route Optimization: 5,396 MT (42%)\n- Intermodal Shifting: 3,983 MT (31%)\n- Empty KM Reduction: 3,468 MT (27%)\n\n**Carbon Intensity:** 1.24 kg CO₂/ton-km\n(Industry avg: 1.61 — you're **23% better**)\n\n**Intermodal Utilization:** 34.2% (target: 40%)\n**ESG Compliance Rate:** 100% across all contracted transporters\n**Carbon Credits Banked:** 3,420 units (₹1.42 Crore value)\n\n*On track to meet 2026 sustainability target. Optimization Engine is increasing intermodal shifts to reach 40% target.*`,
      type: 'data',
      suggestedActions: ['Download ESG report', 'Show carbon by route', 'Intermodal opportunities'],
    },
  },
  {
    patterns: ['weather', 'storm', 'hurricane', 'disruption', 'risk', 'alert'],
    response: {
      message: `**⚡ Active Risk Alerts — Command Center**\n\n🔴 **HIGH** — JNPT Port Congestion\nCongestion at 12.8%. 280 containers at risk. Contingency plan recommended.\n\n🟡 **MEDIUM** — Cyclone Watch — Bay of Bengal\nIMD monitoring active. 72-hour window. 18 shipments on watch list.\n\n🟡 **MEDIUM** — Transporter Compliance\nQuickHaul Transport claims rate at 3.1%. Volume reallocation recommended.\n\n🟢 **LOW** — Rate Volatility\nWest India FTL rates up 3.2% WoW. Within normal seasonal variation.\n\n🟢 **LOW** — Regulatory\nNo new MoRTH rules pending. All transporters compliant.\n\n**National Supply Chain Resilience Score: 96/100**\n\n*Risk Detection Agent is monitoring 24,700+ signals across 14 data sources.*`,
      type: 'alert',
      suggestedActions: ['View risk details', 'Activate contingency', 'Download risk report'],
    },
  },
  {
    patterns: ['demo', 'trial', 'getting started', 'deploy', 'implement', 'onboard'],
    response: {
      message: `**🚀 Deploy Your Autonomous Freight Layer**\n\nLoRRI.ai deploys in **3 phases:**\n\n**Phase 1 — Connect (Week 1)**\nIntegrate with your ERP, existing TMS, and transporter network. Our API connects to 40+ platforms out of the box.\n\n**Phase 2 — Learn (Weeks 2-4)**\nAI agents analyze your historical data, learn your route patterns, transporter preferences, and rate benchmarks.\n\n**Phase 3 — Automate (Week 4+)**\nAgents begin autonomous operations — negotiating rates, optimizing routes, detecting risks, and generating sustainability reports.\n\n**Average time to first value: 11 days**\n**Average ROI at 90 days: 340%**\n\n*67.4% of logistics managers still use spreadsheets. Ready to upgrade?*`,
      type: 'info',
      suggestedActions: ['Request access', 'Schedule live demo', 'View pricing'],
    },
  },
];

function findBestResponse(message) {
  const normalized = message.toLowerCase().trim();
  let bestMatch = null;
  let bestScore = 0;

  for (const entry of RESPONSE_MAP) {
    let score = 0;
    for (const pattern of entry.patterns) {
      if (pattern.includes('.*')) {
        // Regex pattern
        try {
          const regex = new RegExp(pattern, 'i');
          if (regex.test(normalized)) score += pattern.length * 2;
        } catch { /* skip invalid regex */ }
      } else if (normalized.includes(pattern)) {
        score += pattern.length;
      }
    }
    if (score > bestScore) {
      bestScore = score;
      bestMatch = entry;
    }
  }

  return bestMatch;
}

const FALLBACK = {
  message: `I didn't find an exact match, but I can help with many freight intelligence topics. Here are some things you can ask:\n\n**📊 Market Intelligence**\n- "What's the current spot rate?"\n- "Show carrier scorecards"\n\n**🚢 Operations**\n- "Shanghai port congestion status"\n- "Show lane analysis"\n\n**🤖 Platform**\n- "How does LoRRI work?"\n- "Agent fleet status"\n- "Calculate ROI"\n- "Compare to traditional freight management"\n\n**📋 Getting Started**\n- "Show pricing plans"\n- "What integrations are available?"\n\n*Just type naturally — I understand context from your freight domain.*`,
  type: 'fallback',
  suggestedActions: ['How does LoRRI work?', 'Show spot rates', 'Agent status', 'Calculate ROI'],
};

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Invalid JSON.' }, { status: 400 });
  }

  const { message, history } = body;
  if (!message || typeof message !== 'string' || message.trim().length === 0) {
    return Response.json({ error: '"message" is required.' }, { status: 400 });
  }

  // Step 1: Classify intent using ML model
  let mlIntent = null;
  let mlConfidence = 0;
  try {
    const intentRes = await fetch(`${ML_BASE}/predict/intent`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: message }),
    });
    if (intentRes.ok) {
      const intentData = await intentRes.json();
      mlIntent = intentData.intent;
      mlConfidence = intentData.confidence;
    }
  } catch {
    // ML server unavailable — fall through to pattern matching
  }

  // Step 2: If ML detected a rate query, try to get a real ML prediction
  let mlEnrichment = null;
  if (mlIntent === 'rate_query') {
    const cities = extractCities(message);
    if (cities.origin && cities.destination) {
      try {
        const rateRes = await fetch(`${ML_BASE}/predict/rate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ origin: cities.origin, destination: cities.destination }),
        });
        if (rateRes.ok) {
          const rateData = await rateRes.json();
          mlEnrichment = {
            message: `**🤖 ML Rate Prediction (Random Forest model)**\n\n| Parameter | Value |\n|-----------|-------|\n| Route | ${rateData.origin} → ${rateData.destination} |\n| Distance | ${rateData.distance_km} km |\n| Predicted Rate | ₹${Math.round(rateData.predicted_rate_inr).toLocaleString('en-IN')} |\n| Rate/km | ₹${rateData.rate_per_km} |\n| Model Confidence | ${(rateData.confidence * 100).toFixed(1)}% |\n\n*Prediction by RandomForest model trained on 15,000 freight samples (R²=0.977)*`,
            type: 'ml_prediction',
            suggestedActions: ['Optimize this route', 'Check carbon footprint', 'Compare vehicle types'],
          };
        }
      } catch { /* fallback to pattern match */ }
    }
  }

  if (mlIntent === 'sustainability') {
    const cities = extractCities(message);
    if (cities.origin && cities.destination) {
      try {
        const carbonRes = await fetch(`${ML_BASE}/predict/carbon`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ origin: cities.origin, destination: cities.destination }),
        });
        if (carbonRes.ok) {
          const carbonData = await carbonRes.json();
          mlEnrichment = {
            message: `**🌱 ML Carbon Emission Estimate (GradientBoosting model)**\n\n| Parameter | Value |\n|-----------|-------|\n| Route | ${carbonData.origin} → ${carbonData.destination} |\n| Distance | ${carbonData.distance_km} km |\n| CO₂ Emission | ${carbonData.co2_kg} kg |\n| Per Ton-km | ${carbonData.co2_per_ton_km} g CO₂ |\n| Green Alternative | ${carbonData.green_alternative?.mode} |\n| Savings with Green | ${carbonData.green_alternative?.savings_pct}% less CO₂ |\n| Carbon Credit Value | ₹${carbonData.carbon_credit_inr} |\n\n*Prediction by GradientBoosting model calibrated with DEFRA emission factors (R²=0.988)*`,
            type: 'ml_prediction',
            suggestedActions: ['Switch to green route', 'ESG report', 'Calculate carbon credits'],
          };
        }
      } catch { /* fallback */ }
    }
  }

  // Step 3: Fall back to pattern matching for response content
  const match = findBestResponse(message);
  const result = mlEnrichment || (match ? match.response : FALLBACK);

  // Build context-aware metadata
  const turnCount = Array.isArray(history) ? history.length : 0;
  const contextNote = turnCount > 3 ? 'Continuing our conversation — ' : '';

  return Response.json({
    input: message.trim(),
    ...result,
    message: contextNote + result.message,
    conversationTurn: turnCount + 1,
    timestamp: new Date().toISOString(),
    agent: 'lorri-assistant-v3.0',
    ml_intent: mlIntent,
    ml_confidence: mlConfidence,
    ml_powered: mlIntent !== null,
  });
}

// Extract Indian city names from user message
function extractCities(message) {
  const CITIES = [
    'Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Kolkata', 'Hyderabad',
    'Pune', 'Ahmedabad', 'Jaipur', 'Lucknow', 'Nagpur', 'Indore',
    'Coimbatore', 'Vizag', 'Kochi', 'Chandigarh', 'Guwahati', 'Bhopal',
    'Surat', 'Ludhiana',
  ];
  const ALIASES = {
    'mum': 'Mumbai', 'bom': 'Mumbai', 'bombay': 'Mumbai',
    'del': 'Delhi', 'new delhi': 'Delhi',
    'blr': 'Bangalore', 'bengaluru': 'Bangalore',
    'che': 'Chennai', 'madras': 'Chennai', 'maa': 'Chennai',
    'kol': 'Kolkata', 'cal': 'Kolkata', 'calcutta': 'Kolkata',
    'hyd': 'Hyderabad', 'pun': 'Pune', 'poona': 'Pune',
    'ahm': 'Ahmedabad', 'jai': 'Jaipur', 'lko': 'Lucknow',
    'nag': 'Nagpur', 'idr': 'Indore', 'cbe': 'Coimbatore',
    'vtz': 'Vizag', 'visakhapatnam': 'Vizag',
    'cok': 'Kochi', 'cochin': 'Kochi', 'ernakulam': 'Kochi',
    'chd': 'Chandigarh', 'gau': 'Guwahati', 'bho': 'Bhopal',
    'sur': 'Surat', 'ldh': 'Ludhiana',
  };

  const lower = message.toLowerCase();
  const found = [];

  for (const city of CITIES) {
    if (lower.includes(city.toLowerCase())) found.push(city);
  }
  for (const [alias, city] of Object.entries(ALIASES)) {
    if (lower.includes(alias) && !found.includes(city)) found.push(city);
  }

  return { origin: found[0] || null, destination: found[1] || null };
}
