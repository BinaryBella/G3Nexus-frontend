"use client";

// src/contexts/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '@/app/lib/services';
import { AuthUser } from "@/app/lib/types";
import { CLIENT_ADMIN, CLIENT_USER, COMPANY_ADMIN, COMPANY_DEVELOPER } from '@/app/lib/constants';

interface AuthContextType {
    isAuthenticated: boolean;
    user: AuthUser | null;
    login: (email: string, password: string) => Promise<void>;
    logout: () => void;
    loading: boolean;
    isClient: () => boolean;
    isCompanyUser: () => boolean;
    isAdmin: () => boolean;
    hasRole: (role: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState<AuthUser | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    // Check if user is authenticated on mount
    useEffect(() => {
        const checkAuth = async () => {
            const { accessToken } = authService.getTokens();
            if (accessToken && !authService.isTokenExpired()) {
                try {
                    const userData = authService.getCurrentUser();
                    setUser(userData);
                    setIsAuthenticated(true);
                } catch (error) {
                    console.error('Token validation failed:', error);
                    authService.clearTokens();
                    setIsAuthenticated(false);
                    setUser(null);
                }
            } else {
                // Token expired or doesn't exist
                authService.clearTokens();
                setIsAuthenticated(false);
                setUser(null);
            }
            setLoading(false);
        };

        checkAuth();
    }, []);

    const login = async (email: string, password: string) => {
        setLoading(true);
        try {
            const response = await authService.login(email, password);
            if (response.status) {
                const { accessToken, refreshToken } = response.data;
                authService.setTokens(accessToken, refreshToken);

                // Get user data from token
                try {
                    const userData = authService.getCurrentUser();
                    setUser(userData);
                    setIsAuthenticated(true);

                    // Redirect based on user role
                    redirectUserBasedOnRole(userData.role);
                } catch (userError) {
                    console.error('Error fetching user data:', userError);
                    throw new Error('Could not retrieve user information');
                }
            } else {
                throw new Error(response.message || 'Login failed');
            }
        } catch (error: unknown) {
            console.error('Login error:', error);
            throw error instanceof Error ? error : new Error('An unknown error occurred');
        } finally {
            setLoading(false);
        }
    };

    const redirectUserBasedOnRole = (role: string) => {
        console.log('Redirecting user with role:', role);
        console.log('Available constants:', { CLIENT_ADMIN, CLIENT_USER, COMPANY_ADMIN, COMPANY_DEVELOPER });
        
        switch (role) {
            case CLIENT_ADMIN:
            case CLIENT_USER:
                console.log('Redirecting to client dashboard');
                router.push('/client/dashboard');
                break;
            case COMPANY_ADMIN:
            case COMPANY_DEVELOPER:
                console.log('Redirecting to company dashboard');
                router.push('/company/dashboard');
                break;
            default:
                console.log('Unknown role, redirecting to home. Role was:', role);
                router.push('/');
                break;
        }
    };

    const logout = () => {
        authService.clearTokens();
        setIsAuthenticated(false);
        setUser(null);
        router.push('/auth/login');
    };

    // Helper functions to check user type and roles
    const hasRole = (role: string): boolean => {
        return user?.role === role;
    };

    const isClient = (): boolean => {
        return hasRole(CLIENT_ADMIN) || hasRole(CLIENT_USER);
    };

    const isCompanyUser = (): boolean => {
        return hasRole(COMPANY_ADMIN) || hasRole(COMPANY_DEVELOPER);
    };

    const isAdmin = (): boolean => {
        return hasRole(CLIENT_ADMIN) || hasRole(COMPANY_ADMIN);
    };

    return (
        <AuthContext.Provider value={{
            isAuthenticated,
            user,
            login,
            logout,
            loading,
            isClient,
            isCompanyUser,
            isAdmin,
            hasRole
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
