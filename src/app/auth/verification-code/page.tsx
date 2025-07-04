'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { authService } from '@/app/lib/services/api';

export default function VerificationCodePage() {
    const router = useRouter();
    const [email, setEmail] = useState<string>('');
    const [verificationCode, setVerificationCode] = useState<string[]>(Array(6).fill(''));
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string>('');
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    useEffect(() => {
        // Get email from sessionStorage
        const storedEmail = sessionStorage.getItem('resetEmail');
        if (!storedEmail) {
            // Redirect back to reset password page if no email is found
            router.push('/auth/forget-password');
            return;
        }
        setEmail(storedEmail);

        // Initialize refs array
        inputRefs.current = inputRefs.current.slice(0, 6);
    }, [router]);

    const handleInput = (index: number, value: string) => {
        // Only allow numbers
        if (!/^\d*$/.test(value)) return;

        const newVerificationCode = [...verificationCode];
        newVerificationCode[index] = value;
        setVerificationCode(newVerificationCode);

        // Auto-focus next input
        if (value !== '' && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }

        // If all digits are filled, automatically submit
        if (index === 5 && value !== '') {
            const allFilled = newVerificationCode.every(digit => digit !== '');
            if (allFilled) {
                handleSubmit();
            }
        }
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        // Handle backspace
        if (e.key === 'Backspace' && verificationCode[index] === '' && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handlePaste = (e: React.ClipboardEvent) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text');
        const numbers = pastedData.replace(/\D/g, '').split('').slice(0, 6);

        const newVerificationCode = [...verificationCode];
        numbers.forEach((num, index) => {
            if (index < 6) {
                newVerificationCode[index] = num;
            }
        });
        setVerificationCode(newVerificationCode);

        // Focus the next empty input or the last input
        const nextEmptyIndex = newVerificationCode.findIndex(val => val === '');
        if (nextEmptyIndex !== -1) {
            inputRefs.current[nextEmptyIndex]?.focus();
        } else {
            inputRefs.current[5]?.focus();
        }
    };

    const handleSubmit = async (e?: React.FormEvent) => {
        if (e) {
            e.preventDefault();
        }

        setError('');
        setIsSubmitting(true);

        try {
            // Join the verificationCode array into a string before sending
            console.log(verificationCode)
            const code = verificationCode.join('');
            if (code.length !== 6) {
                setError('Please enter the 6-digit verification code.');
                setIsSubmitting(false);
                return;
            }
            // Call the backend verification endpoint
            const response = await authService.verifyResetCode(email, code);
            console.log('Verification response:', response);

            // If verification is successful, store the verification code for password reset
            sessionStorage.setItem('verificationCode', code);

            router.push('/auth/reset-password');
        } catch (error: any) {
            console.error('Verification failed:', error);

            // Handle different types of errors
            if (error.response?.data?.message) {
                setError(error.response.data.message);
            } else if (error.message) {
                setError(error.message);
            } else {
                setError('Invalid verification code. Please try again.');
            }

            // Clear the verification code inputs
            setVerificationCode(Array(6).fill(''));
            // Focus the first input
            inputRefs.current[0]?.focus();
            setIsSubmitting(false);
        }
    };

    return (
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
                        src="/images/verification-illustration.png"
                        alt="Verification Illustration"
                        width={600}
                        height={600}
                        className="w-full max-w-[600px] object-contain"
                        priority
                    />
                </div>
            </div>

            {/* Right Section - Verification Form */}
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

                {/* Verification Form */}
                <div className="flex-1 flex flex-col justify-center max-w-[440px] mx-auto w-full">
                    <h1 className="text-white text-4xl font-semibold mb-16 text-center">
                        Reset Password Verification
                    </h1>

                    <p className="text-white text-center mb-12">
                        We want to make sure it is really you. In order to verify your identity,
                        enter the verification code that was sent to {email}
                    </p>

                    <form onSubmit={handleSubmit} className="space-y-8">
                        {error && (
                            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
                                {error}
                            </div>
                        )}

                        <div>
                            <label className="block text-white text-sm font-medium mb-4">
                                Verification Code
                            </label>
                            <div className="grid grid-cols-6 gap-2">
                                {[0, 1, 2, 3, 4, 5].map((index) => (
                                    <input
                                        key={index}
                                        ref={(el) => {
                                            inputRefs.current[index] = el;
                                        }}
                                        type="text"
                                        maxLength={1}
                                        value={verificationCode[index]}
                                        onKeyDown={(e) => handleKeyDown(index, e)}
                                        onPaste={handlePaste}
                                        className="w-full h-12 text-center text-xl font-semibold rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#F5B316]"
                                        disabled={isSubmitting}
                                        required
                                    />
                                ))}
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isSubmitting || verificationCode.some(v => v === '')}
                            className="w-full mt-7 bg-[#F5B316] text-white py-3 rounded-lg font-medium hover:bg-[#E5A714] transition-colors flex items-center justify-center"
                        >
                            {isSubmitting ? (
                                <span className="flex items-center justify-center">
                                    <svg className="animate-spin h-5 w-5 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                                    </svg>
                                    Verifying...
                                </span>
                            ) : (
                                'Verify'
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
