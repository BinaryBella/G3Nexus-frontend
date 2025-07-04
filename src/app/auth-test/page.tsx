'use client';

import { useAuth } from '@/app/contexts/AuthContext';
import { debugAuthState } from '@/app/utils/authDebug';
import { CLIENT_ADMIN, CLIENT_USER, COMPANY_ADMIN, COMPANY_DEVELOPER } from '@/app/lib/constants';

export default function AuthTestPage() {
    const { user, isAuthenticated, loading } = useAuth();

    const runDebug = () => {
        debugAuthState();
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold mb-4">Authentication Test Page</h1>
            
            <div className="mb-4">
                <button 
                    onClick={runDebug}
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                    Run Debug Check
                </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-100 p-4 rounded">
                    <h2 className="text-lg font-semibold mb-2">Authentication Status</h2>
                    <p><strong>Is Authenticated:</strong> {isAuthenticated ? 'Yes' : 'No'}</p>
                    <p><strong>Loading:</strong> {loading ? 'Yes' : 'No'}</p>
                </div>

                <div className="bg-gray-100 p-4 rounded">
                    <h2 className="text-lg font-semibold mb-2">User Information</h2>
                    {user ? (
                        <div>
                            <p><strong>ID:</strong> {user.id}</p>
                            <p><strong>Name:</strong> {user.name}</p>
                            <p><strong>Email:</strong> {user.email}</p>
                            <p><strong>Role:</strong> {user.role}</p>
                            <p><strong>Is Active:</strong> {user.isActive ? 'Yes' : 'No'}</p>
                        </div>
                    ) : (
                        <p>No user data available</p>
                    )}
                </div>

                <div className="bg-gray-100 p-4 rounded">
                    <h2 className="text-lg font-semibold mb-2">Role Constants</h2>
                    <p><strong>CLIENT_ADMIN:</strong> "{CLIENT_ADMIN}"</p>
                    <p><strong>CLIENT_USER:</strong> "{CLIENT_USER}"</p>
                    <p><strong>COMPANY_ADMIN:</strong> "{COMPANY_ADMIN}"</p>
                    <p><strong>COMPANY_DEVELOPER:</strong> "{COMPANY_DEVELOPER}"</p>
                </div>

                <div className="bg-gray-100 p-4 rounded">
                    <h2 className="text-lg font-semibold mb-2">Expected Redirects</h2>
                    <p><strong>CLIENT_ADMIN/CLIENT_USER:</strong> /client/projects</p>
                    <p><strong>COMPANY_ADMIN:</strong> /company/dashboard</p>
                    <p><strong>COMPANY_DEVELOPER:</strong> /company/projects</p>
                    <p><strong>Unknown:</strong> /</p>
                </div>
            </div>

            <div className="mt-4 bg-yellow-100 p-4 rounded">
                <h2 className="text-lg font-semibold mb-2">Debug Information</h2>
                <p>Check the browser console for detailed authentication debug information.</p>
                <p>If you're not being redirected correctly, the role in your JWT token might not match the expected constants.</p>
            </div>
        </div>
    );
}
