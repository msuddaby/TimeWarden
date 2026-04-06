import { getStoredTokens, setStoredAuth, clearStoredAuth } from '@/lib/auth';

const API_URL = import.meta.env.VITE_API_URL || '';
const REFRESH_URL = `${API_URL}/api/User/refresh`;

let refreshPromise: Promise<boolean> | null = null;

async function tryRefreshToken(): Promise<boolean> {
    if (refreshPromise) return refreshPromise;

    refreshPromise = (async () => {
        const { refreshToken } = getStoredTokens();
        if (!refreshToken) return false;

        try {
            const response = await fetch(REFRESH_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ refreshToken }),
            });

            if (!response.ok) return false;

            const data = await response.json();
            setStoredAuth(data);
            return true;
        } catch {
            return false;
        } finally {
            refreshPromise = null;
        }
    })();

    return refreshPromise;
}

export const customInstance = async <T>(
    url: string,
    init?: RequestInit,
): Promise<T> => {
    const { accessToken } = getStoredTokens();

    const headers = new Headers(init?.headers);

    if (accessToken) {
        headers.set('Authorization', `Bearer ${accessToken}`);
    }

    const fullUrl = `${API_URL}${url}`;

    const response = await fetch(fullUrl, {
        ...init,
        headers,
    });

    // On 401, attempt token refresh and retry (skip if this IS the refresh call)
    if (response.status === 401 && fullUrl !== REFRESH_URL) {
        const refreshed = await tryRefreshToken();
        if (refreshed) {
            const { accessToken: newToken } = getStoredTokens();
            const retryHeaders = new Headers(init?.headers);
            if (newToken) {
                retryHeaders.set('Authorization', `Bearer ${newToken}`);
            }

            const retryResponse = await fetch(fullUrl, {
                ...init,
                headers: retryHeaders,
            });

            if (!retryResponse.ok) {
                const body = await retryResponse.text().catch(() => '');
                throw new Error(body || `Request failed with status ${retryResponse.status}`);
            }

            const contentType = retryResponse.headers.get('content-type');
            const data = contentType?.includes('application/json')
                ? await retryResponse.json()
                : undefined;

            return { data, status: retryResponse.status, headers: retryResponse.headers } as T;
        }

        // Refresh failed — clear auth and redirect to login
        clearStoredAuth();
        window.location.href = '/login';
        throw new Error('Session expired');
    }

    if (!response.ok) {
        const body = await response.text().catch(() => '');
        throw new Error(body || `Request failed with status ${response.status}`);
    }

    const contentType = response.headers.get('content-type');
    const data = contentType?.includes('application/json')
        ? await response.json()
        : undefined;

    return { data, status: response.status, headers: response.headers } as T;
};

export default customInstance;
