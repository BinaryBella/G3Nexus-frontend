'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/app/components/Navbar';
import { FileText, Plus, Edit, Trash2, Eye } from 'lucide-react';
import { projectService, Project } from '@/app/lib/services/projectService';

const ProjectsPage = () => {
    const router = useRouter();
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchProjects();
    }, []);

    const fetchProjects = async () => {
        try {
            setLoading(true);
            const projectsData = await projectService.getAllProjects();
            setProjects(projectsData);
            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch projects');
        } finally {
            setLoading(false);
        }
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

    const getStatusBadge = (status: string) => {
        const statusColors = {
            'Active': 'bg-green-100 text-green-800',
            'Completed': 'bg-blue-100 text-blue-800',
            'On Hold': 'bg-yellow-100 text-yellow-800',
            'Cancelled': 'bg-red-100 text-red-800',
        };

        return (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800'}`}>
                {status}
            </span>
        );
    };

    const getPaymentStatusBadge = (status: string) => {
        const statusColors = {
            'Paid': 'bg-green-100 text-green-800',
            'Pending': 'bg-yellow-100 text-yellow-800',
            'Overdue': 'bg-red-100 text-red-800',
            'Partial': 'bg-orange-100 text-orange-800',
        };

        return (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800'}`}>
                {status}
            </span>
        );
    };

    return (
        <div className="relative w-full min-h-screen">
            {/* Background Image with Opacity */}
            <div
                className="absolute inset-0 bg-cover bg-center opacity-70"
                style={{ backgroundImage: "url('/images/background-image.png')" }}
            ></div>

            {/* Content on Top of the Background */}
            <div className="relative z-10 w-full h-full">
                {/* Navbar */}
                <Navbar />

                {/* Page Content */}
                <section className="container mx-auto py-8 px-4">
                    {/* Header */}
                    <div className="flex justify-between items-center mb-8 mt-20">
                        <div className="flex items-center gap-3">
                            <FileText className="h-8 w-8 text-[#3450A3]" />
                            <h1 className="text-3xl font-bold text-[#3450A3]">
                                Project Management
                            </h1>
                        </div>
                        <button 
                            className="bg-[#3450A3] text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors"
                            onClick={() => router.push('/company/projects/add-project')}
                        >
                            <Plus className="h-4 w-4" />
                            Add New Project
                        </button>
                    </div>

                    {/* Error State */}
                    {error && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
                            <p>{error}</p>
                            <button
                                onClick={fetchProjects}
                                className="mt-2 text-sm underline hover:no-underline"
                            >
                                Try again
                            </button>
                        </div>
                    )}

                    {/* Loading State */}
                    {loading ? (
                        <div className="bg-white rounded-lg shadow-md p-8 text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3450A3] mx-auto mb-4"></div>
                            <p className="text-gray-600">Loading projects...</p>
                        </div>
                    ) : (
                        /* Projects Table */
                        <div className="bg-white rounded-lg shadow-md overflow-hidden">
                            {projects.length === 0 ? (
                                <div className="p-8 text-center">
                                    <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                                    <h3 className="text-lg font-medium text-gray-900 mb-2">No projects found</h3>
                                    <p className="text-gray-600">Get started by creating your first project.</p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Project Name
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Type & Size
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Status
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Budget
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Payment Status
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Dates
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Actions
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {projects.map((project) => (
                                                <tr key={project.projectId} className="hover:bg-gray-50">
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div>
                                                            <div className="text-sm font-medium text-gray-900">
                                                                {project.projectName}
                                                            </div>
                                                            <div className="text-sm text-gray-500 truncate max-w-xs">
                                                                {project.projectDescription}
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm text-gray-900">{project.projectType}</div>
                                                        <div className="text-sm text-gray-500">{project.projectSize}</div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        {getStatusBadge(project.status)}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm text-gray-900">
                                                            {formatCurrency(project.totalBudget)}
                                                        </div>
                                                        <div className="text-sm text-gray-500">
                                                            Est: {formatCurrency(project.estimatedBudget)}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        {getPaymentStatusBadge(project.paymentStatus)}
                                                        <div className="text-xs text-gray-500 mt-1">
                                                            {project.paymentType}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        <div>Start: {formatDate(project.actualStartDate)}</div>
                                                        <div>End: {formatDate(project.actualEndDate)}</div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                        <div className="flex space-x-2">
                                                            <button
                                                                className="text-blue-600 hover:text-blue-900"
                                                                title="View Details"
                                                            >
                                                                <Eye className="h-4 w-4" />
                                                            </button>
                                                            <button
                                                                className="text-green-600 hover:text-green-900"
                                                                title="Edit Project"
                                                            >
                                                                <Edit className="h-4 w-4" />
                                                            </button>
                                                            <button
                                                                className="text-red-600 hover:text-red-900"
                                                                title="Delete Project"
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
};

export default ProjectsPage;
