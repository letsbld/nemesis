type Json = Record<string, any>;

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || '';

function buildUrl(path: string, params?: Record<string, string | number | undefined>) {
    const url = new URL(path, window.location.origin);
    if (params) {
        for (const [k, v] of Object.entries(params)) {
            if (v !== undefined) url.searchParams.set(k, String(v));
        }
    }
    // Allow absolute API base or same-origin
    return API_BASE ? new URL(url.pathname + url.search, API_BASE).toString() : url.toString();
}

function getAuthToken(): string | null {
    // Adjust if your app stores JWT elsewhere
    return localStorage.getItem('authToken') || localStorage.getItem('token') || null;
}

async function handleJson(res: Response) {
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
        const err = new Error(data?.error || 'Request failed');
        (err as any).status = res.status;
        (err as any).data = data;
        throw err;
    }
    return data as Json;
}

export async function getLogin(login_challenge: string, withAuth = true) {
    const headers: HeadersInit = { 'Content-Type': 'application/json' };
    if (withAuth) {
        const token = getAuthToken();
        if (token) headers.Authorization = `Bearer ${token}`;
    }
    const res = await fetch(buildUrl('/oidc/login', { login_challenge }), {
        method: 'GET',
        headers,
        credentials: 'include',
    });
    return handleJson(res);
}

export async function postAuthAccept(payload: {
    login_challenge: string;
    username: string;
    password: string;
    totpToken?: string;
}) {
    const res = await fetch(buildUrl('/oidc/auth/accept'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
    });
    return handleJson(res);
}

export async function getConsent(consent_challenge: string) {
    const res = await fetch(buildUrl('/oidc/consent', { consent_challenge }), {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
    });
    return handleJson(res);
}

export async function getDiscovery() {
    const res = await fetch(buildUrl('/oidc/.well-known/openid-configuration'), {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
    });
    return handleJson(res);
}

// OIDC health (GET /oidc/health)
export async function getOidcHealth() {
    const headers: HeadersInit = { 'Content-Type': 'application/json' };
    const token = getAuthToken();
    if (token) headers.Authorization = `Bearer ${token}`;
    const res = await fetch(buildUrl('/oidc/health'), {
        method: 'GET',
        headers,
        credentials: 'include',
    });
    return handleJson(res);
}

// Build test-start URL (GET /oidc/test/start?client_id=...&redirect_uri=...&scope=...)
export function buildTestStartUrl(opts: {
    client_id: string;
    redirect_uri: string;
    scope?: string;
}) {
    const scope = opts.scope || 'openid offline';
    return buildUrl('/oidc/test/start', {
        client_id: opts.client_id,
        redirect_uri: opts.redirect_uri,
        scope,
    });
}

// Navigate browser to backend test-start (lets backend redirect to Hydra)
export function startTestAuth(opts: { client_id: string; redirect_uri: string; scope?: string }) {
    const url = buildTestStartUrl(opts);
    window.location.assign(url);
}
