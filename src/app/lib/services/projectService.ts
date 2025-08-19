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
  clientName?: string;
  clientEmail?: string;
  quotationCost?: {
    advancePayment: number;
    developmentCost: number;
    hostingAndDomain: number;
    sslCertificate: number;
    serverCost: number;
    deploymentCost: number;
  };
}

export const projectService = {
  // Get all projects
  getAllProjects: async (): Promise<Project[]> => {
    try {
      const response = await api.get<ApiResponse<Project[]>>('/Project');

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
      const response = await api.get<ApiResponse<Project>>(`/Project/${id}`);

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
      const response = await api.get<ApiResponse<Project[]>>(`/Project/client/${email}`);

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
      const response = await api.post<ApiResponse<Project>>('/Project', projectData);

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
      // First fetch the existing project data
      const existingProject = await projectService.getProjectById(id);
      
      // Merge existing data with updates - prioritize new data over existing
      const updatePayload = {
        projectId: id,
        projectName: projectData.projectName || existingProject.projectName,
        projectType: projectData.projectType || existingProject.projectType,
        projectSize: projectData.projectSize || existingProject.projectSize,
        creationDate: projectData.creationDate || existingProject.creationDate,
        projectDescription: projectData.projectDescription !== undefined ? projectData.projectDescription : (existingProject.projectDescription || ""),
        estimatedBudget: projectData.estimatedBudget !== undefined ? projectData.estimatedBudget : existingProject.estimatedBudget,
        actualStartDate: projectData.actualStartDate !== undefined ? projectData.actualStartDate : existingProject.actualStartDate,
        actualEndDate: projectData.actualEndDate !== undefined ? projectData.actualEndDate : existingProject.actualEndDate,
        totalBudget: projectData.totalBudget !== undefined ? projectData.totalBudget : existingProject.totalBudget,
        paymentType: projectData.paymentType || existingProject.paymentType || "Advance Payment",
        paymentStatus: projectData.paymentStatus || existingProject.paymentStatus || "Pending",
        status: projectData.status || existingProject.status,
        isActive: projectData.isActive !== undefined ? projectData.isActive : existingProject.isActive,
        companyId: projectData.companyId || existingProject.companyId,
        clientName: projectData.clientName !== undefined ? projectData.clientName : (existingProject.clientName || ""),
        clientEmail: projectData.clientEmail !== undefined ? projectData.clientEmail : (existingProject.clientEmail || ""),
        quotationCost: projectData.quotationCost || existingProject.quotationCost || {
          advancePayment: 0,
          developmentCost: 0,
          hostingAndDomain: 0,
          sslCertificate: 0,
          serverCost: 0,
          deploymentCost: 0
        }
      };
      
      const response = await api.put<ApiResponse<Project>>('/Project', updatePayload);

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
      const response = await api.delete<ApiResponse<boolean>>(`/Project/${id}`);

      if (!response.data.status) {
        throw new Error(response.data.error || 'Failed to delete project');
      }

      return response.data.data;
    } catch (error) {
      throw error;
    }
  }
};
