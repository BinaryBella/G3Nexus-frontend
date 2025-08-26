// src/app/auth/login/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/app/contexts/AuthContext';
import { authService } from '@/app/lib/services';
import { set } from 'react-hook-form';
import LoadingSpinner from '@/app/components/LoadingSpinner';

interface LoginFormData {
    email: string;
    password: string;
}

export default function LoginPage() {
    const { login, redirectUserBasedOnRole } = useAuth();
    const [formData, setFormData] = useState<LoginFormData>({
        email: '',
        password: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [initializing, setInitializing] = useState(true);

    useEffect(() => {
        const checkAuth = async () => {
            const { accessToken } = authService.getTokens();
            if (accessToken && !authService.isTokenExpired()) {
                const currentUser = await authService.getCurrentUser();
                redirectUserBasedOnRole(currentUser.role);
            } else {
                setInitializing(false);
            }
        };
        checkAuth();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            console.log('Starting login process...');
            await login(formData.email, formData.password);
            console.log('Login successful, checking auth state...');
        } catch (error: any) {
            console.error('Login failed:', error);
            // Provide more specific error messages
            if (error.response?.status === 401) {
                setError("Invalid email or password. Please try again.");
            } else if (error.message?.includes('Could not retrieve user information')) {
                setError("Login successful but there was an issue with user data. Please try again.");
            } else if (error.message?.includes('Invalid access token')) {
                setError("Authentication issue. Please try again.");
            } else {
                setError(error.message || "Invalid email or password. Please try again.");
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    return (
        <>
            {!initializing &&
                <div className="min-h-screen flex flex-row">
                {/* Left Section - Illustration */}
                <div className="hidden lg:flex lg:w-1/2 bg-white px-20 py-12 flex-col">
                    {/* Logo Container */}
                    <div className="h-20 flex justify-center items-start max-w-[600px] mx-auto w-full">
                        <Image
                            src="/images/logo.png"
                            alt="G3NEXUS"
                            width={200}
                            height={50}
                            className="w-auto h-8"
                            priority
                        />
                    </div>
                    {/* Illustration Container */}
                    <div className="flex-1 flex items-center justify-center">
                        <Image
                            src="/images/login-illustration.png"
                            alt="Login Illustration"
                            width={600}
                            height={600}
                            className="w-full max-w-[600px] object-contain"
                            priority
                        />
                    </div>
                </div>

                {/* Right Section - Login Form */}
                <div className="w-full lg:w-1/2 bg-[#2B4B93] p-8 lg:p-12 flex flex-col">
                    {/* Mobile Logo */}
                    <div className="lg:hidden h-20">
                        <Image
                            src="/images/logo-white.png"
                            alt="G3NEXUS"
                            width={150}
                            height={40}
                            className="w-auto h-8"
                            priority
                        />
                    </div>

                    {/* Login Form */}
                    <div className="flex-1 flex flex-col justify-center max-w-[440px] mx-auto w-full">
                        <h1 className="text-white text-4xl font-semibold mb-16 text-center">Login</h1>

                        <form onSubmit={handleSubmit} className="space-y-8">
                            <div className="space-y-2">
                                <label htmlFor="email" className="block text-white text-sm font-medium mb-1">
                                    Email Address
                                </label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    placeholder="Email Address"
                                    className="w-full px-4 py-3 rounded-lg bg-white text-gray-900 focus:outline-none"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="password" className="block text-white text-sm font-medium mb-1">
                                    Password
                                </label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        id="password"
                                        name="password"
                                        value={formData.password}
                                        onChange={handleInputChange}
                                        placeholder="Password"
                                        className="w-full px-4 py-3 rounded-lg bg-white text-gray-900 focus:outline-none"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={togglePasswordVisibility}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-800 focus:outline-none"
                                    >
                                        {showPassword ? (
                                            <EyeOff className="h-5 w-5" />
                                        ) : (
                                            <Eye className="h-5 w-5" />
                                        )}
                                    </button>
                                </div>
                                {error && (
                                    <div className="text-red-300 mt-20 text-sm text-center">
                                        {error}
                                    </div>
                                )}
                            </div>

                            <div className="pt-8">
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full bg-[#F5B316] text-white py-3 rounded-lg font-medium hover:bg-[#E5A714] transition-colors disabled:bg-opacity-70"
                                >
                                    {isLoading ? 'Logging in...' : 'Login'}
                                </button>

                                <div className="text-center mt-4">
                                    <Link
                                        href="/auth/forget-password"
                                        className="text-white text-sm hover:underline"
                                    >
                                        Forgot Password
                                    </Link>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
                </div>
            }

            {initializing &&
                <div className="flex items-center justify-center min-h-screen">
                    <LoadingSpinner />
                </div>
            }
        </>
    );
}
