'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { companyService } from '@/app/lib/services/companyService';
import { projectService, Project } from '@/app/lib/services/projectService';
import { requirementService } from '@/app/lib/services/requirementService';
import { bugService } from '@/app/lib/services/bugService';
import { paymentService } from '@/app/lib/services/paymentService';
import { useProject } from '@/app/contexts/ProjectContext';
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
    Briefcase,
    FileText,
    Bug,
    CreditCard,
    ArrowRight
} from 'lucide-react';
import { useAuth } from "@/app/contexts/AuthContext";
import { CLIENT_ADMIN, CLIENT_USER } from "@/app/lib/constants";

interface ProjectDetailsProps {
    params: {
        projectId: string;
    };
}

export default function ProjectDetails({ params }: ProjectDetailsProps) {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState(0);
    const { projectId } = params;
    const { selectedProject, projectCache, setSelectedProject, addToProjectCache } = useProject();
    const { user } = useAuth();

    const userRole = user?.role;

    // Try to get project from context first, then fetch if needed
    const cachedProject = projectCache[projectId] || selectedProject;
    
    // Fetch project details - only if not in cache
    const { data: project, isLoading: projectLoading, error: projectError } = useQuery<Project, Error>({
        queryKey: ['project', projectId],
        queryFn: () => projectService.getProjectById(parseInt(projectId)),
        enabled: !!projectId && projectId !== 'undefined' && !cachedProject,
    });

    // Cache the project data when it's fetched
    useEffect(() => {
        if (project && !cachedProject) {
            setSelectedProject(project);
            addToProjectCache(projectId, project);
        }
    }, [project, cachedProject, setSelectedProject, addToProjectCache, projectId]);

    // Use cached project if available, otherwise use fetched project
    const currentProject = cachedProject || project;

    // Fetch company details if project has companyId
    const { data: company, isLoading: companyLoading } = useQuery<Company, Error>({
        queryKey: ['company', currentProject?.companyId],
        queryFn: () => companyService.getCompanyById(currentProject!.companyId!),
        enabled: !!currentProject?.companyId,
    });

    // Fetch project-specific requirements
    const { data: requirements = [] } = useQuery({
        queryKey: ['requirements', 'project', projectId],
        queryFn: () => requirementService.getRequirementsByProject(parseInt(projectId)),
        enabled: !!projectId && projectId !== 'undefined',
    });

    // Fetch project-specific bugs
    const { data: bugs = [] } = useQuery({
        queryKey: ['bugs', 'project', projectId],
        queryFn: () => bugService.getBugsByProject(parseInt(projectId)),
        enabled: !!projectId && projectId !== 'undefined',
    });

    // Fetch project-specific payments
    const { data: payments = [] } = useQuery({
        queryKey: ['payments', 'project', projectId],
        queryFn: () => paymentService.getPaymentsByProject(parseInt(projectId)),
        enabled: !!projectId && projectId !== 'undefined',
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

    if (projectLoading && !currentProject) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <Activity className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
                    <p className="text-gray-600">Loading project details...</p>
                </div>
            </div>
        );
    }

    if (projectError || !currentProject) {
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
        { id: 0, name: 'Overview', icon: FolderPlus, allowedRoles: [CLIENT_ADMIN, CLIENT_USER] },
        { id: 1, name: 'Details', icon: Briefcase, allowedRoles: [CLIENT_ADMIN, CLIENT_USER] },
        { id: 2, name: 'Financial', icon: DollarSign, allowedRoles: [CLIENT_ADMIN] }
    ];

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <button
                            onClick={() => router.push('/client/dashboard')}
                            className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                        >
                            <ArrowLeft className="h-5 w-5 text-gray-600" />
                        </button>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">{currentProject.projectName}</h1>
                            <p className="text-gray-600 mt-1">Project Details</p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-3 mr-48">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(currentProject.status)}`}>
                            {currentProject.status}
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
                            const isAllowed = tab.allowedRoles.includes(userRole!);
                            return (isAllowed &&
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

            {/* Action Cards for Navigation */}
            <div className="max-w-6xl mx-auto mb-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <button
                        onClick={() => router.push(`/client/requirements?projectId=${projectId}`)}
                        className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow group"
                    >
                        <div className="flex items-center space-x-3">
                            <FileText className="h-6 w-6 text-blue-600 group-hover:text-blue-700" />
                            <div className="text-left">
                                <p className="font-medium text-gray-900">Requirements</p>
                                <p className="text-sm text-gray-500">View project requirements</p>
                            </div>
                            <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-blue-600" />
                        </div>
                    </button>
                    
                    <button
                        onClick={() => router.push(`/client/bugs?projectId=${projectId}`)}
                        className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow group"
                    >
                        <div className="flex items-center space-x-3">
                            <Bug className="h-6 w-6 text-red-600 group-hover:text-red-700" />
                            <div className="text-left">
                                <p className="font-medium text-gray-900">Bug Reports</p>
                                <p className="text-sm text-gray-500">Track project issues</p>
                            </div>
                            <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-red-600" />
                        </div>
                    </button>

                    {userRole == CLIENT_ADMIN && <button
                        onClick={() => router.push(`/client/payments?projectId=${projectId}`)}
                        className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow group"
                    >
                        <div className="flex items-center space-x-3">
                            <CreditCard className="h-6 w-6 text-purple-600 group-hover:text-purple-700"/>
                            <div className="text-left">
                                <p className="font-medium text-gray-900">Payments</p>
                                <p className="text-sm text-gray-500">Payment history</p>
                            </div>
                            <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-purple-600"/>
                        </div>
                    </button>}
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
                                                <p className="text-gray-900">{currentProject.projectType}</p>
                                            </div>
                                        </div>
                                        
                                        <div className="flex items-start space-x-3">
                                            <Activity className="h-5 w-5 text-gray-400 mt-0.5" />
                                            <div>
                                                <p className="text-sm font-medium text-gray-500">Project Size</p>
                                                <p className="text-gray-900">{currentProject.projectSize}</p>
                                            </div>
                                        </div>
                                        
                                        <div className="flex items-start space-x-3">
                                            <Calendar className="h-5 w-5 text-gray-400 mt-0.5" />
                                            <div>
                                                <p className="text-sm font-medium text-gray-500">Creation Date</p>
                                                <p className="text-gray-900">{formatDate(currentProject.creationDate)}</p>
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
                                            {currentProject.projectDescription || 'No description provided.'}
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
                                                {formatDate(currentProject.actualStartDate)}
                                            </p>
                                        </div>
                                        
                                        <div className="bg-gray-50 p-4 rounded-lg">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-sm font-medium text-gray-500">End Date</span>
                                                <Calendar className="h-4 w-4 text-gray-400" />
                                            </div>
                                            <p className="text-gray-900 font-medium">
                                                {formatDate(currentProject.actualEndDate)}
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
                                            <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(currentProject.status)}`}>
                                                {currentProject.status}
                                            </span>
                                        </div>
                                        
                                        <div className="bg-gray-50 p-4 rounded-lg">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-sm font-medium text-gray-500">Active</span>
                                            </div>
                                            <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${
                                                currentProject.isActive ? 'text-green-600 bg-green-100' : 'text-red-600 bg-red-100'
                                            }`}>
                                                {currentProject.isActive ? 'Active' : 'Inactive'}
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
                                                {formatCurrency(currentProject.estimatedBudget)}
                                            </p>
                                        </div>
                                        
                                        <div className="bg-gray-50 p-4 rounded-lg">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-sm font-medium text-gray-500">Total Budget</span>
                                                <DollarSign className="h-4 w-4 text-gray-400" />
                                            </div>
                                            <p className="text-2xl font-bold text-gray-900">
                                                {formatCurrency(currentProject.totalBudget)}
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
                                                {currentProject.paymentType || 'Not specified'}
                                            </p>
                                        </div>
                                        
                                        <div className="bg-gray-50 p-4 rounded-lg">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-sm font-medium text-gray-500">Payment Status</span>
                                            </div>
                                            <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${getPaymentStatusColor(currentProject.paymentStatus)}`}>
                                                {currentProject.paymentStatus || 'Unknown'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Requirements Tab */}
                    {activeTab === 3 && (
                        <div className="p-6">
                            <div className="space-y-6">
                                <div className="border-b border-gray-200 pb-4">
                                    <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                                        <FileText className="h-5 w-5 text-blue-600 mr-2" />
                                        Project Requirements
                                    </h3>
                                </div>
                                
                                {requirements.length === 0 ? (
                                    <div className="text-center py-8">
                                        <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                        <h3 className="text-lg font-medium text-gray-900 mb-2">No requirements found</h3>
                                        <p className="text-gray-600 mb-4">This project doesn&apos;t have any requirements yet.</p>
                                        <button
                                            onClick={() => router.push(`/client/requirements?projectId=${projectId}`)}
                                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                                        >
                                            View All Requirements
                                        </button>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {requirements.slice(0, 5).map((req: any) => (
                                            <div key={req.requirementId} className="bg-gray-50 p-4 rounded-lg">
                                                <div className="flex items-start justify-between">
                                                    <div>
                                                        <h4 className="font-medium text-gray-900">{req.requirementTitle}</h4>
                                                        <p className="text-sm text-gray-600 mt-1">{req.requirementDescription}</p>
                                                        <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium mt-2 ${
                                                            req.priority === 'High' ? 'bg-red-100 text-red-800' :
                                                            req.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                                                            'bg-green-100 text-green-800'
                                                        }`}>
                                                            {req.priority} Priority
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                        {requirements.length > 5 && (
                                            <div className="text-center pt-4">
                                                <button
                                                    onClick={() => router.push(`/client/requirements?projectId=${projectId}`)}
                                                    className="text-blue-600 hover:text-blue-800 font-medium"
                                                >
                                                    View all {requirements.length} requirements
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Bugs Tab */}
                    {activeTab === 4 && (
                        <div className="p-6">
                            <div className="space-y-6">
                                <div className="border-b border-gray-200 pb-4">
                                    <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                                        <Bug className="h-5 w-5 text-red-600 mr-2" />
                                        Bug Reports
                                    </h3>
                                </div>
                                
                                {bugs.length === 0 ? (
                                    <div className="text-center py-8">
                                        <Bug className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                        <h3 className="text-lg font-medium text-gray-900 mb-2">No bugs reported</h3>
                                        <p className="text-gray-600 mb-4">No bugs have been reported for this project yet.</p>
                                        <button
                                            onClick={() => router.push(`/client/bugs?projectId=${projectId}`)}
                                            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
                                        >
                                            View All Bug Reports
                                        </button>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {bugs.slice(0, 5).map((bug: any) => (
                                            <div key={bug.bugId} className="bg-gray-50 p-4 rounded-lg">
                                                <div className="flex items-start justify-between">
                                                    <div>
                                                        <h4 className="font-medium text-gray-900">{bug.bugTitle}</h4>
                                                        <p className="text-sm text-gray-600 mt-1">{bug.bugDescription}</p>
                                                        <div className="flex items-center space-x-2 mt-2">
                                                            <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                                                                bug.severity === 'High' ? 'bg-red-100 text-red-800' :
                                                                bug.severity === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                                                                'bg-green-100 text-green-800'
                                                            }`}>
                                                                {bug.severity} Severity
                                                            </span>
                                                            <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                                                                bug.isActive ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                                                            }`}>
                                                                {bug.isActive ? 'Open' : 'Closed'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                        {bugs.length > 5 && (
                                            <div className="text-center pt-4">
                                                <button
                                                    onClick={() => router.push(`/client/bugs?projectId=${projectId}`)}
                                                    className="text-red-600 hover:text-red-800 font-medium"
                                                >
                                                    View all {bugs.length} bug reports
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Payments Tab */}
                    {activeTab === 5 && (
                        <div className="p-6">
                            <div className="space-y-6">
                                <div className="border-b border-gray-200 pb-4">
                                    <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                                        <CreditCard className="h-5 w-5 text-green-600 mr-2" />
                                        Payment History
                                    </h3>
                                </div>
                                
                                {payments.length === 0 ? (
                                    <div className="text-center py-8">
                                        <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                        <h3 className="text-lg font-medium text-gray-900 mb-2">No payments found</h3>
                                        <p className="text-gray-600 mb-4">No payments have been made for this project yet.</p>
                                        <button
                                            onClick={() => router.push(`/client/payments?projectId=${projectId}`)}
                                            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
                                        >
                                            View All Payments
                                        </button>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                                            <div className="bg-green-50 p-4 rounded-lg">
                                                <p className="text-sm font-medium text-gray-600">Total Payments</p>
                                                <p className="text-2xl font-bold text-green-600">{payments.length}</p>
                                            </div>
                                            <div className="bg-blue-50 p-4 rounded-lg">
                                                <p className="text-sm font-medium text-gray-600">Total Amount</p>
                                                <p className="text-2xl font-bold text-blue-600">
                                                    ${payments.reduce((sum: number, payment: any) => sum + parseFloat(payment.paymentAmount || '0'), 0).toLocaleString()}
                                                </p>
                                            </div>
                                            <div className="bg-purple-50 p-4 rounded-lg">
                                                <p className="text-sm font-medium text-gray-600">Active Payments</p>
                                                <p className="text-2xl font-bold text-purple-600">
                                                    {payments.filter((payment: any) => payment.isActive).length}
                                                </p>
                                            </div>
                                        </div>
                                        
                                        {payments.slice(0, 5).map((payment: any) => (
                                            <div key={payment.paymentId} className="bg-gray-50 p-4 rounded-lg">
                                                <div className="flex items-start justify-between">
                                                    <div>
                                                        <h4 className="font-medium text-gray-900">Payment #{payment.paymentId}</h4>
                                                        <p className="text-sm text-gray-600 mt-1">{payment.paymentDescription}</p>
                                                        <div className="flex items-center space-x-2 mt-2">
                                                            <span className="inline-flex px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                                {payment.paymentType}
                                                            </span>
                                                            <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                                                                payment.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                                            }`}>
                                                                {payment.isActive ? 'Active' : 'Inactive'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="font-bold text-green-600">${parseFloat(payment.paymentAmount || '0').toLocaleString()}</p>
                                                        <p className="text-sm text-gray-500">{new Date(payment.paymentDate).toLocaleDateString()}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                        {payments.length > 5 && (
                                            <div className="text-center pt-4">
                                                <button
                                                    onClick={() => router.push(`/client/payments?projectId=${projectId}`)}
                                                    className="text-green-600 hover:text-green-800 font-medium"
                                                >
                                                    View all {payments.length} payments
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
