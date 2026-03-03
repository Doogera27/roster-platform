import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';

interface DropdownItem {
  label: string;
  to: string;
  description?: string;
}

interface NavDropdownProps {
  label: string;
  items: DropdownItem[];
}

export function NavDropdown({ label, items }: NavDropdownProps) {
  const [open, setOpen] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  function handleEnter() {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setOpen(true);
  }

  function handleLeave() {
    timeoutRef.current = setTimeout(() => setOpen(false), 150);
  }

  // Close on Escape
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    if (open) document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  return (
    <div
      ref={containerRef}
      className="relative"
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
    >
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1 text-sm text-[var(--color-text-secondary)] hover:text-white transition-colors py-2"
        aria-expanded={open}
        aria-haspopup="true"
      >
        {label}
        <svg
          className={`w-3.5 h-3.5 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          aria-hidden="true"
        >
          <polyline points="4 6 8 10 12 6" />
        </svg>
      </button>

      {/* Dropdown Panel */}
      <div
        className={`absolute top-full left-1/2 -translate-x-1/2 mt-2 w-56 rounded-[var(--radius-lg)] border border-[var(--color-border-mid)] bg-[var(--color-navy-mid)] shadow-xl overflow-hidden transition-all duration-200 origin-top ${
          open ? 'opacity-100 scale-100 pointer-events-auto' : 'opacity-0 scale-95 pointer-events-none'
        }`}
        role="menu"
      >
        <div className="p-2">
          {items.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => setOpen(false)}
              className="block px-3 py-2.5 rounded-[var(--radius-md)] hover:bg-[rgba(255,255,255,0.05)] transition-colors"
              role="menuitem"
            >
              <div className="text-sm font-medium text-white">{item.label}</div>
              {item.description && (
                <div className="text-xs text-[var(--color-text-muted)] mt-0.5">{item.description}</div>
              )}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
