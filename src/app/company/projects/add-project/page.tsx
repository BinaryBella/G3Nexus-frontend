'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from "next/image";
import { useQuery, useMutation } from '@tanstack/react-query';
import { companyService } from '@/app/lib/services/companyService';
import { projectService } from '@/app/lib/services/projectService';
import { Company } from '@/app/lib/types';
import { FolderPlus, ArrowLeft, ArrowRight, X } from 'lucide-react';
import { useRoleAccess } from '@/app/hooks/useRoleAccess';

interface ProjectFormProps {
    projectId: string;
}

interface ProjectFormData {
    // Project Initialization fields
    companyId: string;
    projectName: string;
    projectType: string;
    projectSize: string;
    creationDate: string;
    projectDescription: string;
    estimatedBudget: string;
    status: string;
    // More Details fields
    actualStartDate: string;
    actualEndDate: string;
    totalBudget: string;
    paymentType: string;
    paymentStatus: string;
}

export default function ProjectForm({ projectId }: ProjectFormProps) {
    const router = useRouter();
    const { canManageProjects } = useRoleAccess();
    
    // Redirect if user doesn't have permission to manage projects
    useEffect(() => {
        if (!canManageProjects()) {
            router.push('/company/projects');
            return;
        }
    }, [canManageProjects, router]);

    // Don't render if user doesn't have permission
    if (!canManageProjects()) {
        return (
            <div className="flex justify-center items-center min-h-[400px]">
                <div className="text-center">
                    <X className="h-12 w-12 text-red-500 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Access Denied</h3>
                    <p className="text-gray-600">You don't have permission to add projects.</p>
                </div>
            </div>
        );
    }

    const [activeTab, setActiveTab] = useState(0);
    const [formData, setFormData] = useState<ProjectFormData>({
        companyId: '',
        projectName: '',
        projectType: '',
        projectSize: '',
        creationDate: '',
        projectDescription: '',
        estimatedBudget: '',
        status: 'Active',
        actualStartDate: '',
        actualEndDate: '',
        totalBudget: '',
        paymentType: '',
        paymentStatus: '',
    });
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);

    // Fetch companies for dropdown
    const { data: companies = [], isLoading: companiesLoading, error: companiesError } = useQuery<Company[], Error>({
        queryKey: ['companies'],
        queryFn: companyService.getAllCompanies,
    });

    const addProjectMutation = useMutation({
        mutationFn: projectService.addProject,
        onSuccess: () => {
            setSuccess(true);
            setTimeout(() => {
                router.push('/company/projects');
            }, 1500);
        },
        onError: (error: Error) => {
            console.error('Error adding project:', error);
            setError(error.message || 'Failed to add project');
        },
    });

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        
        // Validate required fields for initialization tab
        if (!formData.companyId || !formData.projectName || !formData.projectType || !formData.projectSize) {
            setError('Please fill in all project initialization fields');
            return;
        }
        
        try {
            setIsSubmitting(true);
            // Prepare data for API call
            const projectData = {
                projectName: formData.projectName,
                projectType: formData.projectType,
                projectSize: formData.projectSize,
                creationDate: formData.creationDate,
                projectDescription: formData.projectDescription,
                estimatedBudget: parseFloat(formData.estimatedBudget) || 0,
                actualStartDate: formData.actualStartDate,
                actualEndDate: formData.actualEndDate,
                totalBudget: parseFloat(formData.totalBudget) || 0,
                paymentType: formData.paymentType,
                paymentStatus: formData.paymentStatus,
                status: formData.status,
                isActive: true,
                companyId: parseInt(formData.companyId)
            };

            await addProjectMutation.mutateAsync(projectData);
        } catch (error) {
            // Error handling is done in the mutation's onError callback
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleNext = () => {
        if (validateInitializationInfo()) {
            setActiveTab(1);
        }
    };

    const handleCancel = () => {
        router.push('/company/projects');
    };

    const validateInitializationInfo = () => {
        if (!formData.companyId || !formData.projectName || !formData.projectType || !formData.projectSize) {
            setError('Please fill in all project initialization fields');
            return false;
        }
        setError(null);
        return true;
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
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Project Added Successfully!</h3>
                    <p className="text-gray-600">Redirecting to projects list...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            {/* Header */}
            <div className="mb-8">
                <button
                    onClick={handleCancel}
                    className="flex items-center text-gray-600 hover:text-gray-800 mb-4"
                >
                    <ArrowLeft className="h-5 w-5 mr-2" />
                    Back to Projects
                </button>
                
                <div className="flex items-center gap-3">
                    <FolderPlus className="h-8 w-8 text-[#3450A3]" />
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Add New Project</h1>
                        <p className="text-gray-600 mt-1">Create a new project record</p>
                    </div>
                </div>
            </div>

            {/* Tab Navigation */}
            <div className="max-w-4xl mx-auto mb-6">
                <div className="border-b border-gray-200">
                    <nav className="-mb-px flex space-x-8">
                        <button
                            onClick={() => setActiveTab(0)}
                            className={`py-2 px-1 border-b-2 font-medium text-sm ${
                                activeTab === 0
                                    ? 'border-[#3450A3] text-[#3450A3]'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                        >
                            Project Initialization
                        </button>
                        <button
                            onClick={() => setActiveTab(1)}
                            className={`py-2 px-1 border-b-2 font-medium text-sm ${
                                activeTab === 1
                                    ? 'border-[#3450A3] text-[#3450A3]'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                        >
                            More Details
                        </button>
                    </nav>
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

                    <form onSubmit={handleSubmit}>
                        {activeTab === 0 && (
                            <div className="space-y-6">
                                <h2 className="text-xl font-semibold text-gray-900 mb-6">Project Initialization</h2>
                                
                                {/* Company Name */}
                                <div>
                                    <label htmlFor="companyId" className="block text-sm font-medium text-gray-700 mb-2">
                                        Company Name *
                                    </label>
                                    {companiesLoading ? (
                                        <div className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-gray-500">
                                            Loading companies...
                                        </div>
                                    ) : companiesError ? (
                                        <div className="w-full px-3 py-2 border border-red-300 rounded-md shadow-sm text-red-700">
                                            Error loading companies
                                        </div>
                                    ) : (
                                        <select
                                            id="companyId"
                                            name="companyId"
                                            value={formData.companyId}
                                            onChange={handleChange}
                                            className="text-black w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#3450A3] focus:border-[#3450A3]"
                                            required
                                        >
                                            <option value="">Select Company</option>
                                            {companies.map((company) => (
                                                <option key={company.companyId} value={company.companyId}>
                                                    {company.companyName}
                                                </option>
                                            ))}
                                        </select>
                                    )}
                                </div>

                                {/* Project Name */}
                                <div>
                                    <label htmlFor="projectName" className="block text-sm font-medium text-gray-700 mb-2">
                                        Project Name *
                                    </label>
                                    <input
                                        type="text"
                                        id="projectName"
                                        name="projectName"
                                        value={formData.projectName}
                                        onChange={handleChange}
                                        className="text-black w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#3450A3] focus:border-[#3450A3]"
                                        placeholder="Enter project name"
                                        required
                                    />
                                </div>

                                {/* Project Type */}
                                <div>
                                    <label htmlFor="projectType" className="block text-sm font-medium text-gray-700 mb-2">
                                        Project Type *
                                    </label>
                                    <select
                                        id="projectType"
                                        name="projectType"
                                        value={formData.projectType}
                                        onChange={handleChange}
                                        className="text-black w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#3450A3] focus:border-[#3450A3]"
                                        required
                                    >
                                        <option value="">Select Project Type</option>
                                        <option value="web">Web Development</option>
                                        <option value="mobile">Mobile Development</option>
                                        <option value="desktop">Desktop Application</option>
                                    </select>
                                </div>

                                {/* Project Size */}
                                <div>
                                    <label htmlFor="projectSize" className="block text-sm font-medium text-gray-700 mb-2">
                                        Project Size *
                                    </label>
                                    <select
                                        id="projectSize"
                                        name="projectSize"
                                        value={formData.projectSize}
                                        onChange={handleChange}
                                        className="text-black w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#3450A3] focus:border-[#3450A3]"
                                        required
                                    >
                                        <option value="">Select Project Size</option>
                                        <option value="small">Small</option>
                                        <option value="medium">Medium</option>
                                        <option value="large">Large</option>
                                    </select>
                                </div>

                                {/* Creation Date */}
                                <div>
                                    <label htmlFor="creationDate" className="block text-sm font-medium text-gray-700 mb-2">
                                        Creation Date
                                    </label>
                                    <input
                                        type="date"
                                        id="creationDate"
                                        name="creationDate"
                                        value={formData.creationDate}
                                        onChange={handleChange}
                                        className="text-black w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#3450A3] focus:border-[#3450A3]"
                                    />
                                </div>

                                {/* Estimated Budget */}
                                <div>
                                    <label htmlFor="estimatedBudget" className="block text-sm font-medium text-gray-700 mb-2">
                                        Estimated Budget
                                    </label>
                                    <input
                                        type="text"
                                        id="estimatedBudget"
                                        name="estimatedBudget"
                                        value={formData.estimatedBudget}
                                        onChange={handleChange}
                                        className="text-black w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#3450A3] focus:border-[#3450A3]"
                                        placeholder="Enter estimated budget"
                                    />
                                </div>

                                {/* Project Description */}
                                <div>
                                    <label htmlFor="projectDescription" className="block text-sm font-medium text-gray-700 mb-2">
                                        Project Description
                                    </label>
                                    <textarea
                                        id="projectDescription"
                                        name="projectDescription"
                                        value={formData.projectDescription}
                                        onChange={handleChange}
                                        rows={3}
                                        className="text-black w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#3450A3] focus:border-[#3450A3]"
                                        placeholder="Enter project description"
                                    />
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
                                        type="button"
                                        onClick={handleNext}
                                        className="px-6 py-2 bg-[#3450A3] text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#3450A3] flex items-center gap-2"
                                    >
                                        Next
                                        <ArrowRight className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        )}

                        {activeTab === 1 && (
                            <div className="space-y-6">
                                <h2 className="text-xl font-semibold text-gray-900 mb-6">More Details</h2>
                                
                                {/* Actual Start Date */}
                                <div>
                                    <label htmlFor="actualStartDate" className="block text-sm font-medium text-gray-700 mb-2">
                                        Actual Start Date
                                    </label>
                                    <input
                                        type="date"
                                        id="actualStartDate"
                                        name="actualStartDate"
                                        value={formData.actualStartDate}
                                        onChange={handleChange}
                                        className="text-black w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#3450A3] focus:border-[#3450A3]"
                                    />
                                </div>

                                {/* Actual End Date */}
                                <div>
                                    <label htmlFor="actualEndDate" className="block text-sm font-medium text-gray-700 mb-2">
                                        Actual End Date
                                    </label>
                                    <input
                                        type="date"
                                        id="actualEndDate"
                                        name="actualEndDate"
                                        value={formData.actualEndDate}
                                        onChange={handleChange}
                                        className="text-black w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#3450A3] focus:border-[#3450A3]"
                                    />
                                </div>

                                {/* Total Budget */}
                                <div>
                                    <label htmlFor="totalBudget" className="block text-sm font-medium text-gray-700 mb-2">
                                        Total Budget
                                    </label>
                                    <input
                                        type="text"
                                        id="totalBudget"
                                        name="totalBudget"
                                        value={formData.totalBudget}
                                        onChange={handleChange}
                                        className="text-black w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#3450A3] focus:border-[#3450A3]"
                                        placeholder="Enter total budget"
                                    />
                                </div>

                                {/* Payment Type */}
                                <div>
                                    <label htmlFor="paymentType" className="block text-sm font-medium text-gray-700 mb-2">
                                        Payment Type
                                    </label>
                                    <select
                                        id="paymentType"
                                        name="paymentType"
                                        value={formData.paymentType}
                                        onChange={handleChange}
                                        className="text-black w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#3450A3] focus:border-[#3450A3]"
                                    >
                                        <option value="">Select Payment Type</option>
                                        <option value="fixed">Fixed</option>
                                        <option value="hourly">Hourly</option>
                                        <option value="milestone">Milestone</option>
                                    </select>
                                </div>

                                {/* Payment Status */}
                                <div>
                                    <label htmlFor="paymentStatus" className="block text-sm font-medium text-gray-700 mb-2">
                                        Payment Status
                                    </label>
                                    <select
                                        id="paymentStatus"
                                        name="paymentStatus"
                                        value={formData.paymentStatus}
                                        onChange={handleChange}
                                        className="text-black w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#3450A3] focus:border-[#3450A3]"
                                    >
                                        <option value="">Select Payment Status</option>
                                        <option value="pending">Pending</option>
                                        <option value="partial">Partial</option>
                                        <option value="paid">Paid</option>
                                    </select>
                                </div>

                                {/* Status */}
                                <div>
                                    <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                                        Project Status
                                    </label>
                                    <select
                                        id="status"
                                        name="status"
                                        value={formData.status}
                                        onChange={handleChange}
                                        className="text-black w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#3450A3] focus:border-[#3450A3]"
                                    >
                                        <option value="Active">Active</option>
                                        <option value="Inactive">Inactive</option>
                                        <option value="Completed">Completed</option>
                                        <option value="On Hold">On Hold</option>
                                    </select>
                                </div>

                                {/* Form Actions */}
                                <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                                    <button
                                        type="button"
                                        onClick={() => setActiveTab(0)}
                                        className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 flex items-center gap-2"
                                    >
                                        <ArrowLeft className="h-4 w-4" />
                                        Back
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="px-6 py-2 bg-[#3450A3] text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#3450A3] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                    >
                                        {isSubmitting ? 'Adding...' : 'Add Project'}
                                    </button>
                                </div>
                            </div>
                        )}
                    </form>
                </div>
            </div>
        </div>
    );
}
