import { createContext, useContext, useState, useMemo } from 'react';
import type { ReactNode } from 'react';
import type { AuthResponse, UserVM } from '@/api/generated/models';
import { getStoredUser, setStoredAuth, clearStoredAuth, isAuthenticated as checkAuth } from '@/lib/auth';

interface AuthContextType {
    user: UserVM | null;
    isAuthenticated: boolean;
    setAuthFromResponse: (response: AuthResponse) => void;
    clearAuth: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<UserVM | null>(() =>
        checkAuth() ? getStoredUser() : null
    );

    const value = useMemo<AuthContextType>(() => ({
        user,
        isAuthenticated: user !== null,
        setAuthFromResponse(response: AuthResponse) {
            setStoredAuth(response);
            setUser(response.user ?? null);
        },
        clearAuth() {
            clearStoredAuth();
            setUser(null);
        },
    }), [user]);

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth(): AuthContextType {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
