"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Bug } from 'lucide-react';
import ProtectedRoute from '@/app/components/ProtectedRoute';

const BugForm = () => {
    const router = useRouter();
    const [title, setTitle] = useState('');
    const [severity, setSeverity] = useState('');
    const [description, setDescription] = useState('');
    const [file, setFile] = useState<File | null>(null);
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Handle form submission
        console.log({ title, severity, description, file });
    };

    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-gray-50 p-6">
                {/* Header */}
                <div className="mb-8">
                    <button
                        onClick={() => router.push('/client/bugs')}
                        className="flex items-center text-gray-600 hover:text-gray-800 mb-4"
                    >
                        <ArrowLeft className="h-5 w-5 mr-2" />
                        Back to Bug Reports
                    </button>
                    
                    <div className="flex items-center gap-3">
                        <Bug className="h-8 w-8 text-[#3450A3]" />
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Add New Bug Report</h1>
                            <p className="text-gray-600 mt-1">Report a new bug or issue</p>
                        </div>
                    </div>
                </div>

                {/* Form */}
                <div className="max-w-4xl mx-auto">
                    <div className="bg-white rounded-lg shadow-sm border p-8">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <h2 className="text-xl font-semibold text-gray-900 mb-6">Bug Information</h2>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="title">
                                    Bug Title *
                                </label>
                                <input
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#3450A3] focus:border-[#3450A3]"
                                    id="title"
                                    type="text"
                                    placeholder="Enter a brief title for the bug"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="severity">
                                    Severity *
                                </label>
                                <select
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#3450A3] focus:border-[#3450A3]"
                                    id="severity"
                                    value={severity}
                                    onChange={(e) => setSeverity(e.target.value)}
                                    required
                                >
                                    <option value="">Select Severity</option>
                                    <option value="Low">Low</option>
                                    <option value="Medium">Medium</option>
                                    <option value="High">High</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="description">
                                    Description *
                                </label>
                                <textarea
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#3450A3] focus:border-[#3450A3]"
                                    id="description"
                                    placeholder="Describe the bug in detail"
                                    rows={4}
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="attachment">
                                    Attachment
                                </label>
                                <input
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#3450A3] focus:border-[#3450A3]"
                                    id="attachment"
                                    type="file"
                                    onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}
                                    accept=".jpg,.jpeg,.png,.gif,.pdf,.doc,.docx"
                                />
                                <p className="mt-1 text-sm text-gray-500">Upload screenshots or documents related to the bug</p>
                            </div>

                            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                                <button
                                    type="button"
                                    onClick={() => router.push('/client/bugs')}
                                    className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 font-medium transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-6 py-2 bg-[#3450A3] hover:bg-blue-700 text-white rounded-md font-medium transition-colors"
                                >
                                    Submit Bug Report
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

                {/* Illustration */}
                <div className="hidden lg:block fixed bottom-10 right-10">
                    <Image
                        src="/images/bug.png"
                        alt="Bug illustration"
                        width={400}
                        height={320}
                    />
                </div>
            </div>
        </ProtectedRoute>
    );
};

export default BugForm;
