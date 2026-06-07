import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import type { Profile, Link, LinkClick, Category } from '@/types';
import { useAuth } from '@/contexts/AuthContext';

export function useProfile(username?: string) {
  const { profile: ownProfile } = useAuth();
  const configured = isSupabaseConfigured();

  return useQuery<Profile | null>({
    queryKey: ['profile', username],
    queryFn: async () => {
      if (!configured) {
        if (username === 'demo' || !username) {
          return {
            id: 'demo-id',
            username: 'demo',
            name: 'Alex Chen',
            bio: 'Full-stack Developer · 设计爱好者 · 咖啡痴迷者',
            avatar_url: null,
            theme: 'theme-purple',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          } as Profile;
        }
        return null;
      }
      if (!username) return ownProfile;
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('username', username)
        .single();
      if (error || !data) return null;
      return data as Profile;
    },
    enabled: configured ? !!username || !!ownProfile : true,
  });
}

export function useLinks(profileId?: string) {
  const { user } = useAuth();
  const configured = isSupabaseConfigured();
  const queryClient = useQueryClient();

  const query = useQuery<Link[]>({
    queryKey: ['links', profileId],
    queryFn: async () => {
      if (!configured) {
        if (profileId === 'demo-id') {
          return getDemoLinks();
        }
        return [];
      }
      if (!profileId) return [];
      const { data, error } = await supabase
        .from('links')
        .select('*')
        .eq('profile_id', profileId)
        .order('sort_order', { ascending: true })
        .order('created_at', { ascending: true });
      if (error) return [];
      return data as Link[];
    },
    enabled: !!profileId,
  });

  const addLink = useMutation({
    mutationFn: async (link: Omit<Link, 'id' | 'created_at' | 'profile_id'> & { profile_id?: string }) => {
      if (!configured) {
        return { id: 'demo-' + Date.now(), ...link, profile_id: user?.id || 'demo-id', created_at: new Date().toISOString() } as Link;
      }
      const payload: Record<string, unknown> = { ...link, profile_id: user?.id };
      const { data, error } = await (supabase
        .from('links')
        .insert([payload]) as any)
        .select()
        .single();
      if (error) throw error;
      return data as Link;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['links'] });
    },
  });

  const updateLink = useMutation({
    mutationFn: async ({ id, ...changes }: Partial<Link> & { id: string }) => {
      if (!configured) return { id, ...changes } as Link;
      const payload: Record<string, unknown> = changes;
      const { data, error } = await (supabase
        .from('links')
        .update(payload) as any)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data as Link;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['links'] });
    },
  });

  const deleteLink = useMutation({
    mutationFn: async (id: string) => {
      if (!configured) return;
      const { error } = await supabase.from('links').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['links'] });
    },
  });

  const updateProfile = useMutation({
    mutationFn: async (changes: Partial<Profile>) => {
      if (!configured) return changes as Profile;
      if (!user?.id) throw new Error('未登录');
      const payload: Record<string, unknown> = changes;
      const { data, error } = await (supabase
        .from('profiles')
        .update(payload) as any)
        .eq('id', user.id)
        .select()
        .single();
      if (error) throw error;
      return data as Profile;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });

  return { query, addLink, updateLink, deleteLink, updateProfile };
}

export function useLinkClicks(profileId?: string) {
  const configured = isSupabaseConfigured();

  return useQuery<LinkClick[]>({
    queryKey: ['linkClicks', profileId],
    queryFn: async () => {
      if (!configured || !profileId) return [];
      const { data, error } = await supabase
        .from('link_clicks')
        .select('*')
        .eq('profile_id', profileId)
        .order('clicked_at', { ascending: false })
        .limit(1000);
      if (error) return [];
      return data as LinkClick[];
    },
    enabled: !!profileId && configured,
  });
}

export async function recordLinkClick(linkId: string, profileId: string): Promise<boolean> {
  if (!isSupabaseConfigured()) return true;
  try {
    const referrer = typeof document !== 'undefined' ? document.referrer || null : null;
    const userAgent = typeof navigator !== 'undefined' ? navigator.userAgent || null : null;
    const payload: Record<string, unknown> = {
      link_id: linkId,
      profile_id: profileId,
      referrer,
      user_agent: userAgent,
    };
    const table = supabase.from('link_clicks') as any;
    const { error } = await table.insert([payload]);
    return !error;
  } catch {
    return false;
  }
}

function getDemoLinks(): Link[] {
  const demoProfileId = 'demo-id';
  const now = new Date().toISOString();
  const mk = (id: string, category: Category, label: string, url: string, icon_name: string, sort_order: number): Link => ({
    id, profile_id: demoProfileId, category, label, url, icon_name, sort_order, created_at: now,
  });
  return [
    mk('1', 'social', 'GitHub', 'https://github.com', 'Github', 0),
    mk('2', 'social', 'Twitter / X', 'https://twitter.com', 'Twitter', 1),
    mk('3', 'social', 'LinkedIn', 'https://linkedin.com', 'Linkedin', 2),
    mk('4', 'social', 'Instagram', 'https://instagram.com', 'Instagram', 3),
    mk('5', 'works', '个人博客', 'https://example.com', 'Globe', 0),
    mk('6', 'works', '技术文章', 'https://example.com/articles', 'BookOpen', 1),
    mk('7', 'works', '开源项目', 'https://github.com', 'Code2', 2),
    mk('8', 'contact', '联系邮箱', 'mailto:hello@example.com', 'Mail', 0),
    mk('9', 'contact', 'Telegram', 'https://t.me/username', 'Send', 1),
  ];
}
