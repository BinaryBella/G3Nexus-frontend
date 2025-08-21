// src/app/services/requirementService.ts
import api from './api';
import { ApiResponse, Requirement, RequirementListItem, QuotationRequest, BulkQuotationRequest } from '@/app/lib/types';
import { authService } from './api';
import { stringToStatusNumber } from '@/app/lib/utils/statusUtils';

export const requirementService = {
  // Get all requirements
  getAllRequirements: async (): Promise<RequirementListItem[]> => {
    try {
      const { accessToken } = authService.getTokens();
      if (!accessToken) throw new Error('Access token is missing');

      const payload = JSON.parse(atob(accessToken.split('.')[1]));
      const userId = payload?.employeeId || payload?.clientId;
      const lastLogin = payload?.lastLoginTime || new Date().toISOString();

      const response = await api.get<ApiResponse<RequirementListItem[]>>('/Requirement', {
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
  getRequirementsByProject: async (projectId: number): Promise<RequirementListItem[]> => {
    try {
      const response = await api.get<ApiResponse<RequirementListItem[]>>('/Requirement');

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
  getRequirementsByClient: async (clientEmail: string): Promise<RequirementListItem[]> => {
    try {
      const projectsResponse = await api.get<ApiResponse<any[]>>(`/Project/client/${clientEmail}`);
      if (!projectsResponse.data.status) {
        throw new Error(projectsResponse.data.error || 'Failed to fetch client projects');
      }

      const projectIds = projectsResponse.data.data.map(project => project.projectId);

      const requirementsResponse = await api.get<ApiResponse<RequirementListItem[]>>('/Requirement');
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
      // Ensure status is a number if it's a string
      const processedData = {
        ...requirementData,
        status: typeof requirementData.status === 'string' 
          ? stringToStatusNumber(requirementData.status) 
          : requirementData.status
      };

      const response = await api.post<ApiResponse<Requirement>>('/Requirement', processedData);
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
  updateRequirement: async (requirementData: Requirement): Promise<Requirement> => {
    try {
      const response = await api.put<ApiResponse<Requirement>>(`/Requirement`, requirementData);
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

  // Send single quotation
  sendQuotation: async (quotationData: QuotationRequest): Promise<boolean> => {
    try {
      const response = await api.post<ApiResponse<boolean>>('/Requirement/send-quotation', quotationData);
      if (!response.data.status) {
        throw new Error(response.data.error || 'Failed to send quotation');
      }

      return response.data.data;
    } catch (error) {
      console.error('Error sending quotation:', error);
      throw error;
    }
  },

  // Send bulk quotation
  sendBulkQuotation: async (quotationData: BulkQuotationRequest): Promise<boolean> => {
    try {
      const response = await api.post<ApiResponse<boolean>>('/Requirement/send-bulk-quotation', quotationData);
      if (!response.data.status) {
        throw new Error(response.data.error || 'Failed to send bulk quotation');
      }

      return response.data.data;
    } catch (error) {
      console.error('Error sending bulk quotation:', error);
      throw error;
    }
  },

  // Update requirement status
  updateRequirementStatus: async (requirementId: number, status: string): Promise<boolean> => {
    try {
      // First get the current requirement
      const currentRequirement = await requirementService.getRequirementById(requirementId);
      
      // Update the requirement with new status (convert string to number)
      const updatedRequirement: Requirement = {
        ...currentRequirement,
        status: stringToStatusNumber(status)
      };
      
      const response = await api.put<ApiResponse<Requirement>>('/Requirement', updatedRequirement);
      if (!response.data.status) {
        throw new Error(response.data.error || 'Failed to update requirement status');
      }

      // Trigger charts refresh
      if (typeof window !== 'undefined') {
        localStorage.setItem('requirementUpdated', Date.now().toString());
        window.dispatchEvent(new StorageEvent('storage', {
          key: 'requirementUpdated',
          newValue: Date.now().toString()
        }));
      }

      return true;
    } catch (error) {
      console.error('Error updating requirement status:', error);
      throw error;
    }
  }
};