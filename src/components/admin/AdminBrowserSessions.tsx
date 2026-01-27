'use client';

import { useEffect, useState } from 'react';
import { BrowserSession, getAdminSessions, deleteAdminSession } from '@/lib/browser-session-service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader } from '@/components/ui/loader';
import toast from 'react-hot-toast';

export function AdminBrowserSessions() {
  const [sessions, setSessions] = useState<BrowserSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [userFilter, setUserFilter] = useState('');
  const limit = 20;

  useEffect(() => {
    loadSessions();
  }, [page, userFilter]);

  const loadSessions = async () => {
    try {
      setLoading(true);
      const data = await getAdminSessions(page, limit, userFilter || undefined);
      setSessions(data.sessions);
      setTotal(data.total);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load sessions';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (sessionId: string) => {
    if (!confirm('Are you sure you want to delete this session?')) {
      return;
    }

    try {
      setDeleting(sessionId);
      await deleteAdminSession(sessionId);
      toast.success('Session deleted successfully');
      await loadSessions();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete session';
      toast.error(errorMessage);
    } finally {
      setDeleting(null);
    }
  };

  const openReadOnlyView = (adminViewUrl: string) => {
    window.open(adminViewUrl, '_blank', 'width=1200,height=800');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="space-y-4">
      <div className="flex gap-4 items-end">
        <div className="flex-1">
          <label className="block text-sm font-medium mb-2">Filter by User Email</label>
          <Input
            type="text"
            placeholder="user@example.com"
            value={userFilter}
            onChange={(e) => {
              setUserFilter(e.target.value);
              setPage(1);
            }}
          />
        </div>
        <Button onClick={() => loadSessions()} disabled={loading}>
          {loading ? 'Loading...' : 'Refresh'}
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <Loader />
        </div>
      ) : sessions.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground">No sessions found</p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto border rounded-lg">
            <table className="w-full text-sm">
              <thead className="bg-muted">
                <tr>
                  <th className="text-left p-3 font-semibold">User Email</th>
                  <th className="text-left p-3 font-semibold">Target URL</th>
                  <th className="text-left p-3 font-semibold">Username</th>
                  <th className="text-left p-3 font-semibold">Created</th>
                  <th className="text-left p-3 font-semibold">Expires</th>
                  <th className="text-left p-3 font-semibold">Status</th>
                  <th className="text-right p-3 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {sessions.map((session) => (
                  <tr key={session.session_id} className="border-t hover:bg-muted/50">
                    <td className="p-3 font-medium">{(session as any).user_email || '-'}</td>
                    <td className="p-3 truncate max-w-xs">{session.target_url}</td>
                    <td className="p-3">{session.username}</td>
                    <td className="p-3 text-xs">{formatDate(session.created_at)}</td>
                    <td className="p-3 text-xs">{formatDate(session.expires_at)}</td>
                    <td className="p-3">
                      <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                        session.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {session.is_active ? 'Active' : 'Expired'}
                      </span>
                    </td>
                    <td className="p-3 text-right space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openReadOnlyView(session.admin_view_url)}
                        disabled={deleting === session.session_id}
                      >
                        View
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(session.session_id)}
                        disabled={deleting === session.session_id}
                      >
                        {deleting === session.session_id ? 'Deleting...' : 'Delete'}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Total: {total} sessions | Page {page} of {totalPages}
            </p>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1 || loading}
              >
                Previous
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setPage(p => (p < totalPages ? p + 1 : p))}
                disabled={page === totalPages || loading}
              >
                Next
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
