// src/app/components/ProjectCard.tsx
'use client';

import { useRouter } from 'next/navigation';
import { 
    CalendarDaysIcon, 
    ClockIcon, 
    CheckCircleIcon, 
    PlayCircleIcon,
    PauseCircleIcon,
    XCircleIcon,
    BoltIcon,
    EyeIcon
} from '@heroicons/react/24/outline';

interface ProjectCardProps {
    id?: string;
    title: string;
    description: string;
    status?: string;
    createdAt?: string;
    projectType?: string;
    budget?: number;
}

const ProjectCard = ({ 
    id = '1', 
    title, 
    description, 
    status = 'Active', 
    createdAt,
    projectType,
    budget 
}: ProjectCardProps) => {
    const router = useRouter();

    const handleClick = () => {
        router.push(`/client/projects/${id}`);
    };

    // Function to get status color classes and icons
    const getStatusConfig = (status: string) => {
        switch (status?.toLowerCase()) {
            case 'active':
            case 'in progress':
            case 'ongoing':
                return {
                    color: 'bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 border-green-200',
                    icon: PlayCircleIcon,
                    iconColor: 'text-green-600'
                };
            case 'completed':
            case 'done':
                return {
                    color: 'bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 border-blue-200',
                    icon: CheckCircleIcon,
                    iconColor: 'text-blue-600'
                };
            case 'planning':
            case 'pending':
            case 'waiting':
                return {
                    color: 'bg-gradient-to-r from-amber-50 to-yellow-50 text-amber-700 border-amber-200',
                    icon: ClockIcon,
                    iconColor: 'text-amber-600'
                };
            case 'on hold':
            case 'paused':
                return {
                    color: 'bg-gradient-to-r from-orange-50 to-red-50 text-orange-700 border-orange-200',
                    icon: PauseCircleIcon,
                    iconColor: 'text-orange-600'
                };
            case 'cancelled':
            case 'terminated':
                return {
                    color: 'bg-gradient-to-r from-red-50 to-pink-50 text-red-700 border-red-200',
                    icon: XCircleIcon,
                    iconColor: 'text-red-600'
                };
            default:
                return {
                    color: 'bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 border-green-200',
                    icon: PlayCircleIcon,
                    iconColor: 'text-green-600'
                };
        }
    };

    const statusConfig = getStatusConfig(status);
    const StatusIcon = statusConfig.icon;

    // Function to get project type color
    const getProjectTypeColor = (type?: string) => {
        if (!type) return 'bg-gray-100 text-gray-600';
        
        const hash = type.split('').reduce((acc, char) => char.charCodeAt(0) + acc, 0);
        const colors = [
            'bg-gray-100 text-blue-500',
            'bg-gray-100 text-blue-500',
            'bg-gray-100 text-blue-500',
            'bg-gray-100 text-blue-500',
            'bg-gray-100 text-blue-500',
            'bg-gray-100 text-blue-500'
        ];
        return colors[hash % colors.length];
    };

    // Format budget
    const formatBudget = (amount?: number) => {
        if (!amount) return null;
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount);
    };

    return (
        <div
            onClick={handleClick}
            className="group relative bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-500 cursor-pointer border border-gray-100 hover:border-gray-200 overflow-hidden transform hover:-translate-y-1"
        >
            {/* Gradient overlay on hover */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50/0 via-transparent to-purple-50/0 group-hover:from-blue-50/30 group-hover:to-purple-50/20 transition-all duration-500 rounded-2xl"></div>
            
            {/* Card content */}
            <div className="relative p-6">
                {/* Header with project type and view icon */}
                <div className="flex items-center justify-between mb-4">
                    {projectType && (
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold tracking-wide uppercase ${getProjectTypeColor(projectType)}`}>
                            {projectType}
                        </span>
                    )}
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <EyeIcon className="h-5 w-5 text-gray-400 group-hover:text-blue-500 transition-colors duration-300" />
                    </div>
                </div>

                {/* Project title */}
                <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-blue-600 transition-colors duration-300">
                    {title}
                </h3>

                {/* Project description */}
                <p className="text-gray-600 text-sm mb-6 line-clamp-3 leading-relaxed">
                    {description}
                </p>

                {/* Project details */}
                <div className="space-y-3">
                    {/* Status */}
                    <div className={`inline-flex items-center px-3 py-2 rounded-xl text-sm font-medium border ${statusConfig.color}`}>
                        <StatusIcon className={`h-4 w-4 mr-2 ${statusConfig.iconColor}`} />
                        {status}
                    </div>

                    {/* Bottom section with date and budget */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                        {createdAt && (
                            <div className="flex items-center text-gray-500">
                                <CalendarDaysIcon className="h-4 w-4 mr-2" />
                                <span className="text-xs font-medium">{createdAt}</span>
                            </div>
                        )}
                        
                        {budget && (
                            <div className="flex items-center">
                                <BoltIcon className="h-4 w-4 mr-1 text-amber-500" />
                                <span className="text-sm font-bold text-gray-900">{formatBudget(budget)}</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Hover effect accent */}
            <div className="absolute bottom-0 left-0 w-full h-1 bg-[#ffbf00] transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 ease-out"></div>
        </div>
    );
};

export default ProjectCard;
