'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation'; // Changed from next/router
import { LoginCredentials, User } from "@/app/lib/types";

// Define the type for the context value
interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: (credentials: LoginCredentials) => Promise<boolean>;
    logout: () => void;
}

// Create the context with default values matching the type
const AuthContext = createContext<AuthContextType>({
    user: null,
    loading: true,
    login: async () => false,
    logout: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        try {
            // Using optional chaining and nullish coalescing for safer client-side checks
            const token = typeof window !== 'undefined'
                ? localStorage?.getItem('token') ?? null
                : null;

            if (token) {
                const response = await fetch('your-api/verify-token', {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });

                if (response.ok) {
                    const userData = await response.json();
                    setUser(userData);
                } else {
                    if (typeof window !== 'undefined') {
                        localStorage.removeItem('token');
                    }
                    setUser(null);
                }
            }
            setLoading(false);
        } catch (error) {
            console.error('Auth check failed:', error);
            setLoading(false);
        }
    };

    const login = async (credentials: LoginCredentials): Promise<boolean> => {
        try {
            const response = await fetch('your-api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(credentials),
            });

            if (response.ok) {
                const data = await response.json();
                if (typeof window !== 'undefined') {
                    localStorage.setItem('token', data.token);
                }
                setUser(data.user);
                return true;
            }
            return false;
        } catch (error) {
            console.error('Login failed:', error);
            return false;
        }
    };

    const logout = () => {
        if (typeof window !== 'undefined') {
            localStorage.removeItem('token');
        }
        setUser(null);
        router.push('/login');
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
