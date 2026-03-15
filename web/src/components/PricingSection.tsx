'use client';

import { motion } from 'framer-motion';
import { Check, X, ArrowRight } from 'lucide-react';

const rows = [
  { feature: 'Monthly minimum', clay: '£800', apollo: '£99', hunter: '£49', forage: '£0', highlight: true },
  { feature: 'Cost per lead', clay: '–', apollo: '£0.05+', hunter: '–', forage: '£0.0025', highlight: true },
  { feature: 'Works in Claude', clay: false, apollo: false, hunter: false, forage: true },
  { feature: 'Works in n8n', clay: false, apollo: false, hunter: false, forage: true },
  { feature: 'Pre-built Skills', clay: false, apollo: false, hunter: false, forage: true },
  { feature: 'Knowledge graph', clay: false, apollo: false, hunter: false, forage: true },
  { feature: 'Pay as you go', clay: false, apollo: false, hunter: false, forage: true },
];

const estimates = [
  { persona: 'Indie Developer', usage: '50 lookups + 200 leads + 5 searches', cost: '£4–8', color: 'var(--cyan)' },
  { persona: 'Growth Team', usage: '500 leads + 30 dossiers + 10 Skills', cost: '£25–45', color: 'var(--accent)' },
  { persona: 'Agency', usage: '5,000 leads + skill rentals + enrichments', cost: '£80–140', color: 'var(--success)' },
];

function Cell({ value }: { value: boolean | string }) {
  if (typeof value === 'boolean') {
    return value ? (
      <Check size={18} style={{ color: 'var(--success)' }} />
    ) : (
      <X size={16} style={{ color: 'var(--foreground-muted)' }} />
    );
  }
  return <span>{value}</span>;
}

export function PricingSection() {
  const scrollTo = (id: string) => {
    const el = document.querySelector(id);
    if (el) {
      const top = el.getBoundingClientRect().top + window.pageYOffset - 80;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  };

  return (
    <section id="pricing" className="section" style={{ background: 'var(--background-secondary)' }}>
      <div className="container">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
          className="section-header"
        >
          <p className="section-label">Pricing</p>
          <h2 className="section-title">
            The most honest pricing in B2B data
          </h2>
          <p className="section-subtitle">
            No subscriptions. No seat fees. Pay only for what you use.
          </p>
        </motion.div>

        {/* Comparison Table */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          style={{
            background: 'var(--background)',
            border: '1px solid var(--border)',
            borderRadius: 16,
            overflow: 'hidden',
            marginBottom: 48,
          }}
        >
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 640 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th style={{
                    padding: '16px 24px',
                    textAlign: 'left',
                    fontSize: 12,
                    fontWeight: 600,
                    color: 'var(--foreground-tertiary)',
                    letterSpacing: '0.05em',
                    textTransform: 'uppercase',
                  }}>
                    Feature
                  </th>
                  {['Clay', 'Apollo', 'Hunter'].map(h => (
                    <th key={h} style={{
                      padding: '16px 20px',
                      textAlign: 'center',
                      fontSize: 13,
                      fontWeight: 500,
                      color: 'var(--foreground-tertiary)',
                    }}>
                      {h}
                    </th>
                  ))}
                  <th style={{
                    padding: '16px 24px',
                    textAlign: 'center',
                    fontSize: 14,
                    fontWeight: 600,
                    color: 'var(--accent)',
                    background: 'var(--accent-dim)',
                  }}>
                    Forage
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, i) => (
                  <tr
                    key={i}
                    style={{
                      borderBottom: i < rows.length - 1 ? '1px solid var(--border)' : 'none',
                    }}
                  >
                    <td style={{
                      padding: '16px 24px',
                      fontSize: 14,
                      color: 'var(--foreground)',
                      fontWeight: 500,
                    }}>
                      {row.feature}
                    </td>
                    {[row.clay, row.apollo, row.hunter].map((v, j) => (
                      <td key={j} style={{
                        padding: '16px 20px',
                        textAlign: 'center',
                        fontSize: 14,
                        color: 'var(--foreground-tertiary)',
                      }}>
                        <Cell value={v as boolean | string} />
                      </td>
                    ))}
                    <td style={{
                      padding: '16px 24px',
                      textAlign: 'center',
                      fontWeight: row.highlight ? 700 : 500,
                      fontSize: 14,
                      color: row.highlight ? 'var(--success)' : 'var(--foreground)',
                      background: 'var(--accent-dim)',
                    }}>
                      <Cell value={row.forage as boolean | string} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Usage Estimates */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: 20,
        }}>
          {estimates.map((e, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="card"
              style={{ padding: 28 }}
            >
              <div style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 11,
                letterSpacing: '0.08em',
                color: e.color,
                textTransform: 'uppercase',
                marginBottom: 8,
              }}>
                {e.persona}
              </div>
              <div style={{
                fontSize: 14,
                color: 'var(--foreground-secondary)',
                marginBottom: 20,
                lineHeight: 1.5,
              }}>
                {e.usage}
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                <span style={{
                  fontSize: 36,
                  fontWeight: 700,
                  letterSpacing: '-0.03em',
                  color: e.color,
                }}>
                  {e.cost}
                </span>
                <span style={{
                  fontSize: 14,
                  color: 'var(--foreground-tertiary)',
                }}>
                  /month
                </span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          style={{
            marginTop: 48,
            textAlign: 'center',
          }}
        >
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => scrollTo('#signup')}
            className="btn btn-primary"
            style={{ padding: '16px 32px', fontSize: 16, fontWeight: 600 }}
          >
            Start Free — No Credit Card
            <ArrowRight size={18} />
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
}
