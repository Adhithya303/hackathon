'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, CheckCircle, Calendar, Building2, Mail, User, Phone } from 'lucide-react';

export default function DemoRequestForm({ open, onClose }) {
  const [form, setForm] = useState({ name: '', email: '', company: '', phone: '', spend: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);

  const update = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSending(true);
    // Simulate API call
    await new Promise((r) => setTimeout(r, 1500));
    setSending(false);
    setSubmitted(true);
  };

  const reset = () => {
    setSubmitted(false);
    setForm({ name: '', email: '', company: '', phone: '', spend: '', message: '' });
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-sm"
            onClick={reset}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 30 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-4 sm:inset-auto sm:top-[8%] sm:left-1/2 sm:-translate-x-1/2 z-[201] sm:w-full sm:max-w-lg max-h-[90vh] overflow-y-auto"
          >
            <div className="glass-panel border-glass-border shadow-[0_24px_80px_rgba(0,0,0,0.5)] p-6 sm:p-8">
              {/* Close Button */}
              <button onClick={reset} className="absolute top-4 right-4 text-text-dim hover:text-text-secondary transition">
                <X className="w-5 h-5" />
              </button>

              {!submitted ? (
                <>
                  {/* Header */}
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan to-purple flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-text-primary">Schedule a Demo</h3>
                      <p className="text-xs text-text-muted">See LoRRI's autonomous agents in action on your data</p>
                    </div>
                  </div>

                  {/* Form */}
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-[11px] text-text-dim uppercase tracking-wider font-medium mb-1 block">Full Name *</label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-dim" />
                          <input
                            required value={form.name} onChange={(e) => update('name', e.target.value)}
                            placeholder="Rajesh Kumar"
                            className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-glass border border-glass-border text-sm text-text-primary placeholder:text-text-dim focus:outline-none focus:border-cyan/30 transition"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="text-[11px] text-text-dim uppercase tracking-wider font-medium mb-1 block">Work Email *</label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-dim" />
                          <input
                            type="email" required value={form.email} onChange={(e) => update('email', e.target.value)}
                            placeholder="rajesh@company.com"
                            className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-glass border border-glass-border text-sm text-text-primary placeholder:text-text-dim focus:outline-none focus:border-cyan/30 transition"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-[11px] text-text-dim uppercase tracking-wider font-medium mb-1 block">Company *</label>
                        <div className="relative">
                          <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-dim" />
                          <input
                            required value={form.company} onChange={(e) => update('company', e.target.value)}
                            placeholder="Acme Logistics Pvt. Ltd."
                            className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-glass border border-glass-border text-sm text-text-primary placeholder:text-text-dim focus:outline-none focus:border-cyan/30 transition"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="text-[11px] text-text-dim uppercase tracking-wider font-medium mb-1 block">Phone</label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-dim" />
                          <input
                            value={form.phone} onChange={(e) => update('phone', e.target.value)}
                            placeholder="+91 98765 43210"
                            className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-glass border border-glass-border text-sm text-text-primary placeholder:text-text-dim focus:outline-none focus:border-cyan/30 transition"
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="text-[11px] text-text-dim uppercase tracking-wider font-medium mb-1 block">Annual Freight Spend</label>
                      <select
                        value={form.spend} onChange={(e) => update('spend', e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl bg-glass border border-glass-border text-sm text-text-primary focus:outline-none focus:border-cyan/30 transition appearance-none"
                      >
                        <option value="">Select range</option>
                        <option value="<10cr">Less than ₹10 Cr</option>
                        <option value="10-50cr">₹10 – 50 Cr</option>
                        <option value="50-200cr">₹50 – 200 Cr</option>
                        <option value="200-500cr">₹200 – 500 Cr</option>
                        <option value="500cr+">₹500 Cr+</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[11px] text-text-dim uppercase tracking-wider font-medium mb-1 block">What would you like to see?</label>
                      <textarea
                        value={form.message} onChange={(e) => update('message', e.target.value)}
                        placeholder="E.g., procurement automation for our top 50 lanes, sustainability reporting..."
                        rows={3}
                        className="w-full px-3 py-2.5 rounded-xl bg-glass border border-glass-border text-sm text-text-primary placeholder:text-text-dim focus:outline-none focus:border-cyan/30 resize-none transition"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={sending}
                      className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-cyan to-purple text-white font-semibold text-sm hover:shadow-[0_0_40px_rgba(0,240,255,0.2)] transition disabled:opacity-50"
                    >
                      {sending ? (
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <Send className="w-4 h-4" />
                      )}
                      {sending ? 'Submitting...' : 'Request Demo'}
                    </button>

                    <p className="text-[10px] text-text-dim text-center">
                      Or email <a href="mailto:lorri@logisticsnow.in" className="text-cyan hover:underline">lorri@logisticsnow.in</a> · Call <a href="tel:+919867773508" className="text-cyan hover:underline">+91-9867773508</a>
                    </p>
                  </form>
                </>
              ) : (
                /* Success State */
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-8"
                >
                  <CheckCircle className="w-14 h-14 text-green mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-text-primary mb-2">Demo Requested!</h3>
                  <p className="text-sm text-text-secondary mb-1">Thank you, {form.name}.</p>
                  <p className="text-xs text-text-muted mb-6">
                    Our team will reach out within 24 hours to schedule a personalized walkthrough of LoRRI for <strong className="text-text-primary">{form.company}</strong>.
                  </p>
                  <button
                    onClick={reset}
                    className="px-6 py-2.5 rounded-xl border border-glass-border text-sm text-text-secondary hover:text-text-primary hover:border-glass-highlight transition"
                  >
                    Close
                  </button>
                </motion.div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
