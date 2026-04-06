import type { AuthResponse, UserVM } from '@/api/generated/models';

const KEYS = {
    accessToken: 'access_token',
    refreshToken: 'refresh_token',
    user: 'user',
} as const;

export function getStoredTokens() {
    return {
        accessToken: localStorage.getItem(KEYS.accessToken),
        refreshToken: localStorage.getItem(KEYS.refreshToken),
    };
}

export function getStoredUser(): UserVM | null {
    const raw = localStorage.getItem(KEYS.user);
    if (!raw) return null;
    try {
        return JSON.parse(raw) as UserVM;
    } catch {
        return null;
    }
}

export function setStoredAuth(auth: AuthResponse): void {
    if (auth.token) localStorage.setItem(KEYS.accessToken, auth.token);
    if (auth.refreshToken) localStorage.setItem(KEYS.refreshToken, auth.refreshToken);
    if (auth.user) localStorage.setItem(KEYS.user, JSON.stringify(auth.user));
}

export function clearStoredAuth(): void {
    localStorage.removeItem(KEYS.accessToken);
    localStorage.removeItem(KEYS.refreshToken);
    localStorage.removeItem(KEYS.user);
}

export function isAuthenticated(): boolean {
    return localStorage.getItem(KEYS.accessToken) !== null;
}
