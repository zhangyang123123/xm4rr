import { Users, Briefcase, Mail } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export type Category = 'social' | 'works' | 'contact';

export const categories: { id: Category; label: string; icon: LucideIcon }[] = [
  { id: 'social', label: '社交', icon: Users },
  { id: 'works', label: '作品', icon: Briefcase },
  { id: 'contact', label: '联系', icon: Mail },
];

interface CategoryTabsProps {
  active: Category;
  onChange: (c: Category) => void;
}

export default function CategoryTabs({ active, onChange }: CategoryTabsProps) {
  return (
    <div
      className="
        w-full flex p-1 rounded-2xl backdrop-blur-md mb-6
        opacity-0 animate-fade-in-up
      "
      style={{
        backgroundColor: 'var(--button-bg)',
        border: '1px solid var(--button-border)',
        animationDelay: '350ms',
      }}
    >
      {categories.map((cat, idx) => {
        const Icon = cat.icon;
        const isActive = active === cat.id;
        return (
          <button
            key={cat.id}
            onClick={() => onChange(cat.id)}
            className={cn(
              'flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl',
              'text-sm font-medium transition-all duration-300',
              'hover:scale-[1.02] active:scale-[0.98]'
            )}
            style={{
              color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
              backgroundColor: isActive ? 'var(--button-bg-hover)' : 'transparent',
              animationDelay: `${idx * 50 + 400}ms`,
            }}
          >
            <Icon className="w-4 h-4" />
            <span>{cat.label}</span>
          </button>
        );
      })}
    </div>
  );
}
