import { useState } from 'react';

interface VideoPlaceholderProps {
  videoUrl?: string;
  title?: string;
}

export function VideoPlaceholder({ videoUrl, title = 'Watch how it works' }: VideoPlaceholderProps) {
  const [playing, setPlaying] = useState(false);

  return (
    <div className="relative rounded-[var(--radius-xl)] overflow-hidden border border-[var(--color-border-mid)] bg-[var(--color-navy-mid)] aspect-video">
      {playing && videoUrl ? (
        <iframe
          src={videoUrl}
          className="w-full h-full"
          allow="autoplay; fullscreen"
          allowFullScreen
          title={title}
        />
      ) : (
        <button
          onClick={() => videoUrl && setPlaying(true)}
          className="w-full h-full flex flex-col items-center justify-center gap-4 group cursor-pointer"
          aria-label={title}
        >
          {/* Background gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-navy-mid)] to-[var(--color-navy)]" />

          {/* Grid pattern overlay */}
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
              backgroundSize: '40px 40px',
            }}
          />

          {/* Play button */}
          <div className="relative z-10 w-16 h-16 md:w-20 md:h-20 rounded-full bg-[var(--color-gold)] flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-[var(--color-gold-glow)]">
            <svg className="w-7 h-7 md:w-8 md:h-8 text-[var(--color-navy)] ml-1" viewBox="0 0 24 24" fill="currentColor">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>

          {/* Label */}
          <div className="relative z-10 text-sm text-[var(--color-text-muted)] group-hover:text-white transition-colors">
            {videoUrl ? title : 'Demo video coming soon'}
          </div>
        </button>
      )}
    </div>
  );
}
