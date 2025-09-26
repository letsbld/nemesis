'use client';

import { useAuth } from '@/context/AuthContext';
import { PrivateRoute } from '@/components/PrivateRoute';

export default function UserHomePage() {
    const { user } = useAuth();

    return (
        <PrivateRoute allowedRoles={['user']}>
            <div className="min-h-screen bg-gray-50">
                <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
                    <div className="bg-white rounded-lg shadow-md p-8 mb-8">
                        <h1 className="text-3xl font-bold text-gray-900 mb-4">
                            Welcome, {user?.username || 'User'}!
                        </h1>
                        <p className="text-gray-600 mb-8">
                            Access your Data Loss Prevention controls and settings here.
                        </p>
                        
                        {/* Quick Actions */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <div className="p-6 bg-blue-50 rounded-lg border border-blue-100">
                                <h3 className="text-lg font-semibold text-blue-900 mb-3">Device Security</h3>
                                <p className="text-blue-700 mb-4">Manage your device security settings and preferences</p>
                                <a href="/device/settings" className="text-blue-600 hover:text-blue-700 font-medium">
                                    Go to Settings →
                                </a>
                            </div>

                            <div className="p-6 bg-green-50 rounded-lg border border-green-100">
                                <h3 className="text-lg font-semibold text-green-900 mb-3">Activity Logs</h3>
                                <p className="text-green-700 mb-4">View your recent device and security activity</p>
                                <a href="/device/logs" className="text-green-600 hover:text-green-700 font-medium">
                                    View Logs →
                                </a>
                            </div>

                            <div className="p-6 bg-purple-50 rounded-lg border border-purple-100">
                                <h3 className="text-lg font-semibold text-purple-900 mb-3">Security Report</h3>
                                <p className="text-purple-700 mb-4">Generate and view your security status report</p>
                                <a href="/device/report" className="text-purple-600 hover:text-purple-700 font-medium">
                                    View Report →
                                </a>
                            </div>
                        </div>
                    </div>

                    {/* Recent Activity */}
                    <div className="bg-white rounded-lg shadow-md p-8">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">Recent Activity</h2>
                        <div className="space-y-4">
                            <div className="flex items-start space-x-4">
                                <div className="min-w-0 flex-1">
                                    <p className="text-sm font-medium text-gray-900">Last Login</p>
                                    <p className="text-sm text-gray-500">
                                        {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-start space-x-4">
                                <div className="min-w-0 flex-1">
                                    <p className="text-sm font-medium text-gray-900">Security Status</p>
                                    <p className="text-sm text-green-500">All systems operational</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </PrivateRoute>
    );
}
