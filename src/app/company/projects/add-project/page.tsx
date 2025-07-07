'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from "next/image";
import { useQuery } from '@tanstack/react-query';
import { companyService } from '@/app/lib/services/companyService';
import { projectService } from '@/app/lib/services/projectService';
import { Company } from '@/app/lib/types';

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
}

export default function ProjectForm({ projectId }: ProjectFormProps) {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState('initialization');
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
    });

    // Fetch companies for dropdown
    const { data: companies = [], isLoading: companiesLoading, error: companiesError } = useQuery<Company[], Error>({
        queryKey: ['companies'],
        queryFn: companyService.getAllCompanies,
    });

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
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
                companyId: parseInt(formData.companyId)
            };

            await projectService.addProject(projectData);
            console.log('Project added successfully');
            router.push('/company/projects'); // Redirect after successful submission
        } catch (error) {
            console.error('Error submitting form:', error);
        }
    };

    return (
        <div className=" px-8 pt-6 h-screen w-4/6">
            <div className="p-6">
                <h1 className="text-4xl font-bold text-[#3450A3] mb-6">
                    Project Information
                </h1>

                {/* Tabs */}
                <div className="flex space-x-6 mb-8 border-b">
                    <button
                        onClick={() => setActiveTab('initialization')}
                        className={`pb-2 ${
                            activeTab === 'initialization'
                                ? 'text-blue-700 border-b-2 border-blue-700 font-medium'
                                : 'text-gray-500'
                        }`}
                    >
                        PROJECT INITIALIZATION
                    </button>
                    <button
                        onClick={() => setActiveTab('details')}
                        className={`pb-2 ${
                            activeTab === 'details'
                                ? 'text-blue-700 border-b-2 border-blue-700 font-medium'
                                : 'text-gray-500'
                        }`}
                    >
                        MORE DETAILS
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    {activeTab === 'initialization' ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Company Name */}
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">
                                    Company Name
                                </label>
                                <select
                                    name="companyId"
                                    value={formData.companyId}
                                    onChange={handleChange}
                                    className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    disabled={companiesLoading}
                                >
                                    <option value="">Select Company</option>
                                    {companies.map((company) => (
                                        <option key={company.companyId} value={company.companyId}>
                                            {company.companyName}
                                        </option>
                                    ))}
                                </select>
                                {companiesError && (
                                    <p className="text-red-500 text-sm">Error loading companies</p>
                                )}
                            </div>

                            {/* Project Name */}
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">
                                    Project Name
                                </label>
                                <input
                                    type="text"
                                    name="projectName"
                                    value={formData.projectName}
                                    onChange={handleChange}
                                    className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="Enter project name"
                                />
                            </div>

                            {/* Project Type */}
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">
                                    Project Type
                                </label>
                                <select
                                    name="projectType"
                                    value={formData.projectType}
                                    onChange={handleChange}
                                    className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                >
                                    <option value="">Select Project Type</option>
                                    <option value="web">Web Development</option>
                                    <option value="mobile">Mobile Development</option>
                                    <option value="desktop">Desktop Application</option>
                                </select>
                            </div>

                            {/* Project Size */}
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">
                                    Project Size
                                </label>
                                <select
                                    name="projectSize"
                                    value={formData.projectSize}
                                    onChange={handleChange}
                                    className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                >
                                    <option value="">Select Project Size</option>
                                    <option value="small">Small</option>
                                    <option value="medium">Medium</option>
                                    <option value="large">Large</option>
                                </select>
                            </div>

                            {/* Creation Date */}
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">
                                    Creation Date
                                </label>
                                <input
                                    type="date"
                                    name="creationDate"
                                    value={formData.creationDate}
                                    onChange={handleChange}
                                    className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>

                            {/* Estimated Budget */}
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">
                                    Estimated Budget
                                </label>
                                <input
                                    type="text"
                                    name="estimatedBudget"
                                    value={formData.estimatedBudget}
                                    onChange={handleChange}
                                    className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="Enter estimated budget"
                                />
                            </div>

                            {/* Project Description */}
                            <div className="space-y-2 col-span-2">
                                <label className="block text-sm font-medium text-gray-700">
                                    Project Description
                                </label>
                                <textarea
                                    name="projectDescription"
                                    value={formData.projectDescription}
                                    onChange={handleChange}
                                    rows={4}
                                    className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="Enter project description"
                                />
                            </div>
                        </div>
                    ) : (
                        // More Details fields
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Actual Start Date */}
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">
                                    Actual Start Date
                                </label>
                                <input
                                    type="date"
                                    name="actualStartDate"
                                    value={formData.actualStartDate}
                                    onChange={handleChange}
                                    className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>

                            {/* Actual End Date */}
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">
                                    Actual End Date
                                </label>
                                <input
                                    type="date"
                                    name="actualEndDate"
                                    value={formData.actualEndDate}
                                    onChange={handleChange}
                                    className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>

                            {/* Total Budget */}
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">
                                    Total Budget
                                </label>
                                <input
                                    type="text"
                                    name="totalBudget"
                                    value={formData.totalBudget}
                                    onChange={handleChange}
                                    className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="Enter total budget"
                                />
                            </div>

                            {/* Payment Type */}
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">
                                    Payment Type
                                </label>
                                <select
                                    name="paymentType"
                                    value={formData.paymentType}
                                    onChange={handleChange}
                                    className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                >
                                    <option value="">Select Payment Type</option>
                                    <option value="fixed">Fixed</option>
                                    <option value="hourly">Hourly</option>
                                    <option value="milestone">Milestone</option>
                                </select>
                            </div>

                            {/* Payment Status */}
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">
                                    Payment Status
                                </label>
                                <select
                                    name="paymentStatus"
                                    value={formData.paymentStatus}
                                    onChange={handleChange}
                                    className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                >
                                    <option value="">Select Payment Status</option>
                                    <option value="pending">Pending</option>
                                    <option value="partial">Partial</option>
                                    <option value="paid">Paid</option>
                                </select>
                            </div>

                            {/* Status */}
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">
                                    Project Status
                                </label>
                                <select
                                    name="status"
                                    value={formData.status}
                                    onChange={handleChange}
                                    className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                >
                                    <option value="Active">Active</option>
                                    <option value="Inactive">Inactive</option>
                                    <option value="Completed">Completed</option>
                                    <option value="On Hold">On Hold</option>
                                </select>
                            </div>
                        </div>
                    )}

                    {/* Form Actions */}
                    <div className="w-3/6 flex justify-end mt-16 gap-x-6">
                        <button
                            className="w-28 bg-gray-300 hover:bg-gray-400 text-black font-bold py-2 px-4 rounded-md focus:outline-none focus:shadow-outline"
                            type="button"
                        >
                            Cancel
                        </button>
                        <button
                            className="w-28 bg-[#FFBF00] hover:bg-[#FFBF00] text-black font-bold py-2 px-4 rounded-md focus:outline-none focus:shadow-outline"
                            type="submit"
                        >
                            Save
                        </button>
                    </div>

                    {/* Illustration */}
                    <div className="hidden lg:block absolute bottom-0 right-0 mb-10 mr-10">
                        <Image
                            src="/images/project.png"
                            alt="Team illustration"
                            width={300}
                            height={220}
                        />
                    </div>
                </form>
            </div>
        </div>
    );
}