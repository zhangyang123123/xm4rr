import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import {
  UserPlus,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Sparkles,
  Eye,
  LogIn,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { configured, demoSignIn } = useAuth();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!configured) {
      setError('当前未配置 Supabase，无法注册真实账户。可使用演示模式体验全部功能。');
      return;
    }

    if (password.length < 6) {
      setError('密码至少需要 6 个字符');
      return;
    }
    if (username && !/^[a-zA-Z0-9_]{3,}$/.test(username)) {
      setError('用户名只能包含字母、数字和下划线，至少 3 个字符');
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            name: name || username || email.split('@')[0],
            username: username || undefined,
          },
        },
      });
      if (error) throw error;
      if (data.session) {
        navigate('/dashboard', { replace: true });
      } else {
        setSuccess('注册成功！请检查邮箱验证账户');
      }
    } catch (err: any) {
      setError(err?.message || '注册失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-animated-gradient flex items-center justify-center p-4 py-8">
      <div className="w-full max-w-md bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-2xl">
        {!configured && (
          <div className="mb-6 p-4 rounded-2xl bg-yellow-400/15 border border-yellow-300/40 text-yellow-50 text-sm">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-yellow-200 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-yellow-100 mb-1">Supabase 未配置</p>
                <p className="text-yellow-100/80 text-xs leading-relaxed">
                  复制项目根目录下的 .env.example 为 .env，并填入 Supabase URL 和匿名密钥后，即可使用真实账户登录。当前可直接使用演示模式体验全部功能。
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/20 flex items-center justify-center">
            <UserPlus className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">创建账户</h1>
          <p className="text-white/70 mt-1">开始使用你的专属导航页</p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-500/20 border border-red-500/40 text-white text-sm flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {error}
          </div>
        )}
        {success && (
          <div className="mb-4 p-3 rounded-xl bg-green-500/20 border border-green-500/40 text-white text-sm flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            {success}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-white/80 text-sm mb-2">邮箱</label>
            <input
              type="email"
              required={configured}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={!configured}
              className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/40 focus:border-transparent transition disabled:opacity-50"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="block text-white/80 text-sm mb-2">昵称（显示名）</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={!configured}
              className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/40 focus:border-transparent transition disabled:opacity-50"
              placeholder="你的名字"
            />
          </div>
          <div>
            <label className="block text-white/80 text-sm mb-2">
              用户名（用于个人链接，可选）
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
              disabled={!configured}
              className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/40 focus:border-transparent transition font-mono disabled:opacity-50"
              placeholder="my_username"
            />
            {username && configured && (
              <p className="text-white/50 text-xs mt-1">
                你的链接将是：
                {typeof window !== 'undefined' && window.location.host}/{username}
              </p>
            )}
          </div>
          <div>
            <label className="block text-white/80 text-sm mb-2">密码</label>
            <input
              type="password"
              required={configured}
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={!configured}
              className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/40 focus:border-transparent transition disabled:opacity-50"
              placeholder="至少 6 个字符"
            />
          </div>
          <button
            type="submit"
            disabled={loading || !configured}
            className="w-full py-3 rounded-xl bg-white text-purple-700 font-semibold hover:bg-white/90 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <UserPlus className="w-5 h-5" />
            )}
            {loading ? '注册中...' : configured ? '注册账户' : '已禁用（未配置）'}
          </button>
        </form>

        <div className="mt-6">
          <div className="flex items-center gap-3 my-4">
            <div className="flex-1 h-px bg-white/20" />
            <span className="text-white/50 text-xs">或</span>
            <div className="flex-1 h-px bg-white/20" />
          </div>

          <div className="flex flex-col gap-2">
            <button
              type="button"
              onClick={() => {
                demoSignIn();
                navigate('/dashboard', { replace: true });
              }}
              className="w-full py-3 rounded-xl bg-white/10 border border-white/20 text-white font-medium hover:bg-white/20 transition flex items-center justify-center gap-2"
            >
              <Sparkles className="w-5 h-5 text-yellow-200" />
              演示模式 — 立即体验
            </button>
            <Link
              to="/demo"
              className="w-full py-3 rounded-xl bg-white/5 border border-white/10 text-white/90 font-medium hover:bg-white/10 transition flex items-center justify-center gap-2"
            >
              <Eye className="w-5 h-5" />
              查看演示导航页
            </Link>
          </div>
        </div>

        <p className="mt-6 text-center text-white/70 text-sm">
          已有账户？{' '}
          <Link
            to="/login"
            className="text-white font-medium underline hover:text-white/90 inline-flex items-center gap-1"
          >
            <LogIn className="w-3.5 h-3.5" />
            去登录
          </Link>
        </p>
      </div>
    </div>
  );
}
