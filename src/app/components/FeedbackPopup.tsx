'use client';

import React from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  type?: 'info' | 'success' | 'error' | 'warning';
  title?: string;
  confirmButtonText?: string;
  onConfirm?: () => void;
}

const FeedbackPopup = ({
  isOpen,
  onClose,
  children = 'Notice',
  type = 'info',
  title,
  confirmButtonText = 'Close',
  onConfirm
}: ModalProps) => {
  if (!isOpen) return null;

  // Define colors based on modal type
  let titleText = title;
  let iconElement = null;
  let textColor = 'text-blue-600';
  let buttonColor = 'bg-blue-600 hover:bg-blue-700';

  if (type === 'success') {
    titleText = title || 'Success';
    iconElement = (
      <svg className="w-5 h-5 text-[#2b4b93]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
      </svg>
    );
    textColor = 'text-[#2b4b93]';
    buttonColor = 'bg-[#2b4b93] hover:bg-blue-700';
  } else if (type === 'error') {
    titleText = title || 'Error';
    iconElement = (
      <svg className="w-5 h-5 text-[#2b4b93]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
      </svg>
    );
    textColor = 'text-[#2b4b93]';
    buttonColor = 'bg-[#2b4b93] hover:bg-blue-700';
  } else if (type === 'warning') {
    titleText = title || 'Warning';
    iconElement = (
      <svg className="w-5 h-5 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
      </svg>
    );
    textColor = 'text-yellow-600';
    buttonColor = 'bg-yellow-600 hover:bg-yellow-700';
  } else {
    // Default info
    titleText = title || 'Information';
    iconElement = (
      <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
      </svg>
    );
  }

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
        onClose();
    }
  };

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm();
    } else {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
        <div className="flex justify-between items-center mb-4">
          <h3 className={`text-lg font-semibold flex items-center gap-2 ${textColor}`}>
            {iconElement}
            {titleText}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mb-6">
          <div className="text-gray-600">
            {children}
          </div>
        </div>

        <div className="flex justify-end space-x-3">
          <button
            onClick={handleConfirm}
            className={`px-4 py-2 ${buttonColor} text-white rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#2b4b93]`}
          >
            {confirmButtonText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default FeedbackPopup;
