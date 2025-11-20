import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ProtectedRoute: React.FC = () => {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="flex h-screen w-full items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-royal border-t-transparent"></div>
            </div>
        );
    }

    return user ? <Outlet /> : <Navigate to="/auth" replace />;
};

export default ProtectedRoute;
