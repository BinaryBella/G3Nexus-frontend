// src/app/services/employeeService.ts
import api from './api';
import { ApiResponse } from '@/app/lib/types';

// Define Employee type to match backend response
export interface Employee {
  employeeId: number;
  name: string;
  contactNo: string;
  email: string;
  address: string;
  password: string;
  role: string;
  isActive: boolean;
}

export const employeeService = {

  getAllEmployees: async (): Promise<Employee[]> => {
    try {
      const response = await api.get<ApiResponse<Employee[]>>('/employee');

      if (!response.data.status) {
        throw new Error(response.data.error || 'Failed to fetch employees');
      }

      return response.data.data;
    } catch (error) {
      throw error;
    }
  },

  // Get employee by ID
  getEmployeeById: async (id: number): Promise<Employee> => {
    try {
      const response = await api.get<ApiResponse<Employee>>(`/employee/${id}`);

      if (!response.data.status) {
        throw new Error(response.data.error || 'Failed to fetch employee');
      }

      return response.data.data;
    } catch (error) {
      throw error;
    }
  },

  // Add new employee
  addEmployee: async (employeeData: Omit<Employee, 'employeeId'>): Promise<Employee> => {
    try {
      const response = await api.post<ApiResponse<Employee>>('/employee', employeeData);

      if (!response.data.status) {
        throw new Error(response.data.error || 'Failed to add employee');
      }

      return response.data.data;
    } catch (error) {
      throw error;
    }
  },

  // Update employee
  updateEmployee: async (id: number, employeeData: Partial<Omit<Employee, 'employeeId'>>): Promise<Employee> => {
    try {
      const response = await api.put<ApiResponse<Employee>>(`/employee/${id}`, employeeData);

      if (!response.data.status) {
        throw new Error(response.data.error || 'Failed to update employee');
      }

      return response.data.data;
    } catch (error) {
      throw error;
    }
  },

  // Delete employee
  deleteEmployee: async (id: number): Promise<boolean> => {
    try {
      const response = await api.delete<ApiResponse<boolean>>(`/employee/${id}`);

      if (!response.data.status) {
        throw new Error(response.data.error || 'Failed to delete employee');
      }

      return response.data.data;
    } catch (error) {
      throw error;
    }
  },

  // Get assigned projects
  getAssignedProjects: async () => {
    try {
      const response = await api.get('/employee/projects');

      if (!response.data.status) {
        throw new Error(response.data.error || 'Failed to fetch assigned projects');
      }

      return response.data.data;
    } catch (error) {
      throw error;
    }
  }
};
