'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Minus } from 'lucide-react';

const faqs = [
  {
    q: 'Is this just a wrapper on Apify?',
    a: "Forage uses Apify's infrastructure as one of its compute layers, the same way every modern SaaS uses AWS. What you're buying is the curated tool layer, the pre-built Skills, the Knowledge Graph, the normalised output schemas, and the native integrations with Claude and n8n that don't exist anywhere else.",
  },
  {
    q: 'What happens if an underlying actor changes its schema?',
    a: 'Nothing on your end. We absorb all schema changes. Your tool calls and Skill triggers use our normalised API — we map to whatever the actor returns internally. You never touch actor schemas directly.',
  },
  {
    q: 'Is my data stored or shared?',
    a: 'Tool outputs feed the shared Knowledge Graph in anonymised, aggregated form. Personal data (emails, phone numbers) is stored only as one-way hashed identifiers for graph linkage — never in raw form. Company data, industries, technologies, and relationships are stored and shared across users — this is what makes the graph valuable. Full data policy at forage.dev/privacy.',
  },
  {
    q: "Can I use this if I'm not a developer?",
    a: "If you use n8n, yes — the node is drag-and-drop. If you use Claude Desktop, yes — add the MCP server in one config change. If you're building from scratch, you'll need basic API knowledge.",
  },
  {
    q: 'How is this different from just calling Apify directly?',
    a: 'Direct Apify access gives you raw actor output with inconsistent schemas, no Skills, no Knowledge Graph, no n8n node, and no MCP server. Forage is the curated, normalised, intelligence layer on top.',
  },
  {
    q: 'What are Skills exactly?',
    a: "Skills are pre-built workflows wrapped in a single trigger. Instead of chaining 5 tools yourself, you call one Skill and get a complete structured result. Think of tools as ingredients and Skills as dishes — we've done the cooking.",
  },
];

function FaqItem({ q, a, isLast }: { q: string; a: string; isLast: boolean }) {
  const [open, setOpen] = useState(false);

  return (
    <div style={{ borderBottom: isLast ? 'none' : '1px solid var(--border)' }}>
      <button
        onClick={() => setOpen((o) => !o)}
        style={{
          width: '100%',
          padding: '20px 0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          gap: 20,
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          textAlign: 'left',
        }}
      >
        <span style={{
          fontSize: 15,
          fontWeight: 500,
          color: 'var(--foreground)',
          lineHeight: 1.4,
        }}>
          {q}
        </span>
        <span style={{
          flexShrink: 0,
          color: open ? 'var(--accent)' : 'var(--foreground-tertiary)',
          marginTop: 2,
          transition: 'color 0.2s',
        }}>
          {open ? <Minus size={18} /> : <Plus size={18} />}
        </span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
            style={{ overflow: 'hidden' }}
          >
            <p style={{
              fontSize: 14,
              lineHeight: 1.75,
              color: 'var(--foreground-secondary)',
              paddingBottom: 20,
              margin: 0,
            }}>
              {a}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function FAQSection() {
  return (
    <section className="section" style={{ position: 'relative' }}>
      {/* Grid pattern */}
      <div className="grid-pattern" style={{ position: 'absolute', inset: 0, opacity: 0.3 }} />

      <div className="container" style={{ maxWidth: 720, position: 'relative' }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
        >
          <p className="section-label">FAQ</p>
          <h2 className="section-title" style={{ textAlign: 'left', marginBottom: 48 }}>
            Frequently asked questions
          </h2>

          <div className="card" style={{ padding: '0 28px' }}>
            {faqs.map((f, i) => (
              <FaqItem key={i} q={f.q} a={f.a} isLast={i === faqs.length - 1} />
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
