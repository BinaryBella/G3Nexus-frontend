// src/app/services/bugService.ts
import api from './api';
import { ApiResponse, Bug } from '@/app/lib/types';
import { authService } from './api';

export const bugService = {
  // Get all bugs
  getAllBugs: async (): Promise<Bug[]> => {
    try {
      const { accessToken } = authService.getTokens();
      if (!accessToken) throw new Error('Access token is missing');

      const payload = JSON.parse(atob(accessToken.split('.')[1]));
      console.log('JWT Payload in bugService:', payload);
      
      // Check user role to determine how to fetch bugs
      const userRole = payload?.role || payload['Role'] || payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];
      
      // For company users, we might need to fetch all bugs without user filtering
      // For client users, we filter by clientId
      let apiUrl = '/Bug';
      let params = {};
      
      if (userRole && (userRole.includes('CLIENT') || userRole === 'CLIENT_ADMIN' || userRole === 'CLIENT_USER')) {
        // Client users - filter by clientId
        const userId = payload?.clientId || payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'];
        const lastLogin = payload?.lastLoginTime || new Date().toISOString();
        params = { userId, lastLogin };
      } else {
        // Company users - fetch all bugs (or filter by company if needed)
        // We might need to pass employeeId or companyId depending on backend logic
        const userId = payload?.employeeId || payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'];
        const lastLogin = payload?.lastLoginTime || new Date().toISOString();
        params = { userId, lastLogin };
      }

      console.log('Using role:', userRole, 'params:', params);

      const response = await api.get<ApiResponse<Bug[]>>(apiUrl, { params });

      console.log('Bug API response:', response.data);

      if (!response.data.status) {
        throw new Error(response.data.error || 'Failed to fetch bugs');
      }

      return response.data.data;
    } catch (error) {
      console.error('Error fetching all bugs:', error);
      throw error;
    }
  },

  // Get bugs by project
  getBugsByProject: async (projectId: number): Promise<Bug[]> => {
    try {
      // First try to get all bugs and filter by projectId
      const response = await api.get<ApiResponse<Bug[]>>('/Bug');
      
      if (!response.data.status) {
        throw new Error(response.data.error || 'Failed to fetch bugs');
      }
      
      // Filter bugs by projectId
      const filteredBugs = response.data.data.filter(bug => bug.projectId === projectId);
      return filteredBugs;
    } catch (error) {
      throw error;
    }
  },

  // Get bugs by client (filter bugs for projects associated with client)
  getBugsByClient: async (clientEmail: string): Promise<Bug[]> => {
    try {
      // First get client's projects
      const projectsResponse = await api.get<ApiResponse<any[]>>(`/Project/client/${clientEmail}`);
      
      if (!projectsResponse.data.status) {
        throw new Error(projectsResponse.data.error || 'Failed to fetch client projects');
      }

      const clientProjects = projectsResponse.data.data;
      const projectIds = clientProjects.map(project => project.projectId);

      // Then get all bugs and filter by client project IDs
      const bugsResponse = await api.get<ApiResponse<Bug[]>>('/Bug');
      
      if (!bugsResponse.data.status) {
        throw new Error(bugsResponse.data.error || 'Failed to fetch bugs');
      }

      // Filter bugs that belong to client's projects
      const filteredBugs = bugsResponse.data.data.filter(bug => 
        projectIds.includes(bug.projectId)
      );

      return filteredBugs;
    } catch (error) {
      throw error;
    }
  },
  
  // Add bug
  addBug: async (bugData: Omit<Bug, 'bugId'>): Promise<Bug> => {
    try {
      const response = await api.post<ApiResponse<Bug>>('/Bug', bugData);
      
      if (!response.data.status) {
        throw new Error(response.data.error || 'Failed to add bug');
      }
      
      return response.data.data;
    } catch (error) {
      throw error;
    }
  },
  
  // Update bug
  updateBug: async (id: number, bugData: Partial<Omit<Bug, 'bugId'>>): Promise<Bug> => {
    try {
      const response = await api.put<ApiResponse<Bug>>(`/Bug/${id}`, bugData);
      
      if (!response.data.status) {
        throw new Error(response.data.error || 'Failed to update bug');
      }
      
      return response.data.data;
    } catch (error) {
      throw error;
    }
  },
  
  // Delete bug
  deleteBug: async (id: number): Promise<boolean> => {
    try {
      const response = await api.delete<ApiResponse<boolean>>(`/Bug/${id}`);
      
      if (!response.data.status) {
        throw new Error(response.data.error || 'Failed to delete bug');
      }
      
      return response.data.data;
    } catch (error) {
      throw error;
    }
  },
  
  // Upload bug attachment
  uploadAttachment: async (bugId: number, file: File): Promise<string> => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await api.post<ApiResponse<string>>(
        `/Bug/${bugId}/attachment`, 
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
  },

  // Get client by email - add this method if it doesn't exist in clientService
  getClientByEmail: async (email: string): Promise<{ clientId: number; name: string; email: string }> => {
    try {
      const response = await api.get<ApiResponse<{ clientId: number; name: string; email: string }>>(`/Client/email/${email}`);
      
      if (!response.data.status) {
        throw new Error(response.data.error || 'Failed to fetch client data');
      }
      
      return response.data.data;
    } catch (error) {
      throw error;
    }
  },

    // Mark requirement as viewed
  markAsViewed: async (bugId: number): Promise<void> => {
    try {
      const { accessToken } = authService.getTokens();
      if (!accessToken) throw new Error('Access token is missing');

      await api.put(`/Bug/MarkAsViewed/${bugId}`, {}, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
    } catch (error) {
      console.error('Error marking bug as viewed:', error);
      throw error;
    }
  },
};