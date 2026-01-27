'use client';

import { useEffect, useState } from 'react';
import { BrowserSession, getUserSessions, deleteBrowserSession } from '@/lib/browser-session-service';
import { Button } from '@/components/ui/button';
import { Loader } from '@/components/ui/loader';
import toast from 'react-hot-toast';

interface BrowserSessionsListProps {
  onRefresh?: () => void;
}

export function BrowserSessionsList({ onRefresh }: BrowserSessionsListProps) {
  const [sessions, setSessions] = useState<BrowserSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    try {
      setLoading(true);
      const data = await getUserSessions();
      setSessions(data.data);
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
      await deleteBrowserSession(sessionId);
      toast.success('Session deleted successfully');
      await loadSessions();
      onRefresh?.();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete session';
      toast.error(errorMessage);
    } finally {
      setDeleting(null);
    }
  };

  const openSession = (accessUrl: string) => {
    window.open(accessUrl, '_blank', 'width=1200,height=800');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader />
      </div>
    );
  }

  if (sessions.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No active sessions</p>
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="border-b">
          <tr>
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
            <tr key={session.session_id} className="border-b hover:bg-muted/50">
              <td className="p-3 truncate">{session.target_url}</td>
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
                  onClick={() => openSession(session.access_url)}
                  disabled={!session.is_active || deleting === session.session_id}
                >
                  Open
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
  );
}
