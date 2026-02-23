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
    refreshProfile: async () => { }
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

    useEffect(() => {
        // Obter Sessão Inicial
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setUser(session?.user ?? null);
            if (session?.user) {
                fetchProfile(session.user.id);
            } else {
                setIsLoading(false);
            }
        });

        // Escutar Mudanças de Auth
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            setUser(session?.user ?? null);

            if (session?.user) {
                fetchProfile(session.user.id).then(() => setIsLoading(false));
            } else {
                setProfile(null);
                setIsLoading(false);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    const signOut = async () => {
        await supabase.auth.signOut();
    };

    // Derive isAdmin from profile - also check demo_bypass for local dev convenience
    const isAdmin = profile?.is_admin === true ||
        localStorage.getItem('demo_bypass') === 'true';

    const value = {
        session,
        user,
        profile,
        isLoading,
        isAdmin,
        signOut,
        refreshProfile
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}
