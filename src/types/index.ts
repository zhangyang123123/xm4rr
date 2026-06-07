export type Category = 'social' | 'works' | 'contact';

export interface Profile {
  id: string;
  username: string;
  name: string;
  bio: string | null;
  avatar_url: string | null;
  theme: string | null;
  created_at: string;
  updated_at: string;
}

export interface Link {
  id: string;
  profile_id: string;
  category: Category;
  label: string;
  url: string;
  icon_name: string;
  sort_order: number;
  created_at: string;
}

export interface LinkClick {
  id: string;
  link_id: string;
  profile_id: string;
  referrer: string | null;
  user_agent: string | null;
  ip_hash: string | null;
  clicked_at: string;
}

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Partial<Omit<Profile, 'id'>> & { id: string };
        Update: Partial<Omit<Profile, 'id'>>;
      };
      links: {
        Row: Link;
        Insert: Partial<Omit<Link, 'id' | 'created_at'>> & { profile_id: string; label: string; url: string; icon_name: string; category: Category };
        Update: Partial<Omit<Link, 'id'>>;
      };
      link_clicks: {
        Row: LinkClick;
        Insert: Partial<Omit<LinkClick, 'id'>> & { link_id: string; profile_id: string };
        Update: Partial<Omit<LinkClick, 'id'>>;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
