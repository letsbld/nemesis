export async function apiFetch(endpoint: string, options?: RequestInit): Promise<any> {
    const apiUrl = `${process.env.NEXT_PUBLIC_PASS_API_BASE_URL || ''}/api`;
    const url = endpoint.startsWith('/') ? `${apiUrl}${endpoint}` : `${apiUrl}/${endpoint}`;
    console.log(url, 'Url here');
    //password-generator/api
    // Attach Authorization header if token exists
    const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
    let fetchOptions: RequestInit;

    if (token) {
        const headers = new Headers(options?.headers || {});
        headers.set('Authorization', `Bearer ${token}`);
        fetchOptions = {
            ...options,
            headers,
        };
    } else {
        fetchOptions = options || {};
    }

    const response = await fetch(url, fetchOptions);

    let data;
    try {
        data = await response.json();
    } catch {
        data = null;
    }

    if (!response.ok) {
        throw data || { error: 'API request failed' };
    }
    return {
        ok: response.ok,
        status: response.status,
        json: async () => data,
    };
}
