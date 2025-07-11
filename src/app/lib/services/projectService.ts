// src/app/services/projectService.ts
import api from './api';
import { ApiResponse } from '@/app/lib/types';

// Define Project type to match backend response
export interface Project {
  projectId: number;
  projectName: string;
  projectType: string;
  projectSize: string;
  creationDate: string;
  projectDescription: string;
  estimatedBudget: number;
  actualStartDate: string;
  actualEndDate: string;
  totalBudget: number;
  paymentType: string;
  paymentStatus: string;
  status: string;
  isActive: boolean;
  companyId?: number; // Optional for backwards compatibility
}

export const projectService = {
  // Get all projects
  getAllProjects: async (): Promise<Project[]> => {
    try {
      const response = await api.get<ApiResponse<Project[]>>('/project');

      if (!response.data.status) {
        throw new Error(response.data.error || 'Failed to fetch projects');
      }

      return response.data.data;
    } catch (error) {
      throw error;
    }
  },

  // Get project by ID
  getProjectById: async (id: number): Promise<Project> => {
    try {
      const response = await api.get<ApiResponse<Project>>(`/project/${id}`);

      if (!response.data.status) {
        throw new Error(response.data.error || 'Failed to fetch project');
      }

      return response.data.data;
    } catch (error) {
      throw error;
    }
  },

  // Get projects by client
  getProjectsByClient: async (email: string): Promise<Project[]> => {
    try {
      const response = await api.get<ApiResponse<Project[]>>(`/project/client/${email}`);

      if (!response.data.status) {
        throw new Error(response.data.error || 'Failed to fetch projects for client');
      }

      return response.data.data;
    } catch (error) {
      throw error;
    }
  },

  // Add project
  addProject: async (projectData: Omit<Project, 'projectId'>): Promise<Project> => {
    try {
      const response = await api.post<ApiResponse<Project>>('/project', projectData);

      if (!response.data.status) {
        throw new Error(response.data.error || 'Failed to add project');
      }

      return response.data.data;
    } catch (error) {
      throw error;
    }
  },

  // Update project
  updateProject: async (id: number, projectData: Partial<Omit<Project, 'projectId'>>): Promise<Project> => {
    try {
      const response = await api.put<ApiResponse<Project>>(`/project/${id}`, projectData);

      if (!response.data.status) {
        throw new Error(response.data.error || 'Failed to update project');
      }

      return response.data.data;
    } catch (error) {
      throw error;
    }
  },

  // Delete project
  deleteProject: async (id: number): Promise<boolean> => {
    try {
      const response = await api.delete<ApiResponse<boolean>>(`/project/${id}`);

      if (!response.data.status) {
        throw new Error(response.data.error || 'Failed to delete project');
      }

      return response.data.data;
    } catch (error) {
      throw error;
    }
  }
};
