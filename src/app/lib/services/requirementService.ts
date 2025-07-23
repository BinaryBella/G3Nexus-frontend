// src/app/services/requirementService.ts
import api from './api';
import { ApiResponse, Requirement } from '@/app/lib/types';
import { authService } from './api';

export const requirementService = {
  // Get all requirements
  getAllRequirements: async (): Promise<Requirement[]> => {
    try {
      const { accessToken } = authService.getTokens();
      if (!accessToken) throw new Error('Access token is missing');

      const payload = JSON.parse(atob(accessToken.split('.')[1]));
      const userId = payload?.employeeId || payload?.clientId;
      const lastLogin = payload?.lastLoginTime || new Date().toISOString();

      const response = await api.get<ApiResponse<Requirement[]>>('/Requirement', {
        params: { userId, lastLogin },
      });

      if (!response.data.status) {
        throw new Error(response.data.error || 'Failed to fetch requirements');
      }

      return response.data.data;
    } catch (error) {
      console.error('Error fetching all requirements:', error);
      throw error;
    }
  },

  // Get requirements by project
  getRequirementsByProject: async (projectId: number): Promise<Requirement[]> => {
    try {
      const response = await api.get<ApiResponse<Requirement[]>>('/Requirement');

      if (!response.data.status) {
        throw new Error(response.data.error || 'Failed to fetch requirements');
      }

      return response.data.data.filter(req => req.projectId === projectId);
    } catch (error) {
      console.error('Error fetching requirements by project:', error);
      throw error;
    }
  },

  // Get requirements by client
  getRequirementsByClient: async (clientEmail: string): Promise<Requirement[]> => {
    try {
      const projectsResponse = await api.get<ApiResponse<any[]>>(`/Project/client/${clientEmail}`);
      if (!projectsResponse.data.status) {
        throw new Error(projectsResponse.data.error || 'Failed to fetch client projects');
      }

      const projectIds = projectsResponse.data.data.map(project => project.projectId);

      const requirementsResponse = await api.get<ApiResponse<Requirement[]>>('/Requirement');
      if (!requirementsResponse.data.status) {
        throw new Error(requirementsResponse.data.error || 'Failed to fetch requirements');
      }

      return requirementsResponse.data.data.filter(req => projectIds.includes(req.projectId));
    } catch (error) {
      console.error('Error fetching requirements by client:', error);
      throw error;
    }
  },

  // Get requirement by ID
  getRequirementById: async (id: number): Promise<Requirement> => {
    try {
      const response = await api.get<ApiResponse<Requirement>>(`/Requirement/${id}`);
      if (!response.data.status) {
        throw new Error(response.data.error || 'Failed to fetch requirement');
      }

      return response.data.data;
    } catch (error) {
      console.error('Error fetching requirement by ID:', error);
      throw error;
    }
  },

  // Add requirement
  addRequirement: async (requirementData: Omit<Requirement, 'requirementId'>): Promise<Requirement> => {
    try {
      const response = await api.post<ApiResponse<Requirement>>('/Requirement', requirementData);
      if (!response.data.status) {
        throw new Error(response.data.error || 'Failed to add requirement');
      }

      return response.data.data;
    } catch (error) {
      console.error('Error adding requirement:', error);
      throw error;
    }
  },

  // Update requirement
  updateRequirement: async (id: number, requirementData: Partial<Omit<Requirement, 'requirementId'>>): Promise<Requirement> => {
    try {
      const response = await api.put<ApiResponse<Requirement>>(`/Requirement/${id}`, requirementData);
      if (!response.data.status) {
        throw new Error(response.data.error || 'Failed to update requirement');
      }

      return response.data.data;
    } catch (error) {
      console.error('Error updating requirement:', error);
      throw error;
    }
  },

  // Delete requirement
  deleteRequirement: async (id: number): Promise<boolean> => {
    try {
      const response = await api.delete<ApiResponse<boolean>>(`/Requirement/${id}`);
      if (!response.data.status) {
        throw new Error(response.data.error || 'Failed to delete requirement');
      }

      return response.data.data;
    } catch (error) {
      console.error('Error deleting requirement:', error);
      throw error;
    }
  },

  // Upload requirement attachment
  uploadAttachment: async (requirementId: number, file: File): Promise<string> => {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await api.post<ApiResponse<string>>(
        `/Requirement/${requirementId}/attachment`,
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
      console.error('Error uploading attachment:', error);
      throw error;
    }
  },

  // Mark requirement as viewed
  markAsViewed: async (requirementId: number): Promise<void> => {
    try {
      const { accessToken } = authService.getTokens();
      if (!accessToken) throw new Error('Access token is missing');

      await api.put(`/Requirement/MarkAsViewed/${requirementId}`, {}, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
    } catch (error) {
      console.error('Error marking requirement as viewed:', error);
      throw error;
    }
  },
};