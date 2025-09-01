import { useQueryClient, useMutation } from "@tanstack/react-query";
import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { bugService } from "../lib/services/bugService";
import { normalizeStatus } from "../lib/utils/statusUtils";

interface BugStatusDropdownProps {
    bugId: number;
    currentStatus: string | number;
    canManage: boolean;
    onStatusUpdate?: () => void;
}

const BugStatusBadge = ({ status }: { status: string | number }) => {
    const normalizedStatus = normalizeStatus(status);
    const colorMap: Record<string, string> = {
        'Pending': "bg-gray-100 text-gray-800 border-gray-200",
        'In Progress': "bg-blue-100 text-blue-800 border-blue-200",
        'Under Review': "bg-yellow-100 text-yellow-800 border-yellow-200",
        'Complete': "bg-green-100 text-green-800 border-green-200"
    };

    const colorClass = colorMap[normalizedStatus] || "bg-gray-100 text-gray-800 border-gray-200";

    return (
        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${colorClass}`}>
            {normalizedStatus}
        </span>
    );
};

const BugStatusDropdown = ({ bugId, currentStatus, canManage, onStatusUpdate }: BugStatusDropdownProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [showError, setShowError] = useState(false);
    const queryClient = useQueryClient();
    
    const statusOptions = ['Pending', 'In Progress', 'Under Review', 'Complete'];
    const normalizedCurrentStatus = normalizeStatus(currentStatus);

    const updateStatusMutation = useMutation({
        mutationFn: async (newStatus: string) => {
            return await bugService.updateBugStatus(bugId, newStatus);
        },
        onSuccess: () => {
            // Invalidate and refetch bugs data
            queryClient.invalidateQueries({ queryKey: ['bugs'] });
            queryClient.invalidateQueries({ queryKey: ['bug', bugId] });
            setIsOpen(false);
            setShowSuccess(true);
            
            // Hide success message after 2 seconds
            setTimeout(() => setShowSuccess(false), 2000);
            
            if (onStatusUpdate) {
                onStatusUpdate();
            }
        },
        onError: (error) => {
            console.error('Failed to update bug status:', error);
            setShowError(true);
            
            // Hide error message after 3 seconds
            setTimeout(() => setShowError(false), 3000);
        },
        onSettled: () => {
            setIsUpdating(false);
        }
    });

    const handleStatusChange = async (newStatus: string) => {
        if (newStatus === normalizedCurrentStatus) {
            setIsOpen(false);
            return;
        }
        
        setIsUpdating(true);
        updateStatusMutation.mutate(newStatus);
    };

    if (!canManage) {
        return <BugStatusBadge status={currentStatus} />;
    }

    return (
        <div className="relative">
            {/* Success notification */}
            {showSuccess && (
                <div className="absolute -top-8 left-0 bg-green-500 text-white text-xs px-2 py-1 rounded shadow-lg z-30 whitespace-nowrap">
                    ✓ Status updated!
                </div>
            )}
            
            {/* Error notification */}
            {showError && (
                <div className="absolute -top-8 left-0 bg-red-500 text-white text-xs px-2 py-1 rounded shadow-lg z-30 whitespace-nowrap">
                    ✗ Update failed
                </div>
            )}
            
            <button
                onClick={() => setIsOpen(!isOpen)}
                disabled={isUpdating}
                className={`flex items-center gap-2 ${isUpdating ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'} rounded-md p-1 transition-all duration-200`}
                title={canManage ? "Click to change status" : "View only"}
            >
                <BugStatusBadge status={currentStatus} />
                {!isUpdating && <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />}
                {isUpdating && (
                    <div className="h-4 w-4 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
                )}
            </button>
            
            {isOpen && !isUpdating && (
                <>
                    {/* Backdrop to close dropdown */}
                    <div 
                        className="fixed inset-0 z-10" 
                        onClick={() => setIsOpen(false)}
                    />
                    
                    {/* Dropdown menu */}
                    <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-20 min-w-[140px]">
                        {statusOptions.map((status) => (
                            <button
                                key={status}
                                onClick={() => handleStatusChange(status)}
                                className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 first:rounded-t-md last:rounded-b-md transition-colors ${
                                    status === normalizedCurrentStatus ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-700'
                                }`}
                            >
                                {status === normalizedCurrentStatus && <span className="text-blue-500 mr-2">✓</span>}
                                {status}
                            </button>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};

export default BugStatusDropdown;
export { BugStatusBadge };
