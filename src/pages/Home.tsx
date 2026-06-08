import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Loader2, User as UserIcon, AlertCircle } from 'lucide-react';
import { useProfile, useLinks } from '@/hooks/useData';
import LinkButton from '@/components/LinkButton';
import ThemeControls from '@/components/ThemeControls';
import CategoryTabs, { type Category } from '@/components/CategoryTabs';
import QRCodeSection from '@/components/QRCodeSection';
import { useTheme, type ColorTheme } from '@/hooks/useTheme';
import { getIconByName } from '@/lib/icons';

const THEME_NAME_MAP: Record<string, ColorTheme> = {
  'theme-purple': 'purple',
  'theme-ocean': 'ocean',
  'theme-forest': 'forest',
  'theme-sunset': 'sunset',
  'theme-rose': 'rose',
};

export default function Home() {
  const { username } = useParams<{ username: string }>();
  const { isDark, toggleTheme, colorTheme, setColorTheme } = useTheme();
  const [activeCategory, setActiveCategory] = useState<Category>('social');
  const [profileThemeApplied, setProfileThemeApplied] = useState(false);

  const { data: profile, isLoading: profileLoading } = useProfile(username);
  const { query: linksQuery } = useLinks(profile?.id);

  const isLoading = profileLoading || linksQuery.isLoading;
  const links = linksQuery.data || [];

  useEffect(() => {
    setProfileThemeApplied(false);
  }, [username]);

  useEffect(() => {
    if (profile && profile.theme && !profileThemeApplied) {
      const mapped = THEME_NAME_MAP[profile.theme];
      if (mapped) {
        setColorTheme(mapped);
      }
      setProfileThemeApplied(true);
    }
  }, [profile, profileThemeApplied, setColorTheme]);

  if (isLoading) {
    return (
      <div className={`min-h-full bg-animated-gradient ${isDark ? '' : 'light'} flex items-center justify-center`}>
        <Loader2 className="w-10 h-10 text-white animate-spin" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className={`min-h-full bg-animated-gradient ${isDark ? '' : 'light'} flex items-center justify-center p-6`}>
        <div className="max-w-md w-full text-center text-white">
          <AlertCircle className="w-16 h-16 mx-auto mb-4 opacity-80" />
          <h1 className="text-2xl font-bold mb-2">未找到用户</h1>
          <p className="text-white/70 mb-6">
            用户 <span className="font-mono bg-white/10 px-2 py-1 rounded">{username || ''}</span> 不存在
          </p>
          <Link
            to="/demo"
            className="inline-block px-6 py-3 rounded-xl bg-white text-purple-700 font-semibold hover:bg-white/90 transition"
          >
            查看演示页
          </Link>
          <Link
            to="/login"
            className="inline-block ml-3 px-6 py-3 rounded-xl bg-white/10 border border-white/20 text-white font-medium hover:bg-white/20 transition"
          >
            登录后台
          </Link>
        </div>
      </div>
    );
  }

  const linksByCategory: Record<Category, typeof links> = {
    social: links.filter((l) => l.category === 'social'),
    works: links.filter((l) => l.category === 'works'),
    contact: links.filter((l) => l.category === 'contact'),
  };

  const activeLinks = linksByCategory[activeCategory];

  return (
    <div className={`min-h-full bg-animated-gradient ${isDark ? '' : 'light'} flex items-center justify-center px-4 py-12 sm:py-16 transition-colors duration-500`}>
      <ThemeControls
        isDark={isDark}
        toggleTheme={toggleTheme}
        colorTheme={colorTheme}
        setColorTheme={setColorTheme}
      />

      <div className="w-full max-w-[440px] flex flex-col items-center">
        <div className="relative mb-6 opacity-0 animate-fade-in-up [animation-delay:100ms]">
          <div
            className="absolute -inset-1 rounded-full blur-md opacity-70 animate-glow"
            style={{
              background: 'linear-gradient(to right, var(--avatar-border-1), var(--avatar-border-2), var(--avatar-border-3))',
            }}
          />
          <div
            className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-full p-[3px]"
            style={{
              backgroundImage: 'linear-gradient(to bottom right, var(--avatar-border-1), var(--avatar-border-2), var(--avatar-border-3))',
            }}
          >
            <div
              className="w-full h-full rounded-full overflow-hidden flex items-center justify-center"
              style={{ backgroundColor: isDark ? '#0f172a' : '#f8fafc' }}
            >
              {profile.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt={profile.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <svg
                  viewBox="0 0 128 128"
                  className="w-full h-full"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <defs>
                    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="var(--gradient-3)" />
                      <stop offset="50%" stopColor="var(--gradient-5)" />
                      <stop offset="100%" stopColor="var(--gradient-7)" />
                    </linearGradient>
                  </defs>
                  <rect width="128" height="128" fill="url(#g)" />
                  <circle cx="64" cy="52" r="22" fill="#fef3c7" opacity="0.9" />
                  <path
                    d="M24 118 Q64 82 104 118 L104 128 L24 128 Z"
                    fill="#fef3c7"
                    opacity="0.9"
                  />
                </svg>
              )}
            </div>
          </div>
        </div>

        <h1
          className="
            text-2xl sm:text-3xl font-bold tracking-tight
            mb-2 opacity-0 animate-fade-in-up
            [animation-delay:200ms] transition-colors duration-500
          "
          style={{ color: 'var(--text-primary)' }}
        >
          {profile.name}
        </h1>
        <p
          className="
            text-sm sm:text-base text-center leading-relaxed
            mb-8 sm:mb-6 px-4 opacity-0 animate-fade-in-up
            [animation-delay:300ms] transition-colors duration-500
          "
          style={{ color: 'var(--text-secondary)' }}
        >
          {profile.bio || ''}
        </p>

        <CategoryTabs active={activeCategory} onChange={setActiveCategory} />

        <div key={activeCategory} className="w-full flex flex-col gap-3">
          {activeLinks.length === 0 ? (
            <p
              className="text-center py-8 opacity-0 animate-fade-in-up [animation-delay:400ms]"
              style={{ color: 'var(--text-muted)' }}
            >
              <UserIcon className="w-8 h-8 mx-auto mb-2 opacity-50" />
              该分类下暂无链接
            </p>
          ) : (
            activeLinks.map((link, index) => (
              <LinkButton
                key={link.id}
                label={link.label}
                url={link.url}
                icon={getIconByName(link.icon_name)}
                index={index}
                linkId={link.id}
                profileId={profile.id}
              />
            ))
          )}
        </div>

        <QRCodeSection />

        <p
          className="
            mt-10 text-xs
            opacity-0 animate-fade-in-up
            [animation-delay:1200ms] transition-colors duration-500
          "
          style={{ color: 'var(--text-muted)' }}
        >
          © {new Date().getFullYear()} {profile.name}
        </p>
      </div>
    </div>
  );
}
