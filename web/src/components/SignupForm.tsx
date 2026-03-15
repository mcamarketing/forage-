'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Check, Copy, Loader2, AlertCircle } from 'lucide-react';

type SignupState = 'idle' | 'loading' | 'success' | 'error';

interface SignupResponse {
  success: boolean;
  message: string;
  isNewUser: boolean;
  userId: string;
  credits: number;
  apiKey: string;
}

export function SignupForm() {
  const [email, setEmail] = useState('');
  const [state, setState] = useState<SignupState>('idle');
  const [response, setResponse] = useState<SignupResponse | null>(null);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !email.includes('@')) {
      setError('Please enter a valid email');
      return;
    }

    setState('loading');
    setError('');

    try {
      const res = await fetch('/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Signup failed');
      }

      setResponse(data);
      setState('success');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
      setState('error');
    }
  };

  const copyApiKey = async () => {
    if (response?.apiKey) {
      await navigator.clipboard.writeText(response.apiKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div style={{ width: '100%', maxWidth: 480 }}>
      <AnimatePresence mode="wait">
        {state === 'success' && response ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="card"
            style={{ padding: 32 }}
          >
            {/* Success header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
              <div style={{
                width: 48,
                height: 48,
                borderRadius: 12,
                background: 'var(--success-dim)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <Check size={24} style={{ color: 'var(--success)' }} />
              </div>
              <div>
                <h3 style={{
                  fontSize: 18,
                  fontWeight: 600,
                  color: 'var(--foreground)',
                  margin: 0,
                }}>
                  {response.isNewUser ? "You're in!" : 'Welcome back!'}
                </h3>
                <p style={{
                  fontSize: 14,
                  color: 'var(--foreground-secondary)',
                  margin: 0,
                }}>
                  {response.message}
                </p>
              </div>
            </div>

            {/* Credit balance */}
            <div style={{
              padding: '16px 20px',
              background: 'var(--glass)',
              borderRadius: 12,
              border: '1px solid var(--border)',
              marginBottom: 20,
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}>
                <span style={{ fontSize: 14, color: 'var(--foreground-secondary)' }}>
                  Available Credit
                </span>
                <span style={{
                  fontSize: 24,
                  fontWeight: 700,
                  color: 'var(--success)',
                  letterSpacing: '-0.02em',
                }}>
                  ${response.credits.toFixed(2)}
                </span>
              </div>
            </div>

            {/* API Key */}
            {response.isNewUser && (
              <div style={{ marginBottom: 24 }}>
                <label style={{
                  display: 'block',
                  fontSize: 12,
                  fontWeight: 500,
                  color: 'var(--foreground-tertiary)',
                  marginBottom: 8,
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase',
                }}>
                  Your API Key (save this!)
                </label>
                <div style={{
                  display: 'flex',
                  gap: 8,
                }}>
                  <div style={{
                    flex: 1,
                    padding: '12px 16px',
                    background: 'var(--background)',
                    border: '1px solid var(--border)',
                    borderRadius: 10,
                    fontFamily: 'var(--font-mono)',
                    fontSize: 13,
                    color: 'var(--foreground)',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}>
                    {response.apiKey}
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={copyApiKey}
                    style={{
                      padding: '12px 16px',
                      background: copied ? 'var(--success-dim)' : 'var(--glass)',
                      border: '1px solid var(--border)',
                      borderRadius: 10,
                      cursor: 'pointer',
                      color: copied ? 'var(--success)' : 'var(--foreground)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.2s',
                    }}
                  >
                    {copied ? <Check size={18} /> : <Copy size={18} />}
                  </motion.button>
                </div>
                <p style={{
                  fontSize: 12,
                  color: 'var(--warning)',
                  margin: '8px 0 0',
                }}>
                  Save this key now — it won&apos;t be shown again!
                </p>
              </div>
            )}

            {/* Next steps */}
            <div style={{
              padding: 20,
              background: 'linear-gradient(135deg, var(--accent-dim) 0%, var(--cyan-dim) 100%)',
              borderRadius: 12,
              border: '1px solid var(--border)',
            }}>
              <h4 style={{
                fontSize: 14,
                fontWeight: 600,
                color: 'var(--foreground)',
                margin: '0 0 12px',
              }}>
                Quick Start
              </h4>
              <div style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 12,
                color: 'var(--foreground-secondary)',
                lineHeight: 1.8,
              }}>
                <div style={{ marginBottom: 8 }}>
                  <span style={{ color: 'var(--foreground-muted)' }}># Claude Desktop</span>
                  <br />
                  npx forage-mcp --key {response.apiKey.slice(0, 8)}...
                </div>
                <div>
                  <span style={{ color: 'var(--foreground-muted)' }}># Direct API</span>
                  <br />
                  npm install forage-client
                </div>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.form
            key="form"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            onSubmit={handleSubmit}
            style={{ width: '100%' }}
          >
            <div style={{
              display: 'flex',
              gap: 12,
              flexWrap: 'wrap',
            }}>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                disabled={state === 'loading'}
                style={{
                  flex: '1 1 240px',
                  padding: '16px 20px',
                  background: 'var(--background-secondary)',
                  border: '1px solid var(--border)',
                  borderRadius: 12,
                  fontSize: 15,
                  color: 'var(--foreground)',
                  outline: 'none',
                  transition: 'border-color 0.2s',
                }}
                onFocus={(e) => e.currentTarget.style.borderColor = 'var(--accent)'}
                onBlur={(e) => e.currentTarget.style.borderColor = 'var(--border)'}
              />
              <motion.button
                type="submit"
                disabled={state === 'loading'}
                whileHover={{ scale: state === 'loading' ? 1 : 1.02 }}
                whileTap={{ scale: state === 'loading' ? 1 : 0.98 }}
                className="btn btn-primary"
                style={{
                  padding: '16px 28px',
                  fontSize: 15,
                  fontWeight: 600,
                  opacity: state === 'loading' ? 0.7 : 1,
                  cursor: state === 'loading' ? 'not-allowed' : 'pointer',
                }}
              >
                {state === 'loading' ? (
                  <>
                    <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
                    Creating...
                  </>
                ) : (
                  <>
                    Start Free
                    <ArrowRight size={18} />
                  </>
                )}
              </motion.button>
            </div>

            {/* Error message */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    marginTop: 12,
                    padding: '10px 14px',
                    background: 'rgba(239, 68, 68, 0.1)',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    borderRadius: 8,
                  }}
                >
                  <AlertCircle size={16} style={{ color: 'var(--error)' }} />
                  <span style={{ fontSize: 13, color: 'var(--error)' }}>{error}</span>
                </motion.div>
              )}
            </AnimatePresence>

            <p style={{
              fontSize: 13,
              color: 'var(--foreground-tertiary)',
              margin: '16px 0 0',
              textAlign: 'center',
            }}>
              No credit card required · $1.00 credit included · Cancel anytime
            </p>
          </motion.form>
        )}
      </AnimatePresence>

    </div>
  );
}
