import { Link } from 'react-router-dom';

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  link?: string;
}

export function FeatureCard({ icon, title, description, link }: FeatureCardProps) {
  return (
    <div className="card p-6 flex flex-col">
      <div className="w-10 h-10 rounded-lg bg-[var(--color-gold-dim)] flex items-center justify-center text-[var(--color-gold)] mb-4">
        {icon}
      </div>
      <h3 className="text-heading text-[17px] text-white mb-2">{title}</h3>
      <p className="text-sm text-[var(--color-text-muted)] leading-relaxed flex-1">{description}</p>
      {link && (
        <Link to={link} className="text-mono text-xs text-[var(--color-gold)] mt-4 hover:text-[var(--color-gold-hover)] transition-colors">
          Learn more &rarr;
        </Link>
      )}
    </div>
  );
}
