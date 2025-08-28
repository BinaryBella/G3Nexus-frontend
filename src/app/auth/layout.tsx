'use client';

import { FC, ReactNode, useEffect, useState } from "react";
import { authService } from "@/app/lib/services";
import { useAuth } from "@/app/contexts/AuthContext";
import LoadingSpinner from "@/app/components/LoadingSpinner";

interface ClientLayoutProps {
    children: ReactNode;
}

const ClientLayout: FC<ClientLayoutProps> = ({ children }) => {
    const {redirectUserBasedOnRole} = useAuth();
    const [initializing, setInitializing] = useState(true);

    useEffect(() => {
        const checkAuth = async () => {
            const {accessToken} = authService.getTokens();
            if (accessToken && !authService.isTokenExpired()) {
                const currentUser = await authService.getCurrentUser();
                redirectUserBasedOnRole(currentUser.role);
            } else {
                setInitializing(false);
            }
        };
        checkAuth();
    }, []);

    return (
        <>
            {!initializing && children}
            {initializing &&
                <div className="flex items-center justify-center min-h-screen">
                    <LoadingSpinner/>
                </div>
            }
        </>
    );
};

export default ClientLayout;
