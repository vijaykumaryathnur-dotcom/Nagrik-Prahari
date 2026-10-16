import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { Profile, UserRole, LanguageCode } from '../types/database';
import { translations, Translations } from '../lib/i18n';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  role: UserRole;
  loading: boolean;
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => Promise<void>;
  t: Translations;
  signIn: (email: string, pass: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, pass: string, fullName: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [language, setLanguageState] = useState<LanguageCode>(() => {
    const saved = localStorage.getItem('nagrik_lang') as LanguageCode;
    return saved && ['en', 'hi', 'te'].includes(saved) ? saved : 'en';
  });

  const fetchProfile = async (userId: string): Promise<Profile | null> => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        console.warn('Error fetching user profile:', error.message);
        return null;
      }

      if (data) {
        const p = data as Profile;
        setProfile(p);
        if (p.language && ['en', 'hi', 'te'].includes(p.language)) {
          setLanguageState(p.language);
          localStorage.setItem('nagrik_lang', p.language);
        }
        return p;
      }
      return null;
    } catch (err) {
      console.warn('Exception fetching profile:', err);
      return null;
    }
  };

  useEffect(() => {
    // 1. Initial session check
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id).finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
    });

    // 2. Auth state changes listener
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
      setSession(newSession);
      setUser(newSession?.user ?? null);
      if (newSession?.user) {
        await fetchProfile(newSession.user.id);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const setLanguage = async (newLang: LanguageCode) => {
    setLanguageState(newLang);
    localStorage.setItem('nagrik_lang', newLang);
    if (user && profile) {
      try {
        await supabase
          .from('profiles')
          .update({ language: newLang })
          .eq('id', user.id);
      } catch (err) {
        console.warn('Could not save language to profile in DB:', err);
      }
    }
  };

  const signIn = async (email: string, pass: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password: pass,
    });
    return { error: error as Error | null };
  };

  const signUp = async (email: string, pass: string, fullName: string) => {
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password: pass,
      options: {
        data: {
          full_name: fullName.trim(),
        },
      },
    });

    if (!error && data.user) {
      // Ensure profile row exists if database trigger is slightly delayed or not configured
      try {
        await supabase.from('profiles').upsert({
          id: data.user.id,
          full_name: fullName.trim(),
          role: 'citizen',
          language: language,
        });
        await fetchProfile(data.user.id);
      } catch (e) {
        console.warn('Profile upsert note:', e);
      }
    }

    return { error: error as Error | null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setUser(null);
    setProfile(null);
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.id);
    }
  };

  const t = useMemo(() => translations[language], [language]);

  const role: UserRole = profile?.role || 'citizen';

  return (
    <AuthContext.Provider
      value={{
        session,
        user,
        profile,
        role,
        loading,
        language,
        setLanguage,
        t,
        signIn,
        signUp,
        signOut,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
