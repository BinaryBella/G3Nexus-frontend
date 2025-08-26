import React from 'react';

export default function LoadingSpinner() {
    return (
        <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[#F5B316] border-opacity-80"></div>
        </div>
    );
}
