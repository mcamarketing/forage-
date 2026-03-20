'use client';

import { useState, useEffect, useCallback } from 'react';

const API = 'https://forage-graph-production.up.railway.app';
const TOKEN = '6da69224eb14e6bdb0fb63514b772480d23a4467f8ac8a4b15266a8262d7f959';

interface Stats {
  total_entities: number;
  total_relationships: number;
  entities_by_type: Record<string, number>;
  last_updated: string;
  status: string;
}

interface Entity {
  id: string;
  name: string;
  type: string;
  confidence: number;
  call_count: number;
  properties: Record<string, string>;
  sources: string[];
  first_seen: string;
  last_seen: string;
}

const TYPE_COLORS: Record<string, string> = {
  person: '#8b5cf6',
  company: '#22d3ee',
  product: '#10b981',
  technology: '#f59e0b',
  location: '#ef4444',
  event: '#ec4899',
  organization: '#6366f1',
  domain: '#14b8a6',
  email: '#f97316',
  keyword: '#64748b',
};

function fmt(n: number) {
  return n.toLocaleString();
}

function timeAgo(ts: string) {
  const diff = Date.now() - new Date(ts).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [health, setHealth] = useState<{ status: string; graph: string } | null>(null);
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Entity[]>([]);
  const [searching, setSearching] = useState(false);
  const [selectedEntity, setSelectedEntity] = useState<Entity | null>(null);
  const [enrichData, setEnrichData] = useState<any>(null);
  const [enriching, setEnriching] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const headers = { Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'application/json' };

  const fetchStats = useCallback(async () => {
    try {
      const [s, h] = await Promise.all([
        fetch(`${API}/stats`, { headers }).then(r => r.json()),
        fetch(`${API}/health`, { headers: { 'Content-Type': 'application/json' } }).then(r => r.json()).catch(() => null),
      ]);
      setStats(s);
      setHealth(h);
      setError('');
    } catch (e: any) {
      setError('Failed to reach graph API — check Railway is running');
    }
    setRefreshing(false);
  }, []);

  useEffect(() => {
    fetchStats();
    const iv = setInterval(fetchStats, 30000);
    return () => clearInterval(iv);
  }, [fetchStats]);

  useEffect(() => {
    if (searchResults.length > 0) return;
    if (stats?.entities_by_type) {
      const sample: Entity[] = Object.entries(stats.entities_by_type)
        .slice(0, 1)
        .flatMap(([type, count]) =>
          Array.from({ length: Math.min(5, count as number) }, (_, i) => ({
            id: `${type}-${i}`,
            name: `${type.charAt(0).toUpperCase() + type.slice(1)} ${i + 1}`,
            type,
            confidence: 0.8,
            call_count: 1,
            properties: {},
            sources: [],
            first_seen: new Date().toISOString(),
            last_seen: new Date().toISOString(),
          }))
        );
    }
  }, [stats]);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;
    setSearching(true);
    setSearchResults([]);
    setSelectedEntity(null);
    try {
      const res = await fetch(`${API}/query`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ name: query.trim(), min_confidence: 0.0 }),
      });
      const data = await res.json();
      setSearchResults(data.entities || []);
    } catch (e) {
      console.error(e);
    }
    setSearching(false);
  }

  async function handleEntityClick(entity: Entity) {
    setSelectedEntity(entity);
    setEnrichData(null);
    setEnriching(true);
    try {
      const res = await fetch(`${API}/enrich`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ identifier: entity.name }),
      });
      const data = await res.json();
      setEnrichData(data);
    } catch (e) {
      console.error(e);
    }
    setEnriching(false);
  }

  const typeEntries = stats?.entities_by_type
    ? Object.entries(stats.entities_by_type).sort((a, b) => (b[1] as number) - (a[1] as number))
    : [];
  const maxTypeCount = typeEntries.length > 0 ? (typeEntries[0][1] as number) : 1;

  return (
    <div style={{ maxWidth: 1400, margin: '0 auto', padding: '32px 24px' }}>
      {error && (
        <div
          style={{
            padding: '12px 16px',
            borderRadius: 10,
            background: 'rgba(239,68,68,0.1)',
            border: '1px solid rgba(239,68,68,0.3)',
            color: '#ef4444',
            fontSize: 13,
            marginBottom: 24,
          }}
        >
          {error}
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, letterSpacing: '-0.02em', margin: 0 }}>
            Graph Overview
          </h1>
          <p style={{ color: 'var(--foreground-secondary)', fontSize: 14, margin: '4px 0 0' }}>
            Live stats from{' '}
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12 }}>forage-graph-production</span>
            {' '}· Updated {timeAgo(lastRefresh.toISOString())}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={() => { setRefreshing(true); setLastRefresh(new Date()); fetchStats(); }}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '8px 16px', borderRadius: 8,
              background: 'var(--glass)', border: '1px solid var(--border)',
              color: 'var(--foreground-secondary)', fontSize: 13, cursor: 'pointer',
              transition: 'all var(--transition-fast)',
            }}
            onMouseOver={e => { e.currentTarget.style.borderColor = 'var(--border-hover)'; e.currentTarget.style.color = 'var(--foreground)'; }}
            onMouseOut={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--foreground-secondary)'; }}
          >
            <svg
              width="14" height="14" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2"
              style={{ animation: refreshing ? 'spin 1s linear infinite' : 'none' }}
            >
              <path d="M1 4v6h6M23 20v-6h-6" />
              <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4-4.64 4.36A9 9 0 0 1 3.51 15" />
            </svg>
            Refresh
          </button>
          <span
            style={{
              fontSize: 11, padding: '6px 10px', borderRadius: 6,
              background: health?.status === 'ok' ? 'var(--success-dim)' : 'rgba(239,68,68,0.1)',
              color: health?.status === 'ok' ? 'var(--success)' : '#ef4444',
              border: `1px solid ${health?.status === 'ok' ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`,
              fontFamily: 'var(--font-mono)',
            }}
          >
            {health?.status === 'ok' ? '● healthy' : '○ checking'}
          </span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 32 }}>
        <div
          className="glass-card"
          style={{ padding: '24px' }}
        >
          <p style={{ fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--foreground-tertiary)', margin: '0 0 8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Entities
          </p>
          <p style={{ fontSize: 36, fontWeight: 800, letterSpacing: '-0.03em', margin: 0, color: 'var(--accent-light)' }}>
            {stats ? fmt(stats.total_entities) : '—'}
          </p>
          <p style={{ fontSize: 12, color: 'var(--foreground-tertiary)', margin: '6px 0 0' }}>
            nodes in graph
          </p>
        </div>

        <div
          className="glass-card"
          style={{ padding: '24px' }}
        >
          <p style={{ fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--foreground-tertiary)', margin: '0 0 8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Relationships
          </p>
          <p style={{ fontSize: 36, fontWeight: 800, letterSpacing: '-0.03em', margin: 0, color: 'var(--cyan)' }}>
            {stats ? fmt(stats.total_relationships) : '—'}
          </p>
          <p style={{ fontSize: 12, color: 'var(--foreground-tertiary)', margin: '6px 0 0' }}>
            edges in graph
          </p>
        </div>

        <div
          className="glass-card"
          style={{ padding: '24px' }}
        >
          <p style={{ fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--foreground-tertiary)', margin: '0 0 8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Entity Types
          </p>
          <p style={{ fontSize: 36, fontWeight: 800, letterSpacing: '-0.03em', margin: 0, color: 'var(--success)' }}>
            {typeEntries.length}
          </p>
          <p style={{ fontSize: 12, color: 'var(--foreground-tertiary)', margin: '6px 0 0' }}>
            distinct types
          </p>
        </div>

        <div
          className="glass-card"
          style={{ padding: '24px' }}
        >
          <p style={{ fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--foreground-tertiary)', margin: '0 0 8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Last Updated
          </p>
          <p style={{ fontSize: 18, fontWeight: 700, letterSpacing: '-0.02em', margin: '4px 0 0', color: 'var(--foreground)' }}>
            {stats?.last_updated ? timeAgo(stats.last_updated) : '—'}
          </p>
          <p style={{ fontSize: 12, color: 'var(--foreground-tertiary)', margin: '4px 0 0', fontFamily: 'var(--font-mono)' }}>
            {stats?.last_updated ? new Date(stats.last_updated).toLocaleString() : ''}
          </p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 24, alignItems: 'start' }}>
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
            <div className="glass-card" style={{ padding: '24px' }}>
              <h3 style={{ fontSize: 13, fontWeight: 600, color: 'var(--foreground-secondary)', margin: '0 0 20px', textTransform: 'uppercase', letterSpacing: '0.05em', fontFamily: 'var(--font-mono)' }}>
                By Type
              </h3>
              {typeEntries.length === 0 ? (
                <p style={{ color: 'var(--foreground-tertiary)', fontSize: 13 }}>No entities yet</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {typeEntries.map(([type, count]) => {
                    const color = TYPE_COLORS[type] || '#64748b';
                    const pct = (count as number) / maxTypeCount;
                    return (
                      <div key={type}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                          <span style={{ fontSize: 13, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 6 }}>
                            <span style={{ width: 8, height: 8, borderRadius: '50%', background: color, display: 'inline-block' }} />
                            {type}
                          </span>
                          <span style={{ fontSize: 13, fontFamily: 'var(--font-mono)', color: 'var(--foreground-secondary)' }}>
                            {fmt(count as number)}
                          </span>
                        </div>
                        <div style={{ height: 4, borderRadius: 4, background: 'var(--background-tertiary)', overflow: 'hidden' }}>
                          <div
                            style={{
                              width: `${Math.max(pct * 100, 4)}%`,
                              height: '100%',
                              borderRadius: 4,
                              background: color,
                              transition: 'width 0.5s ease',
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="glass-card" style={{ padding: '24px' }}>
              <h3 style={{ fontSize: 13, fontWeight: 600, color: 'var(--foreground-secondary)', margin: '0 0 20px', textTransform: 'uppercase', letterSpacing: '0.05em', fontFamily: 'var(--font-mono)' }}>
                Quick Actions
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {[
                  { label: 'Query Entity', desc: 'Search by name or type', icon: '⌕' },
                  { label: 'Find Connections', desc: 'Path between two entities', icon: '⟁' },
                  { label: 'View Claims', desc: 'Provenance assertions', icon: '◈' },
                  { label: 'Check Signals', desc: 'Time-series data', icon: '∿' },
                ].map((action) => (
                  <button
                    key={action.label}
                    onClick={() => {
                      const el = document.getElementById('search-bar');
                      el?.scrollIntoView({ behavior: 'smooth' });
                      el?.focus();
                    }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 12,
                      padding: '10px 12px', borderRadius: 8,
                      background: 'var(--glass)', border: '1px solid var(--border)',
                      color: 'var(--foreground)', textAlign: 'left', cursor: 'pointer',
                      transition: 'all var(--transition-fast)',
                      fontFamily: 'var(--font-mono)',
                    }}
                    onMouseOver={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.background = 'var(--accent-dim)'; }}
                    onMouseOut={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'var(--glass)'; }}
                  >
                    <span style={{ fontSize: 18 }}>{action.icon}</span>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, fontFamily: 'var(--font-sans)' }}>{action.label}</div>
                      <div style={{ fontSize: 11, color: 'var(--foreground-tertiary)' }}>{action.desc}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div id="search-bar" className="glass-card" style={{ padding: '24px', marginTop: 24 }}>
            <h3 style={{ fontSize: 13, fontWeight: 600, color: 'var(--foreground-secondary)', margin: '0 0 16px', textTransform: 'uppercase', letterSpacing: '0.05em', fontFamily: 'var(--font-mono)' }}>
              Search Entities
            </h3>
            <form onSubmit={handleSearch} style={{ display: 'flex', gap: 8 }}>
              <input
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="e.g. Acme Corp, John Doe, AI tools..."
                style={{
                  flex: 1, padding: '10px 14px', borderRadius: 8,
                  background: 'var(--background)', border: '1px solid var(--border)',
                  color: 'var(--foreground)', fontSize: 14, fontFamily: 'var(--font-mono)',
                  outline: 'none',
                }}
                onFocus={e => e.currentTarget.style.borderColor = 'var(--accent)'}
                onBlur={e => e.currentTarget.style.borderColor = 'var(--border)'}
              />
              <button
                type="submit"
                disabled={searching}
                style={{
                  padding: '10px 20px', borderRadius: 8,
                  background: 'var(--accent)', border: 'none',
                  color: 'white', fontSize: 13, fontWeight: 600, cursor: 'pointer',
                  opacity: searching ? 0.6 : 1,
                  transition: 'all var(--transition-fast)',
                  display: 'flex', alignItems: 'center', gap: 6,
                }}
              >
                {searching ? (
                  <>
                    <span style={{ animation: 'spin 1s linear infinite', display: 'inline-block' }}>⟳</span> Searching
                  </>
                ) : (
                  <>⌕ Search</>
                )}
              </button>
            </form>

            <div style={{ marginTop: 16 }}>
              {searching ? (
                <div style={{ display: 'flex', gap: 8 }}>
                  {[1, 2, 3].map(i => (
                    <div key={i} className="shimmer" style={{ height: 44, borderRadius: 8, flex: 1 }} />
                  ))}
                </div>
              ) : searchResults.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <p style={{ fontSize: 12, color: 'var(--foreground-tertiary)', margin: '0 0 8px' }}>
                    {searchResults.length} result{searchResults.length !== 1 ? 's' : ''} for &ldquo;{query}&rdquo;
                  </p>
                  {searchResults.map(entity => (
                    <button
                      key={entity.id}
                      onClick={() => handleEntityClick(entity)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 12,
                        padding: '10px 14px', borderRadius: 8,
                        background: selectedEntity?.id === entity.id ? 'var(--accent-dim)' : 'var(--glass)',
                        border: `1px solid ${selectedEntity?.id === entity.id ? 'var(--accent)' : 'var(--border)'}`,
                        color: 'var(--foreground)', textAlign: 'left', cursor: 'pointer',
                        transition: 'all var(--transition-fast)', width: '100%',
                      }}
                    >
                      <span
                        style={{
                          fontSize: 11, padding: '2px 8px', borderRadius: 4,
                          background: `${TYPE_COLORS[entity.type] || '#64748b'}20`,
                          color: TYPE_COLORS[entity.type] || '#64748b',
                          fontFamily: 'var(--font-mono)',
                          border: `1px solid ${TYPE_COLORS[entity.type] || '#64748b'}40`,
                        }}
                      >
                        {entity.type}
                      </span>
                      <span style={{ fontSize: 14, fontWeight: 500 }}>{entity.name}</span>
                      <span style={{ marginLeft: 'auto', fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--foreground-tertiary)' }}>
                        conf {Math.round(entity.confidence * 100)}%
                      </span>
                    </button>
                  ))}
                </div>
              ) : query && !searching ? (
                <p style={{ color: 'var(--foreground-tertiary)', fontSize: 13 }}>No results found for &ldquo;{query}&rdquo;</p>
              ) : null}
            </div>
          </div>
        </div>

        <div className="glass-card" style={{ padding: '24px', position: 'sticky', top: 72 }}>
          <h3 style={{ fontSize: 13, fontWeight: 600, color: 'var(--foreground-secondary)', margin: '0 0 16px', textTransform: 'uppercase', letterSpacing: '0.05em', fontFamily: 'var(--font-mono)' }}>
            Entity Detail
          </h3>
          {selectedEntity ? (
            <div>
              {enriching ? (
                <div className="shimmer" style={{ height: 200, borderRadius: 8 }} />
              ) : enrichData ? (
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                    <h4 style={{ fontSize: 18, fontWeight: 700, margin: 0, letterSpacing: '-0.02em' }}>
                      {enrichData.entity?.name || selectedEntity.name}
                    </h4>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 16 }}>
                    {[
                      ['Type', enrichData.entity?.type],
                      ['Confidence', enrichData.entity?.confidence ? `${Math.round(enrichData.entity.confidence * 100)}%` : '—'],
                      ['Calls', enrichData.entity?.call_count],
                      ['First Seen', enrichData.entity?.first_seen ? timeAgo(enrichData.entity.first_seen) : '—'],
                    ].map(([label, value]) => (
                      <div key={label as string} style={{ padding: '8px 10px', borderRadius: 6, background: 'var(--glass)', border: '1px solid var(--border)' }}>
                        <div style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--foreground-tertiary)', textTransform: 'uppercase', marginBottom: 2 }}>
                          {label}
                        </div>
                        <div style={{ fontSize: 13, fontWeight: 600 }}>{value || '—'}</div>
                      </div>
                    ))}
                  </div>

                  {enrichData.entity?.sources?.length > 0 && (
                    <div style={{ marginBottom: 16 }}>
                      <p style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--foreground-tertiary)', textTransform: 'uppercase', margin: '0 0 8px' }}>Sources</p>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                        {enrichData.entity.sources.map((s: string, i: number) => (
                          <span key={i} style={{ fontSize: 11, padding: '3px 8px', borderRadius: 4, background: 'var(--accent-dim)', color: 'var(--accent-light)', fontFamily: 'var(--font-mono)' }}>
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {enrichData.relationships && Object.keys(enrichData.relationships).length > 0 && (
                    <div>
                      <p style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--foreground-tertiary)', textTransform: 'uppercase', margin: '0 0 8px' }}>Relationships</p>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        {Object.entries(enrichData.relationships).map(([rel, nodes]: [string, any]) =>
                          (nodes as any[]).map((n: any, i: number) => (
                            <div key={`${rel}-${i}`} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', borderRadius: 6, background: 'var(--glass)', border: '1px solid var(--border)' }}>
                              <span style={{ fontSize: 12, color: 'var(--foreground-secondary)', fontFamily: 'var(--font-mono)' }}>{rel}</span>
                              <span style={{ fontSize: 12, fontWeight: 600 }}>→ {n.name}</span>
                              <span style={{ marginLeft: 'auto', fontSize: 10, fontFamily: 'var(--font-mono)', color: TYPE_COLORS[n.type] || 'var(--foreground-tertiary)' }}>
                                {n.type}
                              </span>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}

                  {(!enrichData.relationships || Object.keys(enrichData.relationships).length === 0) && (
                    <p style={{ color: 'var(--foreground-tertiary)', fontSize: 13 }}>No relationships found. Feed more data through the ingestion pipeline.</p>
                  )}
                </div>
              ) : null}

              <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--border)' }}>
                <div style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--foreground-tertiary)', textTransform: 'uppercase', marginBottom: 8 }}>
                  Raw Properties
                </div>
                <pre
                  style={{
                    fontSize: 11, fontFamily: 'var(--font-mono)',
                    background: 'var(--background)', border: '1px solid var(--border)',
                    borderRadius: 6, padding: 10, overflow: 'auto', maxHeight: 200,
                    color: 'var(--foreground-secondary)', margin: 0,
                  }}
                >
                  {JSON.stringify(selectedEntity.properties || {}, null, 2)}
                </pre>
              </div>

              <button
                onClick={() => { setSelectedEntity(null); setEnrichData(null); }}
                style={{
                  marginTop: 12, width: '100%', padding: '8px', borderRadius: 6,
                  background: 'transparent', border: '1px solid var(--border)',
                  color: 'var(--foreground-secondary)', fontSize: 12, cursor: 'pointer',
                  transition: 'all var(--transition-fast)',
                }}
                onMouseOver={e => { e.currentTarget.style.borderColor = 'var(--border-hover)'; e.currentTarget.style.color = 'var(--foreground)'; }}
                onMouseOut={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--foreground-secondary)'; }}
              >
                Clear Selection
              </button>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '32px 16px' }}>
              <div style={{ fontSize: 32, marginBottom: 12, opacity: 0.3 }}>◎</div>
              <p style={{ color: 'var(--foreground-tertiary)', fontSize: 13 }}>
                Search for an entity above, then click a result to see its full profile and relationships here.
              </p>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
