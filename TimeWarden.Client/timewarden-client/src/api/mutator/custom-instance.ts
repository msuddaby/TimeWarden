export const customInstance = async <T>(
    url: string,
    init?: RequestInit,
): Promise<T> => {
    const token = localStorage.getItem("access_token");

    const headers = new Headers(init?.headers);

    if (token) {
        headers.set("Authorization", `Bearer ${token}`);
    }

    const response = await fetch(url, {
        ...init,
        headers,
    });

    if (!response.ok) {
        const body = await response.text().catch(() => "");
        throw new Error(body || `Request failed with status ${response.status}`);
    }

    const contentType = response.headers.get("content-type");
    const data = contentType?.includes("application/json")
        ? await response.json()
        : undefined;

    return { data, status: response.status, headers: response.headers } as T;
};

export default customInstance;
