/**
 * Messages / Chat Page — Spec System 08
 * Stream Chat integration placeholder.
 * Phase 5.2 — stub UI with mock channels.
 */
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../services/api';
import { clsx } from 'clsx';

interface Channel {
  id: string;
  name: string;
  project_name?: string;
  last_message?: string;
  last_message_at?: string;
  unread_count?: number;
  members: { first_name: string; last_name: string; avatar_url?: string }[];
}

// Mock channels until Stream integration is live
const mockChannels: Channel[] = [
  {
    id: '1',
    name: 'Brand Identity — Spring 2026',
    project_name: 'Brand Identity',
    last_message: 'I\'ve uploaded the revised mood board. Let me know your thoughts!',
    last_message_at: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    unread_count: 2,
    members: [
      { first_name: 'Sarah', last_name: 'Chen' },
      { first_name: 'Marcus', last_name: 'Rivera' },
    ],
  },
  {
    id: '2',
    name: 'Website Redesign Q2',
    project_name: 'Website Redesign',
    last_message: 'The wireframes are ready for review.',
    last_message_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    unread_count: 0,
    members: [
      { first_name: 'Alex', last_name: 'Kim' },
      { first_name: 'Jordan', last_name: 'Park' },
      { first_name: 'Priya', last_name: 'Patel' },
    ],
  },
  {
    id: '3',
    name: 'Social Content — March',
    project_name: 'Social Content',
    last_message: 'Content calendar is approved. Starting production Monday.',
    last_message_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    unread_count: 0,
    members: [
      { first_name: 'Emma', last_name: 'Li' },
    ],
  },
];

const avatarColors = [
  { bg: '#2E4A6B', text: '#72D9D2' },
  { bg: '#3D2E5C', text: '#C9A84C' },
  { bg: '#2A3E2E', text: '#7DD9A0' },
];

function getAvatarColor(name: string) {
  const hash = (name || '').split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  return avatarColors[hash % avatarColors.length];
}

function relativeTime(isoDate: string) {
  const diff = Date.now() - new Date(isoDate).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export function MessagesPage() {
  const [selectedChannel, setSelectedChannel] = useState<string>(mockChannels[0].id);
  const [messageInput, setMessageInput] = useState('');

  // Future: Stream token generation
  const { data: tokenData } = useQuery({
    queryKey: ['messages-token'],
    queryFn: () => api.get('/messages/token').then((r) => r.data.data),
    staleTime: 1000 * 60 * 10,
  });

  const channel = mockChannels.find((c) => c.id === selectedChannel);

  return (
    <div className="flex flex-col h-[calc(100vh-120px)]">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-display text-3xl text-white mb-1">
          Messages
        </h1>
        <p className="text-sm text-[var(--color-text-muted)]">
          Communicate with your creative team in real time.
        </p>
      </div>

      {/* Chat layout */}
      <div className="flex flex-1 gap-0 rounded-xl border border-[var(--color-border)] overflow-hidden bg-[var(--color-navy-mid)]">
        {/* Channel list */}
        <div className="w-80 border-r border-[var(--color-border)] flex flex-col">
          <div className="p-4 border-b border-[var(--color-border)]">
            <input
              type="text"
              placeholder="Search conversations..."
              className="input text-xs"
            />
          </div>
          <div className="flex-1 overflow-y-auto">
            {mockChannels.map((ch) => (
              <button
                key={ch.id}
                onClick={() => setSelectedChannel(ch.id)}
                className={clsx(
                  'w-full p-4 text-left border-b border-[var(--color-border)] transition-colors',
                  selectedChannel === ch.id
                    ? 'bg-[rgba(201,168,76,0.06)]'
                    : 'hover:bg-[rgba(255,255,255,0.02)]',
                )}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className={clsx('text-xs font-medium truncate', selectedChannel === ch.id ? 'text-[var(--color-gold)]' : 'text-white')}>
                    {ch.name}
                  </span>
                  {ch.unread_count ? (
                    <span className="w-5 h-5 rounded-full bg-[var(--color-gold)] text-[var(--color-navy)] text-[10px] font-bold flex items-center justify-center shrink-0">
                      {ch.unread_count}
                    </span>
                  ) : ch.last_message_at ? (
                    <span className="text-mono text-[10px] text-[var(--color-text-faint)] shrink-0">{relativeTime(ch.last_message_at)}</span>
                  ) : null}
                </div>
                <p className="text-[11px] text-[var(--color-text-faint)] truncate">{ch.last_message}</p>
                <div className="flex gap-1 mt-2">
                  {ch.members.slice(0, 3).map((m, i) => {
                    const ac = getAvatarColor(`${m.first_name}${m.last_name}`);
                    return (
                      <div
                        key={i}
                        className="w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-semibold"
                        style={{ background: ac.bg, color: ac.text }}
                        title={`${m.first_name} ${m.last_name}`}
                      >
                        {m.first_name[0]}{m.last_name[0]}
                      </div>
                    );
                  })}
                  {ch.members.length > 3 && (
                    <span className="text-[10px] text-[var(--color-text-faint)]">+{ch.members.length - 3}</span>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Chat area */}
        <div className="flex-1 flex flex-col">
          {/* Chat header */}
          <div className="p-4 border-b border-[var(--color-border)] flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-white">{channel?.name}</h3>
              <p className="text-[11px] text-[var(--color-text-faint)]">
                {channel?.members.length} member{(channel?.members.length || 0) !== 1 ? 's' : ''}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button className="btn-ghost text-xs px-3 py-1.5">Files</button>
              <button className="btn-ghost text-xs px-3 py-1.5">Pin</button>
            </div>
          </div>

          {/* Messages area (placeholder) */}
          <div className="flex-1 flex flex-col items-center justify-center p-8">
            <div className="w-16 h-16 rounded-2xl bg-[var(--color-navy-light)] border border-[var(--color-border)] flex items-center justify-center mb-4">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-faint)" strokeWidth="1.5" strokeLinecap="round">
                <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
              </svg>
            </div>
            <p className="text-sm font-medium text-[var(--color-text-secondary)] mb-1">Real-time Chat — Coming Soon</p>
            <p className="text-xs text-[var(--color-text-faint)] text-center max-w-xs">
              Stream Chat integration will power real-time messaging between you and your creative team.
            </p>
            {tokenData?.message && (
              <span className="mt-3 badge badge-accent text-[10px]">{tokenData.message}</span>
            )}
          </div>

          {/* Message input */}
          <div className="p-4 border-t border-[var(--color-border)]">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Type a message..."
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                className="input flex-1 text-sm"
                disabled
              />
              <button className="btn-primary px-4 py-2 text-sm" disabled>
                Send
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
