"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { FileSearch, Search, Plus, Bug, AlertTriangle, CheckCircle, Clock, Eye, X } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { bugService } from '@/app/lib/services/bugService';
import { projectService } from '@/app/lib/services/projectService';
import { clientService } from '@/app/lib/services/clientService';
import { Bug as BugType } from '../../lib/types';
import { useAuth } from '@/app/contexts/AuthContext';

const SeverityBadge = ({ severity }: { severity: string }) => {
    const colorMap: Record<string, string> = {
        Low: "bg-yellow-100 text-yellow-800 border-yellow-200",
        Medium: "bg-orange-100 text-orange-800 border-orange-200",
        High: "bg-red-100 text-red-800 border-red-200"
    };

    const colorClass = colorMap[severity] || "bg-gray-100 text-gray-800 border-gray-200";

    return (
        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${colorClass}`}>
            {severity}
        </span>
    );
};

const StatusBadge = ({ status }: { status: string }) => {
    const colorMap: Record<string, string> = {
        Open: "bg-red-100 text-red-800 border-red-200",
        "In Progress": "bg-blue-100 text-blue-800 border-blue-200",
        Resolved: "bg-green-100 text-green-800 border-green-200",
        Closed: "bg-gray-100 text-gray-800 border-gray-200"
    };

    const colorClass = colorMap[status] || "bg-gray-100 text-gray-800 border-gray-200";

    return (
        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${colorClass}`}>
            {status}
        </span>
    );
};

// Modal component for viewing bug attachments
const AttachmentModal = ({ isOpen, onClose, bug }: {
    isOpen: boolean;
    onClose: () => void;
    bug: BugType | null;
}) => {
    if (!isOpen || !bug) return null;

    const hasAttachment = bug.attachment && bug.attachment.trim() !== '';

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
                {/* Modal Header */}
                <div className="flex items-center justify-between p-6 border-b">
                    <div>
                        <h2 className="text-xl font-semibold text-gray-900">{bug.bugTitle}</h2>
                        <p className="text-sm text-gray-600">Bug Details</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <X className="h-6 w-6" />
                    </button>
                </div>

                {/* Modal Body */}
                <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">

                    {/* Attachments Section */}
                    <div>
                        <label className="text-sm font-medium text-gray-600 mb-3 block">Attachments</label>
                        {hasAttachment ? (
                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                                <div className="text-center">
                                    <div className="relative inline-block">
                                        <Image
                                            src={bug.attachment.startsWith('http') ? bug.attachment : `/uploads/${bug.attachment}`}
                                            alt="Bug attachment"
                                            width={400}
                                            height={300}
                                            className="rounded-lg object-cover max-w-full h-auto"
                                            onError={(e) => {
                                                e.currentTarget.style.display = 'none';
                                                const nextElement = e.currentTarget.nextElementSibling as HTMLElement;
                                                if (nextElement) {
                                                    nextElement.style.display = 'block';
                                                }
                                            }}
                                        />
                                        <div className="hidden text-gray-500">
                                            <AlertTriangle className="h-12 w-12 mx-auto mb-2" />
                                            <p>Unable to load image</p>
                                            <p className="text-sm mt-1">File: {bug.attachment}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                                <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                <p className="text-gray-600">No attachments available for this bug</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default function CompanyBugsPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [searchText, setSearchText] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedBug, setSelectedBug] = useState<BugType | null>(null);
    const [clientNames, setClientNames] = useState<Record<number, string>>({});
    const { user } = useAuth();

    const projectId = searchParams.get('projectId');
    const projectIdNum = projectId ? parseInt(projectId, 10) : null;

    // Fetch project details if projectId is provided
    const { data: project, isLoading: projectLoading } = useQuery({
        queryKey: ['project', projectIdNum],
        queryFn: () => projectService.getProjectById(projectIdNum!),
        enabled: !!projectIdNum,
    });

    // Fetch bugs - either all bugs or bugs for specific project
    const { data: bugs = [], error, isLoading } = useQuery<BugType[], Error>({
        queryKey: projectIdNum ? ['bugs', 'project', projectIdNum] : ['bugs', 'client', user?.email],
        queryFn: () => {
            if (projectIdNum) {
                return bugService.getBugsByProject(projectIdNum);
            }
            // Get client-specific bugs when not filtered by project
            return bugService.getBugsByClient(user?.email || '');
        },
        enabled: !!user?.email,
    });

    // Fetch client names for the bugs
    const uniqueClientIds = Array.from(new Set(bugs.map(bug => bug.clientId)));
    
    useQuery({
        queryKey: ['clientNames', uniqueClientIds],
        queryFn: async () => {
            const clientNamesMap: Record<number, string> = {};
            await Promise.all(
                uniqueClientIds.map(async (clientId) => {
                    try {
                        const client = await clientService.getClientById(clientId);
                        clientNamesMap[clientId] = client.name;
                    } catch (error) {
                        console.error(`Failed to fetch client ${clientId}:`, error);
                        clientNamesMap[clientId] = `Client ${clientId}`;
                    }
                })
            );
            setClientNames(clientNamesMap);
            return clientNamesMap;
        },
        enabled: bugs.length > 0,
    });

    const filteredBugs = bugs.filter(bug =>
        bug.bugTitle?.toLowerCase().includes(searchText.toLowerCase()) ||
        bug.bugDescription?.toLowerCase().includes(searchText.toLowerCase()) ||
        bug.severity?.toLowerCase().includes(searchText.toLowerCase())
    );

    const stats = {
        total: bugs.length,
        open: bugs.filter(bug => bug.isActive).length,
        inProgress: Math.floor(bugs.length * 0.3), // Mock data - replace with actual status when available
        resolved: Math.floor(bugs.length * 0.4) // Mock data - replace with actual status when available
    };

    const openModal = (bug: BugType) => {
        setSelectedBug(bug);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedBug(null);
    };

    if (isLoading || (projectIdNum && projectLoading)) {
        return (
            <div className="flex justify-center items-center min-h-[400px]">
                <div className="text-center">
                    <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
                    <p className="mt-2 text-gray-600">
                        {projectLoading ? 'Loading project...' : 'Loading bugs...'}
                    </p>
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
                            <Bug className="h-8 w-8 text-[#3450A3]" />
                            {projectId
                                ? (project?.projectName || 'Project Bugs')
                                : 'Bugs'
                            }
                        </h1>
                        <p className="text-gray-600 mt-2">
                            {projectId
                                ? 'Project bugs and issues'
                                : 'Manage project bugs and issues'
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
            </div>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-white rounded-lg shadow-sm border p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Total Bugs</p>
                            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                        </div>
                        <Bug className="h-8 w-8 text-gray-400" />
                    </div>
                </div>
                <div className="bg-white rounded-lg shadow-sm border p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Open</p>
                            <p className="text-2xl font-bold text-red-600">{stats.open}</p>
                        </div>
                        <AlertTriangle className="h-8 w-8 text-red-400" />
                    </div>
                </div>
                <div className="bg-white rounded-lg shadow-sm border p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">In Progress</p>
                            <p className="text-2xl font-bold text-blue-600">{stats.inProgress}</p>
                        </div>
                        <Clock className="h-8 w-8 text-blue-400" />
                    </div>
                </div>
                <div className="bg-white rounded-lg shadow-sm border p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Resolved</p>
                            <p className="text-2xl font-bold text-green-600">{stats.resolved}</p>
                        </div>
                        <CheckCircle className="h-8 w-8 text-green-400" />
                    </div>
                </div>
            </div>

            {/* Search */}
            <div className="relative mb-8">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                    type="text"
                    placeholder={projectIdNum
                        ? `Search bugs in ${project?.projectName || 'this project'}...`
                        : "Search bugs by title, description, or status..."
                    }
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                />
            </div>

            {/* Bugs Table */}
            <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        {filteredBugs.length === 0 ? (
            <div className="text-center py-12">
                <FileSearch className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No bugs found</h3>
                <p className="text-gray-600">
                    {searchText
                        ? 'Try adjusting your search criteria.'
                        : projectIdNum
                            ? `No bugs reported for ${project?.projectName || 'this project'} yet.`
                            : 'Get started by adding your first bug report.'
                    }
                </p>
                {!searchText && (
                    <button
                        onClick={() => {
                            const addBugUrl = projectIdNum
                                ? `/client/bugs/add-bug?projectId=${projectIdNum}`
                                : '/client/bugs/add-bug';
                            router.push(addBugUrl);
                        }}
                        className="mt-4 bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                    >
                        Add Bug Report
                    </button>
                )}
            </div>
        ) : (
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-gray-50 border-b">
                        <tr>
                            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bug</th>
                            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Severity</th>
                            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reporter</th>
                            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {filteredBugs.map((bug) => (
                            <tr key={bug.bugId} className="hover:bg-gray-50">
                                <td className="px-6 py-4">
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">{bug.bugTitle}</p>
                                        <p className="text-sm text-gray-600 truncate max-w-xs">{bug.bugDescription}</p>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <StatusBadge status={bug.isActive ? 'Open' : 'Closed'} />
                                </td>
                                <td className="px-6 py-4">
                                    <SeverityBadge severity={bug.severity || 'Medium'} />
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-900">
                                    {clientNames[bug.clientId] || `Client ${bug.clientId}`}
                                </td>
                                <td className="px-6 py-4">
                                    <button
                                        onClick={() => openModal(bug)}
                                        className="flex items-center gap-2 text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors"
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

            {/* Attachment Modal */}
            <AttachmentModal
                isOpen={isModalOpen}
                onClose={closeModal}
                bug={selectedBug}
            />
        </div>
    );
}
