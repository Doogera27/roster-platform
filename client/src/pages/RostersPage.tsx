import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';
import { Link } from 'react-router-dom';

export function RostersPage() {
  const queryClient = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['rosters'],
    queryFn: () => api.get('/rosters').then((r) => r.data.data),
  });

  const createMutation = useMutation({
    mutationFn: (name: string) => api.post('/rosters', { name }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rosters'] });
      setShowCreate(false);
      setNewName('');
    },
  });

  const rosters = data || [];

  return (
    <div>
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-display text-4xl text-white mb-2">
            Your <em>Rosters</em>
          </h1>
          <p className="text-sm text-[var(--color-text-muted)]">Build and manage your creative teams.</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="btn-primary">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M7 2v10M2 7h10" /></svg>
          New Roster
        </button>
      </div>

      {showCreate && (
        <div className="card-flat p-5 mb-6">
          <div className="text-label mb-3">Create a new roster</div>
          <div className="flex gap-3">
            <input type="text" placeholder="e.g. Q1 Brand Campaign Team" value={newName} onChange={(e) => setNewName(e.target.value)} className="input flex-1" autoFocus onKeyDown={(e) => e.key === 'Enter' && newName && createMutation.mutate(newName)} />
            <button onClick={() => newName && createMutation.mutate(newName)} disabled={!newName || createMutation.isPending} className="btn-accent">Create</button>
            <button onClick={() => { setShowCreate(false); setNewName(''); }} className="btn-ghost">Cancel</button>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="card-flat p-5"><div className="skeleton h-5 w-48 mb-2" /><div className="skeleton h-4 w-32" /></div>
          ))}
        </div>
      ) : rosters.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-14 h-14 rounded-xl bg-[var(--color-navy-light)] border border-[var(--color-border)] flex items-center justify-center mx-auto mb-4">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-faint)" strokeWidth="1.5" strokeLinecap="round"><circle cx="8" cy="7" r="3" /><circle cx="16" cy="7" r="3" /><path d="M2 20c0-4 3-6 6-6" /><path d="M22 20c0-4-3-6-6-6" /></svg>
          </div>
          <p className="text-sm font-medium text-[var(--color-text-secondary)] mb-1">No rosters yet</p>
          <p className="text-xs text-[var(--color-text-faint)] mb-4">Create a roster to start assembling your creative team.</p>
          <button onClick={() => setShowCreate(true)} className="btn-secondary text-xs">Create your first roster</button>
        </div>
      ) : (
        <div className="space-y-3">
          {rosters.map((r: any) => (
            <Link key={r.id} to={`/rosters/${r.id}`} className="card group flex items-center justify-between p-5">
              <div>
                <h3 className="text-[16px] font-semibold text-white group-hover:text-[var(--color-gold)] transition-colors" style={{ fontFamily: 'var(--font-serif)' }}>{r.name}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-mono text-[11px] text-[var(--color-text-faint)]">{r.member_count || 0} members</span>
                  {r.is_saved && <span className="badge badge-success text-[9px]">Saved</span>}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-mono text-[11px] text-[var(--color-text-faint)]">{new Date(r.updated_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                <svg className="text-[var(--color-text-faint)] group-hover:text-[var(--color-gold)] transition-colors" width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 3l4 4-4 4" /></svg>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
