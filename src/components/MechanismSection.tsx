'use client';

import { motion } from 'framer-motion';
import { Plug, Layers, Brain, Zap } from 'lucide-react';

const pillars = [
  {
    icon: Plug,
    title: 'Works Where You Work',
    description: 'MCP server for Claude and any MCP client. Native n8n node. Apify actor for direct API access. Add one tool, not a new stack.',
    highlight: 'Claude · n8n · GPT',
  },
  {
    icon: Layers,
    title: 'Primitives or Skills',
    description: 'Call individual tools when you need control. Trigger a pre-built Skill when you need speed. Your agent decides.',
    highlight: 'One platform, both modes',
  },
  {
    icon: Brain,
    title: 'Learns From Every Call',
    description: 'Every query feeds the Knowledge Graph. Ask "What do we know about fintech in Berlin?" and get instant answers from accumulated intelligence.',
    highlight: 'No API call, no cost',
  },
];

export function MechanismSection() {
  return (
    <section id="how-it-works" className="section" style={{ position: 'relative' }}>
      {/* Grid pattern */}
      <div className="grid-pattern" style={{ position: 'absolute', inset: 0, opacity: 0.3 }} />

      {/* Gradient orbs */}
      <div style={{
        position: 'absolute',
        top: 0,
        right: 0,
        width: 500,
        height: 500,
        background: 'radial-gradient(circle, rgba(34, 211, 238, 0.1) 0%, transparent 70%)',
        filter: 'blur(60px)',
        pointerEvents: 'none',
      }} />

      <div className="container" style={{ position: 'relative' }}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
          className="section-header"
        >
          <p className="section-label">The Mechanism</p>
          <h2 className="section-title">
            One tool call. Every data source
            <br />
            your agent needs.
          </h2>
        </motion.div>

        {/* Pillars Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: 32,
        }}>
          {pillars.map((pillar, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              style={{
                padding: 32,
                borderRadius: 16,
                background: 'var(--glass)',
                border: '1px solid var(--border)',
                transition: 'all 0.3s',
              }}
              whileHover={{
                borderColor: 'var(--border-hover)',
                y: -4,
              }}
            >
              {/* Icon with glow */}
              <motion.div
                whileHover={{ scale: 1.05 }}
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 14,
                  background: 'linear-gradient(135deg, var(--accent-dim) 0%, var(--cyan-dim) 100%)',
                  border: '1px solid var(--border)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 24,
                }}
              >
                <pillar.icon size={24} style={{ color: 'var(--accent-light)' }} />
              </motion.div>

              {/* Title */}
              <h3 style={{
                fontSize: 20,
                fontWeight: 600,
                color: 'var(--foreground)',
                margin: '0 0 12px',
                letterSpacing: '-0.02em',
              }}>
                {pillar.title}
              </h3>

              {/* Description */}
              <p style={{
                fontSize: 15,
                lineHeight: 1.7,
                color: 'var(--foreground-secondary)',
                margin: '0 0 20px',
              }}>
                {pillar.description}
              </p>

              {/* Highlight badge */}
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '6px 12px',
                borderRadius: 8,
                background: 'var(--background)',
                border: '1px solid var(--border)',
              }}>
                <Zap size={12} style={{ color: 'var(--accent)' }} />
                <span style={{
                  fontSize: 12,
                  fontWeight: 500,
                  color: 'var(--foreground-tertiary)',
                }}>
                  {pillar.highlight}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
