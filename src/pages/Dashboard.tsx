import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLinks } from '@/hooks/useData';
import { Link as RouterLink } from 'react-router-dom';
import {
  User, Link2, BarChart3, Settings, LogOut, Save, Loader2,
  Upload, Eye, Palette, Plus, Trash2, GripVertical, ExternalLink,
} from 'lucide-react';
import { ICON_OPTIONS, getIconByName } from '@/lib/icons';
import type { Category, Link as LinkType, Profile } from '@/types';
import AnalyticsSection from '@/components/dashboard/AnalyticsSection';

const CATEGORIES: { value: Category; label: string }[] = [
  { value: 'social', label: '社交' },
  { value: 'works', label: '作品' },
  { value: 'contact', label: '联系方式' },
];

const THEMES = [
  { value: 'theme-purple', label: '紫色' },
  { value: 'theme-ocean', label: '海洋蓝' },
  { value: 'theme-forest', label: '森林绿' },
  { value: 'theme-sunset', label: '日落橙' },
  { value: 'theme-rose', label: '玫瑰粉' },
];

type Tab = 'profile' | 'links' | 'analytics';

export default function Dashboard() {
  const { profile, user, signOut, refreshProfile, configured } = useAuth();
  const { query: linksQuery, addLink, updateLink, deleteLink, updateProfile } = useLinks(profile?.id);
  const [tab, setTab] = useState<Tab>('profile');

  const [name, setName] = useState(profile?.name || '');
  const [bio, setBio] = useState(profile?.bio || '');
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url || '');
  const [theme, setTheme] = useState<Profile['theme']>(profile?.theme || 'theme-purple');
  const [savingProfile, setSavingProfile] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSaveProfile = async () => {
    setSavingProfile(true);
    setSaveSuccess(false);
    try {
      await updateProfile.mutateAsync({
        name: name.trim() || profile?.name || '用户',
        bio,
        avatar_url: avatarUrl || null,
        theme,
      });
      await refreshProfile();
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
    } finally {
      setSavingProfile(false);
    }
  };

  const links = linksQuery.data || [];
  const linksByCategory = CATEGORIES.reduce((acc, cat) => {
    acc[cat.value] = links.filter((l) => l.category === cat.value);
    return acc;
  }, {} as Record<Category, LinkType[]>);

  const handleAddLink = (category: Category) => {
    addLink.mutate({
      profile_id: profile?.id,
      category,
      label: '新链接',
      url: 'https://',
      icon_name: 'Link2',
      sort_order: (linksByCategory[category]?.length || 0),
    });
  };

  const handleUpdateLink = (id: string, changes: Partial<LinkType>) => {
    updateLink.mutate({ id, ...changes });
  };

  const handleDeleteLink = (id: string) => {
    if (confirm('确定删除这个链接吗？')) {
      deleteLink.mutate(id);
    }
  };

  const publicUrl = profile?.username
    ? `${typeof window !== 'undefined' ? window.location.origin : ''}/${profile.username}`
    : '';

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <div className="max-w-6xl mx-auto">
        <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-4 sm:px-6 py-4 sticky top-0 z-30">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">
                L
              </div>
              <div>
                <h1 className="text-lg font-bold text-slate-900 dark:text-white">LinkHub 后台</h1>
                <p className="text-xs text-slate-500 dark:text-slate-400">管理你的个人导航页</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {publicUrl && (
                <a
                  href={publicUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
                >
                  <Eye className="w-4 h-4" />
                  预览
                </a>
              )}
              <RouterLink
                to="/"
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
              >
                <ExternalLink className="w-4 h-4" />
                首页
              </RouterLink>
              <button
                onClick={signOut}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition"
              >
                <LogOut className="w-4 h-4" />
                退出
              </button>
            </div>
          </div>
        </header>

        <div className="flex flex-col md:flex-row">
          <aside className="md:w-56 md:flex-shrink-0 p-4 md:py-6 md:px-4 border-b md:border-b-0 md:border-r border-slate-200 dark:border-slate-700">
            <nav className="flex md:flex-col gap-1 overflow-x-auto">
              <TabButton active={tab === 'profile'} onClick={() => setTab('profile')} icon={<User className="w-4 h-4" />}>
                个人资料
              </TabButton>
              <TabButton active={tab === 'links'} onClick={() => setTab('links')} icon={<Link2 className="w-4 h-4" />}>
                链接管理
              </TabButton>
              <TabButton active={tab === 'analytics'} onClick={() => setTab('analytics')} icon={<BarChart3 className="w-4 h-4" />}>
                数据统计
              </TabButton>
            </nav>
            {user && (
              <div className="mt-6 hidden md:block">
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">当前账户</p>
                <p className="text-sm font-medium text-slate-700 dark:text-slate-200 truncate">{user.email}</p>
              </div>
            )}
          </aside>

          <main className="flex-1 p-4 sm:p-6 md:p-8 min-w-0">
            {tab === 'profile' && (
              <section>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">个人资料</h2>
                <div className="space-y-6 max-w-2xl">
                  {!configured && (
                    <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-sm">
                      ⚠️ 当前为演示模式，配置 Supabase 后可保存真实数据
                    </div>
                  )}

                  {publicUrl && (
                    <div className="p-4 rounded-xl bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800">
                      <p className="text-xs text-purple-600 dark:text-purple-400 mb-1">你的公开链接</p>
                      <a
                        href={publicUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-purple-700 dark:text-purple-300 font-medium underline break-all"
                      >
                        {publicUrl}
                      </a>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">头像 URL</label>
                    <div className="flex gap-3 items-start">
                      <div className="w-20 h-20 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden flex-shrink-0 flex items-center justify-center">
                        {avatarUrl ? (
                          <img src={avatarUrl} alt="avatar" className="w-full h-full object-cover" onError={(e) => (e.currentTarget.style.display = 'none')} />
                        ) : (
                          <User className="w-10 h-10 text-slate-400" />
                        )}
                      </div>
                      <div className="flex-1">
                        <input
                          type="url"
                          value={avatarUrl}
                          onChange={(e) => setAvatarUrl(e.target.value)}
                          placeholder="https://... 图片地址"
                          className="w-full px-4 py-2.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                        />
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                          <Upload className="w-3 h-3 inline mr-1" />
                          可以使用任意公开图片链接（推荐使用 Supabase Storage 或其他图床）
                        </p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">昵称 / 显示名</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="你的名字"
                      className="w-full px-4 py-2.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">简介</label>
                    <textarea
                      rows={3}
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      placeholder="一句话介绍你自己"
                      className="w-full px-4 py-2.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
                      <Palette className="w-4 h-4" /> 主题配色
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
                      {THEMES.map((t) => (
                        <button
                          key={t.value}
                          onClick={() => setTheme(t.value)}
                          className={`px-3 py-2 rounded-lg border text-sm transition ${
                            theme === t.value
                              ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300'
                              : 'border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                          }`}
                        >
                          {t.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 pt-4">
                    <button
                      onClick={handleSaveProfile}
                      disabled={savingProfile}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-purple-600 text-white font-medium hover:bg-purple-700 disabled:opacity-50 transition"
                    >
                      {savingProfile ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                      保存修改
                    </button>
                    {saveSuccess && (
                      <span className="text-green-600 dark:text-green-400 text-sm flex items-center gap-1">
                        <Settings className="w-4 h-4" /> 已保存
                      </span>
                    )}
                  </div>
                </div>
              </section>
            )}

            {tab === 'links' && (
              <section>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">链接管理</h2>
                </div>
                <div className="space-y-8">
                  {CATEGORIES.map((cat) => (
                    <div key={cat.value}>
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-base font-semibold text-slate-800 dark:text-slate-200">{cat.label}</h3>
                        <button
                          onClick={() => handleAddLink(cat.value)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm bg-purple-600 text-white hover:bg-purple-700 transition"
                        >
                          <Plus className="w-4 h-4" /> 添加
                        </button>
                      </div>
                      <div className="space-y-2">
                        {linksByCategory[cat.value].length === 0 ? (
                          <p className="text-sm text-slate-500 dark:text-slate-400 italic py-4 text-center bg-white dark:bg-slate-800 rounded-lg border border-dashed border-slate-300 dark:border-slate-600">
                            暂无链接，点击右上角「添加」
                          </p>
                        ) : (
                          linksByCategory[cat.value].map((link, idx) => (
                            <LinkRow
                              key={link.id}
                              link={link}
                              index={idx}
                              onUpdate={(changes) => handleUpdateLink(link.id, changes)}
                              onDelete={() => handleDeleteLink(link.id)}
                            />
                          ))
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {tab === 'analytics' && <AnalyticsSection />}
          </main>
        </div>
      </div>
    </div>
  );
}

function TabButton({ active, onClick, icon, children }: { active: boolean; onClick: () => void; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition ${
        active
          ? 'bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300'
          : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
      }`}
    >
      {icon}
      {children}
    </button>
  );
}

function LinkRow({
  link,
  onUpdate,
  onDelete,
}: {
  link: LinkType;
  index: number;
  onUpdate: (changes: Partial<LinkType>) => void;
  onDelete: () => void;
}) {
  const IconComp = getIconByName(link.icon_name);
  return (
    <div className="p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
      <div className="flex items-start gap-3 flex-wrap sm:flex-nowrap">
        <div className="flex items-center gap-2 sm:w-40 flex-shrink-0">
          <GripVertical className="w-4 h-4 text-slate-400 flex-shrink-0" />
          <div className="w-9 h-9 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center flex-shrink-0">
            <IconComp className="w-5 h-5 text-slate-700 dark:text-slate-200" />
          </div>
          <select
            value={link.icon_name}
            onChange={(e) => onUpdate({ icon_name: e.target.value })}
            className="flex-1 min-w-0 px-2 py-1.5 rounded bg-transparent border border-slate-200 dark:border-slate-600 text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-purple-500"
          >
            {ICON_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
        <div className="flex-1 flex flex-col sm:flex-row gap-2 min-w-0">
          <input
            type="text"
            value={link.label}
            onChange={(e) => onUpdate({ label: e.target.value })}
            placeholder="名称"
            className="flex-1 min-w-[120px] px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-600 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
          />
          <input
            type="url"
            value={link.url}
            onChange={(e) => onUpdate({ url: e.target.value })}
            placeholder="https://..."
            className="flex-[2] min-w-[180px] px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-600 text-sm text-slate-900 dark:text-white placeholder-slate-400 font-mono focus:outline-none focus:ring-1 focus:ring-purple-500"
          />
        </div>
        <button
          onClick={onDelete}
          className="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 transition flex-shrink-0"
          title="删除"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
