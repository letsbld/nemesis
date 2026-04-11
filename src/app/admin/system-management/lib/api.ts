import axios, { InternalAxiosRequestConfig } from 'axios';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
const TENTY_PROXY_URL = `${API_BASE}/admin/tenty`;
const MESHCENTRAL_PROXY_URL = `${API_BASE}/api/meshcentral`;

export interface Agent {
    id: string;
    status: 'active' | 'disconnected' | 'never_connected' | 'pending';
    name: string;
    ip: string;
    os: { name: string; platform: string; version: string; };
    version: string;
    lastKeepAlive?: string;
}

export interface AgentDetails {
    agent_id: string;
    status: string;
    os: any;
    hardware: any;
    network: any[];
}

export const tentyApi = axios.create({
    baseURL: TENTY_PROXY_URL,
    withCredentials: true,
    headers: { 'Content-Type': 'application/json' }
});

tentyApi.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        if (typeof window !== 'undefined') {
            const token = localStorage.getItem('authToken') || localStorage.getItem('token');
            if (token && config.headers) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        }
        return config;
    },
    (error) => Promise.reject(error)
);

const ensureJson = (data: any) => {
    if (typeof data === 'string') {
        try { return JSON.parse(data); } catch { return data; }
    }
    return data;
};

export const TentyService = {
    getAllAgents: async (): Promise<Agent[]> => ensureJson((await tentyApi.get('/agents')).data),
    getAgentDetails: async (id: string): Promise<AgentDetails> => ensureJson((await tentyApi.get(`/agents/${id}/details`)).data),
    getSoftware: async (id: string, search = '') => {
        const params = search && search.trim() !== '' ? { search } : {};
        return ensureJson((await tentyApi.get(`/agents/${id}/software`, { params })).data);
    },
    deleteAgent: async (id: string) => tentyApi.delete(`/agents/${id}`),
    generateInstallScript: async (os: 'windows' | 'linux' | 'mac', name: string) => ensureJson((await tentyApi.post('/agents/install', { os, name })).data)
};

export const MeshCentralService = {
    getDevices: async () => {
        const res = ensureJson((await tentyApi.get('/devices', { baseURL: MESHCENTRAL_PROXY_URL })).data);
        // morty returns { devices: string[], lastUpdated: string }
        // Each item in devices is a raw stdout line from meshctrl listdevices.
        // Try to parse each line as JSON; if it fails, wrap it as a simple object.
        const raw: string[] = Array.isArray(res?.devices) ? res.devices : (Array.isArray(res) ? res : []);
        return raw.map((item: any) => {
            if (typeof item === 'object' && item !== null) return item;
            if (typeof item === 'string') {
                try { return JSON.parse(item); } catch { /* not JSON */ }
                // Fallback: treat the line as a device name
                return { name: item.trim(), nodeid: item.trim(), conn: 0 };
            }
            return { name: 'Unknown', nodeid: String(item), conn: 0 };
        }).filter((d: any) => d && d.name);
    },
    getWsUrl: (nodeid: string, type: 'terminal' | 'desktop') => {
        // morty is a transparent proxy: server.on('upgrade') pipes the WebSocket
        // directly to MeshCentral without touching the URL.
        // arcReactor rewrites ^/api/meshcentral -> '' before forwarding to morty:3001.
        // So we build the full MeshCentral relay path after the /api/meshcentral prefix.
        const wsBase = API_BASE.replace('http', 'ws').replace('https', 'wss');
        const token = typeof window !== 'undefined' ? (localStorage.getItem('authToken') || localStorage.getItem('token')) : '';
        const protocol = type === 'terminal' ? 1 : 2; // MeshCentral: 1=terminal, 2=desktop
        return `${wsBase}/api/meshcentral/meshrelay.ashx?nodeid=${encodeURIComponent(nodeid)}&p=${protocol}&token=${token}`;
    },
    getLinuxInstall: async () => {
        const res = (await tentyApi.get('/install/linux', { baseURL: MESHCENTRAL_PROXY_URL })).data;
        // morty returns a raw string (the install command)
        return typeof res === 'string' ? res : ensureJson(res);
    },
    getMacInstall: async () => {
        const res = (await tentyApi.get('/install/mac', { baseURL: MESHCENTRAL_PROXY_URL })).data;
        return typeof res === 'string' ? res : ensureJson(res);
    },
    downloadWindowsAgent: async () => {
        // morty's /install/windows returns a string URL, not a binary blob
        const response = await tentyApi.get('/install/windows', {
            baseURL: MESHCENTRAL_PROXY_URL,
        });

        const downloadUrl = typeof response.data === 'string'
            ? response.data.trim()
            : response.data?.url || response.data;

        if (typeof downloadUrl === 'string' && downloadUrl.startsWith('http')) {
            // Open the actual installer URL directly
            window.open(downloadUrl, '_blank');
        } else {
            // Fallback: treat the response as a blob download
            const blob = new Blob([response.data]);
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'agent-setup.exe');
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        }
    }
};