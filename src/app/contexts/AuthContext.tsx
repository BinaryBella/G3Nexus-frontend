"use client";

// src/contexts/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '@/app/lib/services';
import { Client, Employee } from "@/app/lib/types";


// Define a User type that can be either a Client or an Employee
export type User = Client | Employee;

interface AuthContextType {
    isAuthenticated: boolean;
    user: User | null;
    login: (email: string, password: string) => Promise<void>;
    logout: () => void;
    loading: boolean;
    isClient: () => boolean;
    isEmployee: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    // Check if user is authenticated on mount
    useEffect(() => {
        const checkAuth = async () => {
            const { accessToken } = authService.getTokens();
            if (accessToken) {
                try {
                    // Here you would typically validate the token and get user data
                    const userData = await authService.getCurrentUser();
                    setUser(userData);
                    setIsAuthenticated(true);
                } catch (error) {
                    console.error('Token validation failed:', error);
                    authService.clearTokens();
                    setIsAuthenticated(false);
                    setUser(null);
                }
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

                // Fetch user data after successful login
                try {
                    const userData = await authService.getCurrentUser();
                    setUser(userData);
                    setIsAuthenticated(true);

                    // Redirect based on user role
                    if (userData.role === 'client') {
                        router.push('/client/projects');
                    } else if (userData.role === 'employee') {
                        router.push('/employee/dashboard');
                    } else {
                        router.push('/dashboard');
                    }
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

    const logout = () => {
        authService.clearTokens();
        setIsAuthenticated(false);
        setUser(null);
        router.push('/auth/login');
    };

    // Helper functions to check user type
    const isClient = (): boolean => {
        return !!user && user.role === 'client';
    };

    const isEmployee = (): boolean => {
        return !!user && user.role === 'employee';
    };

    return (
        <AuthContext.Provider value={{
            isAuthenticated,
            user,
            login,
            logout,
            loading,
            isClient,
            isEmployee
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
