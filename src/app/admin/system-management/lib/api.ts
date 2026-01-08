import axios, { AxiosResponse, AxiosError, InternalAxiosRequestConfig } from 'axios';
const TENTY_PROXY_URL = 'http://localhost:5000/admin/tenty'; 

// 2. DATA INTERFACES
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

// 3. AXIOS INSTANCE
export const tentyApi = axios.create({
    baseURL: TENTY_PROXY_URL,
    withCredentials: true, 
    headers: { 'Content-Type': 'application/json' }
});

// 4. AUTH INJECTOR
tentyApi.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        if (typeof window !== 'undefined') {
            // Try all common storage keys for the Arc Auth Token
            const token = localStorage.getItem('authToken') || localStorage.getItem('token');
            if (token && config.headers) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// 5. SERVICE METHODS
export const TentyService = {
    getAllAgents: async (): Promise<Agent[]> => (await tentyApi.get('/agents')).data,
    
    getAgentDetails: async (id: string): Promise<AgentDetails> => (await tentyApi.get(`/agents/${id}/details`)).data,
    
    getSoftware: async (id: string, search = '') => (await tentyApi.get(`/agents/${id}/software`, { params: { search } })).data,
    
    deleteAgent: async (id: string) => tentyApi.delete(`/agents/${id}`),
    
    generateInstallScript: async (os: 'windows' | 'linux' | 'mac', name: string) => (await tentyApi.post('/agents/install', { os, name })).data
};