'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, ArrowRight } from 'lucide-react';
import DemoRequestForm from './DemoRequestForm';

export default function CTASection() {
  const [demoOpen, setDemoOpen] = useState(false);

  return (
    <>
      <section className="relative z-10 px-4 py-20">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.6 }}
            className="glass-panel p-8 sm:p-12 text-center"
          >
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
              Ready to deploy your<br />
              <span className="gradient-text">Autonomous Freight Layer?</span>
            </h2>
            <p className="text-text-secondary max-w-xl mx-auto mb-8 text-sm leading-relaxed">
              Join enterprises like Saint Gobain, Onida, Perfetti Van Melle, Apollo Tyres, and Shell
              that moved beyond spreadsheets to AI-native freight intelligence.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={() => setDemoOpen(true)}
                className="flex items-center gap-2 px-8 py-3.5 rounded-xl bg-gradient-to-r from-cyan to-purple text-white font-semibold text-sm hover:shadow-[0_0_40px_rgba(0,240,255,0.25)] transition"
              >
                <Calendar className="w-4 h-4" />
                Schedule a Demo
              </button>
              <a
                href="mailto:lorri@logisticsnow.in"
                className="flex items-center gap-2 px-8 py-3.5 rounded-xl border border-glass-border text-text-secondary hover:text-text-primary hover:border-glass-highlight text-sm font-medium transition"
              >
                Contact Sales <ArrowRight className="w-3.5 h-3.5" />
              </a>
            </div>

            {/* Trust Logos */}
            <div className="mt-10 pt-6 border-t border-glass-border">
              <p className="text-[10px] text-text-dim uppercase tracking-wider mb-4">Trusted by leading enterprises</p>
              <div className="flex flex-wrap items-center justify-center gap-4">
                {['Saint Gobain', 'Onida', 'Perfetti Van Melle', 'Apollo Tyres', 'Bajaj Electricals', 'Shell'].map((name) => (
                  <span key={name} className="px-4 py-2 rounded-lg border border-glass-border text-text-dim text-xs hover:text-text-secondary hover:border-glass-highlight transition">
                    {name}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <DemoRequestForm open={demoOpen} onClose={() => setDemoOpen(false)} />
    </>
  );
}
