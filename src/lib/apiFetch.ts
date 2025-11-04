export type ApiFetchOptions = RequestInit & { skipAuth?: boolean; followRedirects?: boolean };

export async function apiFetch(endpoint: string, options?: ApiFetchOptions): Promise<any> {
    const apiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL || ''}/api`;
    const url = endpoint.startsWith('/') ? `${apiUrl}${endpoint}` : `${apiUrl}/${endpoint}`;
    // console.debug(url, 'apiFetch URL');

    // Attach Authorization header if token exists
    const token =
        typeof window !== 'undefined'
            ? localStorage.getItem('authToken') || localStorage.getItem('token')
            : null;

    const skipAuth = Boolean(options?.skipAuth === true);
    const followRedirects = options?.followRedirects !== false; // default true

    // Merge headers
    const headers = new Headers(options?.headers || {});
    if (!skipAuth && token) headers.set('Authorization', `Bearer ${token}`);

    const fetchOptions: RequestInit = {
        ...options,
        headers,
        redirect: followRedirects ? (options?.redirect as RequestRedirect) || 'follow' : 'manual',
    };

    let response: Response;
    try {
        response = await fetch(url, fetchOptions);
    } catch (err) {
        throw { error: 'Network error', details: err };
    }

    // If we disabled following redirects and server returned a 3xx, expose the Location header to caller
    if (!followRedirects && response.status >= 300 && response.status < 400) {
        const loc = response.headers.get('location');
        if (loc) return { redirect_to: loc };
    }

    let data: any = null;
    try {
        data = await response.json();
    } catch (_) {
        data = null;
    }

    if (!response.ok) {
        throw data || { error: 'API request failed', status: response.status };
    }
    return data;
}
