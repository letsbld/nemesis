'use client';

export default function GoogleLogin() {
    const handleGoogleLogin = () => {
        window.location.href = '/api/auth/google'; // Replace with your Google OAuth endpoint
    };

    return (
        <div className="p-10">
            <h1 className="text-2xl font-bold mb-4">Admin Login</h1>
            <button onClick={handleGoogleLogin} className="px-4 py-2 bg-black text-white rounded">
                Sign in with Google
            </button>
        </div>
    );
}
