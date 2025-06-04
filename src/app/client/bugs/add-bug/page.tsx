"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import ProtectedRoute from '@/app/components/ProtectedRoute';


const RequirementForm = () => {
    const [title, setTitle] = useState('');
    const [Bug, setPriority] = useState('');
    const [description, setDescription] = useState('');
    const [file, setFile] = useState<File | null>(null);
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Handle form submission
        console.log({ title, Bug, description, file });
    };

    return (
        <ProtectedRoute>
        <form onSubmit={handleSubmit} className="bg-white px-8 pt-6 h-screen">
            <h1 className="text-4xl font-bold text-[#3450A3] mb-8">
                Add New Bugs
            </h1>
            <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="title">
                    Bug Title
                </label>
                <input
                    className="shadow appearance-none border rounded w-1/2 py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    id="title"
                    type="text"
                    placeholder="Enter a brief title for the bug"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                />
            </div>
            <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="Bug">
                    Severity
                </label>
                <select
                    className="shadow appearance-none border rounded w-1/2 py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    id="Bug"
                    value={Bug}
                    onChange={(e) => setPriority(e.target.value)}
                >
                    <option value="">Select Severity</option>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                </select>
            </div>
            <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="description">
                    Description
                </label>
                <textarea
                    className="shadow appearance-none border rounded w-1/2 py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    id="description"
                    placeholder="Describe the bug in detail"
                    rows={4}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                />
            </div>
            <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="attachment">
                    Attachment
                </label>
                <input
                    className="shadow appearance-none border rounded w-1/2 py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    id="attachment"
                    type="file"
                    onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}
                />
            </div>
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
                    src="/images/bug.png"
                    alt="Team illustration"
                    width={400}
                    height={320}
                />
            </div>
        </form>
        </ProtectedRoute>
    );
};

export default RequirementForm;
