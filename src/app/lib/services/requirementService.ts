// src/app/services/requirementService.ts
import api from './api';
import { ApiResponse, Requirement } from '@/app/lib/types';

export const requirementService = {
  // Get all requirements
  getAllRequirements: async (): Promise<Requirement[]> => {
    try {
      const response = await api.get<ApiResponse<Requirement[]>>('/requirement');

      if (!response.data.status) {
        throw new Error(response.data.error || 'Failed to fetch requirements');
      }

      return response.data.data;
    } catch (error) {
      throw error;
    }
  },

  // Get requirements by project
  getRequirementsByProject: async (projectId: number): Promise<Requirement[]> => {
    try {
      const response = await api.get<ApiResponse<Requirement[]>>(`/requirement/project/${projectId}`);

      if (!response.data.status) {
        throw new Error(response.data.error || 'Failed to fetch requirements for project');
      }

      return response.data.data;
    } catch (error) {
      throw error;
    }
  },

  // Add requirement
  addRequirement: async (requirementData: Omit<Requirement, 'requirementId'>): Promise<Requirement> => {
    try {
      const response = await api.post<ApiResponse<Requirement>>('/requirement', requirementData);

      if (!response.data.status) {
        throw new Error(response.data.error || 'Failed to add requirement');
      }

      return response.data.data;
    } catch (error) {
      throw error;
    }
  },

  // Update requirement
  updateRequirement: async (id: number, requirementData: Partial<Omit<Requirement, 'requirementId'>>): Promise<Requirement> => {
    try {
      const response = await api.put<ApiResponse<Requirement>>(`/requirement/${id}`, requirementData);

      if (!response.data.status) {
        throw new Error(response.data.error || 'Failed to update requirement');
      }

      return response.data.data;
    } catch (error) {
      throw error;
    }
  },

  // Delete requirement
  deleteRequirement: async (id: number): Promise<boolean> => {
    try {
      const response = await api.delete<ApiResponse<boolean>>(`/requirement/${id}`);

      if (!response.data.status) {
        throw new Error(response.data.error || 'Failed to delete requirement');
      }

      return response.data.data;
    } catch (error) {
      throw error;
    }
  },

  // Upload requirement attachment
  uploadAttachment: async (requirementId: number, file: File): Promise<string> => {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await api.post<ApiResponse<string>>(
        `/requirement/${requirementId}/attachment`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      if (!response.data.status) {
        throw new Error(response.data.error || 'Failed to upload attachment');
      }

      return response.data.data;
    } catch (error) {
      throw error;
    }
  }
};
