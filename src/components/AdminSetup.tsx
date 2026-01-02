import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { dev_setCurrentUserAsAdmin } from '~/services/dbService';
import Button from '@/components/Button';

const AdminSetup: React.FC = () => {
    const { currentUser } = useAuth();
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [errorMsg, setErrorMsg] = useState('');

    const handleGrantMeAdmin = async () => {
        if (!currentUser?.userId) return;

        setStatus('loading');
        try {
            await dev_setCurrentUserAsAdmin();
            setStatus('success');
            // Force reload to refresh profile
            setTimeout(() => window.location.reload(), 1500);
        } catch (err: any) {
            console.error(err);
            setErrorMsg(err.message);
            setStatus('error');
        }
    };

    if (!currentUser) return null;

    // Only show for the specific requested email
    if (currentUser.email !== 'admin@aiconic.co.site') {
        return null;
    }

    return (
        <div className="fixed bottom-4 right-4 z-50 p-4 bg-zinc-900 border border-yellow-600 rounded-lg shadow-xl max-w-sm">
            <h3 className="text-yellow-500 font-bold mb-2">⚠️ Admin Setup</h3>
            <p className="text-gray-300 text-sm mb-4">
                Grant admin role to: <span className="font-mono text-white">{currentUser.email}</span>
            </p>

            {status === 'idle' && (
                <Button variant="primary" onClick={handleGrantMeAdmin} size="sm" className="w-full">
                    Make Me Admin
                </Button>
            )}

            {status === 'loading' && <p className="text-blue-400 text-sm">Updating role...</p>}

            {status === 'success' && (
                <p className="text-green-500 text-sm font-bold">
                    Success! Reloading...
                </p>
            )}

            {status === 'error' && (
                <p className="text-red-500 text-sm">Error: {errorMsg}</p>
            )}
        </div>
    );
};

export default AdminSetup;
