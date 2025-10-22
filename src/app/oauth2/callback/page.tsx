'use client';

import React, { useMemo, useEffect } from 'react';

export default function OAuthCallbackPage() {
	// Parse query params
	const params = useMemo(() => {
		if (typeof window === 'undefined') return new URLSearchParams();
		return new URLSearchParams(window.location.search);
	}, []);
	const code = params.get('code') || '';
	const state = params.get('state') || '';
	const error = params.get('error') || '';
	const error_description = params.get('error_description') || '';

	useEffect(() => {
		console.debug('[OIDC] /oauth2/callback', {
			code: code ? '<present>' : '',
			state,
			error,
			error_description,
			href: typeof window !== 'undefined' ? window.location.href : '',
		});
		// Stash code in sessionStorage for quick manual testing/debug
		if (code && state) {
			try {
				sessionStorage.setItem(`oidc:auth_code:${state}`, code);
			} catch {}
		}
	}, [code, state, error, error_description]);

	// Small helpers
	function resetUrl() {
		if (typeof window === 'undefined') return;
		window.history.replaceState({}, '', window.location.pathname);
	}

	if (error) {
		return (
			<div style={{ maxWidth: 720, padding: 16 }}>
				<h3>OIDC Authorization Error</h3>
				<div style={{ color: 'red', marginTop: 8 }}>
					{error}: {decodeURIComponent(error_description || '')}
				</div>
				{error === 'request_forbidden' ? (
					<div style={{ marginTop: 12, fontSize: 14 }}>
						Possible causes:
						<ul>
							<li>No CSRF cookie/session available to Hydra.</li>
							<li>Cross-site cookie blocked or wrong domain/port.</li>
						</ul>
						Quick checks:
						<ul>
							<li>Use the same host and scheme across redirects (e.g., all on http://localhost).</li>
							<li>Ensure backend sets Hydra cookies with credentials and your fetch uses credentials: 'include'.</li>
							<li>Verify Hydra login/consent URLs point to your frontend /oidc/login and /oidc/consent.</li>
						</ul>
					</div>
				) : null}
				<div style={{ marginTop: 12, fontSize: 12, opacity: 0.7 }}>
					state: {state || '(none)'}
				</div>
				<button style={{ marginTop: 12 }} onClick={resetUrl}>
					Clear query
				</button>
			</div>
		);
	}

	return (
		<div style={{ maxWidth: 720, padding: 16 }}>
			<h3>OIDC Authorization Callback</h3>
			{code ? (
				<>
					<div style={{ marginTop: 8 }}>
						Authorization code received. The OIDC client backend should exchange this at
						/oauth2/token with grant_type=authorization_code.
					</div>
					<pre style={{ marginTop: 12, background: '#f5f5f5', padding: 12 }}>
{`code: ${code}
state: ${state || '(none)'}`}
					</pre>
					<button style={{ marginTop: 12 }} onClick={resetUrl}>
						Clear query
					</button>
				</>
			) : (
				<div>No authorization code found.</div>
			)}
		</div>
	);
}
