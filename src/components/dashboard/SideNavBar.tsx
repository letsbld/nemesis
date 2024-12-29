import Link from 'next/link';

export const SideNavBar = () => {
    return (
        <nav className="w-64 h-screen text-white flex flex-col bg-gray-950">
            <div className="p-4 text-2xl font-bold">DLP Dashboard</div>
            <ul className="flex flex-col p-4">
                <li className="mb-2">
                    <Link href="/" className="hover:underline">
                        Home
                    </Link>
                </li>
                <li className="mb-2">
                    <Link href="/dashboard" className="hover:underline">
                        Dashboard
                    </Link>
                </li>
                <li className="mb-2">
                    <Link href="/device" className="hover:underline">
                        Device
                    </Link>
                </li>
                <li className="mb-2">
                    <Link href="/user" className="hover:underline">
                        User
                    </Link>
                </li>
                <li className="mb-2">
                    <Link href="/settings" className="hover:underline">
                        Settings
                    </Link>
                </li>
            </ul>
        </nav>
    );
};
