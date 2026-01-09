import { apiFetch } from './apiFetch';

export interface BrowserSession {
  session_id: string;
  target_url: string;
  username: string;
  access_url: string;
  admin_view_url: string;
  created_at: string;
  expires_at: string;
  is_active: boolean;
}

export interface CreateSessionPayload {
  target_url: string;
  username: string;
  password: string;
}

export interface SessionResponse extends BrowserSession {
  created_at: string;
  expires_at: string;
}

// User APIs
export async function createBrowserSession(payload: CreateSessionPayload) {
  return apiFetch('/v1/browser-sessions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  }) as Promise<SessionResponse>;
}

export async function getUserSessions(page: number = 1, limit: number = 20) {
  return apiFetch(`/v1/browser-sessions?page=${page}&limit=${limit}`, {
    method: 'GET',
  }) as Promise<{
    data: BrowserSession[];
    total: number;
    page: number;
    limit: number;
  }>;
}

export async function getBrowserSession(sessionId: string) {
  return apiFetch(`/v1/browser-sessions/${sessionId}`, {
    method: 'GET',
  }) as Promise<BrowserSession>;
}

export async function deleteBrowserSession(sessionId: string) {
  await apiFetch(`/v1/browser-sessions/${sessionId}`, {
    method: 'DELETE',
  });
  return true;
}

// Admin APIs
export async function getAdminSessions(page: number = 1, limit: number = 20, userId?: string) {
  let url = `/v1/browser-sessions/admin?page=${page}&limit=${limit}`;
  if (userId) {
    url += `&user_id=${userId}`;
  }

  const result = await apiFetch(url, {
    method: 'GET',
  }) as {
    data: BrowserSession[];
    total: number;
    page: number;
    limit: number;
  };
  
  // Transform data to sessions for consistent interface
  return {
    sessions: result.data,
    total: result.total,
    page: result.page,
    limit: result.limit,
  };
}

export async function getAdminSession(sessionId: string) {
  return apiFetch(`/v1/browser-sessions/admin/${sessionId}`, {
    method: 'GET',
  }) as Promise<BrowserSession>;
}

export async function deleteAdminSession(sessionId: string) {
  await apiFetch(`/v1/browser-sessions/admin/${sessionId}`, {
    method: 'DELETE',
  });
  return true;
}
