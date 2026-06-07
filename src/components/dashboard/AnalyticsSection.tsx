import { useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLinks, useLinkClicks } from '@/hooks/useData';
import { getIconByName } from '@/lib/icons';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line,
} from 'recharts';
import { BarChart3, MousePointer, TrendingUp, ExternalLink, AlertTriangle } from 'lucide-react';

const COLORS = ['#8b5cf6', '#ec4899', '#06b6d4', '#22c55e', '#f59e0b', '#ef4444', '#6366f1', '#14b8a6'];

export default function AnalyticsSection() {
  const { profile, configured } = useAuth();
  const { query: linksQuery } = useLinks(profile?.id);
  const clicksQuery = useLinkClicks(profile?.id);

  const links = linksQuery.data || [];
  const clicks = clicksQuery.data || [];

  const stats = useMemo(() => {
    const totalClicks = clicks.length;
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setHours(0, 0, 0, 0);
      d.setDate(d.getDate() - (6 - i));
      return d;
    });
    const dailyData = last7Days.map((d) => {
      const next = new Date(d);
      next.setDate(next.getDate() + 1);
      const count = clicks.filter((c) => {
        const t = new Date(c.clicked_at).getTime();
        return t >= d.getTime() && t < next.getTime();
      }).length;
      return {
        date: `${d.getMonth() + 1}/${d.getDate()}`,
        点击数: count,
      };
    });

    const clicksByLink: Record<string, number> = {};
    clicks.forEach((c) => {
      clicksByLink[c.link_id] = (clicksByLink[c.link_id] || 0) + 1;
    });
    const linkData = links
      .map((l) => ({
        name: l.label,
        icon: l.icon_name,
        点击数: clicksByLink[l.id] || 0,
      }))
      .filter((x) => x.点击数 > 0)
      .sort((a, b) => b.点击数 - a.点击数)
      .slice(0, 10);

    const referrerMap: Record<string, number> = {};
    clicks.forEach((c) => {
      let ref = c.referrer?.trim();
      if (!ref || ref === '') {
        ref = '直接访问';
      } else {
        try {
          ref = new URL(ref).hostname.replace(/^www\./, '');
        } catch {
          // keep original
        }
      }
      referrerMap[ref] = (referrerMap[ref] || 0) + 1;
    });
    const referrerData = Object.entries(referrerMap)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8);

    const uniqueDays = new Set(clicks.map((c) => new Date(c.clicked_at).toDateString())).size || 1;
    const avgPerDay = totalClicks / uniqueDays;

    return { totalClicks, dailyData, linkData, referrerData, avgPerDay };
  }, [clicks, links]);

  return (
    <section>
      <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
        <BarChart3 className="w-5 h-5" /> 数据统计
      </h2>

      {!configured && (
        <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 text-sm mb-6 flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <div>
            当前为演示模式，统计数据不会持久化。配置 Supabase 并在数据库中执行 <code className="bg-amber-100 dark:bg-amber-900/40 px-1.5 py-0.5 rounded font-mono">supabase/schema.sql</code> 后可正常使用。
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <StatCard icon={<MousePointer className="w-5 h-5" />} label="总点击数" value={stats.totalClicks.toLocaleString()} color="purple" />
        <StatCard icon={<TrendingUp className="w-5 h-5" />} label="日均点击" value={stats.avgPerDay.toFixed(1)} color="cyan" />
        <StatCard icon={<ExternalLink className="w-5 h-5" />} label="链接数量" value={links.length.toString()} color="green" />
      </div>

      <div className="space-y-6">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-4">最近 7 天点击趋势</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stats.dailyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="date" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    background: 'rgba(15, 23, 42, 0.95)',
                    border: 'none',
                    borderRadius: 8,
                    color: '#fff',
                    fontSize: 13,
                  }}
                  labelStyle={{ color: '#fff' }}
                />
                <Line type="monotone" dataKey="点击数" stroke="#8b5cf6" strokeWidth={3} dot={{ fill: '#8b5cf6', r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-4">各链接点击排行</h3>
            {stats.linkData.length === 0 ? (
              <EmptyHint text="暂无点击数据" />
            ) : (
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.linkData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
                    <XAxis type="number" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} allowDecimals={false} />
                    <YAxis
                      type="category"
                      dataKey="name"
                      tick={{ fill: '#475569', fontSize: 12 }}
                      axisLine={false}
                      tickLine={false}
                      width={80}
                    />
                    <Tooltip
                      cursor={{ fill: 'rgba(139, 92, 246, 0.05)' }}
                      contentStyle={{
                        background: 'rgba(15, 23, 42, 0.95)',
                        border: 'none',
                        borderRadius: 8,
                        color: '#fff',
                        fontSize: 13,
                      }}
                    />
                    <Bar dataKey="点击数" fill="#8b5cf6" radius={[0, 6, 6, 0]}>
                      {stats.linkData.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-4">流量来源分布</h3>
            {stats.referrerData.length === 0 ? (
              <EmptyHint text="暂无来源数据" />
            ) : (
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={stats.referrerData}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={90}
                      paddingAngle={2}
                      dataKey="value"
                      nameKey="name"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      labelLine={{ stroke: '#94a3b8' }}
                    >
                      {stats.referrerData.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        background: 'rgba(15, 23, 42, 0.95)',
                        border: 'none',
                        borderRadius: 8,
                        color: '#fff',
                        fontSize: 13,
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-4">链接详情</h3>
          {links.length === 0 ? (
            <EmptyHint text="还没有添加链接" />
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-700">
              {links.map((link) => {
                const Icon = getIconByName(link.icon_name);
                const count = clicks.filter((c) => c.link_id === link.id).length;
                return (
                  <div key={link.id} className="py-3 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center flex-shrink-0">
                      <Icon className="w-4 h-4 text-slate-700 dark:text-slate-200" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-800 dark:text-slate-100 truncate">{link.label}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate font-mono">{link.url}</p>
                    </div>
                    <div className="flex items-center gap-1 text-sm font-semibold text-purple-600 dark:text-purple-400 flex-shrink-0">
                      <MousePointer className="w-3.5 h-3.5" />
                      {count}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function StatCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string; color: 'purple' | 'cyan' | 'green' }) {
  const colorMap = {
    purple: 'from-purple-500 to-pink-500',
    cyan: 'from-cyan-500 to-blue-500',
    green: 'from-green-500 to-emerald-500',
  };
  return (
    <div className="p-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-slate-500 dark:text-slate-400">{label}</span>
        <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${colorMap[color]} flex items-center justify-center text-white`}>
          {icon}
        </div>
      </div>
      <p className="text-3xl font-bold text-slate-900 dark:text-white">{value}</p>
    </div>
  );
}

function EmptyHint({ text }: { text: string }) {
  return (
    <div className="h-72 flex items-center justify-center text-slate-400 dark:text-slate-500 text-sm">
      {text}
    </div>
  );
}
