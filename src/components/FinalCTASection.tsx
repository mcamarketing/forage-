'use client';

import { motion } from 'framer-motion';
import { Github, Twitter } from 'lucide-react';
import { SignupForm } from './SignupForm';

function scrollTo(id: string) {
  const el = document.querySelector(id);
  if (el) {
    const top = el.getBoundingClientRect().top + window.pageYOffset - 80;
    window.scrollTo({ top, behavior: 'smooth' });
  }
}

export function FinalCTASection() {
  return (
    <section id="signup" className="section" style={{
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Grid pattern */}
      <div className="grid-pattern" style={{ position: 'absolute', inset: 0, opacity: 0.4 }} />

      {/* Gradient orbs */}
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 800,
        height: 400,
        background: 'radial-gradient(ellipse, rgba(139, 92, 246, 0.2) 0%, transparent 70%)',
        filter: 'blur(60px)',
        pointerEvents: 'none',
      }} />

      <div style={{
        position: 'absolute',
        top: '30%',
        right: '10%',
        width: 300,
        height: 300,
        background: 'radial-gradient(circle, rgba(34, 211, 238, 0.15) 0%, transparent 70%)',
        filter: 'blur(40px)',
        pointerEvents: 'none',
      }} />

      <div className="container" style={{
        position: 'relative',
        textAlign: 'center',
        maxWidth: 720,
      }}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          {/* Headline */}
          <h2 style={{
            fontSize: 'clamp(36px, 5vw, 56px)',
            fontWeight: 600,
            letterSpacing: '-0.035em',
            lineHeight: 1.1,
            margin: '0 0 20px',
            background: 'linear-gradient(180deg, var(--foreground) 0%, var(--foreground-secondary) 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}>
            Your agent is one tool call
            <br />
            away from being{' '}
            <span style={{
              background: 'linear-gradient(135deg, var(--accent) 0%, var(--cyan) 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>
              smarter
            </span>
          </h2>

          {/* Subheadline */}
          <p style={{
            fontSize: 18,
            lineHeight: 1.6,
            color: 'var(--foreground-secondary)',
            margin: '0 0 40px',
          }}>
            The free trial includes $1.00 of credit — enough for ~30 web searches or 2 Company Dossiers.
            <br />
            No credit card. No commitment.
          </p>

          {/* Signup Form */}
          <SignupForm />

          {/* Secondary links */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: 32,
            flexWrap: 'wrap',
            marginTop: 32,
          }}>
            {[
              { label: 'Read the docs', href: '#docs' },
              { label: 'See all Skills', href: '#skills' },
              { label: 'Talk to a human', href: 'mailto:hello@forage.dev', external: true },
            ].map((link) => (
              link.external ? (
                <a
                  key={link.label}
                  href={link.href}
                  style={{
                    fontSize: 14,
                    color: 'var(--foreground-tertiary)',
                    textDecoration: 'none',
                    transition: 'color 0.2s',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.color = 'var(--foreground)'}
                  onMouseLeave={(e) => e.currentTarget.style.color = 'var(--foreground-tertiary)'}
                >
                  {link.label}
                </a>
              ) : (
                <button
                  key={link.label}
                  onClick={() => scrollTo(link.href)}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: 14,
                    color: 'var(--foreground-tertiary)',
                    padding: 0,
                    transition: 'color 0.2s',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.color = 'var(--foreground)'}
                  onMouseLeave={(e) => e.currentTarget.style.color = 'var(--foreground-tertiary)'}
                >
                  {link.label}
                </button>
              )
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

const footerLinks = [
  { label: 'Docs', href: '#docs' },
  { label: 'Skills', href: '#skills' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'Blog', href: '#blog' },
  { label: 'Status', href: '#status' },
  { label: 'Privacy', href: '#privacy' },
  { label: 'Terms', href: '#terms' },
];

export function Footer() {
  return (
    <footer style={{
      background: 'var(--background-secondary)',
      borderTop: '1px solid var(--border)',
      padding: '48px 0',
    }}>
      <div className="container">
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          gap: 32,
          marginBottom: 32,
        }}>
          {/* Brand */}
          <div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              marginBottom: 8,
            }}>
              <img
                src="/logo.svg"
                alt="Forage"
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 7,
                }}
              />
              <span style={{
                fontSize: 16,
                fontWeight: 600,
                color: 'var(--foreground)',
              }}>
                Forage
              </span>
            </div>
            <p style={{
              fontSize: 13,
              color: 'var(--foreground-tertiary)',
              margin: 0,
              maxWidth: 240,
            }}>
              Data and intelligence layer for AI agents
            </p>
          </div>

          {/* Links */}
          <nav style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '8px 24px',
          }}>
            {footerLinks.map((link) => (
              <button
                key={link.href}
                onClick={() => scrollTo(link.href)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 0,
                  fontSize: 13,
                  color: 'var(--foreground-tertiary)',
                  transition: 'color 0.2s',
                }}
                onMouseEnter={(e) => e.currentTarget.style.color = 'var(--foreground)'}
                onMouseLeave={(e) => e.currentTarget.style.color = 'var(--foreground-tertiary)'}
              >
                {link.label}
              </button>
            ))}
          </nav>

          {/* Social */}
          <div style={{ display: 'flex', gap: 12 }}>
            <a
              href="https://github.com/forage"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                width: 36,
                height: 36,
                borderRadius: 8,
                background: 'var(--glass)',
                border: '1px solid var(--border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--foreground-tertiary)',
                transition: 'all 0.2s',
              }}
            >
              <Github size={16} />
            </a>
            <a
              href="https://twitter.com/forage"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                width: 36,
                height: 36,
                borderRadius: 8,
                background: 'var(--glass)',
                border: '1px solid var(--border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--foreground-tertiary)',
                transition: 'all 0.2s',
              }}
            >
              <Twitter size={16} />
            </a>
          </div>
        </div>

        {/* Bottom */}
        <div style={{
          paddingTop: 24,
          borderTop: '1px solid var(--border)',
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 16,
        }}>
          <p style={{
            fontSize: 12,
            color: 'var(--foreground-muted)',
            margin: 0,
          }}>
            A product of <span style={{ color: 'var(--foreground-tertiary)', fontWeight: 500 }}>Ernesta Labs</span>
          </p>
          <p style={{
            fontSize: 12,
            color: 'var(--foreground-muted)',
            margin: 0,
          }}>
            © 2025 Ernesta Labs Ltd
          </p>
        </div>
      </div>
    </footer>
  );
}
