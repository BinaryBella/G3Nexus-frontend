
"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Bug, X } from 'lucide-react';
import ProtectedRoute from '@/app/components/ProtectedRoute';
import { useAuth } from '@/app/contexts/AuthContext';
import { projectService } from '@/app/lib/services';

const BugReportForm = () => {
    const router = useRouter();
    const { user } = useAuth();
    const [bugData, setBugData] = useState({
        title: '',
        severity: '',
        description: '',
        attachment: null as File | null,
        isActive: true,
        employeeName: '',
        projectId: ''
    });
    const [projects, setProjects] = useState<{ projectId: number; projectName: string }[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);

    // Set employee name from user context
    useEffect(() => {
        if (user && user.name) {
            setBugData(prev => ({ ...prev, employeeName: user.name || '' }));
        }
    }, [user]);

    // Fetch all projects for select
    useEffect(() => {
        const fetchProjects = async () => {
            try {
                const allProjects = await projectService.getAllProjects();
                setProjects(allProjects.map(p => ({ projectId: p.projectId, projectName: p.projectName })));
            } catch (err) {
                // Optionally handle error
            }
        };
        fetchProjects();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        setBugData((prev) => ({
            ...prev,
            [name]: type === 'checkbox' 
                ? (e.target as HTMLInputElement).checked 
                : type === 'file'
                    ? (e.target as HTMLInputElement).files?.[0] || null
                    : value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        
        // Validate required fields
        if (!bugData.title || !bugData.severity || !bugData.description || !bugData.employeeName || !bugData.projectId) {
            setError('Please fill in all required fields');
            return;
        }
        
        try {
            setIsSubmitting(true);
            // TODO: Add bug report submission logic here
            console.log('Bug data:', bugData);
            
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));
            setSuccess(true);
            
            setTimeout(() => {
                router.push('/company/bugs');
            }, 1500);
        } catch (error) {
            setError('Failed to submit bug report');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCancel = () => {
        router.push('/company/bugs');
    };

    if (success) {
        return (
            <div className="flex justify-center items-center min-h-[400px]">
                <div className="text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                        <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Bug Report Added Successfully!</h3>
                    <p className="text-gray-600">Redirecting to bugs list...</p>
                </div>
            </div>
        );
    }

    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-gray-50 p-6">
                {/* Header */}
                <div className="mb-8">
                    <button
                        onClick={handleCancel}
                        className="flex items-center text-gray-600 hover:text-gray-800 mb-4"
                    >
                        <ArrowLeft className="h-5 w-5 mr-2" />
                        Back to Bugs
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
                        {error && (
                            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
                                <div className="flex">
                                    <X className="h-5 w-5 text-red-400" />
                                    <div className="ml-3">
                                        <h3 className="text-sm font-medium text-red-800">Error</h3>
                                        <p className="mt-1 text-sm text-red-700">{error}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <h2 className="text-xl font-semibold text-gray-900 mb-6">Bug Information</h2>

                            {/* Employee Name (auto-filled) */}
                            <div>
                                <label htmlFor="employeeName" className="block text-sm font-medium text-gray-700 mb-2">
                                    Employee Name *
                                </label>
                                <input
                                    type="text"
                                    id="employeeName"
                                    name="employeeName"
                                    value={bugData.employeeName}
                                    readOnly
                                    className="text-black w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-100 focus:outline-none focus:ring-2 focus:ring-[#3450A3] focus:border-[#3450A3]"
                                    required
                                />
                            </div>

                            {/* Project Select */}
                            <div>
                                <label htmlFor="projectId" className="block text-sm font-medium text-gray-700 mb-2">
                                    Project *
                                </label>
                                <select
                                    id="projectId"
                                    name="projectId"
                                    value={bugData.projectId}
                                    onChange={handleChange}
                                    className="text-black w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#3450A3] focus:border-[#3450A3]"
                                    required
                                >
                                    <option value="">Select Project</option>
                                    {projects.map((project) => (
                                        <option key={project.projectId} value={project.projectId}>
                                            {project.projectName}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Bug Title */}
                            <div>
                                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                                    Bug Title *
                                </label>
                                <input
                                    type="text"
                                    id="title"
                                    name="title"
                                    value={bugData.title}
                                    onChange={handleChange}
                                    className="text-black w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#3450A3] focus:border-[#3450A3]"
                                    placeholder="Enter a brief title for the bug"
                                    required
                                />
                            </div>

                            {/* Severity */}
                            <div>
                                <label htmlFor="severity" className="block text-sm font-medium text-gray-700 mb-2">
                                    Severity *
                                </label>
                                <select
                                    id="severity"
                                    name="severity"
                                    value={bugData.severity}
                                    onChange={handleChange}
                                    className="text-black w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#3450A3] focus:border-[#3450A3]"
                                    required
                                >
                                    <option value="">Select Severity</option>
                                    <option value="Low">Low</option>
                                    <option value="Medium">Medium</option>
                                    <option value="High">High</option>
                                    <option value="Critical">Critical</option>
                                </select>
                            </div>

                            {/* Description */}
                            <div>
                                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                                    Description *
                                </label>
                                <textarea
                                    id="description"
                                    name="description"
                                    value={bugData.description}
                                    onChange={handleChange}
                                    rows={4}
                                    className="text-black w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#3450A3] focus:border-[#3450A3]"
                                    placeholder="Describe the bug in detail, including steps to reproduce"
                                    required
                                />
                            </div>

                            {/* Attachment */}
                            <div>
                                <label htmlFor="attachment" className="block text-sm font-medium text-gray-700 mb-2">
                                    Attachment (Optional)
                                </label>
                                <input
                                    type="file"
                                    id="attachment"
                                    name="attachment"
                                    onChange={handleChange}
                                    className="text-black w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#3450A3] focus:border-[#3450A3]"
                                    accept=".jpg,.jpeg,.png,.gif,.pdf,.doc,.docx"
                                />
                                <p className="mt-1 text-sm text-gray-500">
                                    Accepted formats: JPG, PNG, GIF, PDF, DOC, DOCX (Max 10MB)
                                </p>
                            </div>

                            {/* Status */}
                            <div>
                                <label className="flex items-center">
                                    <input
                                        type="checkbox"
                                        name="isActive"
                                        checked={bugData.isActive}
                                        onChange={handleChange}
                                        className="h-4 w-4 text-[#3450A3] focus:ring-[#3450A3] border-gray-300 rounded"
                                    />
                                    <span className="ml-2 text-sm font-medium text-gray-700">Active</span>
                                </label>
                                <p className="mt-1 text-sm text-gray-500">
                                    Inactive bug reports will be hidden from most views
                                </p>
                            </div>

                            {/* Form Actions */}
                            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                                <button
                                    type="button"
                                    onClick={handleCancel}
                                    className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="px-6 py-2 bg-[#3450A3] text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#3450A3] disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isSubmitting ? 'Submitting...' : 'Submit Bug Report'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </ProtectedRoute>
    );
};

export default BugReportForm;
