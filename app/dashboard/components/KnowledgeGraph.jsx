'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

// Graph data: agent reasoning nodes and their causal links
const NODES = [
  // Center orchestrator
  { id: 'orchestrator', label: 'LoRRI\nOrchestrator', x: 0.5, y: 0.5, type: 'core', color: '#00F0FF' },
  // Agents
  { id: 'procurement', label: 'Procurement\nAgent', x: 0.18, y: 0.22, type: 'agent', color: '#00F0FF' },
  { id: 'sustainability', label: 'Sustainability\nAgent', x: 0.82, y: 0.22, type: 'agent', color: '#10B981' },
  { id: 'optimization', label: 'Optimization\nAgent', x: 0.18, y: 0.78, type: 'agent', color: '#8B5CF6' },
  { id: 'risk', label: 'Risk Detection\nAgent', x: 0.82, y: 0.78, type: 'agent', color: '#F59E0B' },
  // Data sources
  { id: 'market', label: 'Market Data\n₹12.5L Cr', x: 0.5, y: 0.08, type: 'data', color: '#00F0FF' },
  { id: 'carriers', label: 'Carrier Bids\n2,200+', x: 0.08, y: 0.5, type: 'data', color: '#8B5CF6' },
  { id: 'iot', label: 'IoT / Telematics\nReal-Time', x: 0.92, y: 0.5, type: 'data', color: '#10B981' },
  { id: 'geofeed', label: 'Geo & News\nFeeds', x: 0.5, y: 0.92, type: 'data', color: '#F59E0B' },
  // Outputs
  { id: 'contract', label: 'Auto\nContract', x: 0.35, y: 0.18, type: 'output', color: '#00F0FF' },
  { id: 'greenroute', label: 'Green\nRoute', x: 0.65, y: 0.18, type: 'output', color: '#10B981' },
  { id: 'reroute', label: 'Self-Heal\nReroute', x: 0.35, y: 0.82, type: 'output', color: '#8B5CF6' },
  { id: 'alert', label: 'Risk\nAlert', x: 0.65, y: 0.82, type: 'output', color: '#F59E0B' },
];

const EDGES = [
  // Data → Orchestrator
  { from: 'market', to: 'orchestrator', type: 'data' },
  { from: 'carriers', to: 'orchestrator', type: 'data' },
  { from: 'iot', to: 'orchestrator', type: 'data' },
  { from: 'geofeed', to: 'orchestrator', type: 'data' },
  // Orchestrator → Agents
  { from: 'orchestrator', to: 'procurement', type: 'dispatch' },
  { from: 'orchestrator', to: 'sustainability', type: 'dispatch' },
  { from: 'orchestrator', to: 'optimization', type: 'dispatch' },
  { from: 'orchestrator', to: 'risk', type: 'dispatch' },
  // Agent → Output
  { from: 'procurement', to: 'contract', type: 'action' },
  { from: 'sustainability', to: 'greenroute', type: 'action' },
  { from: 'optimization', to: 'reroute', type: 'action' },
  { from: 'risk', to: 'alert', type: 'action' },
  // Cross-agent comm
  { from: 'risk', to: 'optimization', type: 'signal' },
  { from: 'sustainability', to: 'procurement', type: 'signal' },
];

export default function KnowledgeGraph() {
  const canvasRef = useRef(null);
  const [hovered, setHovered] = useState(null);
  const [size, setSize] = useState({ w: 800, h: 500 });
  const animRef = useRef(0);
  const containerRef = useRef(null);

  useEffect(() => {
    const onResize = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setSize({ w: rect.width, h: Math.max(420, Math.min(rect.width * 0.6, 560)) });
      }
    };
    onResize();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    canvas.width = size.w * dpr;
    canvas.height = size.h * dpr;
    ctx.scale(dpr, dpr);

    let tick = 0;

    const getPos = (node) => ({
      x: node.x * size.w,
      y: node.y * size.h,
    });

    const drawEdge = (from, to, edge) => {
      const a = getPos(from);
      const b = getPos(to);
      const t = tick * 0.008;

      // Animated pulse position along line
      const pulseT = (t + EDGES.indexOf(edge) * 0.3) % 1;
      const px = a.x + (b.x - a.x) * pulseT;
      const py = a.y + (b.y - a.y) * pulseT;

      // Line
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.strokeStyle =
        edge.type === 'signal'
          ? 'rgba(245, 158, 11, 0.12)'
          : 'rgba(255, 255, 255, 0.06)';
      ctx.lineWidth = edge.type === 'signal' ? 1 : 0.8;
      if (edge.type === 'signal') ctx.setLineDash([4, 6]);
      else ctx.setLineDash([]);
      ctx.stroke();
      ctx.setLineDash([]);

      // Pulse dot
      ctx.beginPath();
      ctx.arc(px, py, 2.5, 0, Math.PI * 2);
      const color = from.color || '#00F0FF';
      ctx.fillStyle = color.replace(')', ', 0.7)').replace('rgb', 'rgba').replace('#', '');
      // Convert hex to rgba for pulse
      const r = parseInt(color.slice(1, 3), 16);
      const g = parseInt(color.slice(3, 5), 16);
      const bl = parseInt(color.slice(5, 7), 16);
      ctx.fillStyle = `rgba(${r}, ${g}, ${bl}, 0.7)`;
      ctx.fill();
    };

    const drawNode = (node) => {
      const { x, y } = getPos(node);
      const isHov = hovered === node.id;
      const r = parseInt(node.color.slice(1, 3), 16);
      const g = parseInt(node.color.slice(3, 5), 16);
      const b = parseInt(node.color.slice(5, 7), 16);

      let radius = node.type === 'core' ? 32 : node.type === 'agent' ? 24 : node.type === 'output' ? 16 : 14;
      if (isHov) radius += 4;

      // Glow
      if (node.type === 'core' || node.type === 'agent') {
        const breathe = 0.3 + Math.sin(tick * 0.03 + NODES.indexOf(node)) * 0.15;
        ctx.beginPath();
        ctx.arc(x, y, radius + 12, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${breathe * 0.15})`;
        ctx.fill();
      }

      // Circle
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${isHov ? 0.25 : 0.1})`;
      ctx.fill();
      ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${isHov ? 0.8 : 0.4})`;
      ctx.lineWidth = isHov ? 2 : 1;
      ctx.stroke();

      // Label
      const lines = node.label.split('\n');
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.font = `${node.type === 'core' ? '600 10px' : '500 9px'} Inter, sans-serif`;
      ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${isHov ? 1 : 0.85})`;
      lines.forEach((line, i) => {
        const offset = (i - (lines.length - 1) / 2) * 12;
        ctx.fillText(line, x, y + offset);
      });
    };

    const frame = () => {
      tick++;
      ctx.clearRect(0, 0, size.w, size.h);

      // Draw edges
      EDGES.forEach((edge) => {
        const fromNode = NODES.find((n) => n.id === edge.from);
        const toNode = NODES.find((n) => n.id === edge.to);
        if (fromNode && toNode) drawEdge(fromNode, toNode, edge);
      });

      // Draw nodes
      NODES.forEach(drawNode);

      animRef.current = requestAnimationFrame(frame);
    };

    frame();
    return () => cancelAnimationFrame(animRef.current);
  }, [size, hovered]);

  // Mouse hit test
  const onMouseMove = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;

    let hit = null;
    for (const node of NODES) {
      const nx = node.x * size.w;
      const ny = node.y * size.h;
      const r = node.type === 'core' ? 32 : node.type === 'agent' ? 24 : 16;
      if (Math.hypot(mx - nx, my - ny) < r + 8) {
        hit = node.id;
        break;
      }
    }
    setHovered(hit);
  };

  return (
    <section className="relative z-10 px-4 py-20">
      <div className="max-w-5xl mx-auto" ref={containerRef}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10"
        >
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-2">
            Agentic <span className="gradient-text">Knowledge Graph</span>
          </h2>
          <p className="text-text-secondary text-sm max-w-lg mx-auto">
            Live visualization of LoRRI's reasoning topology — data flows, agent dispatch, cross-agent signals,
            and autonomous action outputs.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="glass-panel p-4 sm:p-6"
        >
          <canvas
            ref={canvasRef}
            style={{ width: size.w, height: size.h, cursor: hovered ? 'pointer' : 'default' }}
            onMouseMove={onMouseMove}
            onMouseLeave={() => setHovered(null)}
            className="w-full"
          />

          {/* Legend */}
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 mt-4 text-[10px] text-text-dim">
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-cyan" /> Procurement</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-green" /> Sustainability</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-purple" /> Optimization</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber" /> Risk Detection</span>
            <span className="flex items-center gap-1.5"><span className="w-6 border-t border-dashed border-amber/40" /> Cross-Agent Signal</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
