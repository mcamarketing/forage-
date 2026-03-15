'use client';

import { motion } from 'framer-motion';
import { Banknote, Puzzle, Lock } from 'lucide-react';

const problems = [
  {
    icon: Banknote,
    title: 'The Cost Problem',
    description: "Clay starts at £800/month before you've run a single workflow. Apollo charges £0.05 per lead before enrichment. You're spending more on data infrastructure than on the product you're building.",
    stat: '£800+',
    statLabel: '/month wasted',
  },
  {
    icon: Puzzle,
    title: 'The Complexity Problem',
    description: "Your agent knows what it needs. But it doesn't know which tool to call, in what order, with which parameters. So you spend a week engineering a 5-tool chain that breaks every time a schema changes.",
    stat: '5+',
    statLabel: 'tools to chain',
  },
  {
    icon: Lock,
    title: 'The Lock-in Problem',
    description: "Clay is Clay. Apollo is Apollo. They don't work inside Claude Desktop. They don't work in your n8n workflow. They don't work in your custom agent loop.",
    stat: '0',
    statLabel: 'integrations',
  },
];

export function ProblemSection() {
  return (
    <section className="section" style={{ background: 'var(--background-secondary)' }}>
      {/* Background accent */}
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 800,
        height: 400,
        background: 'radial-gradient(ellipse, rgba(139, 92, 246, 0.08) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <div className="container" style={{ position: 'relative' }}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
          style={{ maxWidth: 640, marginBottom: 64 }}
        >
          <h2 style={{
            fontSize: 'clamp(32px, 4vw, 48px)',
            fontWeight: 600,
            letterSpacing: '-0.03em',
            color: 'var(--foreground)',
            lineHeight: 1.1,
            margin: 0,
          }}>
            You're paying{' '}
            <span style={{ color: 'var(--error)' }}>Clay £800/month</span>
            {' '}to do what an agent should do for 90% less.
          </h2>
        </motion.div>

        {/* Cards Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: 24,
        }}>
          {problems.map((problem, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="card"
              style={{
                padding: 32,
                display: 'flex',
                flexDirection: 'column',
                gap: 20,
              }}
            >
              {/* Icon */}
              <div style={{
                width: 48,
                height: 48,
                borderRadius: 12,
                background: 'var(--glass)',
                border: '1px solid var(--border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <problem.icon size={22} style={{ color: 'var(--accent-light)' }} />
              </div>

              {/* Title */}
              <h3 style={{
                fontSize: 20,
                fontWeight: 600,
                color: 'var(--foreground)',
                margin: 0,
                letterSpacing: '-0.02em',
              }}>
                {problem.title}
              </h3>

              {/* Description */}
              <p style={{
                fontSize: 15,
                lineHeight: 1.7,
                color: 'var(--foreground-secondary)',
                margin: 0,
                flex: 1,
              }}>
                {problem.description}
              </p>

              {/* Stat */}
              <div style={{
                paddingTop: 20,
                borderTop: '1px solid var(--border)',
                display: 'flex',
                alignItems: 'baseline',
                gap: 8,
              }}>
                <span style={{
                  fontSize: 32,
                  fontWeight: 700,
                  color: 'var(--error)',
                  letterSpacing: '-0.03em',
                }}>
                  {problem.stat}
                </span>
                <span style={{
                  fontSize: 14,
                  color: 'var(--foreground-tertiary)',
                }}>
                  {problem.statLabel}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
