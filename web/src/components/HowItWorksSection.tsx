'use client';

import { motion } from 'framer-motion';

const steps = [
  {
    n: '01',
    title: 'Add to your agent',
    lang: 'bash',
    code: `# Claude Desktop — edit claude_desktop_config.json
{
  "mcpServers": {
    "forage": {
      "command": "npx forage-mcp"
    }
  }
}

# n8n — install from registry
# Search "Forage" in the node panel

# Direct API
npm install forage-client`,
  },
  {
    n: '02',
    title: 'Call tools or trigger Skills',
    lang: 'typescript',
    code: `// Individual tool — full control
const leads = await forage.find_leads({
  job_title: "CTO",
  location: "London",
  industry: "SaaS",
  num_leads: 100
});

// Pre-built Skill — one call, complete outcome
const dossier = await forage.trigger_skill(
  "Company Dossier",
  { domain: "stripe.com" }
);`,
  },
  {
    n: '03',
    title: 'Pay only for what you used',
    text: "No invoice. No monthly commitment. Credits deplete per call. Top up when you want. Cancel anytime — there's nothing to cancel.",
  },
];

function CodeBlock({ code, lang }: { code: string; lang: string }) {
  return (
    <div className="code-block" style={{ marginTop: 20 }}>
      <div className="code-block-header">
        <div className="code-block-dots">
          <div className="code-block-dot" style={{ background: '#ff5f57' }} />
          <div className="code-block-dot" style={{ background: '#febc2e' }} />
          <div className="code-block-dot" style={{ background: '#28c840' }} />
        </div>
        <span style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 11,
          color: 'var(--foreground-muted)',
          marginLeft: 8,
        }}>
          {lang}
        </span>
      </div>
      <div className="code-block-content">
        <pre style={{
          margin: 0,
          fontFamily: 'var(--font-mono)',
          fontSize: 12,
          lineHeight: 1.7,
          color: 'var(--foreground-secondary)',
          whiteSpace: 'pre-wrap',
        }}>
          <code>{code}</code>
        </pre>
      </div>
    </div>
  );
}

export function HowItWorksSection() {
  return (
    <section id="setup" className="section" style={{ position: 'relative' }}>
      {/* Grid pattern */}
      <div className="grid-pattern" style={{ position: 'absolute', inset: 0, opacity: 0.3 }} />

      <div className="container" style={{ position: 'relative' }}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
          style={{ marginBottom: 64 }}
        >
          <p className="section-label">Setup</p>
          <h2 className="section-title" style={{ textAlign: 'left', maxWidth: 640 }}>
            Your agent is using Forage
            <br />
            in 60 seconds.
          </h2>
        </motion.div>

        {/* Steps */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: 32,
        }}>
          {steps.map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              {/* Step number */}
              <div style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 12,
                color: 'var(--accent)',
                letterSpacing: '0.1em',
                marginBottom: 12,
              }}>
                {step.n}
              </div>

              {/* Title */}
              <h3 style={{
                fontSize: 22,
                fontWeight: 600,
                color: 'var(--foreground)',
                margin: 0,
                letterSpacing: '-0.02em',
              }}>
                {step.title}
              </h3>

              {step.code ? (
                <CodeBlock code={step.code} lang={step.lang!} />
              ) : (
                <div className="card" style={{
                  marginTop: 20,
                  padding: 24,
                }}>
                  <p style={{
                    fontSize: 14,
                    lineHeight: 1.75,
                    color: 'var(--foreground-secondary)',
                    margin: '0 0 24px',
                  }}>
                    {step.text}
                  </p>

                  {/* Usage estimates */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {[
                      { label: 'Occasional use', value: '~£5/month' },
                      { label: 'Growth team', value: '~£40/month' },
                      { label: 'Agency workflows', value: '~£120/month' },
                    ].map((r) => (
                      <div
                        key={r.label}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          padding: '8px 12px',
                          borderRadius: 8,
                          background: 'var(--glass)',
                        }}
                      >
                        <span style={{ fontSize: 13, color: 'var(--foreground-secondary)' }}>
                          {r.label}
                        </span>
                        <span style={{
                          fontFamily: 'var(--font-mono)',
                          fontSize: 13,
                          fontWeight: 600,
                          color: 'var(--success)',
                        }}>
                          {r.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
