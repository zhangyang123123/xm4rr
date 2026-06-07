import { Sun, Moon, Palette } from 'lucide-react';
import { useState } from 'react';
import { colorThemes, type ColorTheme } from '@/hooks/useTheme';
import { cn } from '@/lib/utils';

interface ThemeControlsProps {
  isDark: boolean;
  toggleTheme: () => void;
  colorTheme: ColorTheme;
  setColorTheme: (t: ColorTheme) => void;
}

export default function ThemeControls({ isDark, toggleTheme, colorTheme, setColorTheme }: ThemeControlsProps) {
  const [showPalette, setShowPalette] = useState(false);

  return (
    <div className="fixed top-4 right-4 z-50 flex items-center gap-2">
      <div className="relative">
        <button
          onClick={() => setShowPalette(v => !v)}
          aria-label="主题色"
          className="
            w-10 h-10 rounded-full flex items-center justify-center
            backdrop-blur-md transition-all duration-300
            hover:scale-110 active:scale-95
          "
          style={{
            backgroundColor: 'var(--button-bg)',
            border: '1px solid var(--button-border)',
            color: 'var(--text-primary)',
          }}
        >
          <Palette className="w-5 h-5" />
        </button>

        {showPalette && (
          <div
            className="
              absolute right-0 mt-2 p-3 rounded-2xl backdrop-blur-md
              shadow-2xl flex flex-col gap-2 min-w-[180px]
              animate-fade-in-up
            "
            style={{
              backgroundColor: 'var(--card-bg)',
              border: '1px solid var(--button-border)',
              animationDelay: '0ms',
            }}
          >
            <span className="text-xs font-medium px-1" style={{ color: 'var(--text-secondary)' }}>
              选择主题色
            </span>
            <div className="grid grid-cols-5 gap-2">
              {colorThemes.map(t => (
                <button
                  key={t.id}
                  onClick={() => {
                    setColorTheme(t.id);
                    setShowPalette(false);
                  }}
                  aria-label={t.name}
                  title={t.name}
                  className={cn(
                    'w-7 h-7 rounded-full transition-all duration-200 hover:scale-110',
                    colorTheme === t.id && 'ring-2 ring-offset-2 ring-offset-transparent'
                  )}
                  style={{
                    backgroundColor: t.color,
                    boxShadow: colorTheme === t.id ? `0 0 0 2px ${t.color}` : undefined,
                  }}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      <button
        onClick={toggleTheme}
        aria-label={isDark ? '切换到亮色模式' : '切换到暗色模式'}
        className="
          w-10 h-10 rounded-full flex items-center justify-center
          backdrop-blur-md transition-all duration-300
          hover:scale-110 active:scale-95
        "
        style={{
          backgroundColor: 'var(--button-bg)',
          border: '1px solid var(--button-border)',
          color: 'var(--text-primary)',
        }}
      >
        {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
      </button>
    </div>
  );
}
