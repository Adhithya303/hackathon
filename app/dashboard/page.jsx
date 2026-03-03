import Navbar from './components/Navbar';
import FreightGrid from './components/FreightGrid';
import HeroGlassBox from './components/HeroGlassBox';
import ImpactBar from './components/ImpactBar';
import AgentMarketplace from './components/AgentMarketplace';
import KnowledgeGraph from './components/KnowledgeGraph';
import ConfidenceGauges from './components/ConfidenceGauges';
import ROISimulator from './components/ROISimulator';
import CTASection from './components/CTASection';
import CommandBar from './components/CommandBar';
import Footer from './components/Footer';

export const metadata = {
  title: 'Dashboard — LoRRI.ai Autonomous Freight Layer',
  description: 'AI-Native Logistics Command Center. Deploy autonomous agents for procurement, sustainability, optimization, and risk detection.',
};

export default function DashboardPage() {
  return (
    <main className="relative min-h-screen bg-base text-text-primary overflow-x-hidden">
      {/* Particle Network Background */}
      <FreightGrid />

      {/* Navigation */}
      <Navbar />

      {/* Hero — Glass Box ReAct Simulation */}
      <HeroGlassBox />

      {/* Impact Stats Bar */}
      <ImpactBar />

      {/* Agent Marketplace */}
      <AgentMarketplace />

      {/* Agentic Knowledge Graph */}
      <KnowledgeGraph />

      {/* Confidence Indicators */}
      <ConfidenceGauges />

      {/* ROI Simulator */}
      <ROISimulator />

      {/* CTA with Demo Form */}
      <CTASection />

      {/* Footer */}
      <Footer />

      {/* Persistent Cmd+K Command Bar */}
      <CommandBar />
    </main>
  );
}
