import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { LogIn, AlertCircle, CheckCircle2, Loader2, Sparkles } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { configured, demoSignIn } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (error) throw error;
      if (data.session) {
        const redirect = (location.state as any)?.from || '/dashboard';
        navigate(redirect, { replace: true });
      }
    } catch (err: any) {
      setError(err?.message || '登录失败，请检查邮箱和密码');
    } finally {
      setLoading(false);
    }
  };

  const handleMagicLink = async () => {
    if (!email) {
      setError('请先填写邮箱');
      return;
    }
    setError(null);
    setSuccess(null);
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({ email: email.trim() });
      if (error) throw error;
      setSuccess('登录链接已发送到你的邮箱，请查收');
    } catch (err: any) {
      setError(err?.message || '发送失败');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = () => {
    demoSignIn();
    const redirect = (location.state as any)?.from || '/dashboard';
    navigate(redirect, { replace: true });
  };

  return (
    <div className="min-h-screen bg-animated-gradient flex items-center justify-center p-4 py-8">
      <div className="w-full max-w-md bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-2xl">
        <div className="text-center mb-6">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/20 flex items-center justify-center">
            <LogIn className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">欢迎回来</h1>
          <p className="text-white/70 mt-1">登录你的账户</p>
        </div>

        {!configured && (
          <div className="mb-5 p-3 rounded-xl bg-yellow-500/20 border border-yellow-500/40 text-white text-sm flex items-start gap-2">
            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium">Supabase 未配置</p>
              <p className="text-white/80 mt-0.5">
                你可以使用「演示模式」体验所有功能。部署前请在 <code className="bg-white/20 px-1.5 py-0.5 rounded text-xs">.env</code> 中配置 Supabase 凭据。
              </p>
            </div>
          </div>
        )}

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

        {configured ? (
          <>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-white/80 text-sm mb-2">邮箱</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/40 focus:border-transparent transition"
                  placeholder="you@example.com"
                />
              </div>
              <div>
                <label className="block text-white/80 text-sm mb-2">密码</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/40 focus:border-transparent transition"
                  placeholder="••••••••"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-white text-purple-700 font-semibold hover:bg-white/90 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <LogIn className="w-5 h-5" />}
                {loading ? '登录中...' : '登录'}
              </button>
            </form>

            <div className="mt-4 flex items-center gap-2">
              <div className="flex-1 h-px bg-white/20" />
              <span className="text-white/50 text-sm">或</span>
              <div className="flex-1 h-px bg-white/20" />
            </div>

            <button
              type="button"
              onClick={handleMagicLink}
              disabled={loading}
              className="w-full mt-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white font-medium hover:bg-white/20 disabled:opacity-50 transition"
            >
              使用魔法链接登录
            </button>

            <button
              type="button"
              onClick={handleDemoLogin}
              className="w-full mt-3 py-3 rounded-xl bg-gradient-to-r from-yellow-400/80 to-orange-400/80 hover:from-yellow-400 hover:to-orange-400 text-slate-900 font-semibold transition flex items-center justify-center gap-2"
            >
              <Sparkles className="w-5 h-5" />
              演示模式快速进入
            </button>
          </>
        ) : (
          <div className="space-y-3">
            <button
              type="button"
              onClick={handleDemoLogin}
              className="w-full py-3.5 rounded-xl bg-white text-purple-700 font-semibold hover:bg-white/90 transition flex items-center justify-center gap-2 text-base"
            >
              <Sparkles className="w-5 h-5" />
              演示模式 - 立即体验
            </button>
            <Link
              to="/demo"
              className="block w-full py-3 rounded-xl bg-white/10 border border-white/20 text-white font-medium hover:bg-white/20 transition text-center"
            >
              查看演示导航页
            </Link>
          </div>
        )}

        {configured && (
          <p className="mt-6 text-center text-white/70 text-sm">
            还没有账户？{' '}
            <Link to="/register" className="text-white font-medium underline hover:text-white/90">
              立即注册
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}
