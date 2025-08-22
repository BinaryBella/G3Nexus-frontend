"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FileSearch, Search, Plus, FileText, AlertTriangle, CheckCircle, Clock, DollarSign, Edit, Trash2 } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { projectService, Project } from '@/app/lib/services/projectService';
import Pagination from '@/app/components/Pagination';
import DeleteConfirmationModal from '@/app/components/DeleteConfirmationModal';
import FeedbackPopup from '@/app/components/FeedbackPopup';
import { useRoleAccess } from '@/app/hooks/useRoleAccess';
import StatusDropdown from '@/app/components/StatusDropdown';


const PaymentStatusBadge = ({ status }: { status: string }) => {
    const colorMap: Record<string, string> = {
        Paid: "bg-green-100 text-green-800 border-green-200",
        Pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
        Overdue: "bg-red-100 text-red-800 border-red-200",
        Partial: "bg-orange-100 text-orange-800 border-orange-200"
    };

    const colorClass = colorMap[status] || "bg-gray-100 text-gray-800 border-gray-200";

    return (
        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${colorClass}`}>
            {status}
        </span>
    );
};

export default function CompanyProjectsPage() {
    const router = useRouter();
    const { canManageProjects } = useRoleAccess();
    const queryClient = useQueryClient();
    const [searchText, setSearchText] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [deleteError, setDeleteError] = useState<string | null>(null);
    const [deleteModal, setDeleteModal] = useState<{
        isOpen: boolean;
        project: Project | null;
        isDeleting: boolean;
    }>({
        isOpen: false,
        project: null,
        isDeleting: false
    });
    const itemsPerPage = 6;

    const { data: projects = [], error, isLoading } = useQuery<Project[], Error>({
        queryKey: ['projects'],
        queryFn: projectService.getAllProjects,
    });

    // Delete mutation
    const deleteProjectMutation = useMutation({
        mutationFn: async (projectId: number) => {
            return await projectService.deleteProject(projectId);
        },
        onMutate: () => {
            setDeleteModal(prev => ({ ...prev, isDeleting: true }));
        },
        onSuccess: () => {
            // Invalidate and refetch projects data
            queryClient.invalidateQueries({ queryKey: ['projects'] });
            setDeleteModal({ isOpen: false, project: null, isDeleting: false });
            setDeleteError(null)
            // You could add a success toast here if needed
        },
        onError: (error: { response: { data: { message: string } } }) => {
            console.error('Failed to delete project:', error);
            setDeleteModal(prev => ({ ...prev, isDeleting: false }));
            setDeleteError(error.response.data.message || 'Failed to delete project');
            // You could add an error toast here if needed
        }
    });

    // Delete modal handlers
    const handleDeleteClick = (project: Project) => {
        setDeleteError(null);
        setDeleteModal({
            isOpen: true,
            project,
            isDeleting: false
        });
    };

    const handleDeleteConfirm = () => {
        if (deleteModal.project) {
            deleteProjectMutation.mutate(deleteModal.project.projectId);
        }
    };

    const handleDeleteCancel = () => {
        setDeleteError(null);
        if (!deleteModal.isDeleting) {
            setDeleteModal({ isOpen: false, project: null, isDeleting: false });
        }
    };

    // Reset to first page when search text changes
    useEffect(() => {
        setCurrentPage(1);
    }, [searchText]);

    const filteredProjects = projects.filter(project => {
        if (searchText.trim() === '') return true;

        // Helper function to check if search text matches beginning of any word
        const matchesWordBeginning = (text: string) => {
            if (!text) return false;
            const words = text.toLowerCase().split(/\s+/);
            const searchLower = searchText.toLowerCase();
            return words.some(word => word.startsWith(searchLower));
        };

        return matchesWordBeginning(project.projectName || '') ||
            matchesWordBeginning(project.projectDescription || '') ||
            matchesWordBeginning(project.projectType || '') ||
            matchesWordBeginning(project.status || '');
    });

    // Pagination calculations
    const totalPages = Math.ceil(filteredProjects.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedProjects = filteredProjects.slice(startIndex, startIndex + itemsPerPage);

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const stats = {
        total: projects.length,
        active: projects.filter(project => project.status === 'Active').length,
        completed: projects.filter(project => project.status === 'Completed').length,
        totalBudget: projects.reduce((sum, project) => sum + (project.totalBudget || 0), 0)
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center min-h-[400px]">
                <div className="text-center">
                    <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
                    <p className="mt-2 text-gray-600">Loading projects...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex justify-center items-center min-h-[400px]">
                <div className="text-center">
                    <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                    <p className="text-gray-600">Error loading projects. Please try again.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            {/* Header */}
            <div className="mb-8">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                            <FileText className="h-8 w-8 text-[#3450A3]" />
                            Projects
                        </h1>
                        <p className="text-gray-600 mt-2">
                            {canManageProjects() ? 'Manage and track your projects' : 'View project information (read-only access)'}
                        </p>
                    </div>
                    {canManageProjects() && (
                        <button
                            onClick={() => router.push('/company/projects/add-project')}
                            className="bg-[#3450A3] hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium flex items-center gap-2 transition-colors"
                        >
                            <Plus className="h-5 w-5" />
                            Add New Project
                        </button>
                    )}
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white rounded-lg shadow-sm border p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Total Projects</p>
                                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                            </div>
                            <FileText className="h-8 w-8 text-gray-400" />
                        </div>
                    </div>
                    <div className="bg-white rounded-lg shadow-sm border p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Active</p>
                                <p className="text-2xl font-bold text-green-600">{stats.active}</p>
                            </div>
                            <Clock className="h-8 w-8 text-green-400" />
                        </div>
                    </div>
                    <div className="bg-white rounded-lg shadow-sm border p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Completed</p>
                                <p className="text-2xl font-bold text-blue-600">{stats.completed}</p>
                            </div>
                            <CheckCircle className="h-8 w-8 text-blue-400" />
                        </div>
                    </div>
                    <div className="bg-white rounded-lg shadow-sm border p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Total Budget</p>
                                <p className="text-2xl font-bold text-green-600">{formatCurrency(stats.totalBudget)}</p>
                            </div>
                            <DollarSign className="h-8 w-8 text-green-400" />
                        </div>
                    </div>
                </div>

                {/* Search */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input
                        type="text"
                        placeholder="Search projects by name, description, type, or status..."
                        className="text-black w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3450A3] focus:border-[#3450A3]"
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                    />
                </div>
            </div>

            {/* Projects Table */}
            <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
                {filteredProjects.length === 0 ? (
                    <div className="text-center py-12">
                        <FileSearch className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No projects found</h3>
                        <p className="text-gray-600">
                            {searchText
                                ? 'Try adjusting your search criteria.'
                                : canManageProjects()
                                    ? 'Get started by adding your first project.'
                                    : 'No projects found in the system.'
                            }
                        </p>
                        {!searchText && canManageProjects() && (
                            <button
                                onClick={() => router.push('/company/projects/add-project')}
                                className="mt-4 bg-[#3450A3] hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                            >
                                Add New Project
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Project</th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type & Size</th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Budget</th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dates</th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {paginatedProjects.map((project) => (
                                    <tr key={project.projectId} className="hover:bg-gray-50">
                                        <td className="px-6 py-4">
                                            <div>
                                                <p className="text-sm font-medium text-gray-900">{project.projectName}</p>
                                                <p className="text-sm text-gray-600 truncate max-w-xs">{project.projectDescription}</p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-gray-900">{project.projectType}</div>
                                            <div className="text-sm text-gray-500">{project.projectSize}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <StatusDropdown
                                                projectId={project.projectId}
                                                currentStatus={project.status}
                                                canManage={canManageProjects()}
                                            />
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-gray-900">
                                                {formatCurrency(project.totalBudget)}
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                Est: {formatCurrency(project.estimatedBudget)}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600">
                                            <div>Start: {formatDate(project.actualStartDate)}</div>
                                            <div>End: {formatDate(project.actualEndDate)}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex space-x-2">
                                                {canManageProjects() ? (
                                                    <>
                                                        <button
                                                            onClick={() => router.push(`/company/projects/edit-project/${project.projectId}`)}
                                                            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                                                            title="Edit Project"
                                                        >
                                                            <Edit className="h-4 w-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteClick(project)}
                                                            className="text-red-600 hover:text-red-800 text-sm font-medium"
                                                            title="Delete Project"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </button>
                                                    </>
                                                ) : (
                                                    <span className="text-gray-400 text-sm">View Only</span>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Pagination */}
            {filteredProjects.length > 0 && (
                <div className="bg-white rounded-lg shadow-sm border mt-4">
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={handlePageChange}
                        totalItems={filteredProjects.length}
                        itemsPerPage={itemsPerPage}
                    />
                </div>
            )}

            {/* Delete Confirmation Modal */}
            <DeleteConfirmationModal
                isOpen={deleteModal.isOpen}
                onClose={handleDeleteCancel}
                onConfirm={handleDeleteConfirm}
                title="Delete Project"
                message="Are you sure you want to delete this project?"
                warningMessage="This action cannot be undone. All project data will be permanently removed."
                isDeleting={deleteModal.isDeleting}
                itemName={deleteModal.project?.projectName ? `"${deleteModal.project.projectName}"` : undefined}
                confirmButtonText="Delete Project"
                cancelButtonText="Cancel"
            />

            <FeedbackPopup
                isOpen={!!deleteError}
                onClose={() => setDeleteError(null)}
                children={deleteError}
                title="Failed to Delete Project"
                type='error'
            />
        </div>
    );
}
