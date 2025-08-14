"use client";

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { AxiosError } from 'axios';
import { FileText,AlertTriangle, CheckCircle, Edit } from 'lucide-react';
import { termsService } from '@/app/lib/services/termsService';
import { ApiResponse, TermsConditions } from "../../lib/types";

const TermsAndConditionsPage = () => {
    const queryClient = useQueryClient();

    // Fetch the general terms data
    const { data: termsData, isLoading, error } = useQuery<TermsConditions>({
        queryKey: ['terms'],
        queryFn: () => termsService.getTerms(),
    });

    // State for the terms text
    const [termsText, setTermsText] = useState<string>('');
    const [showSuccess, setShowSuccess] = useState<boolean>(false);
    const [showError, setShowError] = useState<string>('');

    useEffect(() => {
        if (termsData?.content) {
            // Remove leading numbers from each list item if present
            let cleanedContent = termsData.content;
            // Regex to remove numbers like '1. ', '2. ', etc. at the start of list items
            cleanedContent = cleanedContent.replace(/<li>\s*\d+\.\s*/g, '<li>');
            setTermsText(cleanedContent);
        } else {
            setTermsText('');
        }
    }, [termsData]);

    // Mutation for adding new terms
    const createMutation = useMutation<TermsConditions, AxiosError<ApiResponse<TermsConditions>>, string>({
        mutationFn: (content: string) => termsService.addTerms(content),
        onSuccess: (data) => {
            queryClient.setQueryData(['terms'], data);
            queryClient.invalidateQueries({ queryKey: ['terms'] });
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
        mutationFn: ({ tcId, content }) => termsService.updateTerms(tcId, content),
        onSuccess: (data) => {
            queryClient.setQueryData(['terms'], data);
            queryClient.invalidateQueries({ queryKey: ['terms'] });
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
        if (termsData?.content) {
            setTermsText(termsData.content);
        } else {
            setTermsText('');
        }
        setShowError('');
        setShowSuccess(false);
    };

    if (isLoading) {
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
                        <p className="text-gray-600 mt-2">Manage your company&apos;s terms and conditions</p>
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

            {/* Editor Section */}
            <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
                <div className="p-6 border-b bg-gray-50">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-lg font-semibold text-black flex items-center gap-2">
                                <Edit className="h-5 w-5 text-[#3450A3]" />
                                Terms and Conditions Editor
                            </h2>
                            <p className="text-sm text-black mt-1">
                                Edit your company&apos;s terms and conditions below.
                            </p>
                        </div>
                        <div className="text-right">
                            <p className="text-sm text-black">Use numbered lists only</p>
                            <p className="text-xs text-black">Bold and italic formatting available</p>
                        </div>
                    </div>
                </div>

                <div className="p-6">
                    <div className="quill-container">
                        <ReactQuill
                            value={termsText}
                            onChange={setTermsText}
                            className="min-h-[500px] text-black"
                            modules={modules}
                            formats={formats}
                            placeholder="Enter your terms and conditions here using numbered lists..."
                            theme="snow"
                        />
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="px-6 py-4 bg-gray-50 border-t flex justify-end items-center">
                    <button
                        className="px-6 py-2 bg-gray-300 hover:bg-gray-400 text-gray-700 font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors flex items-center gap-2"
                        type="button"
                        onClick={handleCancel}
                    >
                        Reset
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={createMutation.isPending || updateMutation.isPending}
                        className="px-6 py-2 bg-[#3450A3] ml-3 hover:bg-blue-700 text-white disabled:bg-gray-400 font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors flex items-center gap-2"
                        type="button"
                    >
                        {(createMutation.isPending || updateMutation.isPending) ? 'Saving...' : 'Save Terms'}
                    </button>
                </div>
            </div>
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
