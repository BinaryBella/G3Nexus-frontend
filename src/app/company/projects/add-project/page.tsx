   
   'use client';

import { clientService, Client } from '@/app/lib/services/clientService';


import React, { useState, useEffect } from 'react';
import { termsService } from '@/app/lib/services/termsService';
import FeedbackPopup from '@/app/components/FeedbackPopup';
import { useRef } from 'react';
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
    // Client fields
    clientName: string;
    clientEmail: string;
}

export default function ProjectForm({ projectId }: ProjectFormProps) {
    const router = useRouter();
    const { canManageProjects } = useRoleAccess();
       // State for filtered client admins
    const [clientAdmins, setClientAdmins] = useState<Client[]>([]);
    const [allClients, setAllClients] = useState<Client[]>([]);
    const [clientsLoading, setClientsLoading] = useState(false);
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
        clientName: '',
        clientEmail: '',
    });
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [showQuotationConfirm, setShowQuotationConfirm] = useState(false);
    const [pendingProjectData, setPendingProjectData] = useState<any>(null);
    const [showCostModal, setShowCostModal] = useState(false);
    const [costModalStep, setCostModalStep] = useState(0); // 0: cost, 1: terms
    const [costInputs, setCostInputs] = useState({
        development: '',
        hosting: '',
        ssl: '',
        server: '',
    });
    const [costError, setCostError] = useState<string | null>(null);
    // Terms & Conditions state
    const [terms, setTerms] = useState<any[]>([]);
    const [termsLoading, setTermsLoading] = useState(false);
    const [termsError, setTermsError] = useState<string | null>(null);
    const [checkedTerms, setCheckedTerms] = useState<{ [key: number]: boolean }>({});

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
        if (name === 'companyId') {
            setFormData((prev) => ({
                ...prev,
                companyId: value,
                clientName: '',
                clientEmail: '',
            }));
        } else if (name === 'clientName') {
            const selectedClient = clientAdmins.find((c) => c.name === value);
            setFormData((prev) => ({
                ...prev,
                clientName: value,
                clientEmail: selectedClient ? selectedClient.email : '',
            }));
        } else {
            setFormData((prev) => ({
                ...prev,
                [name]: value,
            }));
        }
    };
    // Fetch all clients on mount
    useEffect(() => {
        setClientsLoading(true);
        clientService.getAllClients()
            .then((clients) => {
                setAllClients(clients);
                setClientsLoading(false);
            })
            .catch(() => setClientsLoading(false));
    }, []);

    // Filter client admins when companyId changes
    useEffect(() => {
        if (!formData.companyId) {
            setClientAdmins([]);
            return;
        }
        const filtered = allClients.filter(
            (c) => String(c.companyId) === String(formData.companyId) && c.role === 'CLIENT_ADMIN'
        );
        setClientAdmins(filtered);
    }, [formData.companyId, allClients]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        // Validate required fields for initialization tab
        if (!formData.companyId || !formData.projectName || !formData.projectType || !formData.projectSize || !formData.clientName || !formData.clientEmail) {
            setError('Please fill in all required fields including client name and email');
            return;
        }
        // Validate client email format
        if (formData.clientEmail && !/^\S+@\S+\.\S+$/.test(formData.clientEmail)) {
            setError('Please enter a valid client email address');
            return;
        }
        // Validate Estimated Budget format
        if (formData.estimatedBudget && !/^\d+(\.\d{1,2})?$/.test(formData.estimatedBudget)) {
            setError('Estimated Budget must be a valid number (up to 2 decimal places)');
            return;
        }
        // Validate Total Budget format
        if (formData.totalBudget && !/^\d+(\.\d{1,2})?$/.test(formData.totalBudget)) {
            setError('Total Budget must be a valid number (up to 2 decimal places)');
            return;
        }
        // Validate Actual Start Date is earlier than Actual End Date
        if (formData.actualStartDate && formData.actualEndDate) {
            const start = new Date(formData.actualStartDate);
            const end = new Date(formData.actualEndDate);
            if (start > end) {
                setError('Actual Start Date must be earlier than Actual End Date');
                return;
            }
        }
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
            companyId: parseInt(formData.companyId),
            clientName: formData.clientName,
            clientEmail: formData.clientEmail,
        };
        setPendingProjectData(projectData);
        setShowQuotationConfirm(true);
    };

    // Called if user confirms quotation generation
    // After confirming quotation, show cost breakdown modal
    const handleConfirmQuotation = () => {
        setShowQuotationConfirm(false);
        setShowCostModal(true);
        setCostModalStep(0);
    };

    // Calculate total and advance
    const getTotalCost = () => {
        const dev = parseFloat(costInputs.development) || 0;
        const host = parseFloat(costInputs.hosting) || 0;
        const ssl = parseFloat(costInputs.ssl) || 0;
        const server = parseFloat(costInputs.server) || 0;
        return dev + host + ssl + server;
    };
    const getAdvance = () => {
        return (getTotalCost() * 0.25).toFixed(2);
    };

    // Handle cost input changes
    const handleCostInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        if (!/^\d*(\.\d{0,2})?$/.test(value)) return; // Only allow numbers and 2 decimals
        setCostInputs((prev) => ({ ...prev, [name]: value }));
    };

    // Step 1: Confirm cost breakdown, then fetch terms and go to step 2
    const handleCostModalNext = async () => {
        setCostError(null);
        if (!costInputs.development || !costInputs.hosting || !costInputs.ssl || !costInputs.server) {
            setCostError('Please fill in all cost fields.');
            return;
        }
        setTermsLoading(true);
        setTermsError(null);
        try {
            const termsList = await termsService.getTerms();
            // If the API returns a single object, wrap in array; if array, use as is
            const allTerms = Array.isArray(termsList) ? termsList : [termsList];
            const activeTerms = allTerms.filter((t: any) => t.isActive);
            setTerms(activeTerms);
            // Initialize checked state
            const checked: { [key: number]: boolean } = {};
            activeTerms.forEach((t: any) => { checked[t.tcId] = false; });
            setCheckedTerms(checked);
            setCostModalStep(1);
            if (activeTerms.length === 0) {
                setTermsError('No active terms and conditions found.');
            }
        } catch (err: any) {
            setTermsError('Failed to load terms and conditions. Please check your connection or try again later.');
            console.error('Error fetching terms and conditions:', err);
            setTerms([]);
            setCheckedTerms({});
            setCostModalStep(1); // Still show the step so user sees the error
        } finally {
            setTermsLoading(false);
        }
    };

    // Step 2: Finalize project creation with cost breakdown and selected terms
    const handleTermsModalConfirm = async () => {
        setCostError(null);
        // Require at least one term checked (or all, if needed)
        if (!Object.values(checkedTerms).some(Boolean)) {
            setCostError('Please agree to at least one term and condition.');
            return;
        }
        if (pendingProjectData) {
            setIsSubmitting(true);
            try {
                await addProjectMutation.mutateAsync({
                    ...pendingProjectData,
                    estimatedBudget: getTotalCost(),
                    costBreakdown: {
                        development: parseFloat(costInputs.development),
                        hosting: parseFloat(costInputs.hosting),
                        ssl: parseFloat(costInputs.ssl),
                        server: parseFloat(costInputs.server),
                        advance: parseFloat(getAdvance()),
                    },
                    agreedTerms: Object.entries(checkedTerms)
                        .filter(([_, checked]) => checked)
                        .map(([tcId]) => Number(tcId)),
                });
                setShowCostModal(false);
            } catch (err) {
                // Error handled in mutation
            } finally {
                setIsSubmitting(false);
                setPendingProjectData(null);
            }
        }
    };

    const handleCostModalCancel = () => {
        setShowCostModal(false);
        setPendingProjectData(null);
        setCostModalStep(0);
        setTerms([]);
        setCheckedTerms({});
    };

    // Checkbox handler for terms
    const handleTermCheck = (tcId: number) => {
        setCheckedTerms((prev) => ({ ...prev, [tcId]: !prev[tcId] }));
    };

    // If user cancels, just close the popup
    const handleCancelQuotation = () => {
        setShowQuotationConfirm(false);
        setPendingProjectData(null);
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
        <>
            {/* Quotation Confirmation Popup */}
            <FeedbackPopup
                isOpen={showQuotationConfirm}
                onClose={handleCancelQuotation}
                type="info"
                title="Generate Quotation?"
                confirmButtonText="Yes, Generate"
                onConfirm={handleConfirmQuotation}
            >
                Do you want to generate a quotation for this project?
            </FeedbackPopup>

            {/* Cost Breakdown & Terms Modal (Stepper) */}
            {showCostModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-8 max-w-lg w-full mx-6 shadow-xl relative">
                        <button
                            className="absolute top-4 right-4 text-black hover:text-black"
                            onClick={handleCostModalCancel}
                            disabled={isSubmitting}
                        >
                            <span className="sr-only">Close</span>
                            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                        {/* Stepper */}
                        <div className="flex items-center mb-6">
                            <div className={`flex-1 text-center ${costModalStep === 0 ? 'font-bold text-[#3450A3]' : 'text-gray-400'}`}>Cost Breakdown</div>
                            <div className="w-8 h-0.5 bg-gray-300 mx-2" />
                            <div className={`flex-1 text-center ${costModalStep === 1 ? 'font-bold text-[#3450A3]' : 'text-gray-400'}`}>Terms & Conditions</div>
                        </div>
                        {costModalStep === 0 && (
                            <>
                                <h2 className="text-2xl font-bold mb-2 text-black">Project Cost Breakdown & Advance Payment</h2>
                                <div className="mb-4 text-gray-700 text-sm">
                                    Please fill in the cost amounts for each item below. The system will calculate the <b>Total Project Cost</b> and the <b>Advance Payment (25%)</b> automatically.
                                </div>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-black mb-1">Development Cost</label>
                                        <div className="text-xs text-gray-500 mb-1">UI/UX design, frontend & backend development</div>
                                        <input
                                            type="text"
                                            name="development"
                                            value={costInputs.development}
                                            onChange={handleCostInputChange}
                                            className="w-full px-3 py-2 text-black border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#3450A3] focus:border-[#3450A3]"
                                            placeholder="Rs."
                                            disabled={isSubmitting}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-black mb-1">Hosting & Domain (1 Year)</label>
                                        <div className="text-xs text-gray-500 mb-1">.com domain + 10GB SSD hosting</div>
                                        <input
                                            type="text"
                                            name="hosting"
                                            value={costInputs.hosting}
                                            onChange={handleCostInputChange}
                                            className="w-full px-3 py-2 text-black border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#3450A3] focus:border-[#3450A3]"
                                            placeholder="Rs."
                                            disabled={isSubmitting}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-black mb-1">SSL Certificate</label>
                                        <div className="text-xs text-gray-500 mb-1">Standard 256-bit SSL for 1 year</div>
                                        <input
                                            type="text"
                                            name="ssl"
                                            value={costInputs.ssl}
                                            onChange={handleCostInputChange}
                                            className="w-full px-3 py-2 text-black border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#3450A3] focus:border-[#3450A3]"
                                            placeholder="Rs."
                                            disabled={isSubmitting}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-black mb-1">Server Setup & Final Delivery</label>
                                        <div className="text-xs text-gray-500 mb-1">Server configuration, deployment, and final handover</div>
                                        <input
                                            type="text"
                                            name="server"
                                            value={costInputs.server}
                                            onChange={handleCostInputChange}
                                            className="w-full px-3 py-2 text-black border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#3450A3] focus:border-[#3450A3]"
                                            placeholder="Rs."
                                            disabled={isSubmitting}
                                        />
                                    </div>
                                </div>
                                <div className="mt-6 border-t pt-4 space-y-2">
                                    <div className="flex justify-between text-base font-semibold">
                                        <span className='text-black'>Total Project Cost</span>
                                        <span className='text-black'>Rs. {getTotalCost().toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                                    </div>
                                    <div className="flex justify-between text-base">
                                        <span className='text-black'>Advance Payment (25%)</span>
                                        <span className='text-black'>Rs. {getAdvance()}</span>
                                    </div>
                                </div>
                                <div className="mt-6 text-sm text-black">
                                    <div>Deployment & Handover: Required before project kickoff</div>
                                    <div>UI/UX Design, Frontend & Backend Dev</div>
                                    <div>.com domain + 10GB SSD Hosting</div>
                                    <div>Standard 256-bit SSL (1 Year)</div>
                                    <div>Server setup & final delivery</div>
                                </div>
                                {costError && <div className="mt-4 text-red-600">{costError}</div>}
                                <div className="flex justify-end space-x-3 mt-8">
                                    <button
                                        type="button"
                                        onClick={handleCostModalCancel}
                                        disabled={isSubmitting}
                                        className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >Cancel</button>
                                    <button
                                        type="button"
                                        onClick={handleCostModalNext}
                                        disabled={isSubmitting}
                                        className="px-4 py-2 bg-[#3450A3] text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >Next</button>
                                </div>
                            </>
                        )}
                        {costModalStep === 1 && (
                            <>
                                <h2 className="text-2xl font-bold mb-2 text-black">Terms & Conditions</h2>
                                <div className="mb-4 text-gray-700 text-sm">Please review and agree to the terms and conditions before sending the quotation.</div>
                                {termsLoading ? (
                                    <div className="text-gray-500">Loading terms and conditions...</div>
                                ) : termsError ? (
                                    <div className="text-red-600">{termsError}</div>
                                ) : (
                                    <div className="max-h-60 overflow-y-auto space-y-4 mb-4">
                                        {terms.map((term) => (
                                            <div key={term.tcId} className="flex items-start gap-2 border-b pb-2">
                                                <input
                                                    type="checkbox"
                                                    id={`term-${term.tcId}`}
                                                    checked={checkedTerms[term.tcId] || false}
                                                    onChange={() => handleTermCheck(term.tcId)}
                                                    className="mt-1"
                                                    disabled={isSubmitting}
                                                />
                                                <label htmlFor={`term-${term.tcId}`} className="text-black text-sm" style={{flex:1}}>
                                                    <span dangerouslySetInnerHTML={{ __html: term.content }} />
                                                </label>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                {costError && <div className="mt-2 text-red-600">{costError}</div>}
                                <div className="flex justify-between mt-8">
                                    <button
                                        onClick={() => setCostModalStep(0)}
                                        disabled={isSubmitting}
                                        className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >Back</button>
                                    <button
                                        onClick={handleTermsModalConfirm}
                                        disabled={isSubmitting}
                                        className="px-4 py-2 bg-[#3450A3] text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >{isSubmitting ? 'Adding...' : 'Confirm & Add Project'}</button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}

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
                                    {/* Company Name */}
                                    <div>
                                        <label htmlFor="companyId" className="block text-sm font-medium text-gray-700 mb-2">Company Name *</label>
                                        {companiesLoading ? (
                                            <div className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-gray-500">Loading companies...</div>
                                        ) : companiesError ? (
                                            <div className="w-full px-3 py-2 border border-red-300 rounded-md shadow-sm text-red-700">Error loading companies</div>
                                        ) : (
                                            <select id="companyId" name="companyId" value={formData.companyId} onChange={handleChange} className="text-black w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#3450A3] focus:border-[#3450A3]" required>
                                                <option value="">Select Company</option>
                                                {companies.map((company) => (
                                                    <option key={company.companyId} value={company.companyId}>{company.companyName}</option>
                                                ))}
                                            </select>
                                        )}
                                    </div>
                                    {/* Project Name */}
                                    <div>
                                        <label htmlFor="projectName" className="block text-sm font-medium text-gray-700 mb-2">Project Name *</label>
                                        <input type="text" id="projectName" name="projectName" value={formData.projectName} onChange={handleChange} className="text-black w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#3450A3] focus:border-[#3450A3]" placeholder="Enter project name" required />
                                    </div>
                                    {/* Project Type */}
                                    <div>
                                        <label htmlFor="projectType" className="block text-sm font-medium text-gray-700 mb-2">Project Type *</label>
                                        <select id="projectType" name="projectType" value={formData.projectType} onChange={handleChange} className="text-black w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#3450A3] focus:border-[#3450A3]" required>
                                            <option value="">Select Project Type</option>
                                            <option value="web">Web Development</option>
                                            <option value="mobile">Mobile Development</option>
                                            <option value="desktop">Desktop Application</option>
                                        </select>
                                    </div>
                                    {/* Project Size */}
                                    <div>
                                        <label htmlFor="projectSize" className="block text-sm font-medium text-gray-700 mb-2">Project Size *</label>
                                        <select id="projectSize" name="projectSize" value={formData.projectSize} onChange={handleChange} className="text-black w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#3450A3] focus:border-[#3450A3]" required>
                                            <option value="">Select Project Size</option>
                                            <option value="small">Small</option>
                                            <option value="medium">Medium</option>
                                            <option value="large">Large</option>
                                        </select>
                                    </div>
                                    {/* Creation Date */}
                                    <div>
                                        <label htmlFor="creationDate" className="block text-sm font-medium text-gray-700 mb-2">Creation Date</label>
                                        <input type="date" id="creationDate" name="creationDate" value={formData.creationDate} onChange={handleChange} className="text-black w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#3450A3] focus:border-[#3450A3]" />
                                    </div>
                                    {/* Estimated Budget */}
                                    <div>
                                        <label htmlFor="estimatedBudget" className="block text-sm font-medium text-gray-700 mb-2">Estimated Budget</label>
                                        <input type="text" id="estimatedBudget" name="estimatedBudget" value={formData.estimatedBudget} onChange={handleChange} className="text-black w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#3450A3] focus:border-[#3450A3]" placeholder="Enter estimated budget" />
                                    </div>
                                    {/* Project Description */}
                                <div>
                                    <label htmlFor="projectDescription" className="block text-sm font-medium text-gray-700 mb-2">Project Description</label>
                                    <textarea id="projectDescription" name="projectDescription" value={formData.projectDescription} onChange={handleChange} rows={3} className="text-black w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#3450A3] focus:border-[#3450A3]" placeholder="Enter project description" />
                                </div>
                                {/* Client Name Dropdown */}
                                <div>
                                    <label htmlFor="clientName" className="block text-sm font-medium text-gray-700 mb-2">Client Name *</label>
                                    <select
                                        id="clientName"
                                        name="clientName"
                                        value={formData.clientName}
                                        onChange={handleChange}
                                        className="text-black w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#3450A3] focus:border-[#3450A3]"
                                        required
                                        disabled={!formData.companyId || clientsLoading || clientAdmins.length === 0}
                                    >
                                        <option value="">Select Client Admin</option>
                                        {clientAdmins.map((client) => (
                                            <option key={client.id} value={client.name}>{client.name}</option>
                                        ))}
                                    </select>
                                </div>
                                {/* Client Email (auto-filled) */}
                                <div>
                                    <label htmlFor="clientEmail" className="block text-sm font-medium text-gray-700 mb-2">Client Email *</label>
                                    <input
                                        type="email"
                                        id="clientEmail"
                                        name="clientEmail"
                                        value={formData.clientEmail}
                                        readOnly
                                        className="text-black w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#3450A3] focus:border-[#3450A3] bg-gray-100"
                                        placeholder="Client email will be auto-filled"
                                        required
                                    />
                                </div>
                                {/* Form Actions */}
                                <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                                    <button type="button" onClick={handleCancel} className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500">Cancel</button>
                                    <button type="button" onClick={handleNext} className="px-6 py-2 bg-[#3450A3] text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#3450A3] flex items-center gap-2">Next<ArrowRight className="h-4 w-4" /></button>
                                </div>
                            </div>
                        )}
                        {activeTab === 1 && (
                            <div className="space-y-6">
                                {/* Actual Start Date */}
                                <div>
                                    <label htmlFor="actualStartDate" className="block text-sm font-medium text-gray-700 mb-2">Actual Start Date</label>
                                    <input type="date" id="actualStartDate" name="actualStartDate" value={formData.actualStartDate} onChange={handleChange} className="text-black w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#3450A3] focus:border-[#3450A3]" />
                                </div>
                                {/* Actual End Date */}
                                <div>
                                    <label htmlFor="actualEndDate" className="block text-sm font-medium text-gray-700 mb-2">Actual End Date</label>
                                    <input type="date" id="actualEndDate" name="actualEndDate" value={formData.actualEndDate} onChange={handleChange} className="text-black w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#3450A3] focus:border-[#3450A3]" />
                                </div>
                                {/* Total Budget */}
                                <div>
                                    <label htmlFor="totalBudget" className="block text-sm font-medium text-gray-700 mb-2">Total Budget</label>
                                    <input type="text" id="totalBudget" name="totalBudget" value={formData.totalBudget} onChange={handleChange} className="text-black w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#3450A3] focus:border-[#3450A3]" placeholder="Enter total budget" />
                                </div>
                                {/* Payment Type */}
                                <div>
                                    <label htmlFor="paymentType" className="block text-sm font-medium text-gray-700 mb-2">Payment Type</label>
                                    <select id="paymentType" name="paymentType" value={formData.paymentType} onChange={handleChange} className="text-black w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#3450A3] focus:border-[#3450A3]">
                                        <option value="">Select Payment Type</option>
                                        <option value="fixed">Fixed</option>
                                        <option value="hourly">Hourly</option>
                                        <option value="milestone">Milestone</option>
                                    </select>
                                </div>
                                {/* Payment Status */}
                                <div>
                                    <label htmlFor="paymentStatus" className="block text-sm font-medium text-gray-700 mb-2">Payment Status</label>
                                    <select id="paymentStatus" name="paymentStatus" value={formData.paymentStatus} onChange={handleChange} className="text-black w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#3450A3] focus:border-[#3450A3]">
                                        <option value="">Select Payment Status</option>
                                        <option value="pending">Pending</option>
                                        <option value="partial">Partial</option>
                                        <option value="paid">Paid</option>
                                    </select>
                                </div>
                                {/* Status */}
                                <div>
                                    <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">Project Status</label>
                                    <select id="status" name="status" value={formData.status} onChange={handleChange} className="text-black w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#3450A3] focus:border-[#3450A3]">
                                        <option value="Active">Active</option>
                                        <option value="Inactive">Inactive</option>
                                        <option value="Completed">Completed</option>
                                        <option value="On Hold">On Hold</option>
                                    </select>
                                </div>
                                {/* Form Actions */}
                                <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                                    <button type="button" onClick={() => setActiveTab(0)} className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 flex items-center gap-2"><ArrowLeft className="h-4 w-4" />Back</button>
                                    <button type="submit" disabled={isSubmitting} className="px-6 py-2 bg-[#3450A3] text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#3450A3] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">{isSubmitting ? 'Adding...' : 'Add Project'}</button>
                                </div>
                            </div>
                        )}
                    </form>
                </div>
            </div>
        </div>
    </>);
}
