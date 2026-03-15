'use client';

import { motion } from 'framer-motion';
import { Shield, Unlock } from 'lucide-react';

export function GuaranteeSection() {
  return (
    <section className="section" style={{ background: 'var(--background-secondary)' }}>
      <div className="container" style={{ maxWidth: 800 }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
        >
          {/* Shield icon */}
          <div style={{
            width: 56,
            height: 56,
            borderRadius: 14,
            background: 'var(--success-dim)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 28,
          }}>
            <Shield size={24} style={{ color: 'var(--success)' }} />
          </div>

          {/* Headline */}
          <h2 style={{
            fontSize: 'clamp(28px, 4vw, 40px)',
            fontWeight: 600,
            letterSpacing: '-0.03em',
            color: 'var(--foreground)',
            lineHeight: 1.15,
            margin: '0 0 20px',
          }}>
            If your first 500 leads cost more than £2, we refund the difference.
          </h2>

          {/* Description */}
          <p style={{
            fontSize: 16,
            lineHeight: 1.75,
            color: 'var(--foreground-secondary)',
            margin: '0 0 40px',
            maxWidth: 600,
          }}>
            At £0.0025 per lead, 500 leads should cost £1.25. If our pricing ever fails
            that promise, we send money back. No questions. No support ticket. Automatic.
          </p>

          {/* No lock-in box */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="card"
            style={{
              padding: 28,
              display: 'flex',
              alignItems: 'flex-start',
              gap: 20,
            }}
          >
            <div style={{
              width: 44,
              height: 44,
              borderRadius: 11,
              background: 'var(--glass)',
              border: '1px solid var(--border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}>
              <Unlock size={20} style={{ color: 'var(--foreground-tertiary)' }} />
            </div>
            <div>
              <h3 style={{
                fontSize: 18,
                fontWeight: 600,
                color: 'var(--foreground)',
                margin: '0 0 8px',
                letterSpacing: '-0.02em',
              }}>
                No lock-in guarantee
              </h3>
              <p style={{
                fontSize: 14,
                color: 'var(--foreground-secondary)',
                margin: 0,
                lineHeight: 1.65,
              }}>
                If you stop using Forage, your unused credits never expire. There is nothing
                to cancel. There is no contract. You either find value or you don&apos;t spend.
              </p>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
