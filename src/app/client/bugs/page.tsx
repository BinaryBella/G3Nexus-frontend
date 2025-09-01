"use client";

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { FileText, Search, Clock, CheckCircle, AlertTriangle, Eye, X, Download } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { bugService } from '@/app/lib/services/bugService';
import { projectService, Project } from '@/app/lib/services/projectService';
import { clientService } from '@/app/lib/services/clientService';
import { Bug, BugListItem, Client } from '../../lib/types';
import { useAuth } from '@/app/contexts/AuthContext';
import { BugStatusBadge } from '@/app/components/BugStatusDropdown';
import { normalizeStatus } from '@/app/lib/utils/statusUtils';

const SeverityBadge = ({ severity }: { severity: string }) => {
    const colorMap: Record<string, string> = {
        Low: "bg-green-100 text-green-800 border-green-200",
        Medium: "bg-yellow-100 text-yellow-800 border-yellow-200",
        High: "bg-red-100 text-red-800 border-red-200"
    };

    const colorClass = colorMap[severity] || "bg-gray-100 text-gray-800 border-gray-200";

    return (
        <span className={`px-3 py-1 rounded-full h-fit w-fit text-xs font-medium border ${colorClass}`}>
            {severity}
        </span>
    );
};

// Enhanced Modal component for viewing bug details
const BugDetailsModal = ({ isOpen, onClose, bug }: {
    isOpen: boolean;
    onClose: () => void;
    bug: Bug | null;
}) => {
    if (!isOpen || !bug) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                {/* Modal Header */}
                <div className="flex items-center justify-between p-6 border-b">
                    <div className="flex flex-col">
                        <h2 className="text-xl font-semibold text-gray-900">Bug Details</h2>
                        <p className="text-sm text-gray-600">Complete bug information</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <X className="h-6 w-6" />
                    </button>
                </div>

                {/* Modal Body */}
                <div className="p-6 space-y-6">
                    {/* Bug Title */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Bug Title
                        </label>
                        <div className="bg-gray-50 rounded-lg p-4">
                            <p className="text-gray-900 font-medium">
                                {bug.bugTitle || 'No title provided'}
                            </p>
                        </div>
                    </div>

                    {/* Bug Description */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Description
                        </label>
                        <div className="bg-gray-50 rounded-lg p-4 min-h-[120px]">
                            <p className="text-gray-900 whitespace-pre-wrap">
                                {bug.bugDescription || 'No description provided'}
                            </p>
                        </div>
                    </div>

                    {/* Additional Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Severity
                            </label>
                            <div className="bg-gray-50 rounded-lg p-4">
                                <SeverityBadge severity={bug.severity || 'Medium'} />
                            </div>
                        </div>                        
                    </div>

                    {/* Attachment Section */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Attachment
                        </label>
                        <div className="bg-gray-50 rounded-lg p-4">
                            {bug.attachment ? (
                                <div className="flex items-center justify-between bg-white rounded-lg p-3 border">
                                    <div className="flex items-center space-x-3">
                                        <FileText className="h-8 w-8 text-blue-600" />
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">
                                                {typeof bug.attachment === 'string'
                                                    ? bug.attachment.split('/').pop() || 'Attachment'
                                                    : 'Attachment'
                                                }
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                Click to download
                                            </p>
                                        </div>
                                    </div>
                                    <a
                                        download
                                        href={'/uploads/' + bug.attachment}
                                        className="text-blue-600 hover:text-blue-800 transition-colors"
                                    >
                                        <Download className="h-5 w-5" />
                                    </a>
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <FileText className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                                    <p className="text-gray-500 text-sm">No attachment available</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Modal Footer */}
                <div className="flex justify-end gap-3 p-6 border-t bg-gray-50">
                    <button
                        onClick={onClose}
                        className="bg-[#2b4b93] hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default function CompanyBugsPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [searchText, setSearchText] = useState("");
    const [selectedBug, setSelectedBug] = useState<Bug | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { user } = useAuth();

    const projectId = searchParams.get('projectId');

    // Fetch project details when projectId is available
    const { data: project } = useQuery({
        queryKey: ['project', projectId],
        queryFn: () => projectService.getProjectById(parseInt(projectId!)),
        enabled: !!projectId,
    });

    // Fetch all clients and projects for name lookups
    const { data: allClients = [] } = useQuery<Client[], Error>({
        queryKey: ['allClients'],
        queryFn: () => clientService.getAllClients(),
    });

    const { data: allProjects = [] } = useQuery<Project[], Error>({
        queryKey: ['allProjects'],
        queryFn: () => projectService.getAllProjects(),
    });

    const { data: bugs = [], error, isLoading } = useQuery<BugListItem[], Error>({
        queryKey: ['bugs', projectId, user?.email],
        queryFn: () => {
            console.log('Fetching bugs for projectId:', projectId);
            if (projectId) {
                return bugService.getBugsByProject(parseInt(projectId));
            }
            // Get client-specific bugs when not filtered by project
            return bugService.getBugsByClient(user?.email || '');
        },
        enabled: !!user?.email,
    });

    console.log('Bugs data:', bugs);
    console.log('Project ID from URL:', projectId);

    // Create lookup maps for client and project names
    const clientNameMap = allClients.reduce((acc, client) => {
        acc[client.clientId] = client.name;
        return acc;
    }, {} as Record<number, string>);

    const projectNameMap = allProjects.reduce((acc, project) => {
        acc[project.projectId] = project.projectName;
        return acc;
    }, {} as Record<number, string>);

    // Modal handlers
    const openModal = (bugId: number) => {
        bugService.getBugById(bugId)
            .then(bug => {
                setSelectedBug(bug);
                setIsModalOpen(true);
            })
            .catch(error => {
                console.error('Error fetching bug details:', error);
            });
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedBug(null);
    };

    const filteredBugs = bugs.filter(bug =>
        bug.bugTitle?.toLowerCase().includes(searchText.toLowerCase()) ||
        bug.severity?.toLowerCase().includes(searchText.toLowerCase())
    );

    const stats = {
        total: bugs.length,
        high: bugs.filter(bug => bug.severity === 'High').length,
        medium: bugs.filter(bug => bug.severity === 'Medium').length,
        low: bugs.filter(bug => bug.severity === 'Low').length
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center min-h-[400px]">
                <div className="text-center">
                    <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
                    <p className="mt-2 text-gray-600">Loading bugs...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex justify-center items-center min-h-[400px]">
                <div className="text-center">
                    <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                    <p className="text-gray-600">Error loading bugs. Please try again.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            {/* Header */}
            <div className="mb-8">
                {/* Breadcrumb for project-specific view */}
                {projectId && (
                    <div className="mb-4">
                        <button
                            onClick={() => router.push(`/client/projects/${projectId}`)}
                            className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center gap-2"
                        >
                            ← Back to Project
                        </button>
                    </div>
                )}

                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                            <FileText className="h-8 w-8 text-[#3450A3]" />
                            {projectId
                                ? (project?.projectName || 'Project Bugs')
                                : 'Bugs'
                            }
                        </h1>
                        <p className="text-gray-600 mt-2">
                            {projectId
                                ? 'Project bugs and specifications'
                                : 'Manage project bugs and specifications'
                            }
                        </p>
                    </div>
                    {/* Add Bug Button (visible when bugs exist) */}
                    {filteredBugs.length > 0 && (
                        <div className="flex justify-end mt-6">
                            <button
                                onClick={() => {
                                    const addBugUrl = projectId
                                        ? `/client/bugs/add-bug?projectId=${projectId}`
                                        : '/client/bugs/add-bug';
                                    router.push(addBugUrl);
                                }}
                                className="bg-[#2b4b93] hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                            >
                                Add Bug
                            </button>
                        </div>
                    )}
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white rounded-lg shadow-sm border p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Total</p>
                                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                            </div>
                            <FileText className="h-8 w-8 text-gray-400" />
                        </div>
                    </div>
                    <div className="bg-white rounded-lg shadow-sm border p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">High Severity</p>
                                <p className="text-2xl font-bold text-red-600">{stats.high}</p>
                            </div>
                            <AlertTriangle className="h-8 w-8 text-red-400" />
                        </div>
                    </div>
                    <div className="bg-white rounded-lg shadow-sm border p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Medium Severity</p>
                                <p className="text-2xl font-bold text-yellow-600">{stats.medium}</p>
                            </div>
                            <Clock className="h-8 w-8 text-yellow-400" />
                        </div>
                    </div>
                    <div className="bg-white rounded-lg shadow-sm border p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Low Severity</p>
                                <p className="text-2xl font-bold text-green-600">{stats.low}</p>
                            </div>
                            <CheckCircle className="h-8 w-8 text-green-400" />
                        </div>
                    </div>
                </div>

                {/* Search */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input
                        type="text"
                        placeholder="Search bugs by title, description, or severity..."
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                    />
                </div>
            </div>

            {/* Bugs Table */}
            <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
                {filteredBugs.length === 0 ? (
                    <div className="text-center py-12">
                        <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No bugs found</h3>
                        <p className="text-gray-600">
                            {searchText ? 'Try adjusting your search criteria.' : 'Get started by adding your first bug.'}
                        </p>
                        {!searchText && (
                            <button
                                onClick={() => {
                                    const addBugUrl = projectId
                                        ? `/client/bugs/add-bug?projectId=${projectId}`
                                        : '/client/bugs/add-bug';
                                    router.push(addBugUrl);
                                }}
                                className="px-6 py-2 bg-[#3450A3] text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#3450A3] disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Add Bug
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bug</th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Severity</th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client</th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Project</th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredBugs.map((bug) => (
                                    <tr key={bug.bugId} className="hover:bg-gray-50">
                                        <td className="px-6 py-4">
                                            <div>
                                                <p className="text-sm font-medium text-gray-900">{bug.bugTitle}</p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <SeverityBadge severity={bug.severity || 'Medium'} />
                                        </td>
                                        <td className="px-6 py-4">
                                            <BugStatusBadge status={normalizeStatus(bug.status) || 'Pending'} />
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-900">
                                            {clientNameMap[bug.clientId] || `Client ${bug.clientName}`}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-900">
                                            {projectNameMap[bug.projectId] || `Project ${bug.projectId}`}
                                        </td>                                       
                                        <td className="px-6 py-4">
                                            <button
                                                onClick={() => openModal(bug.bugId)}
                                                className="flex items-center gap-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 px-3 py-1 rounded-lg transition-colors"
                                                title="View attachment"
                                            >
                                                <Eye className="h-4 w-4" />
                                                <span className="text-sm font-medium">View More</span>
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Bug Details Modal */}
            <BugDetailsModal
                isOpen={isModalOpen}
                onClose={closeModal}
                bug={selectedBug}
            />
        </div>
    );
}
