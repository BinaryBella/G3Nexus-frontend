'use client';

import { FormEvent, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { authService } from '@/app/lib/services/api';

export default function ForgotPasswordPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError('');
        setSuccessMessage('');

        try {
            // Call the backend /forget-password endpoint
            await authService.requestPasswordReset(email);

            // Store email in sessionStorage for next steps
            sessionStorage.setItem('resetEmail', email);

            router.push('/auth/verification-code');

        } catch (error: any) {
            console.error('Password reset request failed:', error);

            // Handle different types of errors
            if (error.response?.data?.message) {
                setError(error.response.data.message);
            } else if (error.message) {
                setError(error.message);
            } else {
                setError('Failed to send verification code. Please try again.');
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
                <div className="min-h-screen flex flex-row" suppressHydrationWarning={true}>
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
                                src="/images/forgot-password-illustration.png"
                                alt="Forgot Password Illustration"
                                width={600}
                                height={600}
                                className="w-full max-w-[600px] object-contain"
                                priority
                            />
                        </div>
                    </div>

                    {/* Right Section - Reset Password Form */}
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

                        {/* Reset Password Form */}
                        <div className="flex-1 flex flex-col justify-center max-w-[440px] mx-auto w-full">
                            <h1 className="text-white text-4xl font-semibold mb-16 text-center">
                                Reset Password Verification
                            </h1>

                            <form onSubmit={handleSubmit} className="space-y-8">
                                {/* Error Message */}
                                {error && (
                                    <div
                                        className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
                                        <span>{error}</span>
                                    </div>
                                )}

                                {/* Success Message */}
                                {successMessage && (
                                    <div
                                        className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative">
                                        <span>{successMessage}</span>
                                    </div>
                                )}

                                <div className="space-y-2">
                                    <p className="text-white text-sm text-center mb-6">
                                        Enter your email address to receive a verification code
                                    </p>
                                    <label htmlFor="email" className="block text-white text-sm font-medium mb-1">
                                        Email Address
                                    </label>
                                    <input
                                        type="email"
                                        id="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="Enter your email address"
                                        className="w-full px-4 py-3 rounded-lg bg-white text-gray-900 focus:outline-none"
                                        required
                                        disabled={isSubmitting || !!successMessage}
                                    />
                                </div>

                                <div className="pt-8">
                                    <button
                                        type="submit"
                                        disabled={isSubmitting || !email || !!successMessage}
                                        className="w-full bg-[#F5B316] text-white py-3 rounded-lg font-medium hover:bg-[#E5A714] transition-colors flex items-center justify-center disabled:bg-opacity-70"
                                    >
                                        {isSubmitting ? (
                                            <span>Sending...</span>
                                        ) : successMessage ? (
                                            <span>Code Sent!</span>
                                        ) : (
                                            <span>Send Verification Code</span>
                                        )}
                                    </button>

                                    <div className="text-center mt-4">
                                        <Link
                                            href="/auth/login"
                                            className="text-white text-sm hover:underline"
                                        >
                                            Return to Login
                                        </Link>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>

    );
}
