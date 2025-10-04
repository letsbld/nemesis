// registerPasskey.ts
import { apiFetch } from '@/lib/apiFetch';
import { startRegistration, startAuthentication } from '@simplewebauthn/browser';

export async function registerPasskey() {
    try {
        // Step 1: Ask backend for registration options (already parsed JSON)
        const optionsResp = await apiFetch('/passkey/register/options', {
            method: 'POST',
        });
        // Defensive: handle both Response and plain object, and check for undefined/null
        let options;
        if (!optionsResp) {
            alert('No registration options received from server.');
            return;
        }
        if (typeof optionsResp.json === 'function') {
            options = await optionsResp.json();
        } else {
            options = optionsResp;
        }
        if (!options || typeof options !== 'object') {
            alert('Invalid registration options from server.');
            return;
        }
        console.log('Registration options:', options);

        // Step 2: Show biometric prompt
        const attResp = await startRegistration(options);
        if (!attResp) {
            alert('No attestation response from browser.');
            return;
        }
        console.log('Attestation Response:', attResp);

        // Step 3: Verify with backend
        const verifyRespRaw = await apiFetch('/passkey/register/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ attestationResponse: attResp }), // <-- wrap here!
        });
        if (!verifyRespRaw) {
            alert('No response from server during verification.');
            return;
        }
        const verifyResp =
            typeof verifyRespRaw.json === 'function' ? await verifyRespRaw.json() : verifyRespRaw;

        if (verifyResp && verifyResp.success) {
            alert('Passkey registered successfully 🎉');
        } else {
            alert(`Failed to register passkey: ${verifyResp?.error || ''}`);
        }
    } catch (err: any) {
        console.error('Registration error:', err);
        alert(err?.error || err?.message || 'Registration failed');
    }
}



export async function loginWithPasskey(username: string) {
    try {
        // Step 1: Ask backend for authentication options
        const optionsResp = await apiFetch('/passkey/authenticate/options', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username }),
        });
        let options;
        if (!optionsResp) {
            alert('No authentication options received from server.');
            return;
        }
        if (typeof optionsResp.json === 'function') {
            options = await optionsResp.json();
        } else {
            options = optionsResp;
        }
        if (!options || typeof options !== 'object') {
            alert('Invalid authentication options from server.');
            return;
        }
        const { userId, ...authOptions } = options;
        console.log('Authentication options:', authOptions);

        // Step 2: Show passkey prompt
        const assertionResp = await startAuthentication(authOptions);
        if (!assertionResp) {
            alert('No assertion response from browser.');
            return;
        }
        console.log('Assertion Response:', assertionResp);

        // Step 3: Verify with backend
        const verifyRespRaw = await apiFetch('/passkey/authenticate/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, assertionResponse: assertionResp }),
        });
        const verifyResp =
            typeof verifyRespRaw.json === 'function' ? await verifyRespRaw.json() : verifyRespRaw;

        if (verifyResp && verifyResp.success) {
            // Return backend response for session/token handling
            return verifyResp;
        } else {
            throw new Error(verifyResp?.error || 'Authentication failed');
        }
    } catch (err: any) {
        console.error('Authentication error:', err);
        throw err;
    }
}

export async function getUserDevices() {
    try {
        const resp = await apiFetch('/passkey', {
            method: 'GET',
        });

        let data;
        if (typeof resp.json === 'function') {
            data = await resp.json();
        } else {
            data = resp;
        }

        if (!data || !data.passkeys) {
            throw new Error('No devices found');
        }

        console.log('User devices:', data.passkeys);
        return data.passkeys;
    } catch (err: any) {
        console.error('Error fetching devices:', err);
        throw err;
    }
}

export async function deletePasskey(Id: string) {
    try {
        const resp = await apiFetch(`/passkey/${Id}`, {
            method: 'DELETE',
        });

        let data;
        if (typeof resp.json === 'function') {
            data = await resp.json();
        } else {
            data = resp;
        }

        if (data && data.success) {
            return true;
        } else {
            throw new Error(data?.error || 'Failed to delete credential');
        }
    } catch (err: any) {
        console.error('Error deleting passkey:', err);
        throw err;
    }
}

