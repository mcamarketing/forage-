'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import { useEffect, useState, useRef } from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';

const TERMINAL_LINES = [
  { delay: 0, type: 'comment', text: '// Your agent needs data. One tool call.' },
  { delay: 500, type: 'keyword', text: 'const ', extra: 'result = ', extraType: 'variable' },
  { delay: 700, type: 'await', text: 'await ', extra: 'forage.', extraType: 'function' },
  { delay: 900, type: 'method', text: 'find_leads', extra: '({', extraType: 'bracket' },
  { delay: 1100, type: 'param', text: '  job_title: ', extra: '"VP of Engineering"', extraType: 'string' },
  { delay: 1300, type: 'param', text: '  location: ', extra: '"London"', extraType: 'string' },
  { delay: 1500, type: 'param', text: '  num_leads: ', extra: '100', extraType: 'number' },
  { delay: 1700, type: 'bracket', text: '});' },
  { delay: 2200, type: 'divider', text: '' },
  { delay: 2400, type: 'success', text: '✓ 100 verified leads returned' },
  { delay: 2700, type: 'success', text: '✓ 87 emails confirmed deliverable' },
  { delay: 3000, type: 'success', text: '✓ Knowledge graph enriched' },
  { delay: 3300, type: 'metric', text: '→ Cost: £0.25  ·  Time: 3.8s' },
];

function Terminal() {
  const [visibleLines, setVisibleLines] = useState<number[]>([]);
  const [cursor, setCursor] = useState(true);

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];
    TERMINAL_LINES.forEach((_, i) => {
      timers.push(setTimeout(() => setVisibleLines(v => [...v, i]), TERMINAL_LINES[i].delay));
    });
    const blink = setInterval(() => setCursor(c => !c), 530);
    return () => { timers.forEach(clearTimeout); clearInterval(blink); };
  }, []);

  const getColor = (type: string) => {
    switch (type) {
      case 'comment': return 'var(--foreground-muted)';
      case 'keyword': return 'var(--accent-light)';
      case 'variable': return 'var(--foreground)';
      case 'function': return 'var(--cyan)';
      case 'method': return 'var(--cyan)';
      case 'await': return 'var(--accent-light)';
      case 'bracket': return 'var(--foreground-tertiary)';
      case 'param': return 'var(--foreground-secondary)';
      case 'string': return 'var(--success)';
      case 'number': return '#f59e0b';
      case 'success': return 'var(--success)';
      case 'metric': return 'var(--accent-light)';
      default: return 'var(--foreground-secondary)';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.8, delay: 0.4, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
      className="code-block"
      style={{
        maxWidth: 520,
        width: '100%',
        boxShadow: '0 0 60px rgba(139, 92, 246, 0.15), 0 25px 50px -12px rgba(0, 0, 0, 0.5)',
      }}
    >
      {/* Window chrome */}
      <div className="code-block-header">
        <div className="code-block-dots">
          <div className="code-block-dot" style={{ background: '#ff5f57' }} />
          <div className="code-block-dot" style={{ background: '#febc2e' }} />
          <div className="code-block-dot" style={{ background: '#28c840' }} />
        </div>
        <span style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 12,
          color: 'var(--foreground-muted)',
          marginLeft: 8,
        }}>
          agent.ts
        </span>
      </div>

      {/* Code content */}
      <div className="code-block-content" style={{ minHeight: 280 }}>
        {TERMINAL_LINES.map((line, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -8 }}
            animate={visibleLines.includes(i) ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.2 }}
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 13,
              lineHeight: '1.8',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            {line.type === 'divider' ? (
              <div style={{
                height: 1,
                background: 'var(--border)',
                width: '100%',
                margin: '8px 0',
              }} />
            ) : (
              <>
                <span style={{ color: getColor(line.type) }}>{line.text}</span>
                {line.extra && (
                  <span style={{ color: getColor(line.extraType || 'default') }}>{line.extra}</span>
                )}
              </>
            )}
            {i === TERMINAL_LINES.length - 1 && visibleLines.includes(i) && (
              <span style={{
                display: 'inline-block',
                width: 2,
                height: 14,
                background: 'var(--accent)',
                marginLeft: 4,
                opacity: cursor ? 1 : 0,
                transition: 'opacity 0.1s',
              }} />
            )}
          </motion.div>
        ))}
        {visibleLines.length < TERMINAL_LINES.length && (
          <span style={{
            display: 'inline-block',
            width: 2,
            height: 14,
            background: 'var(--foreground-secondary)',
            opacity: cursor ? 1 : 0,
            transition: 'opacity 0.1s',
          }} />
        )}
      </div>
    </motion.div>
  );
}

const stagger = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.1 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] } },
};

export function HeroSection() {
  const containerRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start'],
  });

  const y = useTransform(scrollYProgress, [0, 1], [0, 150]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  const scrollTo = (id: string) => {
    const el = document.querySelector(id);
    if (el) {
      const top = el.getBoundingClientRect().top + window.pageYOffset - 80;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  };

  return (
    <section
      ref={containerRef}
      style={{
        minHeight: '100vh',
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        paddingTop: 80,
        paddingBottom: 80,
      }}
    >
      {/* Background grid pattern */}
      <div
        className="grid-pattern"
        style={{
          position: 'absolute',
          inset: 0,
          opacity: 0.5,
        }}
      />

      {/* Gradient orbs */}
      <motion.div
        style={{ y, opacity }}
        className="gradient-orb gradient-orb-purple"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.5 }}
      >
        <div style={{
          position: 'absolute',
          top: -200,
          right: '10%',
          width: 600,
          height: 600,
          background: 'radial-gradient(circle, rgba(139, 92, 246, 0.25) 0%, transparent 70%)',
          filter: 'blur(60px)',
        }} />
      </motion.div>

      <motion.div
        style={{ y: useTransform(scrollYProgress, [0, 1], [0, 100]) }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.5, delay: 0.3 }}
      >
        <div style={{
          position: 'absolute',
          bottom: -100,
          left: '5%',
          width: 400,
          height: 400,
          background: 'radial-gradient(circle, rgba(34, 211, 238, 0.15) 0%, transparent 70%)',
          filter: 'blur(60px)',
        }} />
      </motion.div>

      {/* Content */}
      <div className="container" style={{ position: 'relative', zIndex: 1 }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 480px), 1fr))',
          gap: 64,
          alignItems: 'center',
        }}>
          {/* Left column - Text */}
          <motion.div variants={stagger} initial="hidden" animate="visible">
            {/* Badge */}
            <motion.div variants={fadeUp}>
              <span
                className="badge badge-accent"
                style={{ marginBottom: 24 }}
              >
                <Sparkles size={14} />
                $1.00 free credit — Start building today
              </span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              variants={fadeUp}
              style={{
                fontSize: 'clamp(40px, 6vw, 64px)',
                fontWeight: 600,
                letterSpacing: '-0.035em',
                lineHeight: 1.05,
                margin: '0 0 20px',
                background: 'linear-gradient(180deg, var(--foreground) 0%, var(--foreground-secondary) 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              The data layer
              <br />
              your AI agents
              <br />
              <span style={{
                background: 'linear-gradient(135deg, var(--accent) 0%, var(--cyan) 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}>
                actually need
              </span>
            </motion.h1>

            {/* Subheadline */}
            <motion.p
              variants={fadeUp}
              style={{
                fontSize: 18,
                lineHeight: 1.6,
                color: 'var(--foreground-secondary)',
                margin: '0 0 32px',
                maxWidth: 460,
              }}
            >
              Stop paying Clay £800/month. Get the same leads, same quality,
              <span style={{ color: 'var(--success)', fontWeight: 500 }}> 95% cheaper</span>.
              Works in Claude, n8n, and any MCP client.
            </motion.p>

            {/* CTAs */}
            <motion.div variants={fadeUp} style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => scrollTo('#signup')}
                className="btn btn-primary"
                style={{ padding: '14px 28px', fontSize: 15, fontWeight: 600 }}
              >
                Start Free
                <ArrowRight size={16} />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => scrollTo('#how-it-works')}
                className="btn btn-secondary"
                style={{ padding: '14px 28px', fontSize: 15 }}
              >
                See How It Works
              </motion.button>
            </motion.div>

            {/* Trust signals */}
            <motion.div
              variants={fadeUp}
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
                marginTop: 40,
                paddingTop: 32,
                borderTop: '1px solid var(--border)',
              }}
            >
              {[
                '£0.0025/lead — 20× cheaper than Apollo',
                'Install in 60 seconds — Claude, n8n, GPT',
                '500+ AI builders already switched',
              ].map((text, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{
                    width: 6,
                    height: 6,
                    borderRadius: '50%',
                    background: 'var(--accent)',
                    boxShadow: '0 0 8px var(--accent-glow)',
                  }} />
                  <span style={{ fontSize: 14, color: 'var(--foreground-tertiary)' }}>{text}</span>
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* Right column - Terminal */}
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <Terminal />
          </div>
        </div>

        {/* Integration bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1 }}
          style={{
            marginTop: 80,
            paddingTop: 40,
            borderTop: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexWrap: 'wrap',
            gap: '24px 48px',
          }}
        >
          <span style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 11,
            color: 'var(--foreground-muted)',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
          }}>
            Works with
          </span>
          {['Claude Desktop', 'n8n', 'GPT-4', 'Apify', 'Any MCP Client'].map(name => (
            <span
              key={name}
              style={{
                fontSize: 14,
                fontWeight: 500,
                color: 'var(--foreground-tertiary)',
                transition: 'color 0.2s',
              }}
            >
              {name}
            </span>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
