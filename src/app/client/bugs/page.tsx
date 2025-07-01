"use client";

import React, { useState } from 'react';
import { FileSearch, Search } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { bugService } from '@/app/lib/services/bugService';
import { Bug } from '../../lib/types';

const SeverityBadge = ({ severity }: { severity: string }) => {
    const colorMap: Record<string, string> = {
        Low: "bg-yellow-200 text-yellow-800",
        Medium: "bg-green-200 text-green-800",
        High: "bg-red-200 text-red-800"
    };

    const colorClass = colorMap[severity] || "bg-gray-200 text-gray-800";

    return (
        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${colorClass}`}>
            {severity}
        </span>
    );
};

const BugsTable = () => {
    const [searchText, setSearchText] = useState("");

    const { data: bugs = [], error, isLoading } = useQuery<Bug[], Error>({
        queryKey: ['bugs'],
        queryFn: bugService.getAllBugs,
    });

    const handleDetails = (id: number) => {
        console.log(`View more details for bug with id: ${id}`);
    };

    if (isLoading) {
        return (
            <div className="flex mt-48 justify-center h-screen">
                <div className="text-center">
                    <div role="status">
                        <svg aria-hidden="true" className="inline w-16 h-16 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/>
                            <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/>
                        </svg>
                        <span className="sr-only">Loading...</span>
                    </div>
                </div>
            </div>
        );
    }

    if (error) return <div>Error: {error.message}</div>;

    return (
        <div className="p-4">
            <h1 className="text-4xl font-bold text-[#3450A3] mb-8">
                Bugs
            </h1>
            <div className="flex justify-between mb-4">
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Search text"
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                        className="pl-8 pr-2 py-1 border rounded"
                    />
                    <Search className="absolute left-2 top-2 h-4 w-4 border rounded-lg text-gray-400"/>
                </div>
                <button className="bg-[#3450A3] text-white px-4 py-2 rounded-lg hover:bg-[#2a4084]">
                    ADD NEW BUG
                </button>
            </div>
            <div className="bg-white rounded-lg overflow-hidden shadow">
                <table className="w-full border-collapse">
                    <thead>
                    <tr className="bg-[#3450A3] text-white">
                        <th className="p-3 text-left text-blackr">Title</th>
                        <th className="p-3 text-left">Severity</th>
                        <th className="p-3 text-left">Description</th>
                        <th className="p-3 text-center">Actions</th>
                    </tr>
                    </thead>
                    <tbody>
                    {bugs.map((bug) => (
                        <tr key={bug.bugId} className="border-b hover:bg-gray-50">
                            <td className="p-3">{bug.bugTitle}</td>
                            <td className="p-3">
                                <SeverityBadge severity={bug.severity}/>
                            </td>
                            <td className="p-3">{bug.bugDescription}</td>
                            <td className="p-3 flex justify-center space-x-4 align-middle">
                                <button
                                    className="p-1 hover:bg-gray-100 rounded"
                                    title="More Details"
                                    onClick={() => handleDetails(bug.bugId)}
                                >
                                    <FileSearch className="h-5 w-5 text-[#3450A3]"/>
                                </button>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
            <div className="flex justify-end mt-4 gap-1">
                {[1, 2, 3, 4, 5, 6, 7].map((page) => (
                    <button
                        key={page}
                        className={`px-3 py-1 border rounded hover:bg-gray-100 ${page === 1 ? 'bg-[#3450A3] text-white' : ''}`}
                    >
                        {page}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default BugsTable;
