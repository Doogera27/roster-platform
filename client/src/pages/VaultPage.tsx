import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../services/api';
import { clsx } from 'clsx';
import { VaultUploadModal } from '../components/VaultUploadModal';

const completenessGuide: Record<string, string> = {
  brand_guidelines: 'Brand guidelines define your voice, values, and visual standards.',
  logo: 'Upload your primary logo, variations, and usage rules.',
  font: 'Include your brand typefaces (TTF, OTF, or WOFF files).',
  template: 'Provide design templates for common asset types.',
  photography: 'Share brand photography, lifestyle images, or product shots.',
};

export function VaultPage() {
  const [uploadOpen, setUploadOpen] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['vault'],
    queryFn: () => api.get('/vault').then((r) => r.data.data),
  });

  if (isLoading) {
    return (
      <div>
        <div className="skeleton h-10 w-48 mb-2" />
        <div className="skeleton h-4 w-64 mb-8" />
        <div className="skeleton h-3 w-full rounded-full mb-8" />
        {Array.from({ length: 4 }).map((_, i) => <div key={i} className="skeleton h-16 w-full rounded-xl mb-3" />)}
      </div>
    );
  }

  if (!data) {
    return <div className="text-center py-20"><p className="text-sm text-[var(--color-text-muted)]">No Brand Vault found.</p></div>;
  }

  const assets = data.assets || [];
  const completeness = Math.round(data.completeness_score || 0);

  const grouped = assets.reduce((acc: Record<string, any[]>, a: any) => {
    const cat = a.asset_category || 'other';
    (acc[cat] = acc[cat] || []).push(a);
    return acc;
  }, {} as Record<string, any[]>);

  // Determine missing categories for coaching
  const allCategories = ['brand_guidelines', 'logo', 'font', 'template', 'photography'];
  const existingCategories = new Set(assets.map((a: any) => a.asset_category));
  const missingCategories = allCategories.filter((c) => !existingCategories.has(c));

  return (
    <div>
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-display text-4xl text-white mb-2">Brand <em>Vault</em></h1>
          <p className="text-sm text-[var(--color-text-muted)]">Your team's brand assets and guidelines.</p>
        </div>
        <button onClick={() => setUploadOpen(true)} className="btn-accent">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M7 1v8M3.5 5L7 1l3.5 4" /><path d="M1 10v2h12v-2" /></svg>
          Upload
        </button>
      </div>

      {/* Completeness */}
      <div className="card-flat p-5 mb-8">
        <div className="flex items-center justify-between mb-3">
          <span className="text-label">Vault Completeness</span>
          <span className={clsx('text-mono text-sm font-medium', completeness >= 80 ? 'text-[var(--color-teal)]' : completeness >= 40 ? 'text-[var(--color-gold)]' : 'text-[var(--color-danger)]')}>
            {completeness}%
          </span>
        </div>
        <div className="h-2 bg-[var(--color-navy-light)] rounded-full overflow-hidden">
          <div className={clsx('h-full rounded-full transition-all duration-500', completeness >= 80 ? 'bg-[var(--color-teal)]' : completeness >= 40 ? 'bg-[var(--color-gold)]' : 'bg-[var(--color-danger)]')} style={{ width: `${Math.min(completeness, 100)}%` }} />
        </div>

        {/* Coaching hints */}
        {missingCategories.length > 0 && completeness < 100 && (
          <div className="mt-4 space-y-2">
            {missingCategories.slice(0, 2).map((cat) => (
              <div key={cat} className="flex items-start gap-2 p-2.5 rounded-lg bg-[rgba(201,168,76,0.04)] border border-[var(--color-gold-border)]">
                <svg width="14" height="14" fill="none" stroke="var(--color-gold)" strokeWidth="1.5" strokeLinecap="round" className="shrink-0 mt-0.5">
                  <circle cx="7" cy="7" r="6" />
                  <path d="M7 4v4M7 10h.01" />
                </svg>
                <div>
                  <span className="text-xs font-medium text-[var(--color-gold)]">Upload {cat.replace(/_/g, ' ')}</span>
                  <p className="text-[10px] text-[var(--color-text-faint)] mt-0.5">{completenessGuide[cat]}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {assets.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-16 h-16 rounded-xl bg-[var(--color-navy-light)] border border-dashed border-[var(--color-border-mid)] flex items-center justify-center mx-auto mb-4">
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none" stroke="var(--color-text-faint)" strokeWidth="1.5" strokeLinecap="round"><path d="M14 6v16M8 12l6-6 6 6" /><path d="M4 22h20" /></svg>
          </div>
          <p className="text-sm font-medium text-[var(--color-text-secondary)] mb-1">Your vault is empty</p>
          <p className="text-xs text-[var(--color-text-faint)] max-w-xs mx-auto mb-4">Upload brand guidelines, logos, fonts, and templates.</p>
          <button onClick={() => setUploadOpen(true)} className="btn-primary text-sm">
            Upload Your First Asset
          </button>
        </div>
      ) : (
        <div className="space-y-8">
          {(Object.entries(grouped) as [string, any[]][]).map(([category, catAssets]) => (
            <section key={category}>
              <div className="flex items-center gap-2 mb-3">
                <h2 className="text-label">{category.replace(/_/g, ' ')}</h2>
                <span className="text-mono text-[10px] text-[var(--color-text-faint)]">{catAssets.length}</span>
              </div>
              <div className="space-y-2">
                {catAssets.map((a: any) => {
                  const ext = a.filename?.split('.').pop()?.toUpperCase() || '?';
                  return (
                    <div key={a.id} className="card-flat p-4 flex items-center justify-between group">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-[var(--color-navy-light)] border border-[var(--color-border)] flex items-center justify-center">
                          <span className="text-mono text-[10px] font-medium text-[var(--color-text-faint)]">{ext}</span>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-white">{a.filename}</div>
                          <div className="flex items-center gap-3 text-mono text-[11px] text-[var(--color-text-faint)]">
                            <span>v{a.version}</span><span className="text-[var(--color-border-mid)]">&bull;</span>
                            <span>{a.file_size_bytes ? (a.file_size_bytes < 1024 * 1024 ? `${(a.file_size_bytes / 1024).toFixed(0)} KB` : `${(a.file_size_bytes / (1024 * 1024)).toFixed(1)} MB`) : '—'}</span>
                            <span className="text-[var(--color-border-mid)]">&bull;</span>
                            <span>{new Date(a.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                          </div>
                        </div>
                      </div>
                      <button className="opacity-0 group-hover:opacity-100 transition-opacity btn-ghost text-xs text-[var(--color-gold)]">Download</button>
                    </div>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      )}

      <VaultUploadModal open={uploadOpen} onClose={() => setUploadOpen(false)} />
    </div>
  );
}
