import './dashboard.css';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--background)' }}>
      <nav
        style={{
          borderBottom: '1px solid var(--border)',
          padding: '0 24px',
          height: 56,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'sticky',
          top: 0,
          zIndex: 50,
          background: 'rgba(10, 10, 11, 0.9)',
          backdropFilter: 'blur(12px)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path
              d="M12 2L2 7L12 12L22 7L12 2Z"
              stroke="var(--accent)"
              strokeWidth="2"
              strokeLinejoin="round"
            />
            <path
              d="M2 17L12 22L22 17"
              stroke="var(--accent)"
              strokeWidth="2"
              strokeLinejoin="round"
            />
            <path
              d="M2 12L12 17L22 12"
              stroke="var(--accent)"
              strokeWidth="2"
              strokeLinejoin="round"
            />
          </svg>
          <span
            style={{
              fontWeight: 700,
              fontSize: 16,
              letterSpacing: '-0.02em',
            }}
          >
            Forage Graph
          </span>
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 11,
              padding: '2px 8px',
              borderRadius: 6,
              background: 'var(--accent-dim)',
              color: 'var(--accent-light)',
              border: '1px solid rgba(139,92,246,0.3)',
            }}
          >
            Dashboard
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <a href="/" className="dash-nav-link">
            ← Landing
          </a>
        </div>
      </nav>
      {children}
    </div>
  );
}
