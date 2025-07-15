"use client";

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { AxiosError } from 'axios';
import { FileText, Save, RotateCcw, AlertTriangle, CheckCircle, Edit, FolderOpen } from 'lucide-react';
import { termsService } from '@/app/lib/services/termsService';
import { projectService } from '@/app/lib/services/projectService';
import { ApiResponse, TermsConditions, Project } from "../../lib/types";

const TermsAndConditionsPage = () => {
    const queryClient = useQueryClient();
    
    // State for selected project
    const [selectedProjectId, setSelectedProjectId] = useState<string>('');
    
    // Fetch all projects for the dropdown
    const { data: projects = [], isLoading: projectsLoading } = useQuery<Project[]>({
        queryKey: ['projects'],
        queryFn: projectService.getAllProjects,
    });

    // Fetch the general terms data (for fallback)
    const { data: termsData, isLoading, error } = useQuery<TermsConditions>({
        queryKey: ['terms'],
        queryFn: () => termsService.getTerms(),
    });

    // State for the terms text
    const [termsText, setTermsText] = useState<string>('');
    const [showSuccess, setShowSuccess] = useState<boolean>(false);
    const [showError, setShowError] = useState<string>('');
    
    // Store project-specific terms in localStorage for now
    const getProjectTermsKey = (projectId: string) => `terms_project_${projectId}`;
    
    // Get selected project details
    const selectedProject = projects.find(p => p.projectId.toString() === selectedProjectId);

    // Update state when data is loaded or project changes
    useEffect(() => {
        if (selectedProjectId) {
            // Try to load project-specific terms from localStorage first
            const savedTerms = localStorage.getItem(getProjectTermsKey(selectedProjectId));
            if (savedTerms) {
                setTermsText(savedTerms);
            } else if (termsData?.content) {
                // Check if the global terms contain this project's terms
                const projectSpecificContent = extractProjectTerms(termsData.content, selectedProjectId);
                setTermsText(projectSpecificContent);
            } else {
                // Start with empty editor
                setTermsText('');
            }
        } else {
            setTermsText('');
        }
    }, [termsData, selectedProjectId, selectedProject]);
    
    // Helper function to extract project-specific terms from global terms
    const extractProjectTerms = (content: string, projectId: string): string => {
        const projectMarker = `<!-- PROJECT_${projectId}_START -->`;
        const projectEndMarker = `<!-- PROJECT_${projectId}_END -->`;
        
        const startIndex = content.indexOf(projectMarker);
        const endIndex = content.indexOf(projectEndMarker);
        
        if (startIndex !== -1 && endIndex !== -1) {
            return content.substring(startIndex + projectMarker.length, endIndex).trim();
        }
        
        return '';
    };

    // Mutation for adding new terms
    const createMutation = useMutation<TermsConditions, AxiosError<ApiResponse<TermsConditions>>, string>({
        mutationFn: (content: string) => {
            // For now, save project-specific terms to localStorage and update global terms
            const projectSpecificContent = `<!-- PROJECT_${selectedProjectId}_START -->\n${content}\n<!-- PROJECT_${selectedProjectId}_END -->`;
            localStorage.setItem(getProjectTermsKey(selectedProjectId), content);
            return termsService.addTerms(projectSpecificContent);
        },
        onSuccess: (data) => {
            queryClient.setQueryData(['terms', selectedProjectId], data);
            queryClient.invalidateQueries({ queryKey: ['terms', selectedProjectId] });
            setShowSuccess(true);
            setShowError('');
            setTimeout(() => setShowSuccess(false), 3000);
        },
        onError: (error) => {
            setShowError(error.message || 'Failed to create terms and conditions');
            setShowSuccess(false);
        },
    });

    // Mutation for updating existing terms
    const updateMutation = useMutation<TermsConditions, AxiosError<ApiResponse<TermsConditions>>, { tcId: number; content: string }>({
        mutationFn: ({ tcId, content }) => {
            // Save project-specific terms to localStorage
            localStorage.setItem(getProjectTermsKey(selectedProjectId), content);
            
            // For updating, we'll just update the project-specific content
            // In a real implementation, you'd want to merge with other project terms
            const projectSpecificContent = `<!-- PROJECT_${selectedProjectId}_START -->\n${content}\n<!-- PROJECT_${selectedProjectId}_END -->`;
            return termsService.updateTerms(tcId, projectSpecificContent);
        },
        onSuccess: (data) => {
            queryClient.setQueryData(['terms', selectedProjectId], data);
            queryClient.invalidateQueries({ queryKey: ['terms', selectedProjectId] });
            setShowSuccess(true);
            setShowError('');
            setTimeout(() => setShowSuccess(false), 3000);
        },
        onError: (error) => {
            setShowError(error.message || 'Failed to update terms and conditions');
            setShowSuccess(false);
        },
    });

    // Handle save logic
    const handleSave = () => {
        if (!selectedProjectId) {
            setShowError('Please select a project first');
            return;
        }
        
        if (!termsText.trim()) {
            setShowError('Terms and conditions content cannot be empty');
            return;
        }

        setShowError('');
        
        if (termsData?.tcId) {
            updateMutation.mutate({ tcId: termsData.tcId, content: termsText });
        } else {
            createMutation.mutate(termsText);
        }
    };

    const handleCancel = () => {
        if (selectedProjectId) {
            // Reload from localStorage or reset to empty
            const savedTerms = localStorage.getItem(getProjectTermsKey(selectedProjectId));
            if (savedTerms) {
                setTermsText(savedTerms);
            } else if (termsData?.content) {
                const projectSpecificContent = extractProjectTerms(termsData.content, selectedProjectId);
                setTermsText(projectSpecificContent);
            } else {
                // Reset to empty
                setTermsText('');
            }
        } else {
            setTermsText('');
        }
        setShowError('');
        setShowSuccess(false);
    };

    const handleProjectChange = (projectId: string) => {
        setSelectedProjectId(projectId);
        setShowError('');
        setShowSuccess(false);
        // Text will be updated by useEffect
    };

    if (isLoading || projectsLoading) {
        return (
            <div className="flex justify-center items-center min-h-[400px]">
                <div className="text-center">
                    <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
                    <p className="mt-2 text-gray-600">Loading...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex justify-center items-center min-h-[400px]">
                <div className="text-center">
                    <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                    <p className="text-gray-600">Error loading terms and conditions. Please try again.</p>
                </div>
            </div>
        );
    }

    // Simplified toolbar configuration for numbered lists only
    const modules = {
        toolbar: [
            [{ list: 'ordered' }], // Only numbered lists
            ['bold', 'italic'], // Basic text formatting
            ['clean'], // Remove formatting
        ],
    };

    const formats = [
        'list', 'bold', 'italic'
    ];

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            {/* Header */}
            <div className="mb-8">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                            <FileText className="h-8 w-8 text-[#3450A3]" />
                            Terms and Conditions
                        </h1>
                        <p className="text-gray-600 mt-2">Manage your company's terms and conditions</p>
                    </div>
                </div>

                {/* Success/Error Messages */}
                {showSuccess && (
                    <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg flex items-center gap-2">
                        <CheckCircle className="h-5 w-5" />
                        Terms and conditions saved successfully!
                    </div>
                )}
                
                {showError && (
                    <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5" />
                        {showError}
                    </div>
                )}
            </div>

            {/* Project Selection */}
            <div className="bg-white rounded-lg shadow-sm border mb-6">
                <div className="p-6 border-b bg-gray-50">
                    <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                        <FolderOpen className="h-5 w-5 text-[#3450A3]" />
                        Select Project
                    </h2>
                    <p className="text-sm text-gray-600 mt-1">Choose a project to manage its terms and conditions</p>
                </div>
                
                <div className="p-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div>
                            <label htmlFor="projectSelect" className="block text-sm font-medium text-gray-700 mb-2">
                                Project *
                            </label>
                            <select
                                id="projectSelect"
                                value={selectedProjectId}
                                onChange={(e) => handleProjectChange(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3450A3] focus:border-[#3450A3] text-gray-900"
                            >
                                <option value="">Select a project...</option>
                                {projects.map((project) => (
                                    <option key={project.projectId} value={project.projectId.toString()}>
                                        {project.projectName} ({project.projectType})
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            {/* Editor Section - Only show when project is selected */}
            {selectedProjectId && (
                <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
                    <div className="p-6 border-b bg-gray-50">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                    <Edit className="h-5 w-5 text-[#3450A3]" />
                                    Terms and Conditions Editor
                                </h2>
                                <p className="text-sm text-gray-600 mt-1">
                                    Creating terms for: <span className="font-medium text-gray-900">{selectedProject?.projectName}</span>
                                </p>
                            </div>
                            <div className="text-right">
                                <p className="text-sm text-gray-500">Use numbered lists only</p>
                                <p className="text-xs text-gray-400">Bold and italic formatting available</p>
                            </div>
                        </div>
                    </div>
                    
                    <div className="p-6">
                        <div className="quill-container">
                            <ReactQuill
                                value={termsText}
                                onChange={setTermsText}
                                className="min-h-[500px]"
                                modules={modules}
                                formats={formats}
                                placeholder="Enter your terms and conditions here using numbered lists..."
                                theme="snow"
                            />
                        </div>
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="px-6 py-4 bg-gray-50 border-t flex justify-between items-center">
                        <div className="text-sm text-gray-500">
                            Terms will be saved for project: <span className="font-medium">{selectedProject?.projectName}</span>
                        </div>
                        <div className="flex gap-4">
                            <button
                                className="px-6 py-2 bg-gray-300 hover:bg-gray-400 text-gray-700 font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors flex items-center gap-2"
                                type="button"
                                onClick={handleCancel}
                            >
                                <RotateCcw className="h-4 w-4" />
                                Reset
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={createMutation.isPending || updateMutation.isPending}
                                className="px-6 py-2 bg-[#3450A3] hover:bg-blue-700 text-white disabled:bg-gray-400 font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors flex items-center gap-2"
                                type="button"
                            >
                                <Save className="h-4 w-4" />
                                {(createMutation.isPending || updateMutation.isPending) ? 'Saving...' : 'Save Terms'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* No Project Selected Message */}
            {!selectedProjectId && (
                <div className="bg-white rounded-lg shadow-sm border">
                    <div className="p-12 text-center">
                        <FolderOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">No Project Selected</h3>
                        <p className="text-gray-600 max-w-md mx-auto">
                            Please select a project from the dropdown above to start creating or editing terms and conditions.
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TermsAndConditionsPage;

// Custom styles for ReactQuill editor with simplified toolbar
const styles = `
.quill-container .ql-toolbar {
    border-top: 1px solid #e5e7eb;
    border-left: 1px solid #e5e7eb;
    border-right: 1px solid #e5e7eb;
    border-bottom: none;
    border-radius: 0.5rem 0.5rem 0 0;
    background: #f9fafb;
    padding: 8px 12px;
}

.quill-container .ql-container {
    border-bottom: 1px solid #e5e7eb;
    border-left: 1px solid #e5e7eb;
    border-right: 1px solid #e5e7eb;
    border-top: none;
    border-radius: 0 0 0.5rem 0.5rem;
    font-family: inherit;
}

.quill-container .ql-editor {
    min-height: 400px;
    font-size: 14px;
    line-height: 1.6;
    padding: 20px;
}

.quill-container .ql-editor.ql-blank::before {
    color: #9ca3af;
    font-style: italic;
    left: 20px;
}

.quill-container .ql-toolbar .ql-picker-label:hover,
.quill-container .ql-toolbar .ql-picker-item:hover {
    color: #3450A3;
}

.quill-container .ql-toolbar button:hover {
    color: #3450A3;
}

.quill-container .ql-toolbar button.ql-active {
    color: #3450A3;
}

.quill-container .ql-editor ol {
    padding-left: 1.5em;
}

.quill-container .ql-editor ol > li {
    list-style-type: decimal;
    margin-bottom: 0.5em;
        color: black;

}

.quill-container .ql-editor ol ol {
    padding-left: 1.5em;
        color: black;

}

.quill-container .ql-editor ol ol > li {
    list-style-type: lower-alpha;
        color: black;
}

.quill-container .ql-editor ol ol ol > li {
    list-style-type: lower-roman;
    color: black;
}
`;

// Inject styles
if (typeof document !== 'undefined') {
    const styleElement = document.createElement('style');
    styleElement.textContent = styles;
    if (!document.head.querySelector('style[data-quill-terms-custom]')) {
        styleElement.setAttribute('data-quill-terms-custom', 'true');
        document.head.appendChild(styleElement);
    }
}
