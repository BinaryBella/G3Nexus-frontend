'use client';

import React, { useState, useEffect } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { requirementService } from '@/app/lib/services/requirementService'; 
import { projectService } from '@/app/lib/services/projectService';
import { Requirement } from '../../../lib/types';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/app/contexts/AuthContext';
import { FileText, ArrowLeft, X } from 'lucide-react';

// Modal Component for Notifications
const Modal = ({ isOpen, onClose, children = 'Notice' }: any) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-lg mx-auto relative">
                <button
                    className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 focus:outline-none"
                    onClick={onClose}
                >
                    <X className="h-5 w-5" />
                </button>
                <div className="text-gray-700 text-left mt-6 mb-8">{children}</div>
                <div className="flex justify-end">
                    <button
                        className="bg-[#3450A3] hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-md focus:outline-none focus:ring-2 focus:ring-[#3450A3]"
                        onClick={onClose}
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

const RequirementForm = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { user } = useAuth();

    // State variables for form fields and error handling
    const [requirementTitle, setRequirementTitle] = useState('');
    const [priority, setPriority] = useState('');
    const [requirementDescription, setRequirementDescription] = useState('');
    const [attachment, setAttachment] = useState('');
    const [project, setProject] = useState<number | null>(null);
    const [projectName, setProjectName] = useState<string>('');
    const [error, setError] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMessage, setModalMessage] = useState('');

    // Get projectId from query params and set it
    useEffect(() => {
        const projectIdParam = searchParams.get('projectId');
        console.log(user);
        
        if (projectIdParam) {
            setProject(Number(projectIdParam));
        }
    }, [searchParams]);
    // Fetch project details when project ID is available
    const { data: projectData, isLoading: projectLoading } = useQuery({
        queryKey: ['project', project],
        queryFn: () => projectService.getProjectById(project!),
        enabled: !!project,
    });

    // Set project name when project data is loaded
    useEffect(() => {
        if (projectData) {
            setProjectName(projectData.projectName);
        }
    }, [projectData]);

    // Mutation for adding requirement
    const addRequirementMutation = useMutation({
        mutationFn: requirementService.addRequirement,
        onSuccess: () => {
            setModalMessage('Requirement added successfully!');
            setIsModalOpen(true);
        },
        onError: (error: Error) => {
            setModalMessage(`Error: ${error.message}`);
            setIsModalOpen(true);
        },
    });

    // Form submission handler
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!requirementTitle || !priority || !requirementDescription || user?.clientId === null || project === null) {
            setError('Please fill in all the required fields.');
            return;
        }

        const newRequirement: Omit<Requirement, 'requirementId'> = {
            requirementTitle,
            priority,
            requirementDescription,
            attachment,
            isActive: true,
            clientId: user?.clientId!,
            projectId: project,
            isNew: true,
        };

        try {
            await addRequirementMutation.mutateAsync(newRequirement);
        } catch (error) {
            // Error handling is done in mutation's onError callback
        }
    };

    // Closing the modal
    const closeModal = () => {
        setIsModalOpen(false);
        if (modalMessage.startsWith('Requirement added successfully')) {
            router.push('/client/requirements'); // Redirect after successful addition
        }
    };

    if (modalMessage.startsWith('Requirement added successfully')) {
        return (
            <div className="flex justify-center items-center min-h-[400px]">
                <div className="text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                        <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Requirement Added Successfully!</h3>
                    <p className="text-gray-600">Redirecting to requirements list...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            {/* Header */}
            <div className="mb-8">
                <button
                    onClick={() => router.push('/client/requirements')}
                    className="flex items-center text-gray-600 hover:text-gray-800 mb-4"
                >
                    <ArrowLeft className="h-5 w-5 mr-2" />
                    Back to Requirements
                </button>
                
                <div className="flex items-center gap-3">
                    <FileText className="h-8 w-8 text-[#3450A3]" />
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Add New Requirement</h1>
                        <p className="text-gray-600 mt-1">Create a new requirement record</p>
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
                        <h2 className="text-xl font-semibold text-gray-900 mb-6">Requirement Information</h2>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="requirementTitle">
                                Requirement Title *
                            </label>
                            <input
                                className="text-black w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#3450A3] focus:border-[#3450A3]"
                                id="requirementTitle"
                                type="text"
                                placeholder="Enter requirement title"
                                value={requirementTitle}
                                onChange={(e) => setRequirementTitle(e.target.value)}
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="priority">
                                Priority *
                            </label>
                            <select
                                className="text-black w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#3450A3] focus:border-[#3450A3]"
                                id="priority"
                                value={priority}
                                onChange={(e) => setPriority(e.target.value)}
                                required
                            >
                                <option value="">Select Priority</option>
                                <option value="High">High</option>
                                <option value="Medium">Medium</option>
                                <option value="Low">Low</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="requirementDescription">
                                Requirement Description *
                            </label>
                            <textarea
                                className="text-black w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#3450A3] focus:border-[#3450A3]"
                                id="requirementDescription"
                                placeholder="Describe the requirement"
                                rows={4}
                                value={requirementDescription}
                                onChange={(e) => setRequirementDescription(e.target.value)}
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="attachment">
                                Attachment (Optional)
                            </label>
                            <input
                                className="text-black w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#3450A3] focus:border-[#3450A3]"
                                id="attachment"
                                type="text"
                                placeholder="Link to attachment"
                                value={attachment}
                                onChange={(e) => setAttachment(e.target.value)}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="projectId">
                                Project
                            </label>
                            <input
                                className="text-black w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#3450A3] focus:border-[#3450A3] bg-gray-50"
                                id="projectId"
                                disabled
                                placeholder={projectLoading ? "Loading project..." : "Project will be auto-filled"}
                                value={projectLoading ? "Loading..." : projectName || ''}
                                required
                            />
                        </div>            

                        {/* Form Actions */}
                        <div className="flex justify-end space-x-4 pt-6">
                            <button
                                className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                                type="button"
                                onClick={() => router.push('/client/requirements')}
                            >
                                Cancel
                            </button>
                            <button
                                className="px-6 py-2 bg-[#3450A3] text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#3450A3] disabled:opacity-50 disabled:cursor-not-allowed"
                                type="submit"
                                disabled={addRequirementMutation.isPending}
                            >
                                {addRequirementMutation.isPending ? 'Adding...' : 'Add Requirement'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {/* Modal */}
            <Modal isOpen={isModalOpen} onClose={closeModal}>
                {modalMessage}
            </Modal>
        </div>
    );
};

export default RequirementForm;
