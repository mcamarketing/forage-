'use client';

import { motion } from 'framer-motion';
import { ArrowRight, Check } from 'lucide-react';

const rows = [
  { feature: 'Web search (SerpAPI-powered, normalised output)', market: '£30/mo direct' },
  { feature: 'Page scraping (Jina AI + direct fallback)', market: '£40/mo direct' },
  { feature: 'B2B lead finder (verified, £0.0025/lead)', market: '£150/mo via Apollo' },
  { feature: 'Email lookup by domain (Hunter-powered)', market: '£49/mo direct' },
  { feature: 'Local business discovery (Google Maps)', market: '£50/mo via APIs' },
  { feature: 'Company intelligence (website + email patterns)', market: '£80/mo via ZoomInfo' },
  { feature: 'Universal actor access (3,000+ Apify tools)', market: '£200/mo via Apify Pro' },
  { feature: 'Knowledge graph intelligence (proprietary)', market: 'Not available' },
  { feature: '7 pre-built Skills (Dossier, Prospect, Market Map…)', market: '£300/mo via Clay' },
  { feature: 'Works in Claude, n8n, GPT — no extra setup', market: 'Priceless' },
];

export function ValueStackSection() {
  const scrollTo = (id: string) => {
    const el = document.querySelector(id);
    if (el) {
      const top = el.getBoundingClientRect().top + window.pageYOffset - 80;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  };

  return (
    <section className="section" style={{ background: 'var(--background-secondary)' }}>
      <div className="container">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
          style={{ marginBottom: 48 }}
        >
          <p className="section-label">Value</p>
          <h2 className="section-title" style={{ textAlign: 'left', maxWidth: 640 }}>
            Everything your agent needs to interact with the real world.
          </h2>
        </motion.div>

        {/* Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          style={{
            background: 'var(--background)',
            border: '1px solid var(--border)',
            borderRadius: 16,
            overflow: 'hidden',
            marginBottom: 32,
          }}
        >
          {rows.map((row, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: i * 0.03 }}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '16px 24px',
                borderBottom: i < rows.length - 1 ? '1px solid var(--border)' : 'none',
                gap: 20,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <Check size={16} style={{ color: 'var(--success)', flexShrink: 0 }} />
                <span style={{
                  fontSize: 14,
                  color: 'var(--foreground)',
                  lineHeight: 1.4,
                }}>
                  {row.feature}
                </span>
              </div>
              <span style={{
                fontSize: 13,
                color: 'var(--foreground-tertiary)',
                whiteSpace: 'nowrap',
                flexShrink: 0,
              }}>
                {row.market}
              </span>
            </motion.div>
          ))}

          {/* Total row */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '20px 24px',
            background: 'linear-gradient(135deg, var(--accent-dim) 0%, var(--cyan-dim) 100%)',
            borderTop: '1px solid var(--border)',
          }}>
            <span style={{
              fontSize: 16,
              fontWeight: 600,
              color: 'var(--foreground)',
            }}>
              Total standalone value
            </span>
            <span style={{
              fontSize: 24,
              fontWeight: 700,
              color: 'var(--accent)',
              letterSpacing: '-0.02em',
            }}>
              £899+/month
            </span>
          </div>
        </motion.div>

        {/* CTA callout */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="card"
          style={{
            padding: '32px 40px',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 24,
          }}
        >
          <div>
            <p style={{
              fontSize: 18,
              fontWeight: 600,
              color: 'var(--foreground)',
              margin: '0 0 4px',
            }}>
              With Forage: pay only for what you use.
            </p>
            <p style={{
              fontSize: 14,
              color: 'var(--foreground-secondary)',
              margin: 0,
            }}>
              Most users spend £15–60/month. Some spend £200. Nobody pays £899.
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => scrollTo('#signup')}
            className="btn btn-primary"
          >
            Start Free — Lock In Beta Pricing
            <ArrowRight size={16} />
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
}
