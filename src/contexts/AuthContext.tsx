import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { User, Session } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import type { Profile } from '@/types';

const DEMO_PROFILE: Profile = {
  id: 'demo-id',
  username: 'demo',
  name: '演示用户',
  bio: '这是演示模式，可体验后台所有功能',
  avatar_url: null,
  theme: 'theme-purple',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

const DEMO_SESSION_KEY = 'linkhub_demo_session';

interface AuthContextValue {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  configured: boolean;
  isDemo: boolean;
  refreshProfile: () => Promise<void>;
  signOut: () => Promise<void>;
  demoSignIn: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDemo, setIsDemo] = useState(false);
  const configured = isSupabaseConfigured();

  const fetchProfile = async (userId: string) => {
    if (!configured) return;
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    if (!error && data) {
      setProfile(data as Profile);
    }
  };

  const refreshProfile = async () => {
    if (user) await fetchProfile(user.id);
  };

  const demoSignIn = () => {
    const demoUser = {
      id: DEMO_PROFILE.id,
      email: 'demo@example.com',
    } as User;
    setUser(demoUser);
    setSession({ user: demoUser } as Session);
    setProfile(DEMO_PROFILE);
    setIsDemo(true);
    try {
      localStorage.setItem(DEMO_SESSION_KEY, '1');
    } catch {
      // ignore
    }
  };

  const signOut = async () => {
    if (configured) {
      await supabase.auth.signOut();
    }
    setUser(null);
    setSession(null);
    setProfile(null);
    setIsDemo(false);
    try {
      localStorage.removeItem(DEMO_SESSION_KEY);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    if (!configured) {
      try {
        const demoActive = localStorage.getItem(DEMO_SESSION_KEY);
        if (demoActive === '1') {
          demoSignIn();
        }
      } catch {
        // ignore
      }
      setLoading(false);
      return;
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id).finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setProfile(null);
      }
    });

    return () => subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [configured]);

  return (
    <AuthContext.Provider value={{ user, session, profile, loading, configured, isDemo, refreshProfile, signOut, demoSignIn }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
