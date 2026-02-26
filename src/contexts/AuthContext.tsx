import { createContext, useContext, useEffect, useState } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

// Define the shape of our context
interface AuthContextType {
    session: Session | null;
    user: User | null;
    profile: Profile | null;
    isLoading: boolean;
    isAdmin: boolean;
    signOut: () => Promise<void>;
    refreshProfile: () => Promise<void>;
    updateProfile: (data: Partial<Profile>) => Promise<void>;
}

interface Profile {
    id: string;
    first_name: string;
    last_name: string;
    avatar_url: string | null;
    is_admin: boolean;
}

const AuthContext = createContext<AuthContextType>({
    session: null,
    user: null,
    profile: null,
    isLoading: true,
    isAdmin: false,
    signOut: async () => { },
    refreshProfile: async () => { },
    updateProfile: async () => { }
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [session, setSession] = useState<Session | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<Profile | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const fetchProfile = async (userId: string) => {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .single();

            if (error) {
                console.error('Error fetching user profile:', error);
            } else if (data) {
                setProfile(data);
            }
        } catch (error) {
            console.error('Error in fetchProfile:', error);
        }
    };

    const refreshProfile = async () => {
        if (user) {
            await fetchProfile(user.id);
        }
    };

    const updateProfile = async (data: Partial<Profile>) => {
        if (!user) return;

        // Se for demo, atualiza localmente
        if (user.id === '00000000-0000-0000-0000-000000000000') {
            const updatedProfile = profile ? { ...profile, ...data } : null;
            setProfile(updatedProfile);
            if (updatedProfile) {
                localStorage.setItem('demo_profile', JSON.stringify(updatedProfile));
            }
            return;
        }

        // Real
        const { error } = await supabase.from('profiles').update(data).eq('id', user.id);
        if (error) throw error;
        await refreshProfile();
    };

    useEffect(() => {
        const checkBypass = () => {
            const isBypass = localStorage.getItem('demo_bypass') === 'true';
            if (isBypass && !user) {
                const mockUser = {
                    id: '00000000-0000-0000-0000-000000000000',
                    email: 'demo@bethel.com.br',
                    user_metadata: { first_name: 'Usuário', last_name: 'Demo' }
                } as any;
                setUser(mockUser);
                const savedProfile = localStorage.getItem('demo_profile');
                let initialProfile = {
                    id: '00000000-0000-0000-0000-000000000000',
                    first_name: 'Usuário',
                    last_name: 'Demo',
                    avatar_url: null,
                    is_admin: true
                };

                if (savedProfile) {
                    try {
                        initialProfile = { ...initialProfile, ...JSON.parse(savedProfile) };
                    } catch (e) { }
                }

                setProfile(initialProfile);
                setIsLoading(false);
                return true;
            }
            return false;
        };

        // Obter Sessão Inicial
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session) {
                setSession(session);
                setUser(session.user);
                fetchProfile(session.user.id).then(() => setIsLoading(false));
            } else {
                if (!checkBypass()) {
                    setIsLoading(false);
                }
            }
        });

        // Escutar Mudanças de Auth
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            if (session) {
                setSession(session);
                setUser(session.user);
                fetchProfile(session.user.id).then(() => setIsLoading(false));
            } else {
                if (!checkBypass()) {
                    setSession(null);
                    setUser(null);
                    setProfile(null);
                    setIsLoading(false);
                }
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    const signOut = async () => {
        await supabase.auth.signOut();
    };

    // Bypass temporário: todos são admins enquanto desenvolve
    const isAdmin = true;

    const value = {
        session,
        user,
        profile,
        isLoading,
        isAdmin,
        signOut,
        refreshProfile,
        updateProfile
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}
