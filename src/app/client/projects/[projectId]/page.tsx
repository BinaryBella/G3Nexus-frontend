'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { companyService } from '@/app/lib/services/companyService';
import { projectService, Project } from '@/app/lib/services/projectService';
import { Company } from '@/app/lib/types';
import { 
    FolderPlus, 
    ArrowLeft, 
    Calendar, 
    DollarSign, 
    Building2, 
    Clock, 
    CheckCircle,
    AlertCircle,
    Activity,
    Briefcase
} from 'lucide-react';

interface ProjectDetailsProps {
    params: {
        projectId: string;
    };
}

export default function ProjectDetails({ params }: ProjectDetailsProps) {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState(0);
    const { projectId } = params;

    // Fetch project details
    const { data: project, isLoading: projectLoading, error: projectError } = useQuery<Project, Error>({
        queryKey: ['project', projectId],
        queryFn: () => projectService.getProjectById(parseInt(projectId)),
        enabled: !!projectId && projectId !== 'undefined',
    });

    // Fetch company details if project has companyId
    const { data: company, isLoading: companyLoading } = useQuery<Company, Error>({
        queryKey: ['company', project?.companyId],
        queryFn: () => companyService.getCompanyById(project!.companyId!),
        enabled: !!project?.companyId,
    });

    const getStatusColor = (status: string) => {
        switch (status?.toLowerCase()) {
            case 'active':
                return 'text-green-600 bg-green-100';
            case 'completed':
                return 'text-blue-600 bg-blue-100';
            case 'on hold':
                return 'text-yellow-600 bg-yellow-100';
            case 'cancelled':
                return 'text-red-600 bg-red-100';
            default:
                return 'text-gray-600 bg-gray-100';
        }
    };

    const getPaymentStatusColor = (status: string) => {
        switch (status?.toLowerCase()) {
            case 'paid':
                return 'text-green-600 bg-green-100';
            case 'pending':
                return 'text-yellow-600 bg-yellow-100';
            case 'overdue':
                return 'text-red-600 bg-red-100';
            default:
                return 'text-gray-600 bg-gray-100';
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return 'Not set';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    if (projectLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <Activity className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
                    <p className="text-gray-600">Loading project details...</p>
                </div>
            </div>
        );
    }

    if (projectError || !project) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">Project Not Found</h2>
                    <p className="text-gray-600 mb-4">
                        {projectError?.message || 'The requested project could not be found.'}
                    </p>
                    <button
                        onClick={() => router.push('/client/projects')}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Back to Projects
                    </button>
                </div>
            </div>
        );
    }

    const tabs = [
        { id: 0, name: 'Overview', icon: FolderPlus },
        { id: 1, name: 'Details', icon: Briefcase },
        { id: 2, name: 'Financial', icon: DollarSign }
    ];

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <button
                            onClick={() => router.push('/client/projects')}
                            className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                        >
                            <ArrowLeft className="h-5 w-5 text-gray-600" />
                        </button>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">{project.projectName}</h1>
                            <p className="text-gray-600 mt-1">Project Details</p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-3">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(project.status)}`}>
                            {project.status}
                        </span>
                    </div>
                </div>
            </div>

            {/* Tab Navigation */}
            <div className="max-w-6xl mx-auto mb-6">
                <div className="border-b border-gray-200">
                    <nav className="-mb-px flex space-x-8">
                        {tabs.map((tab) => {
                            const Icon = tab.icon;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                                        activeTab === tab.id
                                            ? 'border-blue-500 text-blue-600'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                                >
                                    <Icon className="h-4 w-4" />
                                    <span>{tab.name}</span>
                                </button>
                            );
                        })}
                    </nav>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-6xl mx-auto">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                    {/* Overview Tab */}
                    {activeTab === 0 && (
                        <div className="p-6">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                {/* Project Info Card */}
                                <div className="space-y-6">
                                    <div className="border-b border-gray-200 pb-4">
                                        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                                            <FolderPlus className="h-5 w-5 text-blue-600 mr-2" />
                                            Project Information
                                        </h3>
                                    </div>
                                    
                                    <div className="space-y-4">
                                        <div className="flex items-start space-x-3">
                                            <Briefcase className="h-5 w-5 text-gray-400 mt-0.5" />
                                            <div>
                                                <p className="text-sm font-medium text-gray-500">Project Type</p>
                                                <p className="text-gray-900">{project.projectType}</p>
                                            </div>
                                        </div>
                                        
                                        <div className="flex items-start space-x-3">
                                            <Activity className="h-5 w-5 text-gray-400 mt-0.5" />
                                            <div>
                                                <p className="text-sm font-medium text-gray-500">Project Size</p>
                                                <p className="text-gray-900">{project.projectSize}</p>
                                            </div>
                                        </div>
                                        
                                        <div className="flex items-start space-x-3">
                                            <Calendar className="h-5 w-5 text-gray-400 mt-0.5" />
                                            <div>
                                                <p className="text-sm font-medium text-gray-500">Creation Date</p>
                                                <p className="text-gray-900">{formatDate(project.creationDate)}</p>
                                            </div>
                                        </div>
                                        
                                        {company && (
                                            <div className="flex items-start space-x-3">
                                                <Building2 className="h-5 w-5 text-gray-400 mt-0.5" />
                                                <div>
                                                    <p className="text-sm font-medium text-gray-500">Company</p>
                                                    <p className="text-gray-900">{company.companyName}</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Description Card */}
                                <div className="space-y-6">
                                    <div className="border-b border-gray-200 pb-4">
                                        <h3 className="text-lg font-semibold text-gray-900">Description</h3>
                                    </div>
                                    
                                    <div className="prose prose-sm max-w-none">
                                        <p className="text-gray-700 leading-relaxed">
                                            {project.projectDescription || 'No description provided.'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Details Tab */}
                    {activeTab === 1 && (
                        <div className="p-6">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                {/* Timeline Card */}
                                <div className="space-y-6">
                                    <div className="border-b border-gray-200 pb-4">
                                        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                                            <Clock className="h-5 w-5 text-blue-600 mr-2" />
                                            Project Timeline
                                        </h3>
                                    </div>
                                    
                                    <div className="space-y-4">
                                        <div className="bg-gray-50 p-4 rounded-lg">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-sm font-medium text-gray-500">Start Date</span>
                                                <Calendar className="h-4 w-4 text-gray-400" />
                                            </div>
                                            <p className="text-gray-900 font-medium">
                                                {formatDate(project.actualStartDate)}
                                            </p>
                                        </div>
                                        
                                        <div className="bg-gray-50 p-4 rounded-lg">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-sm font-medium text-gray-500">End Date</span>
                                                <Calendar className="h-4 w-4 text-gray-400" />
                                            </div>
                                            <p className="text-gray-900 font-medium">
                                                {formatDate(project.actualEndDate)}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Status Card */}
                                <div className="space-y-6">
                                    <div className="border-b border-gray-200 pb-4">
                                        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                                            <CheckCircle className="h-5 w-5 text-blue-600 mr-2" />
                                            Project Status
                                        </h3>
                                    </div>
                                    
                                    <div className="space-y-4">
                                        <div className="bg-gray-50 p-4 rounded-lg">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-sm font-medium text-gray-500">Current Status</span>
                                            </div>
                                            <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(project.status)}`}>
                                                {project.status}
                                            </span>
                                        </div>
                                        
                                        <div className="bg-gray-50 p-4 rounded-lg">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-sm font-medium text-gray-500">Active</span>
                                            </div>
                                            <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${
                                                project.isActive ? 'text-green-600 bg-green-100' : 'text-red-600 bg-red-100'
                                            }`}>
                                                {project.isActive ? 'Active' : 'Inactive'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Financial Tab */}
                    {activeTab === 2 && (
                        <div className="p-6">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                {/* Budget Card */}
                                <div className="space-y-6">
                                    <div className="border-b border-gray-200 pb-4">
                                        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                                            <DollarSign className="h-5 w-5 text-blue-600 mr-2" />
                                            Budget Information
                                        </h3>
                                    </div>
                                    
                                    <div className="space-y-4">
                                        <div className="bg-gray-50 p-4 rounded-lg">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-sm font-medium text-gray-500">Estimated Budget</span>
                                                <DollarSign className="h-4 w-4 text-gray-400" />
                                            </div>
                                            <p className="text-2xl font-bold text-gray-900">
                                                {formatCurrency(project.estimatedBudget)}
                                            </p>
                                        </div>
                                        
                                        <div className="bg-gray-50 p-4 rounded-lg">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-sm font-medium text-gray-500">Total Budget</span>
                                                <DollarSign className="h-4 w-4 text-gray-400" />
                                            </div>
                                            <p className="text-2xl font-bold text-gray-900">
                                                {formatCurrency(project.totalBudget)}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Payment Card */}
                                <div className="space-y-6">
                                    <div className="border-b border-gray-200 pb-4">
                                        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                                            <CheckCircle className="h-5 w-5 text-blue-600 mr-2" />
                                            Payment Information
                                        </h3>
                                    </div>
                                    
                                    <div className="space-y-4">
                                        <div className="bg-gray-50 p-4 rounded-lg">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-sm font-medium text-gray-500">Payment Type</span>
                                            </div>
                                            <p className="text-gray-900 font-medium">
                                                {project.paymentType || 'Not specified'}
                                            </p>
                                        </div>
                                        
                                        <div className="bg-gray-50 p-4 rounded-lg">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-sm font-medium text-gray-500">Payment Status</span>
                                            </div>
                                            <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${getPaymentStatusColor(project.paymentStatus)}`}>
                                                {project.paymentStatus || 'Unknown'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}