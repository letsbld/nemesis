import UserDetailView from './UserDetailView';

export default async function UserDetailPage({ params }: { params: Promise<{ userId: string }> }) {
    const { userId } = await params;

    return (
        <div className="p-8 bg-gray-50 min-h-screen">
            <UserDetailView userId={userId} />
        </div>
    );
}

export const runtime = 'edge';