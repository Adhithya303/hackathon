/* ============================================
   LoRRI.ai — The Autonomous Freight Layer
   Interactive Application Layer
   ============================================ */

(function () {
    'use strict';

    // ============================================
    // UTILITY: Page Visibility
    // ============================================
    let isPageVisible = true;
    document.addEventListener('visibilitychange', () => {
        isPageVisible = !document.hidden;
    });

    function throttle(fn, ms) {
        let last = 0;
        return function (...args) {
            const now = Date.now();
            if (now - last >= ms) {
                last = now;
                fn.apply(this, args);
            }
        };
    }

    // ============================================
    // 1. GLOBAL FREIGHT GRID — Animated Background
    // ============================================
    class FreightGrid {
        constructor(canvas) {
            this.canvas = canvas;
            this.ctx = canvas.getContext('2d');
            this.nodes = [];
            this.connections = [];
            this.mouse = { x: -1000, y: -1000 };
            this.nodeCount = 60;
            this.maxDist = 180;
            this.resize();
            this.init();
            this.bindEvents();
            this.animate();
        }

        resize() {
            this.canvas.width = window.innerWidth;
            this.canvas.height = window.innerHeight;
        }

        init() {
            this.nodes = [];
            for (let i = 0; i < this.nodeCount; i++) {
                this.nodes.push({
                    x: Math.random() * this.canvas.width,
                    y: Math.random() * this.canvas.height,
                    vx: (Math.random() - 0.5) * 0.3,
                    vy: (Math.random() - 0.5) * 0.3,
                    radius: Math.random() * 1.5 + 0.5,
                    pulse: Math.random() * Math.PI * 2,
                    type: Math.random() > 0.8 ? 'hub' : 'node'
                });
            }
        }

        bindEvents() {
            window.addEventListener('resize', throttle(() => {
                this.resize();
                this.init();
            }, 250));
            window.addEventListener('mousemove', throttle((e) => {
                this.mouse.x = e.clientX;
                this.mouse.y = e.clientY;
            }, 16));
        }

        animate() {
            if (!isPageVisible) {
                requestAnimationFrame(() => this.animate());
                return;
            }
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

            // Update & draw nodes
            for (const node of this.nodes) {
                node.x += node.vx;
                node.y += node.vy;
                node.pulse += 0.02;

                // Wrap around
                if (node.x < 0) node.x = this.canvas.width;
                if (node.x > this.canvas.width) node.x = 0;
                if (node.y < 0) node.y = this.canvas.height;
                if (node.y > this.canvas.height) node.y = 0;

                const pulseScale = 1 + Math.sin(node.pulse) * 0.3;
                const r = node.radius * pulseScale;

                if (node.type === 'hub') {
                    this.ctx.beginPath();
                    this.ctx.arc(node.x, node.y, r * 2, 0, Math.PI * 2);
                    this.ctx.fillStyle = 'rgba(0, 240, 255, 0.15)';
                    this.ctx.fill();
                }

                this.ctx.beginPath();
                this.ctx.arc(node.x, node.y, r, 0, Math.PI * 2);
                this.ctx.fillStyle = node.type === 'hub'
                    ? 'rgba(0, 240, 255, 0.6)'
                    : 'rgba(139, 92, 246, 0.3)';
                this.ctx.fill();
            }

            // Draw connections
            for (let i = 0; i < this.nodes.length; i++) {
                for (let j = i + 1; j < this.nodes.length; j++) {
                    const dx = this.nodes[i].x - this.nodes[j].x;
                    const dy = this.nodes[i].y - this.nodes[j].y;
                    const dist = Math.sqrt(dx * dx + dy * dy);

                    if (dist < this.maxDist) {
                        const alpha = (1 - dist / this.maxDist) * 0.12;
                        this.ctx.beginPath();
                        this.ctx.moveTo(this.nodes[i].x, this.nodes[i].y);
                        this.ctx.lineTo(this.nodes[j].x, this.nodes[j].y);
                        this.ctx.strokeStyle = `rgba(0, 240, 255, ${alpha})`;
                        this.ctx.lineWidth = 0.5;
                        this.ctx.stroke();
                    }
                }

                // Mouse interaction
                const dx = this.nodes[i].x - this.mouse.x;
                const dy = this.nodes[i].y - this.mouse.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 200) {
                    const alpha = (1 - dist / 200) * 0.2;
                    this.ctx.beginPath();
                    this.ctx.arc(this.nodes[i].x, this.nodes[i].y, this.nodes[i].radius * 3, 0, Math.PI * 2);
                    this.ctx.fillStyle = `rgba(0, 240, 255, ${alpha})`;
                    this.ctx.fill();
                }
            }

            requestAnimationFrame(() => this.animate());
        }
    }

    // ============================================
    // 2. LIVE AGENT SIMULATION — ReAct Cycle
    // ============================================
    class AgentSimulation {
        constructor() {
            this.goalEl = document.getElementById('goal-text');
            this.traceLog = document.getElementById('trace-log');
            this.metricLanes = document.getElementById('metric-lanes');
            this.metricCarriers = document.getElementById('metric-carriers');
            this.metricSavings = document.getElementById('metric-savings');
            this.metricCo2 = document.getElementById('metric-co2');

            this.scenarios = [
                {
                    goal: "Optimize Q3 Western India routes for 15% lower carbon footprint.",
                    traces: [
                        { tag: 'thought', content: 'Analyzing 47 transporter bids against ₹2,500Cr+ market dataset...' },
                        { tag: 'action', content: 'Querying Western India route pricing: MUM→DEL, PUN→AHM, AHM→BLR...' },
                        { tag: 'observation', content: 'Found 23 transporters with competitive rates; 8 meet ESG criteria.' },
                        { tag: 'thought', content: 'Cross-referencing Scope 3 emission data with route efficiency...' },
                        { tag: 'action', content: 'Negotiating with 3 autonomous Procurement Agent bots...' },
                        { tag: 'observation', content: 'Transporter A accepted 5.2% rate reduction; Transporter B counter-offered.' },
                        { tag: 'action', content: 'Triggering multimodal route optimization: rail + truck hybrid...' },
                        { tag: 'result', content: '5% rate alignment found; Scope 3 emission reduction of 12% identified.' },
                    ],
                    metrics: { lanes: 47, carriers: 23, savings: '5.2%', co2: '1,247 MT' }
                },
                {
                    goal: "Detect and reroute around JNPT port congestion before Q4 peak.",
                    traces: [
                        { tag: 'thought', content: 'Scanning Indian port telemetry for congestion signals...' },
                        { tag: 'observation', content: 'JNPT port vessel queue increased 340% vs. baseline.' },
                        { tag: 'thought', content: 'Evaluating alternative ports: Mundra, Chennai, Cochin...' },
                        { tag: 'action', content: 'Running cost-delay simulation across 12 alternative routes...' },
                        { tag: 'observation', content: 'Mundra route saves 4 days transit; +2.1% cost. Chennai: 3 days; +1.8%.' },
                        { tag: 'action', content: 'Pre-booking capacity at Mundra for routes to North India...' },
                        { tag: 'action', content: 'Alerting 6 affected shippers with reroute proposals...' },
                        { tag: 'result', content: 'Rerouted 38 shipments via Mundra; avoided 12-day delay. ₹2 Crore saved.' },
                    ],
                    metrics: { lanes: 156, carriers: 38, savings: '8.7%', co2: '892 MT' }
                },
                {
                    goal: "Reduce spot market exposure by 30% across South India FTL network.",
                    traces: [
                        { tag: 'thought', content: 'Analyzing spot vs. contract mix across 234 South India routes...' },
                        { tag: 'observation', content: 'Current mix: 42% spot, 58% contract. Target: 12% spot.' },
                        { tag: 'action', content: 'Initiating mini-bid RFQ for top 50 volume routes...' },
                        { tag: 'thought', content: 'Evaluating transporter performance scores: on-time %, tender acceptance...' },
                        { tag: 'action', content: 'Deploying dynamic routing to shift 67 routes to contracted transporters...' },
                        { tag: 'observation', content: '34 transporters submitted bids; 18 within ±3% of target rate.' },
                        { tag: 'action', content: 'Auto-awarding 22 lanes based on composite score algorithm...' },
                        { tag: 'result', content: 'Spot exposure reduced to 14%. Annual savings projection: ₹6.8 Crore.' },
                    ],
                    metrics: { lanes: 234, carriers: 34, savings: '11.3%', co2: '2,156 MT' }
                }
            ];

            this.currentScenario = 0;
            this.isRunning = false;
            this.start();
        }

        async start() {
            while (true) {
                await this.runScenario(this.scenarios[this.currentScenario]);
                this.currentScenario = (this.currentScenario + 1) % this.scenarios.length;
                await this.delay(2000);
            }
        }

        async runScenario(scenario) {
            // Clear previous
            this.traceLog.innerHTML = '';
            this.goalEl.textContent = '';

            // Reset metrics
            this.animateMetric(this.metricLanes, 0);
            this.animateMetric(this.metricCarriers, 0);
            this.metricSavings.textContent = '0%';
            this.metricCo2.textContent = '0 MT';

            // Type goal
            await this.typeText(this.goalEl, scenario.goal, 30);
            await this.delay(600);

            // Process traces
            for (const trace of scenario.traces) {
                await this.addTrace(trace);
                await this.delay(800 + Math.random() * 600);
            }

            // Animate final metrics
            this.animateCountUp(this.metricLanes, scenario.metrics.lanes, 1000);
            this.animateCountUp(this.metricCarriers, scenario.metrics.carriers, 800);
            await this.delay(200);
            this.metricSavings.textContent = scenario.metrics.savings;
            this.metricCo2.textContent = scenario.metrics.co2;

            await this.delay(4000);
        }

        async typeText(el, text, speed) {
            for (let i = 0; i < text.length; i++) {
                el.textContent = text.slice(0, i + 1);
                await this.delay(speed);
            }
        }

        async addTrace(trace) {
            const entry = document.createElement('div');
            entry.className = 'trace-entry';

            const tag = document.createElement('span');
            tag.className = `trace-tag ${trace.tag}`;
            tag.textContent = trace.tag.charAt(0).toUpperCase() + trace.tag.slice(1);

            const content = document.createElement('span');
            content.className = 'trace-content';
            content.textContent = trace.content;

            entry.appendChild(tag);
            entry.appendChild(content);
            this.traceLog.appendChild(entry);

            // Scroll to bottom
            this.traceLog.scrollTop = this.traceLog.scrollHeight;
        }

        animateCountUp(el, target, duration) {
            const start = parseInt(el.textContent) || 0;
            const startTime = Date.now();
            const step = () => {
                const elapsed = Date.now() - startTime;
                const progress = Math.min(elapsed / duration, 1);
                const eased = 1 - Math.pow(1 - progress, 3);
                el.textContent = Math.round(start + (target - start) * eased).toLocaleString();
                if (progress < 1) requestAnimationFrame(step);
            };
            requestAnimationFrame(step);
        }

        animateMetric(el, value) {
            el.textContent = value;
        }

        delay(ms) {
            return new Promise(r => setTimeout(r, ms));
        }
    }

    // ============================================
    // 3. DASHBOARD — Mini Map & Activity Feed
    // ============================================
    class Dashboard {
        constructor() {
            this.initClock();
            this.initActivityFeed();
            this.initDashMap();
            this.initSparklines();
            this.initTabs();
        }

        initClock() {
            const clockEl = document.getElementById('dash-clock');
            if (!clockEl) return;
            const update = () => {
                const now = new Date();
                clockEl.textContent = now.toISOString().slice(11, 19) + ' UTC';
            };
            update();
            setInterval(update, 1000);
        }

        initActivityFeed() {
            const feed = document.getElementById('activity-feed');
            if (!feed) return;

            const activities = [
                { agent: 'Procurement', msg: 'Awarded route DEL→BLR to TCI Express at ₹72/km', color: '#00F0FF' },
                { agent: 'Risk', msg: 'Weather alert: Cyclone risk Bay of Bengal — monitoring', color: '#F59E0B' },
                { agent: 'Optimization', msg: 'Rerouted 12 shipments via NH-48 corridor', color: '#8B5CF6' },
                { agent: 'Sustainability', msg: 'Scope 3 emissions down 8% this week', color: '#10B981' },
                { agent: 'Procurement', msg: 'Mini-bid completed: 34 transporters, 22 awards', color: '#00F0FF' },
                { agent: 'Risk', msg: 'JNPT congestion probability: 23% — watching', color: '#F59E0B' },
                { agent: 'Optimization', msg: 'Consolidation opportunity: 6 PTL→1 FTL, MUM hub', color: '#8B5CF6' },
                { agent: 'Sustainability', msg: 'Rail intermodal shift saved 847 MT CO₂ MTD', color: '#10B981' },
                { agent: 'Procurement', msg: 'Rate alert: West India flatbed rates ↑ 3.2%', color: '#00F0FF' },
                { agent: 'Risk', msg: 'Transporter B compliance score dropped below threshold', color: '#F59E0B' },
            ];

            let idx = 0;
            const addActivity = () => {
                const act = activities[idx % activities.length];
                const item = document.createElement('div');
                item.className = 'feed-item';

                const now = new Date();
                const time = now.toTimeString().slice(0, 5);

                item.innerHTML = `
                    <span class="feed-dot" style="background: ${act.color}; box-shadow: 0 0 6px ${act.color};"></span>
                    <span><strong style="color: ${act.color}">${act.agent}:</strong> ${act.msg}</span>
                    <span class="feed-time">${time}</span>
                `;

                feed.insertBefore(item, feed.firstChild);

                // Keep max 8 items
                while (feed.children.length > 8) {
                    feed.removeChild(feed.lastChild);
                }

                idx++;
            };

            // Initial feed
            for (let i = 0; i < 4; i++) { addActivity(); }
            setInterval(addActivity, 5000);
        }

        initDashMap() {
            const canvas = document.getElementById('dash-map-canvas');
            if (!canvas) return;

            const ctx = canvas.getContext('2d');
            const resize = () => {
                const rect = canvas.parentElement.getBoundingClientRect();
                canvas.width = Math.max(rect.width - 32, 100);
                canvas.height = Math.max(rect.height - 46, 120);
            };
            resize();
            window.addEventListener('resize', throttle(resize, 250));

            // Simplified world map points (major logistics hubs)
            const hubs = [
                { name: 'LAX', x: 0.12, y: 0.45 },
                { name: 'CHI', x: 0.22, y: 0.35 },
                { name: 'NYC', x: 0.28, y: 0.38 },
                { name: 'MIA', x: 0.25, y: 0.55 },
                { name: 'LON', x: 0.45, y: 0.3 },
                { name: 'AMS', x: 0.47, y: 0.28 },
                { name: 'DXB', x: 0.58, y: 0.48 },
                { name: 'SHA', x: 0.78, y: 0.4 },
                { name: 'SIN', x: 0.72, y: 0.6 },
                { name: 'TYO', x: 0.85, y: 0.38 },
                { name: 'SYD', x: 0.87, y: 0.75 },
                { name: 'SAO', x: 0.32, y: 0.7 },
            ];

            const routes = [
                [0, 7], [0, 9], [1, 4], [2, 5], [3, 11],
                [4, 6], [5, 6], [6, 7], [7, 8], [7, 9],
                [8, 10], [0, 1], [1, 2], [2, 3], [4, 5],
            ];

            // Active shipments
            const shipments = routes.map((route, i) => ({
                route,
                progress: Math.random(),
                speed: 0.001 + Math.random() * 0.002,
                color: ['#00F0FF', '#8B5CF6', '#10B981', '#F59E0B'][i % 4]
            }));

            const animate = () => {
                if (!isPageVisible) {
                    requestAnimationFrame(animate);
                    return;
                }
                ctx.clearRect(0, 0, canvas.width, canvas.height);

                // Draw routes
                for (const [a, b] of routes) {
                    const ax = hubs[a].x * canvas.width;
                    const ay = hubs[a].y * canvas.height;
                    const bx = hubs[b].x * canvas.width;
                    const by = hubs[b].y * canvas.height;

                    ctx.beginPath();
                    ctx.moveTo(ax, ay);

                    // Curved lines
                    const mx = (ax + bx) / 2;
                    const my = (ay + by) / 2 - 15;
                    ctx.quadraticCurveTo(mx, my, bx, by);
                    ctx.strokeStyle = 'rgba(255, 255, 255, 0.06)';
                    ctx.lineWidth = 1;
                    ctx.stroke();
                }

                // Draw shipments
                for (const ship of shipments) {
                    ship.progress += ship.speed;
                    if (ship.progress > 1) ship.progress = 0;

                    const [ai, bi] = ship.route;
                    const a = hubs[ai];
                    const b = hubs[bi];
                    const t = ship.progress;

                    // Quadratic bezier position
                    const ax = a.x * canvas.width, ay = a.y * canvas.height;
                    const bx = b.x * canvas.width, by = b.y * canvas.height;
                    const mx = (ax + bx) / 2, my = (ay + by) / 2 - 15;

                    const x = (1 - t) * (1 - t) * ax + 2 * (1 - t) * t * mx + t * t * bx;
                    const y = (1 - t) * (1 - t) * ay + 2 * (1 - t) * t * my + t * t * by;

                    // Glow
                    const gradient = ctx.createRadialGradient(x, y, 0, x, y, 8);
                    gradient.addColorStop(0, ship.color + '44');
                    gradient.addColorStop(1, ship.color + '00');
                    ctx.beginPath();
                    ctx.arc(x, y, 6, 0, Math.PI * 2);
                    ctx.fillStyle = gradient;
                    ctx.fill();

                    // Dot
                    ctx.beginPath();
                    ctx.arc(x, y, 2.5, 0, Math.PI * 2);
                    ctx.fillStyle = ship.color;
                    ctx.fill();
                }

                // Draw hubs
                for (const hub of hubs) {
                    const x = hub.x * canvas.width;
                    const y = hub.y * canvas.height;

                    ctx.beginPath();
                    ctx.arc(x, y, 3, 0, Math.PI * 2);
                    ctx.fillStyle = 'rgba(0, 240, 255, 0.5)';
                    ctx.fill();

                    ctx.beginPath();
                    ctx.arc(x, y, 1.5, 0, Math.PI * 2);
                    ctx.fillStyle = '#00F0FF';
                    ctx.fill();

                    ctx.font = '9px "JetBrains Mono", monospace';
                    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
                    ctx.fillText(hub.name, x + 6, y + 3);
                }

                requestAnimationFrame(animate);
            };

            animate();
        }

        initSparklines() {
            const sparkData = {
                'spark-shipments': [40, 45, 42, 48, 52, 50, 55, 58, 54, 60, 62, 58, 65, 68, 70],
                'spark-rate': [60, 58, 55, 52, 50, 48, 45, 47, 44, 42, 40, 38, 35, 34, 32],
                'spark-efficiency': [80, 82, 85, 83, 87, 88, 90, 89, 92, 93, 95, 94, 96, 97, 98],
                'spark-co2': [20, 25, 30, 28, 35, 40, 38, 45, 50, 48, 55, 60, 58, 65, 70],
            };

            const colors = {
                'spark-shipments': '#00F0FF',
                'spark-rate': '#00F0FF',
                'spark-efficiency': '#8B5CF6',
                'spark-co2': '#10B981',
            };

            for (const [id, data] of Object.entries(sparkData)) {
                const container = document.getElementById(id);
                if (!container) continue;

                const canvas = document.createElement('canvas');
                container.appendChild(canvas);

                const ctx = canvas.getContext('2d');
                const rect = container.getBoundingClientRect();
                canvas.width = rect.width || 100;
                canvas.height = rect.height || 24;

                const max = Math.max(...data);
                const min = Math.min(...data);
                const range = max - min || 1;
                const w = canvas.width / (data.length - 1);
                const color = colors[id];

                ctx.beginPath();
                data.forEach((v, i) => {
                    const x = i * w;
                    const y = canvas.height - ((v - min) / range) * (canvas.height - 4) - 2;
                    if (i === 0) ctx.moveTo(x, y);
                    else ctx.lineTo(x, y);
                });
                ctx.strokeStyle = color;
                ctx.lineWidth = 1.5;
                ctx.stroke();

                // Fill
                ctx.lineTo(canvas.width, canvas.height);
                ctx.lineTo(0, canvas.height);
                ctx.closePath();
                const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
                grad.addColorStop(0, color + '20');
                grad.addColorStop(1, 'transparent');
                ctx.fillStyle = grad;
                ctx.fill();
            }
        }

        initTabs() {
            const tabs = document.querySelectorAll('.dash-tab');
            tabs.forEach(tab => {
                tab.addEventListener('click', () => {
                    tabs.forEach(t => t.classList.remove('active'));
                    tab.classList.add('active');
                });
            });
        }
    }

    // ============================================
    // 4. ROI CALCULATOR
    // ============================================
    class ROICalculator {
        constructor() {
            this.spendSlider = document.getElementById('roi-spend');
            this.lanesSlider = document.getElementById('roi-lanes');
            this.rfqSlider = document.getElementById('roi-rfq');
            this.teamSlider = document.getElementById('roi-team');

            this.spendVal = document.getElementById('roi-spend-val');
            this.lanesVal = document.getElementById('roi-lanes-val');
            this.rfqVal = document.getElementById('roi-rfq-val');
            this.teamVal = document.getElementById('roi-team-val');

            this.costSavingsEl = document.getElementById('roi-cost-savings');
            this.timeSavedEl = document.getElementById('roi-time-saved');
            this.co2SavedEl = document.getElementById('roi-co2-saved');
            this.efficiencyEl = document.getElementById('roi-efficiency');
            this.totalEl = document.getElementById('roi-total');
            this.paybackEl = document.getElementById('roi-payback');

            this.agentToggles = document.querySelectorAll('.agent-toggle input');

            if (!this.spendSlider) return;

            this.sliders = [this.spendSlider, this.lanesSlider, this.rfqSlider, this.teamSlider];
            this.bindEvents();
            this.calculate();
            this.updateSliderFills();
        }

        bindEvents() {
            this.sliders.forEach(slider => {
                if (slider) {
                    slider.addEventListener('input', () => {
                        this.calculate();
                        this.updateSliderFills();
                    });
                }
            });

            this.agentToggles.forEach(toggle => {
                toggle.addEventListener('change', (e) => {
                    e.target.closest('.agent-toggle').classList.toggle('active', e.target.checked);
                    this.calculate();
                });
            });
        }

        calculate() {
            const spend = parseInt(this.spendSlider.value);
            const lanes = parseInt(this.lanesSlider.value);
            const rfq = parseInt(this.rfqSlider.value);
            const team = parseInt(this.teamSlider.value);

            // Display input values
            this.spendVal.textContent = this.formatCurrency(spend);
            this.lanesVal.textContent = lanes.toLocaleString();
            this.rfqVal.textContent = rfq;
            this.teamVal.textContent = team;

            // Check which agents are active
            const agents = {};
            this.agentToggles.forEach(t => {
                agents[t.dataset.agent] = t.checked;
            });

            // Calculate savings
            let costSavingsRate = 0;
            let timeSavedHours = 0;
            let co2Reduction = 0;
            let efficiencyGain = 0;

            if (agents.procurement) {
                costSavingsRate += 0.08; // 8% cost reduction
                timeSavedHours += rfq * lanes * 0.5; // hours saved per RFQ cycle
                efficiencyGain += 25;
            }

            if (agents.sustainability) {
                co2Reduction += spend * 0.00001 * lanes * 0.01; // MT CO₂
                costSavingsRate += 0.02; // fuel savings
                efficiencyGain += 10;
            }

            if (agents.optimization) {
                costSavingsRate += 0.05; // routing optimization
                timeSavedHours += team * 160; // hours/year saved
                co2Reduction += spend * 0.000005 * lanes * 0.005;
                efficiencyGain += 20;
            }

            if (agents.risk) {
                costSavingsRate += 0.03; // risk avoidance
                timeSavedHours += team * 40;
                efficiencyGain += 15;
            }

            const costSavings = Math.round(spend * costSavingsRate);
            const co2 = Math.round(co2Reduction);
            const platformCost = 4000000 + lanes * 1600; // Estimated platform cost in INR
            const roi = costSavings > 0 ? (costSavings / platformCost).toFixed(1) : 0;
            const payback = costSavings > 0 ? Math.max(1, Math.round(platformCost / (costSavings / 12))) : 0;

            // Update display with animation
            this.animateValue(this.costSavingsEl, this.formatCurrencyFull(costSavings));
            this.animateValue(this.timeSavedEl, timeSavedHours.toLocaleString() + ' hrs');
            this.animateValue(this.co2SavedEl, co2.toLocaleString() + ' MT');
            this.animateValue(this.efficiencyEl, Math.min(efficiencyGain, 70) + '%');
            this.animateValue(this.totalEl, roi + 'x');
            this.paybackEl.textContent = `Payback period: ${payback} month${payback !== 1 ? 's' : ''}`;
        }

        formatCurrency(value) {
            if (value >= 1e9) return '₹' + (value / 1e7 / 100).toFixed(0) + 'Cr';
            if (value >= 1e7) return '₹' + (value / 1e7).toFixed(0) + 'Cr';
            if (value >= 1e5) return '₹' + (value / 1e5).toFixed(0) + 'L';
            return '₹' + value.toLocaleString('en-IN');
        }

        formatCurrencyFull(value) {
            if (value >= 1e7) return '₹' + (value / 1e7).toFixed(1) + ' Cr';
            if (value >= 1e5) return '₹' + (value / 1e5).toFixed(1) + ' L';
            return '₹' + value.toLocaleString('en-IN');
        }

        animateValue(el, newValue) {
            // Quick crossfade animation
            if (el.textContent === newValue) return;
            el.style.transition = 'opacity 0.15s ease';
            el.style.opacity = '0';
            setTimeout(() => {
                el.textContent = newValue;
                el.style.opacity = '1';
            }, 150);
        }

        updateSliderFills() {
            this.sliders.forEach(slider => {
                if (!slider) return;
                slider.classList.add('has-fill');
                const pct = ((slider.value - slider.min) / (slider.max - slider.min)) * 100;
                slider.style.setProperty('--fill-pct', pct + '%');
            });
        }
    }

    // ============================================
    // 5. AGENT TRACE TICKER
    // ============================================
    class AgentTicker {
        constructor() {
            this.tickers = {
                procurement: {
                    el: document.getElementById('procurement-trace'),
                    messages: [
                        'Evaluating 47 transporter bids...',
                        'Rate comparison: ₹72 vs market ₹78/km',
                        'Auto-awarding DEL→BLR to TCI Express',
                        'Mini-bid cycle completed: 22 awards',
                        'Tender acceptance rate: 94.2%',
                        'Rolling negotiation active: 6 routes',
                    ]
                },
                sustainability: {
                    el: document.getElementById('sustainability-trace'),
                    messages: [
                        'Optimizing Scope 3 emissions...',
                        'Rail intermodal shift: -847 MT CO₂',
                        'Route efficiency score: 94.7%',
                        'ESG report generation: Q3 complete',
                        'Fuel consumption ↓ 10.3% vs baseline',
                        'Carbon credit calculation: 1,247 units',
                    ]
                },
                optimization: {
                    el: document.getElementById('optimization-trace'),
                    messages: [
                        'Scanning port congestion data...',
                        'NH-48 corridor: optimal, ETA on-track',
                        'Rerouting 12 shipments: monsoon avoidance',
                        'Load consolidation opportunity detected',
                        'Self-healing reroute: MUM→DEL +2hr ETA',
                        'Disruption alert: 72hr advance — clear',
                    ]
                },
                risk: {
                    el: document.getElementById('risk-trace'),
                    messages: [
                        'Monitoring geopolitical signals...',
                        'Cyclone forecast: Bay of Bengal — LOW',
                        'Transporter B compliance: flagged for review',
                        'Port congestion probability: 12% declining',
                        'Economic indicator scan: stable',
                        'Supply chain resilience score: 96/100',
                    ]
                }
            };

            this.indices = { procurement: 0, sustainability: 0, optimization: 0, risk: 0 };
            this.start();
        }

        start() {
            const agents = Object.keys(this.tickers);
            agents.forEach((agent, i) => {
                setInterval(() => {
                    const ticker = this.tickers[agent];
                    if (!ticker.el) return;
                    this.indices[agent] = (this.indices[agent] + 1) % ticker.messages.length;
                    ticker.el.style.opacity = '0';
                    setTimeout(() => {
                        ticker.el.textContent = ticker.messages[this.indices[agent]];
                        ticker.el.style.opacity = '1';
                    }, 200);
                }, 3000 + i * 700); // Staggered
            });
        }
    }

    // ============================================
    // 6. SCROLL EFFECTS
    // ============================================
    class ScrollEffects {
        constructor() {
            this.initNavScroll();
            this.initAOS();
            this.initStatCountUp();
        }

        initNavScroll() {
            const nav = document.getElementById('nav');
            if (!nav) return;
            window.addEventListener('scroll', () => {
                nav.classList.toggle('scrolled', window.scrollY > 50);
            });
        }

        initAOS() {
            const elements = document.querySelectorAll('[data-aos]');
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const delay = entry.target.dataset.aosDelay || 0;
                        setTimeout(() => {
                            entry.target.classList.add('visible');
                        }, parseInt(delay));
                    }
                });
            }, { threshold: 0.1 });

            elements.forEach(el => observer.observe(el));
        }

        initStatCountUp() {
            const statNumbers = document.querySelectorAll('.stat-number[data-target]');
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        this.countUp(entry.target);
                        observer.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.5 });

            statNumbers.forEach(el => observer.observe(el));
        }

        countUp(el) {
            const target = parseInt(el.dataset.target);
            const duration = 2000;
            const start = Date.now();

            const step = () => {
                const elapsed = Date.now() - start;
                const progress = Math.min(elapsed / duration, 1);
                const eased = 1 - Math.pow(1 - progress, 4);
                const current = Math.round(target * eased);
                el.textContent = current.toLocaleString();
                if (progress < 1) requestAnimationFrame(step);
            };

            requestAnimationFrame(step);
        }
    }

    // ============================================
    // 7. MOBILE NAV
    // ============================================
    class MobileNav {
        constructor() {
            const toggle = document.getElementById('mobile-toggle');
            const nav = document.querySelector('.nav-links');
            if (!toggle || !nav) return;

            toggle.addEventListener('click', () => {
                nav.classList.toggle('mobile-open');
                toggle.classList.toggle('active');
            });

            // Close mobile nav when a link is clicked
            nav.querySelectorAll('.nav-link').forEach(link => {
                link.addEventListener('click', () => {
                    nav.classList.remove('mobile-open');
                    toggle.classList.remove('active');
                });
            });

            // Close on outside click
            document.addEventListener('click', (e) => {
                if (!nav.contains(e.target) && !toggle.contains(e.target)) {
                    nav.classList.remove('mobile-open');
                    toggle.classList.remove('active');
                }
            });
        }
    }

    // ============================================
    // 8. SMOOTH SCROLL
    // ============================================
    class SmoothScroll {
        constructor() {
            document.querySelectorAll('a[href^="#"]').forEach(anchor => {
                anchor.addEventListener('click', (e) => {
                    const href = anchor.getAttribute('href');
                    if (href === '#') return; // Skip bare # links
                    e.preventDefault();
                    const target = document.querySelector(href);
                    if (target) {
                        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }
                });
            });
        }
    }

    // ============================================
    // 9. CMD+K COMMAND PALETTE
    // ============================================
    class CommandPalette {
        constructor() {
            this.overlay = document.getElementById('cmdk-overlay');
            this.input = document.getElementById('cmdk-input');
            this.body = document.getElementById('cmdk-body');
            this.trigger = document.getElementById('cmd-k-trigger');
            if (!this.overlay || !this.input) return;

            this.activeIndex = -1;
            this.items = [];
            this.bindEvents();
        }

        bindEvents() {
            // Cmd+K / Ctrl+K shortcut
            document.addEventListener('keydown', (e) => {
                if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                    e.preventDefault();
                    this.open();
                }
                if (e.key === 'Escape' && this.isOpen()) {
                    this.close();
                }
            });

            // Trigger button
            if (this.trigger) {
                this.trigger.addEventListener('click', () => this.open());
            }

            // Overlay click to close
            this.overlay.addEventListener('click', (e) => {
                if (e.target === this.overlay) this.close();
            });

            // Input handling
            this.input.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    const query = this.input.value.trim();
                    if (query) this.executeQuery(query);
                    else if (this.activeIndex >= 0 && this.items[this.activeIndex]) {
                        const q = this.items[this.activeIndex].dataset.query;
                        if (q) this.executeQuery(q);
                    }
                }
                if (e.key === 'ArrowDown') {
                    e.preventDefault();
                    this.navigate(1);
                }
                if (e.key === 'ArrowUp') {
                    e.preventDefault();
                    this.navigate(-1);
                }
            });

            // Suggestion items
            this.body.addEventListener('click', (e) => {
                const item = e.target.closest('.cmdk-item');
                if (item && item.dataset.query) {
                    this.executeQuery(item.dataset.query);
                }
                const related = e.target.closest('.cmdk-related-item');
                if (related) {
                    this.input.value = related.textContent;
                    this.executeQuery(related.textContent);
                }
            });
        }

        isOpen() { return this.overlay.classList.contains('open'); }

        open() {
            this.overlay.classList.add('open');
            this.input.value = '';
            this.input.focus();
            this.resetBody();
            document.body.style.overflow = 'hidden';
        }

        close() {
            this.overlay.classList.remove('open');
            document.body.style.overflow = '';
        }

        resetBody() {
            // Restore default suggestions
            const defaultHTML = `
                <div class="cmdk-section">
                    <div class="cmdk-section-label">SUGGESTED QUERIES</div>
                    <button class="cmdk-item" data-query="Shanghai port congestion status">
                        <span class="cmdk-item-icon">🚢</span>
                        <span class="cmdk-item-text">Shanghai port congestion status</span>
                        <span class="cmdk-item-tag">Port Intel</span>
                    </button>
                    <button class="cmdk-item" data-query="Current spot rates">
                        <span class="cmdk-item-icon">📊</span>
                        <span class="cmdk-item-text">Current spot rate analysis</span>
                        <span class="cmdk-item-tag">Rates</span>
                    </button>
                    <button class="cmdk-item" data-query="carrier performance scorecard">
                        <span class="cmdk-item-icon">🏆</span>
                        <span class="cmdk-item-text">Transporter performance scorecards</span>
                        <span class="cmdk-item-tag">Transporters</span>
                    </button>
                    <button class="cmdk-item" data-query="agent status system health">
                        <span class="cmdk-item-icon">🤖</span>
                        <span class="cmdk-item-text">Agent fleet system health</span>
                        <span class="cmdk-item-tag">Agents</span>
                    </button>
                    <button class="cmdk-item" data-query="carbon emissions sustainability">
                        <span class="cmdk-item-icon">🌱</span>
                        <span class="cmdk-item-text">Sustainability & carbon report</span>
                        <span class="cmdk-item-tag">ESG</span>
                    </button>
                    <button class="cmdk-item" data-query="risk alerts disruption">
                        <span class="cmdk-item-icon">⚡</span>
                        <span class="cmdk-item-text">Active risk alerts & disruptions</span>
                        <span class="cmdk-item-tag">Risk</span>
                    </button>
                </div>`;
            this.body.innerHTML = defaultHTML;
            this.items = Array.from(this.body.querySelectorAll('.cmdk-item'));
            this.activeIndex = -1;
        }

        navigate(dir) {
            this.items = Array.from(this.body.querySelectorAll('.cmdk-item'));
            if (!this.items.length) return;
            this.items.forEach(i => i.classList.remove('active'));
            this.activeIndex += dir;
            if (this.activeIndex < 0) this.activeIndex = this.items.length - 1;
            if (this.activeIndex >= this.items.length) this.activeIndex = 0;
            this.items[this.activeIndex].classList.add('active');
            this.items[this.activeIndex].scrollIntoView({ block: 'nearest' });
        }

        async executeQuery(query) {
            this.input.value = query;
            this.body.innerHTML = `
                <div class="cmdk-loading">
                    <div class="cmdk-spinner"></div>
                    <span>Querying LoRRI intelligence engine...</span>
                </div>`;

            try {
                const res = await fetch('/api/agent/query', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ query })
                });
                const data = await res.json();

                let html = `<div class="cmdk-result">
                    <div class="cmdk-result-header">
                        <span>🧠 Intelligence Response</span>
                        <span class="cmdk-result-confidence">${Math.round(data.confidence * 100)}% confidence</span>
                        <span style="margin-left:auto; font-size:0.6rem; color:var(--text-dim)">${data.source || ''}</span>
                    </div>
                    <div class="cmdk-result-answer">${this.escapeHtml(data.answer)}</div>`;

                if (data.relatedQueries && data.relatedQueries.length) {
                    html += `<div class="cmdk-result-related">
                        <div class="cmdk-result-related-label">RELATED QUERIES</div>`;
                    for (const rq of data.relatedQueries) {
                        html += `<button class="cmdk-related-item">${this.escapeHtml(rq)}</button>`;
                    }
                    html += `</div>`;
                }
                html += `</div>`;
                this.body.innerHTML = html;
            } catch (err) {
                this.body.innerHTML = `<div class="cmdk-loading" style="color:var(--red)">
                    Failed to query intelligence engine. Please try again.</div>`;
            }
        }

        escapeHtml(str) {
            const div = document.createElement('div');
            div.textContent = str;
            return div.innerHTML;
        }
    }

    // ============================================
    // 10. AI CHAT WIDGET
    // ============================================
    class AIChatWidget {
        constructor() {
            this.fab = document.getElementById('chat-fab');
            this.panel = document.getElementById('chat-panel');
            this.closeBtn = document.getElementById('chat-close');
            this.messages = document.getElementById('chat-messages');
            this.input = document.getElementById('chat-input');
            this.sendBtn = document.getElementById('chat-send');
            this.suggestions = document.getElementById('chat-suggestions');
            if (!this.fab || !this.panel) return;

            this.isOpen = false;
            this.hasGreeted = false;
            this.history = []; // conversation history
            this.bindEvents();
        }

        bindEvents() {
            this.fab.addEventListener('click', () => this.toggle());
            this.closeBtn.addEventListener('click', () => this.toggle());

            this.sendBtn.addEventListener('click', () => this.sendMessage());
            this.input.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    this.sendMessage();
                }
            });

            // Suggestion chips
            this.suggestions.addEventListener('click', (e) => {
                const btn = e.target.closest('.chat-suggestion');
                if (btn) {
                    this.input.value = btn.dataset.msg;
                    this.sendMessage();
                }
            });

            // Action buttons in bot messages
            this.messages.addEventListener('click', (e) => {
                const action = e.target.closest('.chat-msg-action');
                if (action) {
                    this.input.value = action.textContent;
                    this.sendMessage();
                }
            });
        }

        toggle() {
            this.isOpen = !this.isOpen;
            this.panel.classList.toggle('open', this.isOpen);
            this.fab.classList.toggle('hidden', this.isOpen);

            if (this.isOpen && !this.hasGreeted) {
                this.hasGreeted = true;
                this.addBotMessage(
                    `Welcome to **LoRRI Command Center** 🧠\n\nI'm your autonomous freight intelligence assistant. Ask me about:\n• Spot rates & market trends\n• Port congestion (try: "Shanghai port")\n• Agent fleet status\n• ROI projections\n• Risk alerts\n\nHow can I help?`,
                    ['Show spot rates', 'Port status', 'Agent health', 'Calculate ROI']
                );
            }
            if (this.isOpen) {
                setTimeout(() => this.input.focus(), 200);
            }
        }

        async sendMessage() {
            const text = this.input.value.trim();
            if (!text) return;

            // Add user message
            this.addUserMessage(text);
            this.history.push({ role: 'user', content: text });
            this.input.value = '';

            // Show typing indicator
            const typing = this.addTypingIndicator();

            try {
                const res = await fetch('/api/agent/chat', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ message: text, history: this.history })
                });
                const data = await res.json();

                // Remove typing
                typing.remove();

                // Add bot response
                this.addBotMessage(data.message, data.suggestedActions);
                this.history.push({ role: 'assistant', content: data.message });

                // Keep history manageable (last 20 turns)
                if (this.history.length > 20) {
                    this.history = this.history.slice(-20);
                }

                // Update suggestion chips
                if (data.suggestedActions) {
                    this.updateSuggestions(data.suggestedActions);
                }
            } catch {
                typing.remove();
                this.addBotMessage('I\'m having trouble connecting to the intelligence engine. Please try again in a moment.', ['Retry', 'Agent status']);
            }
        }

        addUserMessage(text) {
            const msg = document.createElement('div');
            msg.className = 'chat-msg user';
            msg.innerHTML = `${this.escapeHtml(text)}<span class="chat-msg-time">${this.timeNow()}</span>`;
            this.messages.appendChild(msg);
            this.scrollToBottom();
        }

        addBotMessage(text, actions) {
            const msg = document.createElement('div');
            msg.className = 'chat-msg bot';

            let formatted = this.renderMarkdown(text);
            let html = `<div class="chat-msg-body">${formatted}</div><span class="chat-msg-time">${this.timeNow()}</span>`;

            if (actions && actions.length) {
                html += `<div class="chat-msg-actions">`;
                for (const a of actions) {
                    html += `<button class="chat-msg-action">${this.escapeHtml(a)}</button>`;
                }
                html += `</div>`;
            }

            msg.innerHTML = html;
            this.messages.appendChild(msg);
            this.scrollToBottom();
            return msg;
        }

        renderMarkdown(text) {
            let escaped = this.escapeHtml(text);

            // Detect and render markdown tables
            const lines = escaped.split('\n');
            let result = [];
            let tableRows = [];
            let inTable = false;

            for (let i = 0; i < lines.length; i++) {
                const line = lines[i].trim();
                if (line.startsWith('|') && line.endsWith('|')) {
                    // Check if this is a separator row (|---|---|)
                    if (/^\|[\s\-:|]+\|$/.test(line)) {
                        continue; // skip separator
                    }
                    if (!inTable) {
                        if (result.length > 0) result.push(''); // spacer
                        inTable = true;
                    }
                    const cells = line.split('|').filter(c => c.trim() !== '');
                    tableRows.push(cells.map(c => c.trim()));
                } else {
                    if (inTable && tableRows.length > 0) {
                        result.push(this.buildTable(tableRows));
                        tableRows = [];
                        inTable = false;
                    }
                    result.push(line);
                }
            }
            if (inTable && tableRows.length > 0) {
                result.push(this.buildTable(tableRows));
            }

            let html = result.join('\n');

            // Bold
            html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
            // Italic
            html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');
            // Bullet points (• or -)
            html = html.replace(/^[\u2022\-]\s+(.+)/gm, '<div class="chat-bullet">$1</div>');
            // Numbered lists
            html = html.replace(/^(\d+)\.\s+(.+)/gm, '<div class="chat-bullet"><span class="chat-bullet-num">$1.</span> $2</div>');
            // Line breaks
            html = html.replace(/\n/g, '<br>');
            // Clean up double breaks around tables
            html = html.replace(/<br>\s*(<div class="chat-table)/g, '$1');
            html = html.replace(/(chat-table-wrap">.*?<\/div>)<br>/g, '$1');

            return html;
        }

        buildTable(rows) {
            if (rows.length === 0) return '';
            let html = '<div class="chat-table-wrap"><table class="chat-table">';
            // First row as header
            html += '<thead><tr>';
            for (const cell of rows[0]) {
                html += `<th>${cell}</th>`;
            }
            html += '</tr></thead><tbody>';
            for (let i = 1; i < rows.length; i++) {
                html += '<tr>';
                for (const cell of rows[i]) {
                    html += `<td>${cell}</td>`;
                }
                html += '</tr>';
            }
            html += '</tbody></table></div>';
            return html;
        }

        addTypingIndicator() {
            const el = document.createElement('div');
            el.className = 'chat-typing';
            el.innerHTML = `<div class="chat-typing-dot"></div><div class="chat-typing-dot"></div><div class="chat-typing-dot"></div>`;
            this.messages.appendChild(el);
            this.scrollToBottom();
            return el;
        }

        updateSuggestions(actions) {
            if (!this.suggestions) return;
            this.suggestions.innerHTML = '';
            for (const a of actions.slice(0, 4)) {
                const btn = document.createElement('button');
                btn.className = 'chat-suggestion';
                btn.dataset.msg = a;
                btn.textContent = a;
                this.suggestions.appendChild(btn);
            }
        }

        scrollToBottom() {
            this.messages.scrollTop = this.messages.scrollHeight;
        }

        timeNow() {
            return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        }

        escapeHtml(str) {
            const div = document.createElement('div');
            div.textContent = str;
            return div.innerHTML;
        }
    }

    // ============================================
    // 11. LIVE INTELLIGENCE PULSE
    // ============================================
    class LiveDashboard {
        constructor() {
            this.kpiShipments = document.getElementById('kpi-shipments');
            this.kpiRate = document.getElementById('kpi-rate');
            this.kpiEfficiency = document.getElementById('kpi-efficiency');
            this.kpiCo2 = document.getElementById('kpi-co2');
            if (!this.kpiShipments) return;

            // Arch node stat elements
            this.archNodes = document.querySelectorAll('.arch-node-stat');

            this.fetchData();
            setInterval(() => this.fetchData(), 12000);
        }

        async fetchData() {
            try {
                const [statusRes, intelRes] = await Promise.all([
                    fetch('/api/agent/status'),
                    fetch('/api/agent/intelligence')
                ]);
                const status = await statusRes.json();
                const intel = await intelRes.json();

                // Update KPI cards
                this.animateKPI(this.kpiShipments, status.globalMetrics.totalShipmentsActive.toLocaleString());
                this.animateKPI(this.kpiRate, '₹' + status.globalMetrics.avgRatePerKm + '/km');
                this.animateKPI(this.kpiEfficiency, status.globalMetrics.networkEfficiency + '%');
                const co2El = this.kpiCo2;
                if (co2El) this.animateKPI(co2El, intel.sustainability.co2SavedYTD.toLocaleString() + ' MT');

                // Update health bars
                for (const agent of status.agents) {
                    const fill = document.getElementById('health-' + agent.id);
                    const pct = document.getElementById('health-pct-' + agent.id);
                    if (fill) {
                        fill.style.width = agent.health + '%';
                        fill.style.transition = 'width 0.8s ease';
                    }
                    if (pct) pct.textContent = agent.health + '%';
                }

                // Update arch-node stats from API data
                const archStats = document.querySelectorAll('.arch-node-stat');
                if (archStats.length >= 4) {
                    archStats[0].textContent = '₹2,500Cr+ dataset';
                    archStats[1].textContent = intel.portIntelligence.reduce((s, p) => s + p.vessels, 0) + ' vessels';
                    archStats[2].textContent = status.agents.find(a => a.id === 'risk')?.metrics.signalsMonitored.toLocaleString() + ' signals';
                    archStats[3].textContent = (status.globalMetrics.totalRoutesMonitored / 1e3).toFixed(0) + 'K+ routes';
                }

            } catch { /* silently fail on network error */ }
        }

        animateKPI(el, newVal) {
            if (!el || el.textContent === newVal) return;
            el.style.transition = 'opacity 0.2s';
            el.style.opacity = '0.3';
            setTimeout(() => {
                el.textContent = newVal;
                el.style.opacity = '1';
            }, 200);
        }
    }

    class IntelligencePulse {
        constructor() {
            this.textEls = [
                document.getElementById('pulse-text-1'),
                document.getElementById('pulse-text-2'),
                document.getElementById('pulse-text-3'),
                document.getElementById('pulse-text-4'),
            ];
            if (!this.textEls[0]) return;

            this.fetchIntelligence();
            setInterval(() => this.fetchIntelligence(), 15000);
        }

        async fetchIntelligence() {
            try {
                const res = await fetch('/api/agent/intelligence');
                const data = await res.json();

                if (this.textEls[0])
                    this.textEls[0].textContent = `Monitoring ${data.globalFreightGrid.totalRoutes.toLocaleString()} routes • ${data.globalFreightGrid.activeShipments.toLocaleString()} active shipments`;
                if (this.textEls[1])
                    this.textEls[1].textContent = `FTL rate: ₹${data.rateIntelligence.nationalAvgFTL}/km • Tender rejection: ${data.rateIntelligence.tenderRejectionRate}%`;
                if (this.textEls[2])
                    this.textEls[2].textContent = `JNPT congestion: ${data.portIntelligence[0].congestion}% • ${data.portIntelligence[0].vessels} vessels`;
                if (this.textEls[3])
                    this.textEls[3].textContent = `CO₂ saved YTD: ${data.sustainability.co2SavedYTD.toLocaleString()} MT • ESG: ${data.sustainability.esgCompliance}%`;
            } catch { /* silently fail */ }
        }
    }

    // ============================================
    // 12. API-CONNECTED ROI CALCULATOR
    // ============================================
    class TraceStreamHandler {
        constructor() {
            this.btn = document.getElementById('trace-api-btn');
            this.traceLog = document.querySelector('.trace-log');
            if (!this.btn || !this.traceLog) return;

            this.streaming = false;
            this.reader = null;

            this.btn.addEventListener('click', () => {
                if (this.streaming) {
                    this.stopStream();
                } else {
                    this.startStream();
                }
            });
        }

        async startStream() {
            this.streaming = true;
            this.btn.classList.add('streaming');
            this.btn.querySelector('span').textContent = 'Stop Stream';
            this.traceLog.innerHTML = '';

            try {
                const res = await fetch('/api/agent/trace', { method: 'POST' });
                this.reader = res.body.getReader();
                const decoder = new TextDecoder();
                let buffer = '';

                while (true) {
                    const { done, value } = await this.reader.read();
                    if (done) break;

                    buffer += decoder.decode(value, { stream: true });
                    const lines = buffer.split('\n');
                    buffer = lines.pop();

                    for (const line of lines) {
                        if (line.startsWith('data: ')) {
                            try {
                                const event = JSON.parse(line.slice(6));
                                this.renderEvent(event);
                            } catch { /* skip malformed */ }
                        }
                    }
                }
            } catch (err) {
                this.addLogEntry('error', `Stream error: ${err.message}`);
            }

            this.stopStream();
        }

        stopStream() {
            this.streaming = false;
            this.btn.classList.remove('streaming');
            this.btn.querySelector('span').textContent = 'Stream from API';
            if (this.reader) {
                try { this.reader.cancel(); } catch {}
                this.reader = null;
            }
        }

        renderEvent(event) {
            if (event.type === 'step') {
                const phase = event.phase || 'process';
                const icon = phase === 'think' ? '🧠' : phase === 'act' ? '⚡' : phase === 'observe' ? '👁' : '📊';
                this.addLogEntry(phase, `${icon} [${event.agent}] ${event.message}`, event.confidence);
            } else if (event.type === 'result') {
                this.addLogEntry('result', `✅ Decision: ${event.decision} — Confidence: ${(event.confidence * 100).toFixed(0)}%`);
            }
        }

        addLogEntry(type, text, confidence) {
            const entry = document.createElement('div');
            entry.className = 'trace-entry';
            entry.setAttribute('data-type', type);
            const color = type === 'think' ? 'var(--purple)' : type === 'act' ? 'var(--cyan)' : type === 'observe' ? 'var(--amber)' : type === 'result' ? 'var(--green)' : 'var(--text-muted)';
            entry.style.borderLeftColor = color;
            entry.innerHTML = `<span style="color:${color}">${text}</span>`;
            if (confidence) {
                entry.innerHTML += `<span style="color:var(--text-dim);font-size:0.6rem;margin-left:8px">${(confidence * 100).toFixed(0)}%</span>`;
            }
            this.traceLog.appendChild(entry);
            this.traceLog.scrollTop = this.traceLog.scrollHeight;
        }
    }

    class ROIApiEnhancer {
        constructor() {
            this.ctaBtn = document.querySelector('.roi-cta');
            if (!this.ctaBtn) return;

            // Enhance CTA to fetch from API
            this.ctaBtn.addEventListener('click', async (e) => {
                e.preventDefault();
                const spendSlider = document.getElementById('roi-spend');
                if (!spendSlider) return;

                const annualSpend = parseInt(spendSlider.value);
                this.ctaBtn.textContent = 'Fetching Analysis...';
                this.ctaBtn.style.pointerEvents = 'none';

                try {
                    const res = await fetch('/api/agent/roi', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ annualSpend })
                    });
                    const data = await res.json();

                    // Update ROI display with API data
                    const costEl = document.getElementById('roi-cost-savings');
                    const totalEl = document.getElementById('roi-total');
                    const paybackEl = document.getElementById('roi-payback');

                    if (costEl) costEl.textContent = '$' + (data.savings.freightCostReduction.expected / 1e6).toFixed(1) + 'M';
                    if (totalEl) totalEl.textContent = Math.round(data.roi.expected) + '%';
                    if (paybackEl) paybackEl.textContent = data.paybackPeriod.description;

                    this.ctaBtn.innerHTML = '<span class="btn-glow"></span>✓ Analysis Complete — Schedule Demo';
                } catch {
                    this.ctaBtn.innerHTML = '<span class="btn-glow"></span>Get Full Analysis Report';
                }
                this.ctaBtn.style.pointerEvents = '';
            });
        }
    }

    // ============================================
    // THEME SWITCHER
    // ============================================
    class ThemeSwitcher {
        constructor() {
            this.html = document.documentElement;
            this.btn = document.getElementById('theme-toggle');
            this.storageKey = 'lorri-theme';
            this.meta = document.querySelector('meta[name="theme-color"]');

            // Determine initial theme
            const saved = localStorage.getItem(this.storageKey);
            if (saved) {
                this.set(saved, false);
            } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
                this.set('light', false);
            } else {
                this.set('dark', false);
            }

            // Toggle on click
            if (this.btn) {
                this.btn.addEventListener('click', () => {
                    const next = this.html.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
                    this.set(next, true);
                });
            }

            // Listen for OS theme changes
            window.matchMedia('(prefers-color-scheme: light)').addEventListener('change', (e) => {
                if (!localStorage.getItem(this.storageKey)) {
                    this.set(e.matches ? 'light' : 'dark', false);
                }
            });
        }

        set(theme, persist) {
            this.html.setAttribute('data-theme', theme);
            if (this.meta) {
                this.meta.content = theme === 'light' ? '#F5F7FA' : '#0A0A0A';
            }
            if (persist) localStorage.setItem(this.storageKey, theme);
        }
    }

    // ============================================
    // 16. DEMO REQUEST FORM HANDLER
    // ============================================
    class DemoFormHandler {
        constructor() {
            this.form = document.getElementById('demo-form');
            if (!this.form) return;
            this.form.addEventListener('submit', (e) => this.handleSubmit(e));
        }

        async handleSubmit(e) {
            e.preventDefault();
            const btn = this.form.querySelector('.demo-submit-btn');
            const origText = btn.innerHTML;
            btn.innerHTML = '<span style="display:inline-block;width:18px;height:18px;border:2px solid rgba(255,255,255,0.3);border-top-color:#fff;border-radius:50%;animation:spin 0.6s linear infinite;vertical-align:middle;margin-right:8px;"></span> Submitting…';
            btn.disabled = true;

            // Simulate API call
            await new Promise(r => setTimeout(r, 1500));

            // Show success
            document.getElementById('demo-form-view').style.display = 'none';
            document.getElementById('demo-success-view').style.display = '';

            // Reset button
            btn.innerHTML = origText;
            btn.disabled = false;
        }
    }

    // ============================================
    // INITIALIZE
    // ============================================
    document.addEventListener('DOMContentLoaded', () => {
        // Theme (must be first for no-flash)
        new ThemeSwitcher();

        // Background grid
        const gridCanvas = document.getElementById('freight-grid');
        if (gridCanvas) new FreightGrid(gridCanvas);

        // Core modules
        new AgentSimulation();
        new Dashboard();
        new ROICalculator();
        new AgentTicker();
        new ScrollEffects();
        new MobileNav();
        new SmoothScroll();

        // New AI-first features
        new CommandPalette();
        new AIChatWidget();
        new IntelligencePulse();
        new LiveDashboard();
        new ROIApiEnhancer();
        new TraceStreamHandler();
        new DemoFormHandler();
    });

})();
