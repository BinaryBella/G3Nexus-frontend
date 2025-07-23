// src/app/services/requirementService.ts
import api from './api';
import { ApiResponse, Requirement } from '@/app/lib/types';
import { authService } from './api';

export const requirementService = {
  // Get all requirements
  getAllRequirements: async (): Promise<Requirement[]> => {
    try {
      const { accessToken } = authService.getTokens();
      if (!accessToken) throw new Error('No access token available');

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
      throw error;
    }
  },

  // Get requirements by project
  getRequirementsByProject: async (projectId: number): Promise<Requirement[]> => {
    try {
      // First try to get all requirements and filter by projectId
      console.log(`Fetching requirements for project ID: ${projectId}`);
      const response = await api.get<ApiResponse<Requirement[]>>('/Requirement');
      
      if (!response.data.status) {
        throw new Error(response.data.error || 'Failed to fetch requirements');
      }

      // Filter requirements by projectId
      const filteredRequirements = response.data.data.filter(req => {
        console.log(`Requirement ${req.requirementId}: projectId = ${req.projectId}, target = ${projectId}`);
        return req.projectId === projectId;
      });

      console.log(`Found ${filteredRequirements.length} requirements for project ${projectId}`);
      return filteredRequirements;
    } catch (error) {
      console.error('Error fetching requirements by project:', error);
      throw error;
    }
  },

  // Get requirements by client (filter requirements for projects associated with client)
  getRequirementsByClient: async (clientEmail: string): Promise<Requirement[]> => {
    try {
      // First get client's projects
      const projectsResponse = await api.get<ApiResponse<any[]>>(`/Project/client/${clientEmail}`);
      
      if (!projectsResponse.data.status) {
        throw new Error(projectsResponse.data.error || 'Failed to fetch client projects');
      }

      const clientProjects = projectsResponse.data.data;
      const projectIds = clientProjects.map(project => project.projectId);

      // Then get all requirements and filter by client project IDs
      const requirementsResponse = await api.get<ApiResponse<Requirement[]>>('/Requirement');
      
      if (!requirementsResponse.data.status) {
        throw new Error(requirementsResponse.data.error || 'Failed to fetch requirements');
      }

      // Filter requirements that belong to client's projects
      const filteredRequirements = requirementsResponse.data.data.filter(requirement => 
        projectIds.includes(requirement.projectId)
      );

      return filteredRequirements;
    } catch (error) {
      throw error;
    }
  },

  // Get requirement by ID
  getRequirementById: async (id: number): Promise<Requirement> => {
    try {
      const response = await api.get<ApiResponse<Requirement>>(`/requirement/${id}`);

      if (!response.data.status) {
        throw new Error(response.data.error || 'Failed to fetch requirement');
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
