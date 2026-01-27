'use client';

import { AdminBrowserSessions } from '@/components/admin/AdminBrowserSessions';

export default function AdminBrowserSessionsPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-7xl mx-auto py-8">
        <div className="space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold">Browser Sessions Management</h1>
            <p className="text-muted-foreground mt-2">View and manage all browser sessions</p>
          </div>

          {/* Admin Panel */}
          <div className="bg-card border rounded-lg p-6">
            <AdminBrowserSessions />
          </div>
        </div>
      </div>
    </div>
  );
}
