import type { LucideIcon } from 'lucide-react';
import { recordLinkClick } from '@/hooks/useData';

interface LinkButtonProps {
  label: string;
  url: string;
  icon: LucideIcon;
  index: number;
  linkId?: string;
  profileId?: string;
}

const SPECIAL_PROTOCOLS = ['mailto:', 'tel:', 'sms:', 'fax:', 'javascript:', '#'];

function isSpecialProtocol(url: string): boolean {
  return SPECIAL_PROTOCOLS.some((p) => url.toLowerCase().startsWith(p));
}

export default function LinkButton({ label, url, icon: Icon, index, linkId, profileId }: LinkButtonProps) {
  const handleClick = () => {
    if (linkId && profileId) {
      recordLinkClick(linkId, profileId);
    }
  };

  const special = isSpecialProtocol(url);

  const linkProps = special
    ? ({ href: url, 'aria-label': label } as const)
    : ({ href: url, target: '_blank', rel: 'noopener noreferrer', 'aria-label': label } as const);

  return (
    <a
      {...linkProps}
      onClick={handleClick}
      className="
        group relative flex items-center justify-center gap-3
        w-full px-6 py-4 min-h-[56px]
        rounded-2xl
        backdrop-blur-md
        text-[var(--text-primary)] font-medium
        shadow-lg shadow-black/10
        transition-all duration-300 ease-out
        opacity-0 animate-fade-in-up
        active:scale-[0.98]
      "
      style={{
        backgroundColor: 'var(--button-bg)',
        border: '1px solid var(--button-border)',
        animationDelay: `${index * 100 + 400}ms`,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = 'var(--button-bg-hover)';
        e.currentTarget.style.borderColor = 'var(--button-border-hover)';
        e.currentTarget.style.transform = 'scale(1.03)';
        e.currentTarget.style.boxShadow = '0 25px 50px -12px var(--accent-soft)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = 'var(--button-bg)';
        e.currentTarget.style.borderColor = 'var(--button-border)';
        e.currentTarget.style.transform = 'scale(1)';
        e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1)';
      }}
    >
      <span className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{ background: 'linear-gradient(to right, transparent, var(--accent-soft), transparent)' }}
      />
      <Icon className="w-5 h-5 transition-transform duration-300 group-hover:scale-110" strokeWidth={2} />
      <span className="tracking-wide">{label}</span>
      <svg
        className="w-4 h-4 ml-auto opacity-0 -translate-x-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M7 17L17 7" />
        <path d="M7 7h10v10" />
      </svg>
    </a>
  );
}
