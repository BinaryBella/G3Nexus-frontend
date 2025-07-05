// src/app/components/ProjectCard.tsx
'use client';

import { useRouter } from 'next/navigation';

interface ProjectCardProps {
    id?: string;
    title: string;
    description: string;
    status?: string;
    createdAt?: string;
}

const ProjectCard = ({ id = '1', title, description, status = 'Active', createdAt }: ProjectCardProps) => {
    const router = useRouter();

    const handleClick = () => {
        router.push(`/client/projects/${id}`);
    };

    // Function to get status color classes
    const getStatusColor = (status: string) => {
        switch (status?.toLowerCase()) {
            case 'active':
            case 'in progress':
            case 'ongoing':
                return 'bg-green-100 text-green-800';
            case 'completed':
            case 'done':
                return 'bg-blue-100 text-blue-800';
            case 'on hold':
            case 'paused':
                return 'bg-yellow-100 text-yellow-800';
            case 'cancelled':
            case 'terminated':
                return 'bg-red-100 text-red-800';
            case 'pending':
            case 'waiting':
                return 'bg-gray-100 text-gray-800';
            default:
                return 'bg-green-100 text-green-800';
        }
    };

    return (
        <div
            onClick={handleClick}
            className="bg-white rounded-lg shadow-md p-6 cursor-pointer transition-all duration-300 hover:shadow-lg hover:transform hover:-translate-y-1 border border-gray-200"
        >
            <div className="flex flex-col h-48">
                <h3 className="text-xl font-semibold text-[#3450A3] mb-3 line-clamp-2">{title}</h3>
                <p className="text-gray-600 text-sm mb-4 flex-grow line-clamp-3">{description}</p>

                <div className="flex justify-between items-center mt-auto">
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${getStatusColor(status)}`}>
                        {status}
                    </span>
                    {createdAt && (
                        <span className="text-xs text-gray-500">
                            Created: {createdAt}
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProjectCard;
