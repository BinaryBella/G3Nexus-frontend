// src/app/services/bugService.ts
import api from './api';
import { ApiResponse, Bug } from '@/app/lib/types';

export const bugService = {
  // Get all bugs
  getAllBugs: async (): Promise<Bug[]> => {
    try {
      const response = await api.get<ApiResponse<Bug[]>>('/bug');
      
      if (!response.data.status) {
        throw new Error(response.data.error || 'Failed to fetch bugs');
      }
      
      return response.data.data;
    } catch (error) {
      throw error;
    }
  },
  
  // Get bugs by project
  getBugsByProject: async (projectId: number): Promise<Bug[]> => {
    try {
      const response = await api.get<ApiResponse<Bug[]>>(`/bug/project/${projectId}`);
      
      if (!response.data.status) {
        throw new Error(response.data.error || 'Failed to fetch bugs for project');
      }
      
      return response.data.data;
    } catch (error) {
      throw error;
    }
  },
  
  // Add bug
  addBug: async (bugData: Omit<Bug, 'bugId'>): Promise<Bug> => {
    try {
      const response = await api.post<ApiResponse<Bug>>('/bug', bugData);
      
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
      const response = await api.put<ApiResponse<Bug>>(`/bug/${id}`, bugData);
      
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
      const response = await api.delete<ApiResponse<boolean>>(`/bug/${id}`);
      
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
        `/bug/${bugId}/attachment`, 
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
