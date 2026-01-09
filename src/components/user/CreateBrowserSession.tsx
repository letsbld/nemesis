'use client';

import { useState } from 'react';
import { createBrowserSession, CreateSessionPayload, SessionResponse } from '@/lib/browser-session-service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import toast from 'react-hot-toast';

interface CreateBrowserSessionProps {
  onSessionCreated?: (session: SessionResponse) => void;
  onClose?: () => void;
}

export function CreateBrowserSession({ onSessionCreated, onClose }: CreateBrowserSessionProps) {
  const [targetUrl, setTargetUrl] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload: CreateSessionPayload = {
        target_url: targetUrl,
        username,
        password,
      };

      const session = await createBrowserSession(payload);
      toast.success('Browser session created successfully!');
      
      // Reset form
      setTargetUrl('');
      setUsername('');
      setPassword('');

      onSessionCreated?.(session);
      onClose?.();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create session';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 w-full max-w-md">
      <div>
        <label className="block text-sm font-medium mb-1">Target URL</label>
        <Input
          type="url"
          placeholder="https://example.com"
          value={targetUrl}
          onChange={(e) => setTargetUrl(e.target.value)}
          required
          disabled={loading}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Username</label>
        <Input
          type="text"
          placeholder="Enter username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          disabled={loading}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Password</label>
        <Input
          type="password"
          placeholder="Enter password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          disabled={loading}
        />
      </div>

      <div className="flex gap-2 pt-4">
        <Button type="submit" disabled={loading}>
          {loading ? 'Creating...' : 'Create Session'}
        </Button>
        {onClose && (
          <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}
