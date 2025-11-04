import { apiFetch } from '../lib/apiFetch';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || '';

// function buildTestStartUrl(opts: { client_id: string; redirect_uri: string; scope?: string }) {
//     const scope = opts.scope || 'openid offline';
//     const path = '/oidc/test/start';
//     const params = new URLSearchParams({
//         client_id: opts.client_id,
//         redirect_uri: opts.redirect_uri,
//         scope,
//     });
//     if (API_BASE) {
//         return new URL(`${path}?${params.toString()}`, API_BASE).toString();
//     }
//     return `${window.location.origin}${path}?${params.toString()}`;
// }

export async function startTestAuth(opts: {
    client_id: string;
    redirect_uri: string;
    scope?: string;
}) {
    // Instead of navigating the browser to the backend `/oidc/test/start` endpoint (which would
    // cause a redirect through the backend port), call the backend via XHR to obtain the
    // provider authorization URL and then navigate the browser directly to that URL.
    const scope = opts.scope || 'openid offline';
    const params = new URLSearchParams({
        client_id: opts.client_id,
        redirect_uri: opts.redirect_uri,
        scope,
        // redirect: 'true',
    });
    const qs = `?${params.toString()}`;

    // Call backend to build the provider URL. We don't want apiFetch to attach Authorization here.
    const data = await apiFetch(`/oidc/test/start${qs}`, {
        method: 'GET',
        followRedirects: true,
    });

    // apiFetch returns either parsed JSON or { redirect_to } when backend responded with a Location header
    const redirect = (data && (data.redirect_to || (data as any).url)) as string | undefined;
    if (redirect) {
        window.location.assign(redirect);
        return;
    }

    // If backend returned something unexpected, fallback to constructing a direct URL if API_BASE is set
    if (API_BASE) {
        const url = new URL(`/api/oidc/test/start${qs}`, API_BASE).toString();
        window.location.assign(url);
        return;
    }

    // As a final fallback, navigate same-origin path (this will hit the backend)
    window.location.assign(`${window.location.origin}/api/oidc/test/start${qs}`);
}

export async function getLogin(login_challenge: string, withAuth = true) {
    const qs = `?login_challenge=${encodeURIComponent(login_challenge)}`;
    return apiFetch(`/oidc/login${qs}`, {
        method: 'GET',
        credentials: 'include',
        skipAuth: !withAuth,
        followRedirects: false,
    });
}

export async function postAuthAccept(payload: {
    login_challenge: string;
    username: string;
    password: string;
    totpToken?: string;
}) {
    return apiFetch('/oidc/auth/accept', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        followRedirects: false,
    });
}

export async function getConsent(consent_challenge: string) {
    const qs = `?consent_challenge=${encodeURIComponent(consent_challenge)}`;
    return apiFetch(`/oidc/consent${qs}`, {
        method: 'GET',
        credentials: 'include',
        followRedirects: false,
    });
}

export async function getDiscovery() {
    return apiFetch('/oidc/.well-known/openid-configuration', { method: 'GET' });
}

export async function getOidcHealth() {
    return apiFetch('/oidc/health', {
        method: 'GET',
        credentials: 'include',
        followRedirects: false,
    });
}
