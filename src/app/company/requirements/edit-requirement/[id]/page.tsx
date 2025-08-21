'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { requirementService } from '@/app/lib/services/requirementService'; 
import { Requirement } from '../../../../lib/types';
import { FileText, ArrowLeft, X, Upload, Trash2, Undo } from 'lucide-react';
import { clientService, projectService } from '@/app/lib/services';
import { stringToStatusNumber, statusNumberToString } from '@/app/lib/utils/statusUtils';

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

const EditRequirementForm = () => {
    const router = useRouter();
    const params = useParams();
    const queryClient = useQueryClient();
    const requirementId = parseInt(params.id as string, 10);

    // State variables for form fields and error handling
    const [requirementTitle, setRequirementTitle] = useState('');
    const [priority, setPriority] = useState('');
    const [status, setStatus] = useState('');
    const [requirementDescription, setRequirementDescription] = useState('');
    const [attachment, setAttachment] = useState('');
    const [clientName, setClientName] = useState<string | null>(null);
    const [project, setProject] = useState<string | null>(null);
    const [isActive, setIsActive] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMessage, setModalMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [projects, setProjects] = useState<{ projectId: number; projectName: string }[]>([]);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [attachmentToDelete, setAttachmentToDelete] = useState<string | null>(null);

    // Fetch requirement data
    const { data: requirement, isLoading: requirementLoading, error: requirementError } = useQuery({
        queryKey: ['requirement', requirementId],
        queryFn: () => requirementService.getRequirementById(requirementId),
        enabled: !!requirementId
    });

    // Update form state when requirement data is loaded
    useEffect(() => {
        const loadClientData = async () => {
            if (requirement) {
                const client = await clientService.getClientById(requirement.clientId);
                const clientProjects = await projectService.getProjectsByClient(client.email);
                const selectedProject = clientProjects.find(p => p.projectId === requirement.projectId);
                setProjects(clientProjects.map(p => ({ projectId: p.projectId, projectName: p.projectName })));
                setProject(selectedProject?.projectId?.toString() || null);
                setClientName(client.name || null);
                setRequirementTitle(requirement.requirementTitle || '');
                setPriority(requirement.priority || '');
                setStatus(requirement.status !== undefined ? statusNumberToString(requirement.status) : 'Pending');
                setRequirementDescription(requirement.requirementDescription || '');
                setAttachment(requirement.attachment || '');
                setIsActive(requirement.isActive ?? true);
            }
        };
        
        loadClientData();
    }, [requirement]);

    // Mutation for updating requirement
    const updateRequirementMutation = useMutation({
        mutationFn: (data: Requirement) => {
            data.requirementId = requirementId;
            return requirementService.updateRequirement(data);
        },
        onSuccess: () => {
            setModalMessage('Requirement updated successfully!');
            setIsModalOpen(true);
            queryClient.invalidateQueries({ queryKey: ['requirements'] });
            queryClient.invalidateQueries({ queryKey: ['requirement', requirementId] });
        },
        onError: (error: Error) => {
            setModalMessage(`Error: ${error.message}`);
            setIsModalOpen(true);
        },
    });

    // Handle attachment deletion from UI only
    const handleAttachmentRemove = () => {
        if (attachment) {
            setAttachmentToDelete(attachment);
            setAttachment('');
        }
    };

    const onChangeProject = (projectId: number) => {
        setProject(projectId.toString());
    };

    // File upload handler
    const handleFileUpload = async () => {
        if (!selectedFile) return;

        setIsUploading(true);
        try {
            const formData = new FormData();
            formData.append('file', selectedFile);

            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            });

            const result = await response.json();

            if (result.success) {
                // If there's an existing file, delete it
                if (attachment) {
                    await handleFileDelete(attachment, false);
                }
                
                setAttachment(result.filename);
                setSelectedFile(null);
                return result.filename;
            } else {
                setModalMessage(`Upload failed: ${result.error}`);
                setIsModalOpen(true);
                return null;
            }
        } catch (error) {
            setModalMessage('Error uploading file. Please try again.');
            setIsModalOpen(true);
        } finally {
            setIsUploading(false);
        }
    };

    // File delete handler
    const handleFileDelete = async (filename: string, showModal = true) => {
        if (!filename) return;

        try {
            const response = await fetch(`/api/upload/delete?filename=${encodeURIComponent(filename)}`, {
                method: 'DELETE',
            });

            const result = await response.json();

            if (result.success) {
                setAttachment('');
                if (showModal) {
                    setModalMessage('File deleted successfully!');
                    setIsModalOpen(true);
                }
            } else {
                if (showModal) {
                    setModalMessage(`Delete failed: ${result.error}`);
                    setIsModalOpen(true);
                }
            }
        } catch (error) {
            if (showModal) {
                setModalMessage('Error deleting file. Please try again.');
                setIsModalOpen(true);
            }
        }
    };

    // File selection handler
    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Validate file type
            const allowedTypes = [
                'image/jpeg',
                'image/jpg', 
                'image/png',
                'application/pdf',
                'text/plain',
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
            ];

            if (!allowedTypes.includes(file.type)) {
                setModalMessage('Invalid file type. Only JPEG, JPG, PNG, PDF, TXT, DOCX files are allowed.');
                setIsModalOpen(true);
                return;
            }

            // Validate file size (max 10MB)
            const maxSize = 10 * 1024 * 1024; // 10MB
            if (file.size > maxSize) {
                setModalMessage('File size must be less than 10MB.');
                setIsModalOpen(true);
                return;
            }

            setSelectedFile(file);
            // Reset attachment deletion state when new file is selected
            if (attachmentToDelete) {
                setAttachmentToDelete(null);
            }
        }
    };

    // Get file display name
    const getFileDisplayName = (filename: string) => {
        if (!filename) return '';
        return filename.substring(filename.indexOf('_') + 1);
    };

    // Form submission handler
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!requirementTitle || !priority || !requirementDescription || requirement?.clientId === null || !project) {
            setError('Please fill in all the required fields.');
            return;
        }

        // Don't submit if file operations are in progress
        if (isUploading) {
            setError('Please wait for file operations to complete before submitting.');
            return;
        }

        let attachmentName = attachment;
        
        // Handle file upload if a new file is selected
        if (selectedFile !== null) {
            const uploadedFilename = await handleFileUpload();
            if (uploadedFilename) {
                attachmentName = uploadedFilename;
            }
        }

        // Handle file deletion if attachment was marked for deletion
        if (attachmentToDelete && !selectedFile) {
            await handleFileDelete(attachmentToDelete, false);
            attachmentName = '';
        }

        const selectedProjectId = parseInt(project, 10);

        const updatedRequirement: Requirement = {
            requirementId: requirementId,
            requirementTitle,
            priority,
            status: stringToStatusNumber(status),
            requirementDescription,
            attachment: attachmentName,
            isActive,
            clientId: requirement?.clientId!,
            projectId: selectedProjectId
        };

        try {
            setIsSubmitting(true);
            await updateRequirementMutation.mutateAsync(updatedRequirement);
            setTimeout(() => {
                router.push('/company/requirements');
            }, 1500);
        } catch (error) {
            // Error handling is done in mutation's onError callback
        } finally {
            setIsSubmitting(false);
        }
    };

    // Closing the modal
    const closeModal = () => {
        setIsModalOpen(false);
        if (modalMessage.startsWith('Requirement updated successfully')) {
            router.push('/company/requirements'); // Redirect after successful update
        }
    };

    if (requirementLoading) {
        return (
            <div className="flex justify-center items-center min-h-[400px]">
                <div className="text-center">
                    <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
                    <p className="mt-2 text-gray-600">Loading requirement...</p>
                </div>
            </div>
        );
    }

    if (requirementError) {
        return (
            <div className="flex justify-center items-center min-h-[400px]">
                <div className="text-center">
                    <p className="text-red-600">Error loading requirement. Please try again.</p>
                    <button
                        onClick={() => router.push('/company/requirements')}
                        className="mt-4 text-blue-600 hover:text-blue-800"
                    >
                        Back to Requirements
                    </button>
                </div>
            </div>
        );
    }

    if (modalMessage.startsWith('Requirement updated successfully')) {
        return (
            <div className="flex justify-center items-center min-h-[400px]">
                <div className="text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                        <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Requirement Updated Successfully!</h3>
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
                    onClick={() => router.push('/company/requirements')}
                    className="flex items-center text-gray-600 hover:text-gray-800 mb-4"
                >
                    <ArrowLeft className="h-5 w-5 mr-2" />
                    Back to Requirements
                </button>
                
                <div className="flex items-center gap-3">
                    <FileText className="h-8 w-8 text-[#3450A3]" />
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Edit Requirement</h1>
                        <p className="text-gray-600 mt-1">Update requirement information</p>
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
                            <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="status">
                                Status *
                            </label>
                            <select
                                className="text-black w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#3450A3] focus:border-[#3450A3]"
                                id="status"
                                value={status}
                                onChange={(e) => setStatus(e.target.value)}
                                required
                            >
                                <option value="">Select Status</option>
                                <option value="Pending">Pending</option>
                                <option value="In Progress">In Progress</option>
                                <option value="Under Review">Under Review</option>
                                <option value="Complete">Complete</option>
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
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Attachment
                            </label>
                            
                            {/* Current Attachment Display */}
                            {attachment && !selectedFile && (
                                <div className="mb-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-3">
                                            <FileText className="h-5 w-5 text-gray-500" />
                                            <div>
                                                <p className="text-sm font-medium text-gray-900">
                                                    {getFileDisplayName(attachment)}
                                                </p>
                                                <p className="text-xs text-gray-500">Current attachment</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-2">                                        
                                            <button
                                                type="button"
                                                onClick={handleAttachmentRemove}
                                                className="inline-flex items-center px-3 py-1 border border-red-300 shadow-sm text-xs font-medium rounded text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                                            >
                                                <Trash2 className="h-3 w-3 mr-1" />
                                                Remove
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Show deletion notice if attachment is marked for deletion */}
                            {attachmentToDelete && !attachment && !selectedFile && (
                                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                                    <div className="flex items-center justify-between">
                                        <div className='flex items-center space-x-3'>
                                            <X className="h-5 w-5 text-red-500" />
                                            <div>
                                                <p className="text-sm font-medium text-red-900">
                                                {getFileDisplayName(attachmentToDelete)} will be deleted
                                            </p>
                                            <p className="text-xs text-red-600">
                                                File will be permanently deleted when you update the requirement
                                            </p>
                                            </div>                                            
                                        </div>
                                        <div className="flex items-center space-x-2">                                        
                                            <button
                                                type="button"
                                                onClick={() => {
                                                setAttachment(attachmentToDelete);
                                                setAttachmentToDelete(null);
                                            }}
                                                className="inline-flex items-center px-2 py-1 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                                            >
                                                <Undo className="h-3 w-3 mr-1" />
                                                Undo
                                            </button>
                                        </div>                                        
                                    </div>
                                </div>
                            )}

                            {/* File Upload Section */}
                            <div className="space-y-4">
                                {/* File Selection */}
                                <div>
                                    <input
                                        type="file"
                                        id="fileInput"
                                        className="hidden"
                                        accept=".jpg,.jpeg,.png,.pdf,.txt,.docx"
                                        onChange={handleFileSelect}
                                    />
                                    <label
                                        htmlFor="fileInput"
                                        className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#3450A3] cursor-pointer"
                                    >
                                        <Upload className="h-4 w-4 mr-2" />
                                        Choose File
                                    </label>
                                    <p className="mt-1 text-xs text-gray-500">
                                        Supported formats: JPEG, PNG, PDF, TXT, DOCX (max 10MB)
                                    </p>
                                </div>

                                {/* Selected File Display */}
                                {selectedFile && (
                                    <div className="space-y-3">
                                        {/* Show notice about existing attachment being hidden */}
                                        {attachment && (
                                            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                                                <div className="flex items-center space-x-2">
                                                    <div className="h-4 w-4 bg-yellow-400 rounded-full flex items-center justify-center">
                                                        <span className="text-xs text-yellow-800">!</span>
                                                    </div>
                                                    <p className="text-sm text-yellow-800">
                                                        Existing attachment &quot;{getFileDisplayName(attachment)}&quot; will be replaced by the new file
                                                    </p>
                                                </div>
                                            </div>
                                        )}
                                        
                                        {/* New file display */}
                                        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center space-x-2">
                                                    <FileText className="h-4 w-4 text-blue-500" />
                                                    <div>
                                                        <p className="text-sm font-medium text-blue-900">
                                                            {selectedFile.name}
                                                        </p>
                                                        <p className="text-xs text-blue-600">
                                                            {(selectedFile.size / 1024 / 1024).toFixed(2)} MB - New attachment
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center space-x-2">                                            
                                                    <button
                                                        type="button"
                                                        onClick={() => setSelectedFile(null)}
                                                        className="inline-flex items-center px-2 py-1 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                                                    >
                                                        <X className="h-3 w-3" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="clientId">
                                Client
                            </label>
                            <input
                                className="text-black w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#3450A3] focus:border-[#3450A3]"
                                id="clientId"
                                disabled
                                placeholder="Enter Client ID"
                                value={clientName ?? ''}
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="projectId">
                                Project
                            </label>
                            <select
                                className="text-black w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#3450A3] focus:border-[#3450A3]"
                                id="projectId"
                                value={project || ''}
                                onChange={(e) => onChangeProject(parseInt(e.target.value, 10))}
                                required
                            >
                                <option value="">Select a project</option>
                                {projects.map((p) => (
                                    <option key={p.projectId} value={p.projectId}>
                                        {p.projectName}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="flex items-center">
                                <input
                                    className="h-4 w-4 text-[#3450A3] focus:ring-[#3450A3] border-gray-300 rounded"
                                    type="checkbox"
                                    checked={isActive}
                                    onChange={() => setIsActive(!isActive)}
                                />
                                <span className="ml-2 text-sm font-medium text-gray-700">Active</span>
                            </label>
                            <p className="mt-1 text-sm text-gray-500">
                                Inactive requirements will be hidden from most views
                            </p>
                        </div>

                        {/* Form Actions */}
                        <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                            <button
                                className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                                type="button"
                                onClick={() => router.push('/company/requirements')}
                            >
                                Cancel
                            </button>
                            <button
                                className="px-6 py-2 bg-[#3450A3] text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#3450A3] disabled:opacity-50 disabled:cursor-not-allowed"
                                type="submit"
                                disabled={isSubmitting || updateRequirementMutation.isPending || isUploading}
                            >
                                {isSubmitting || updateRequirementMutation.isPending ? 'Updating...' : 'Update Requirement'}
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

export default EditRequirementForm;
