import DashboardView from './DashboardView';

export default function DashboardPage() {
    return (
        <div className="p-8 bg-gray-50 min-h-screen">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">Password Security Overview</h1>
            <DashboardView />
        </div>
    );
}