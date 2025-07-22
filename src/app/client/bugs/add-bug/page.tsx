"use client";

import React, { useState, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Bug, Plus, Upload, X, AlertTriangle, Save } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { bugService } from '@/app/lib/services/bugService';
import { projectService } from '@/app/lib/services/projectService';
import { clientService } from '@/app/lib/services/clientService';
import { useAuth } from '@/app/contexts/AuthContext';

interface BugFormData {
  bugTitle: string;
  severity: string;
  bugDescription: string;
  attachment: string;
  isActive: boolean;
  clientId: number;
  projectId: number;
}

export default function AddBugPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  const projectIdParam = searchParams.get('projectId');
  const projectId = projectIdParam ? parseInt(projectIdParam, 10) : null;

  const [formData, setFormData] = useState<BugFormData>({
    bugTitle: '',
    severity: 'Medium',
    bugDescription: '',
    attachment: '',
    isActive: true,
    clientId: 0,
    projectId: projectId || 0
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Fetch client data to get clientId
  // Alternative approach: Use existing client data from auth context or fetch differently
  const { data: clientData } = useQuery({
    queryKey: ['client', user?.email],
    queryFn: async () => {
      // If your clientService doesn't have getClientByEmail, try this approach:
      try {
        return await clientService.getClientByEmail(user?.email || '');
      } catch (error) {
        // Alternative: get client data from user context or use a different endpoint
        console.error('Error fetching client data:', error);
        // Return a default or handle differently based on your API
        throw error;
      }
    },
    enabled: !!user?.email,
  });

  // Fetch project details if projectId is provided
  const { data: project } = useQuery({
    queryKey: ['project', projectId],
    queryFn: () => projectService.getProjectById(projectId!),
    enabled: !!projectId,
  });

  // Fetch all projects for the client
  const { data: projects = [] } = useQuery({
    queryKey: ['projects', user?.email],
    queryFn: () => projectService.getProjectsByClient(user?.email || ''),
    enabled: !!user?.email && !projectId,
  });

  // Update clientId when clientData is available
//   React.useEffect(() => {
//     if (clientData) {
//       setFormData(prev => ({ ...prev, clientId: clientData.clientId }));
//     }
//   }, [clientData]);

  const addBugMutation = useMutation({
    mutationFn: (bugData: Omit<BugFormData, 'bugId'>) => bugService.addBug(bugData),
    onSuccess: () => {
      // Invalidate and refetch bugs
      queryClient.invalidateQueries({ queryKey: ['bugs'] });
      
      // Navigate back to bugs list
      if (projectId) {
        router.push(`/client/bugs?projectId=${projectId}`);
      } else {
        router.push('/client/bugs');
      }
    },
    onError: (error: any) => {
      console.error('Error adding bug:', error);
      setErrors({ submit: error.message || 'Failed to add bug' });
    }
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        setErrors(prev => ({ ...prev, attachment: 'Please select a valid image file (JPEG, PNG, GIF, WebP)' }));
        return;
      }

      // Validate file size (5MB limit)
      const maxSize = 5 * 1024 * 1024;
      if (file.size > maxSize) {
        setErrors(prev => ({ ...prev, attachment: 'File size must be less than 5MB' }));
        return;
      }

      setSelectedFile(file);
      setFormData(prev => ({ ...prev, attachment: file.name }));
      
      // Create preview URL
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      
      // Clear any previous errors
      setErrors(prev => ({ ...prev, attachment: '' }));
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    setFormData(prev => ({ ...prev, attachment: '' }));
    setPreviewUrl('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.bugTitle.trim()) {
      newErrors.bugTitle = 'Bug title is required';
    }

    if (!formData.bugDescription.trim()) {
      newErrors.bugDescription = 'Bug description is required';
    }

    if (!formData.projectId) {
      newErrors.projectId = 'Project is required';
    }

    if (!formData.clientId) {
      newErrors.clientId = 'Client information is missing';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      // For now, we'll just use the filename as attachment
      // In a real implementation, you'd upload the file first and get the URL
      const bugData = {
        ...formData,
        attachment: selectedFile ? selectedFile.name : ''
      };

      addBugMutation.mutate(bugData);
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  const handleCancel = () => {
    if (projectId) {
      router.push(`/client/bugs?projectId=${projectId}`);
    } else {
      router.push('/client/bugs');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-8">
        {/* Breadcrumb */}
        <div className="mb-4">
          <button
            onClick={handleCancel}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center gap-2"
          >
            ← Back to {projectId ? 'Project ' : ''}Bugs
          </button>
        </div>

        <div className="flex items-center gap-3 mb-2">
          <Bug className="h-8 w-8 text-[#3450A3]" />
          <h1 className="text-3xl font-bold text-gray-900">Add New Bug</h1>
        </div>
        <p className="text-gray-600">
          {projectId && project
            ? `Report a new bug for ${project.projectName}`
            : 'Report a new bug in your project'
          }
        </p>
      </div>

      {/* Form */}
      <div className="max-w-4xl mx-auto">
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border p-8">
          {/* Bug Title */}
          <div className="mb-6">
            <label htmlFor="bugTitle" className="block text-sm font-medium text-gray-700 mb-2">
              Bug Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="bugTitle"
              name="bugTitle"
              value={formData.bugTitle}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.bugTitle ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Enter a descriptive title for the bug"
            />
            {errors.bugTitle && (
              <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                <AlertTriangle className="h-4 w-4" />
                {errors.bugTitle}
              </p>
            )}
          </div>

          {/* Project Selection (if not pre-selected) */}
          {!projectId && (
            <div className="mb-6">
              <label htmlFor="projectId" className="block text-sm font-medium text-gray-700 mb-2">
                Project <span className="text-red-500">*</span>
              </label>
              <select
                id="projectId"
                name="projectId"
                value={formData.projectId}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.projectId ? 'border-red-300' : 'border-gray-300'
                }`}
              >
                <option value={0}>Select a project</option>
                {projects.map((project: any) => (
                  <option key={project.projectId} value={project.projectId}>
                    {project.projectName}
                  </option>
                ))}
              </select>
              {errors.projectId && (
                <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                  <AlertTriangle className="h-4 w-4" />
                  {errors.projectId}
                </p>
              )}
            </div>
          )}

          {/* Severity */}
          <div className="mb-6">
            <label htmlFor="severity" className="block text-sm font-medium text-gray-700 mb-2">
              Severity <span className="text-red-500">*</span>
            </label>
            <select
              id="severity"
              name="severity"
              value={formData.severity}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
          </div>

          {/* Bug Description */}
          <div className="mb-6">
            <label htmlFor="bugDescription" className="block text-sm font-medium text-gray-700 mb-2">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              id="bugDescription"
              name="bugDescription"
              rows={6}
              value={formData.bugDescription}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.bugDescription ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Describe the bug in detail. Include steps to reproduce, expected behavior, and actual behavior."
            />
            {errors.bugDescription && (
              <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                <AlertTriangle className="h-4 w-4" />
                {errors.bugDescription}
              </p>
            )}
          </div>

          {/* File Attachment */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Attachment (Optional)
            </label>
            
            {!selectedFile ? (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                <div className="text-center">
                  <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600 mb-2">Upload a screenshot or file</p>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    Choose File
                  </button>
                  <p className="text-xs text-gray-500 mt-1">PNG, JPG, GIF up to 5MB</p>
                </div>
              </div>
            ) : (
              <div className="border border-gray-300 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-gray-900">Selected File:</span>
                  <button
                    type="button"
                    onClick={removeFile}
                    className="text-red-600 hover:text-red-800"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                
                {previewUrl && (
                  <div className="mb-3">
                    <img
                      src={previewUrl}
                      alt="Preview"
                      className="max-w-full h-32 object-cover rounded border"
                    />
                  </div>
                )}
                
                <p className="text-sm text-gray-600">{selectedFile.name}</p>
                <p className="text-xs text-gray-500">
                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            )}
            
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
            
            {errors.attachment && (
              <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                <AlertTriangle className="h-4 w-4" />
                {errors.attachment}
              </p>
            )}
          </div>

          {/* Status */}
          <div className="mb-8">
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                name="isActive"
                checked={formData.isActive}
                onChange={handleInputChange}
                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700">Mark as Active</span>
            </label>
            <p className="text-xs text-gray-500 mt-1">Active bugs will appear in open bugs list</p>
          </div>

          {/* Error Message */}
          {errors.submit && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                {errors.submit}
              </p>
            </div>
          )}

          {/* Form Actions */}
          <div className="flex justify-end gap-4 pt-6 border-t">
            <button
              type="button"
              onClick={handleCancel}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
              disabled={addBugMutation.isPending}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={addBugMutation.isPending}
              className="px-6 py-2 bg-[#3450A3] hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {addBugMutation.isPending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Adding Bug...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Add Bug
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}