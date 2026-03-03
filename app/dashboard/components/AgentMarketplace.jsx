'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ShoppingCart, Leaf, Cpu, Zap, ArrowRight, ShieldAlert } from 'lucide-react';

const agents = [
  {
    id: 'procurement',
    name: 'Autonomous Procurement Agent',
    icon: ShoppingCart,
    color: 'cyan',
    glowClass: 'glass-glow-cyan',
    badge: 'Live',
    capabilities: [
      'Rolling Negotiations — continuous price alignment vs. annual contracts',
      'Self-Managing Contracts — auto-scans carriers on disruption, executes digital contracts via secure APIs',
      'Rate Harmonization — normalization across suppliers, regions, INR/USD/AED',
      'Supplier Intelligence — monitors financial reports, news, social sentiment for emerging risks',
    ],
    metric: { label: 'RFQ Speed', value: '90% faster', sub: 'vs. manual cycles' },
  },
  {
    id: 'sustainability',
    name: 'Sustainability & Energy-Aware Agent',
    icon: Leaf,
    color: 'green',
    glowClass: 'glass-glow-cyan',
    badge: 'ESG',
    capabilities: [
      'Carbon-Optimal Mode — weighs cost/speed vs. emissions, suggests intermodal shifts (air → rail)',
      'Continuous ESG Parameterization — sustainability as core decision parameter, auto-flags compliance gaps',
      'Digital Twin Inefficiency Modeling — shadow simulations reduce fuel consumption by up to 10%',
      '100,000+ metric tons CO₂ avoided annually through route & load optimization',
    ],
    metric: { label: 'CO₂ Saved', value: '100K+ tons', sub: 'annually' },
  },
  {
    id: 'optimization',
    name: 'Optimization & Self-Healing Logic',
    icon: Cpu,
    color: 'purple',
    glowClass: 'glass-glow-purple',
    badge: 'Auto',
    capabilities: [
      'Anticipatory Replenishment — 92% demand accuracy, stock moves before checkout',
      'Self-Healing Disruption — detects port strikes / weather 72h ahead, autonomous rerouting',
      'Predictive Maintenance — vehicle telematics (vibration, battery, engine) schedules repairs pre-failure',
      'Empty Mile Mitigation — predictive load pooling cuts industry emissions by 20%',
    ],
    metric: { label: 'Match Ratio', value: '87%', sub: 'first-time invoice match' },
  },
  {
    id: 'risk',
    name: 'Risk Detection & Compliance Agent',
    icon: ShieldAlert,
    color: 'amber',
    glowClass: 'glass-glow-cyan',
    badge: 'Guard',
    capabilities: [
      'Real-Time Risk Scanning — monitors 24,700+ signals across geopolitical, weather, and market feeds',
      'Carrier Scorecard Engine — financial health, on-time %, claims ratio, safety audits aggregated live',
      'Trade Compliance — auto-validates GST filings, e-way bills, customs docs, sanctions screening',
      'Anomaly Detection — flags invoice mismatches, unusual rate spikes, and fraud patterns instantly',
    ],
    metric: { label: 'Signals Monitored', value: '24.7K+', sub: 'real-time feeds' },
  },
];

const colorMap = {
  cyan: { dot: 'bg-cyan', ring: 'ring-cyan/30', text: 'text-cyan', bg: 'bg-cyan-dim' },
  green: { dot: 'bg-green', ring: 'ring-green/30', text: 'text-green', bg: 'bg-green-dim' },
  purple: { dot: 'bg-purple', ring: 'ring-purple/30', text: 'text-purple', bg: 'bg-purple-dim' },
  amber: { dot: 'bg-amber', ring: 'ring-amber/30', text: 'text-amber', bg: 'bg-amber-dim' },
};

export default function AgentMarketplace() {
  const [deployed, setDeployed] = useState({});

  const deploy = (id) => {
    setDeployed((p) => ({ ...p, [id]: !p[id] }));
  };

  return (
    <section className="relative z-10 px-4 py-20">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-3">
            Agent <span className="gradient-text">Marketplace</span>
          </h2>
          <p className="text-text-secondary max-w-xl mx-auto">
            Composable autonomous agents — deploy one or stack all four for full-spectrum freight intelligence.
          </p>
        </motion.div>

        {/* Cards Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
          {agents.map((agent, idx) => {
            const c = colorMap[agent.color];
            const Icon = agent.icon;
            const isDeployed = deployed[agent.id];

            return (
              <motion.div
                key={agent.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.5, delay: idx * 0.12 }}
                className={`glass-panel p-6 flex flex-col group hover:border-glass-highlight transition-all duration-500 ${isDeployed ? agent.glowClass : ''}`}
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-5">
                  <div className="relative">
                    <div className={`w-12 h-12 rounded-xl ${c.bg} flex items-center justify-center`}>
                      <Icon className={`w-5 h-5 ${c.text}`} />
                    </div>
                    {/* Pulse ring when deployed */}
                    {isDeployed && (
                      <span className={`absolute inset-0 rounded-xl ring-2 ${c.ring} animate-pulse-ring`} />
                    )}
                  </div>
                  <span className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-md ${c.bg} ${c.text}`}>
                    {agent.badge}
                  </span>
                </div>

                <h3 className="text-base font-semibold text-text-primary mb-3">{agent.name}</h3>

                {/* Capabilities */}
                <ul className="space-y-2 mb-6 flex-1">
                  {agent.capabilities.map((cap, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-text-secondary leading-relaxed">
                      <Zap className={`w-3 h-3 mt-0.5 shrink-0 ${c.text} opacity-60`} />
                      {cap}
                    </li>
                  ))}
                </ul>

                {/* Metric */}
                <div className="border-t border-glass-border pt-4 mb-4">
                  <div className="flex items-baseline gap-2">
                    <span className={`text-2xl font-bold ${c.text}`}>{agent.metric.value}</span>
                    <span className="text-xs text-text-dim">{agent.metric.sub}</span>
                  </div>
                  <span className="text-[10px] text-text-dim uppercase tracking-wider">{agent.metric.label}</span>
                </div>

                {/* Deploy Button */}
                <button
                  onClick={() => deploy(agent.id)}
                  className={`flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 ${
                    isDeployed
                      ? `${c.bg} ${c.text} ring-1 ${c.ring}`
                      : 'bg-glass border border-glass-border text-text-secondary hover:text-text-primary hover:border-glass-highlight'
                  }`}
                >
                  {isDeployed ? (
                    <>
                      <span className={`w-1.5 h-1.5 rounded-full ${c.dot} animate-pulse`} />
                      Deployed — Active
                    </>
                  ) : (
                    <>
                      Deploy Agent <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
