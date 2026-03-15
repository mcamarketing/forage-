'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, ArrowRight } from 'lucide-react';

const navLinks = [
  { label: 'Features', href: '#how-it-works' },
  { label: 'Skills', href: '#skills' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'Docs', href: '#docs' },
];

function scrollTo(href: string, callback?: () => void) {
  const el = document.querySelector(href);
  if (el) {
    const top = el.getBoundingClientRect().top + window.pageYOffset - 80;
    window.scrollTo({ top, behavior: 'smooth' });
  }
  callback?.();
}

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  return (
    <>
      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          padding: scrolled ? '12px 0' : '20px 0',
          background: scrolled
            ? 'rgba(10, 10, 11, 0.8)'
            : 'transparent',
          backdropFilter: scrolled ? 'blur(20px) saturate(180%)' : 'none',
          borderBottom: scrolled ? '1px solid var(--border)' : '1px solid transparent',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        <div className="container">
          <nav style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
            {/* Logo */}
            <a
              href="#"
              onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              style={{
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
              }}
            >
              <img
                src="/logo.svg"
                alt="Forage"
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  boxShadow: '0 0 20px var(--accent-glow)',
                }}
              />
              <span style={{
                fontFamily: 'var(--font-sans)',
                fontSize: 18,
                fontWeight: 600,
                letterSpacing: '-0.02em',
                color: 'var(--foreground)',
              }}>
                Forage
              </span>
              <span style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 10,
                fontWeight: 500,
                letterSpacing: '0.08em',
                color: 'var(--accent)',
                textTransform: 'uppercase',
                padding: '2px 6px',
                background: 'var(--accent-dim)',
                borderRadius: 4,
              }}>
                Beta
              </span>
            </a>

            {/* Desktop Navigation */}
            <div
              className="hidden-mobile"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              {navLinks.map((link) => (
                <button
                  key={link.href}
                  onClick={() => scrollTo(link.href)}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '8px 16px',
                    borderRadius: 8,
                    fontFamily: 'var(--font-sans)',
                    fontSize: 14,
                    fontWeight: 500,
                    color: 'var(--foreground-secondary)',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = 'var(--foreground)';
                    e.currentTarget.style.background = 'var(--glass)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = 'var(--foreground-secondary)';
                    e.currentTarget.style.background = 'none';
                  }}
                >
                  {link.label}
                </button>
              ))}
            </div>

            {/* Desktop CTA */}
            <div className="hidden-mobile" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => scrollTo('#signup')}
                className="btn btn-primary"
                style={{
                  padding: '10px 20px',
                  fontSize: 14,
                }}
              >
                Get Started
                <ArrowRight size={14} />
              </motion.button>
            </div>

            {/* Mobile menu button */}
            <button
              className="hidden-desktop"
              onClick={() => setMobileOpen(true)}
              style={{
                background: 'var(--glass)',
                border: '1px solid var(--border)',
                borderRadius: 8,
                padding: 10,
                cursor: 'pointer',
                color: 'var(--foreground)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Menu size={20} />
            </button>
          </nav>
        </div>
      </motion.header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setMobileOpen(false)}
              style={{
                position: 'fixed',
                inset: 0,
                zIndex: 110,
                background: 'rgba(0, 0, 0, 0.8)',
                backdropFilter: 'blur(4px)',
              }}
            />

            {/* Drawer */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              style={{
                position: 'fixed',
                top: 0,
                right: 0,
                bottom: 0,
                width: 320,
                maxWidth: '85vw',
                zIndex: 120,
                background: 'var(--background-secondary)',
                borderLeft: '1px solid var(--border)',
                display: 'flex',
                flexDirection: 'column',
                padding: 24,
              }}
            >
              {/* Header */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 40,
              }}>
                <span style={{
                  fontFamily: 'var(--font-sans)',
                  fontSize: 18,
                  fontWeight: 600,
                  color: 'var(--foreground)',
                }}>
                  Menu
                </span>
                <button
                  onClick={() => setMobileOpen(false)}
                  style={{
                    background: 'var(--glass)',
                    border: '1px solid var(--border)',
                    borderRadius: 8,
                    padding: 8,
                    cursor: 'pointer',
                    color: 'var(--foreground)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <X size={18} />
                </button>
              </div>

              {/* Links */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {navLinks.map((link, i) => (
                  <motion.button
                    key={link.href}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    onClick={() => scrollTo(link.href, () => setMobileOpen(false))}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: '16px 0',
                      borderBottom: '1px solid var(--border)',
                      fontFamily: 'var(--font-sans)',
                      fontSize: 16,
                      fontWeight: 500,
                      color: 'var(--foreground)',
                      textAlign: 'left',
                      transition: 'color 0.2s',
                    }}
                  >
                    {link.label}
                  </motion.button>
                ))}
              </div>

              {/* CTA */}
              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                onClick={() => scrollTo('#signup', () => setMobileOpen(false))}
                className="btn btn-primary"
                style={{
                  marginTop: 32,
                  padding: '16px 24px',
                  fontSize: 15,
                  fontWeight: 600,
                  width: '100%',
                }}
              >
                Get Started
                <ArrowRight size={16} />
              </motion.button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
