'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff } from 'lucide-react';
import { authService } from '@/app/lib/services/api';
import FeedbackPopup from '@/app/components/FeedbackPopup';

interface PasswordState {
    value: string;
    visible: boolean;
}

export default function NewPasswordPage() {
    const router = useRouter();
    const [email, setEmail] = useState<string>('');
    const [verificationCode, setVerificationCode] = useState<string>('');
    const [newPassword, setNewPassword] = useState<PasswordState>({
        value: '',
        visible: false,
    });
    const [confirmPassword, setConfirmPassword] = useState<PasswordState>({
        value: '',
        visible: false,
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string>('');
    const [showPopup, setShowPopup] = useState(false);
    const [popupType, setPopupType] = useState<'success' | 'error' | 'info'>('info');
    const [popupMessage, setPopupMessage] = useState('');

    useEffect(() => {
        // Get email and verification code from sessionStorage
        const storedEmail = sessionStorage.getItem('resetEmail');
        const storedVerificationCode = sessionStorage.getItem('verificationCode');

        if (!storedEmail || !storedVerificationCode) {
            // Redirect back to reset password page if no email or verification code is found
            router.push('/auth/forget-password');
            return;
        }

        setEmail(storedEmail);
        setVerificationCode(storedVerificationCode);
    }, [router]);

    const togglePasswordVisibility = (field: 'new' | 'confirm') => {
        if (field === 'new') {
            setNewPassword(prev => ({ ...prev, visible: !prev.visible }));
        } else {
            setConfirmPassword(prev => ({ ...prev, visible: !prev.visible }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (newPassword.value !== confirmPassword.value) {
            setPopupType('error');
            setPopupMessage('Passwords do not match');
            setShowPopup(true);
            return;
        }

        if (newPassword.value.length < 8) {
            setPopupType('error');
            setPopupMessage('Password must be at least 8 characters long');
            setShowPopup(true);
            return;
        }

        setIsSubmitting(true);
        try {
            // Call the backend reset password endpoint with email, new password, and verification code
            const response = await authService.resetPassword(email, newPassword.value, verificationCode);
            console.log('Password reset response:', response);

            // Clear stored data
            sessionStorage.removeItem('resetEmail');
            sessionStorage.removeItem('verificationCode');

            // Show success message and redirect to login
            setPopupType('success');
            setPopupMessage('Password has been reset successfully! Please log in with your new password.');
            setShowPopup(true);
        } catch (error: any) {
            console.error('Password reset failed:', error);

            // Handle different types of errors
            setPopupType('error');
            setPopupMessage(error.response?.data?.message || error.message || 'Failed to update password. Please try again.');
            setShowPopup(true);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-row">
            <FeedbackPopup
                isOpen={showPopup}
                onConfirm={() => router.push('/auth/login')}
                onClose={() => setShowPopup(false)}
                type={popupType}
                title={popupType === 'success' ? 'Success' : popupType === 'error' ? 'Error' : 'Notice'}
            >
                {popupMessage}
            </FeedbackPopup>
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
                        src="/images/reset-password-illustration.png"
                        alt="Reset Password Illustration"
                        width={600}
                        height={600}
                        className="w-full max-w-[600px] object-contain"
                        priority
                    />
                </div>
            </div>

            {/* Right Section - New Password Form */}
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

                {/* New Password Form */}
                <div className="flex-1 flex flex-col justify-center max-w-[440px] mx-auto w-full">
                    <h1 className="text-white text-4xl font-semibold mb-16 text-center">
                        Create New Password
                    </h1>

                    <p className="text-white text-center mb-12">
                        Enter your new password below
                    </p>

                    <form onSubmit={handleSubmit} className="space-y-8">
                        {error && (
                            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
                                {error}
                            </div>
                        )}

                        <div className="space-y-6">
                            {/* New Password Input */}
                            <div className="space-y-2">
                                <label htmlFor="newPassword" className="block text-white text-sm font-medium">
                                    New Password
                                </label>
                                <div className="relative">
                                    <input
                                        type={newPassword.visible ? "text" : "password"}
                                        id="newPassword"
                                        value={newPassword.value}
                                        onChange={(e) => setNewPassword(prev => ({ ...prev, value: e.target.value }))}
                                        className="w-full px-4 py-3 rounded-lg bg-white text-gray-900 focus:outline-none"
                                        placeholder="New Password"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => togglePasswordVisibility('new')}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-800"
                                    >
                                        {newPassword.visible ? (
                                            <EyeOff className="h-5 w-5" />
                                        ) : (
                                            <Eye className="h-5 w-5" />
                                        )}
                                    </button>
                                </div>
                            </div>

                            {/* Confirm Password Input */}
                            <div className="space-y-2">
                                <label htmlFor="confirmPassword" className="block text-white text-sm font-medium">
                                    Confirm Password
                                </label>
                                <div className="relative">
                                    <input
                                        type={confirmPassword.visible ? "text" : "password"}
                                        id="confirmPassword"
                                        value={confirmPassword.value}
                                        onChange={(e) => setConfirmPassword(prev => ({ ...prev, value: e.target.value }))}
                                        className="w-full px-4 py-3 rounded-lg bg-white text-gray-900 focus:outline-none"
                                        placeholder="Confirm Password"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => togglePasswordVisibility('confirm')}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-800"
                                    >
                                        {confirmPassword.visible ? (
                                            <EyeOff className="h-5 w-5" />
                                        ) : (
                                            <Eye className="h-5 w-5" />
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isSubmitting || !newPassword.value || !confirmPassword.value}
                            className="w-full bg-[#F5B316] text-white py-3 rounded-lg font-medium hover:bg-[#E5A714] transition-colors"
                        >
                            {isSubmitting ? 'Creating...' : 'Create'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
