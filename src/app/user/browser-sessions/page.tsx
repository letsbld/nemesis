'use client';

import { useState } from 'react';
import { CreateBrowserSession } from '@/components/user/CreateBrowserSession';
import { BrowserSessionsList } from '@/components/user/BrowserSessionsList';
import { SessionResponse } from '@/lib/browser-session-service';
import { Button } from '@/components/ui/button';

export default function BrowserSessionsPage() {
  const [showForm, setShowForm] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleSessionCreated = (session: SessionResponse) => {
    setShowForm(false);
    setRefreshKey(k => k + 1);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-6xl mx-auto py-8">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">Browser Sessions</h1>
              <p className="text-muted-foreground mt-2">Create and manage your browser sessions</p>
            </div>
            {!showForm && (
              <Button onClick={() => setShowForm(true)} size="lg">
                Create New Session
              </Button>
            )}
          </div>

          {/* Create Form */}
          {showForm && (
            <div className="bg-card border rounded-lg p-6">
              <h2 className="text-lg font-semibold mb-4">Create Browser Session</h2>
              <CreateBrowserSession
                onSessionCreated={handleSessionCreated}
                onClose={() => setShowForm(false)}
              />
            </div>
          )}

          {/* Sessions List */}
          <div className="bg-card border rounded-lg p-6">
            <h2 className="text-lg font-semibold mb-4">Active Sessions</h2>
            <BrowserSessionsList key={refreshKey} onRefresh={() => setRefreshKey(k => k + 1)} />
          </div>
        </div>
      </div>
    </div>
  );
}
