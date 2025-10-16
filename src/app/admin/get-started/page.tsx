// Admin Get Started Page
'use client';
import Link from 'next/link';

export default function AdminGetStarted() {
  return (
    <div className="max-w-3xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-6">Get Started with the Admin Panel</h1>
      <p className="mb-6 text-gray-700 text-lg">Welcome to the DLP Admin Console! Here’s a quick overview of all the main sections you can access as an admin:</p>
      <ul className="space-y-6">
        <li>
          <span className="font-semibold text-blue-700">Dashboard:</span> Your main overview for system status, quick stats, and recent activity.
        </li>
        <li>
          <span className="font-semibold text-blue-700">Device Management:</span> Manage all registered devices, view device details, and send commands to endpoints.
        </li>
        <li>
          <span className="font-semibold text-blue-700">User Management:</span> View, create, and manage users and user groups. Assign roles and permissions.
        </li>
        <li>
          <span className="font-semibold text-blue-700">Security:</span> Configure SSO, manage authentication policies, and review access logs.
        </li>
      </ul>
      <div className="mt-10">
        <Link href="/admin/dashboard" className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition">Go to Dashboard</Link>
      </div>
    </div>
  );
}
