"use client";

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { AxiosError } from 'axios';
import { termsService } from '@/app/lib/services/termsService';
import { ApiResponse, TermsConditions } from "../../lib/types";

const TermsAndConditionsPage = () => {
    const queryClient = useQueryClient();

    // Fetch the terms data
    const { data: termsData, isLoading, error } = useQuery<TermsConditions>({
        queryKey: ['terms'],
        queryFn: termsService.getTerms,
    });

    // State for the terms text
    const [termsText, setTermsText] = useState<string>('');
    const [showSuccess, setShowSuccess] = useState<boolean>(false);
    const [showError, setShowError] = useState<string>('');

    // Update state when data is loaded
    useEffect(() => {
        if (termsData?.content) {
            setTermsText(termsData.content);
        }
    }, [termsData]);

    // Mutation for adding new terms
    const createMutation = useMutation<TermsConditions, AxiosError<ApiResponse<TermsConditions>>, string>({
        mutationFn: termsService.addTerms,
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
        setTermsText(termsData?.content || '');
        setShowError('');
        setShowSuccess(false);
    };

    if (isLoading) return <div className="flex justify-center items-center h-64">Loading...</div>;
    if (error) return <div className="text-red-500 text-center">Error: {error.message}</div>;

    // Enhanced toolbar configuration for rich text editing
    const modules = {
        toolbar: [
            [{ header: [1, 2, 3, 4, 5, 6, false] }],
            [{ font: [] }],
            [{ size: ['small', false, 'large', 'huge'] }],
            ['bold', 'italic', 'underline', 'strike'],
            [{ color: [] }, { background: [] }],
            [{ script: 'sub' }, { script: 'super' }],
            [{ list: 'ordered' }, { list: 'bullet' }],
            [{ indent: '-1' }, { indent: '+1' }],
            [{ direction: 'rtl' }],
            [{ align: [] }],
            ['link', 'image', 'video'],
            ['blockquote', 'code-block'],
            ['clean'],
        ],
    };

    const formats = [
        'header', 'font', 'size',
        'bold', 'italic', 'underline', 'strike',
        'color', 'background',
        'script',
        'list', 'bullet',
        'indent',
        'direction', 'align',
        'link', 'image', 'video',
        'blockquote', 'code-block',
    ];

    return (
        <div className="p-8 max-w-6xl mx-auto">
            <h1 className="text-4xl font-bold text-[#3450A3] mb-8">Terms and Conditions</h1>
            
            {/* Success/Error Messages */}
            {showSuccess && (
                <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded-md">
                    Terms and conditions saved successfully!
                </div>
            )}
            
            {showError && (
                <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-md">
                    {showError}
                </div>
            )}
            
            <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
                <ReactQuill
                    value={termsText}
                    onChange={setTermsText}
                    className="min-h-[400px]"
                    modules={modules}
                    formats={formats}
                    placeholder="Enter your terms and conditions here..."
                    theme="snow"
                />
            </div>
            
            <div className="flex justify-end gap-x-6">
                <button
                    className="w-28 bg-gray-300 hover:bg-gray-400 text-black font-bold py-2 px-4 rounded-md focus:outline-none focus:shadow-outline transition-colors"
                    type="button"
                    onClick={handleCancel}
                >
                    Cancel
                </button>
                <button
                    onClick={handleSave}
                    disabled={createMutation.isPending || updateMutation.isPending}
                    className="w-28 bg-[#FFBF00] hover:bg-[#e6ac00] disabled:bg-gray-400 text-black font-bold py-2 px-4 rounded-md focus:outline-none focus:shadow-outline transition-colors"
                    type="button"
                >
                    {(createMutation.isPending || updateMutation.isPending) ? 'Saving...' : 'Save'}
                </button>
            </div>
        </div>
    );
};

export default TermsAndConditionsPage;
