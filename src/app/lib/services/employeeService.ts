// src/app/services/employeeService.ts
import api from './api';
import { ApiResponse, Employee, EmployeeEditPayload } from '@/app/lib/types';

// Re-export Employee interface for convenience
export type { Employee };

export const employeeService = {

  getAllEmployees: async (): Promise<Employee[]> => {
    try {
      const response = await api.get<ApiResponse<Employee[]>>('/Employee');

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
      const response = await api.get<ApiResponse<Employee>>(`/Employee/${id}`);

      if (!response.data.status) {
        throw new Error(response.data.error || 'Failed to fetch employee');
      }

      return response.data.data;
    } catch (error) {
      throw error;
    }
  },

  // Get employee by email
  getEmployeeByEmail: async (email: string): Promise<Employee> => {
    try {
      // Get all employees and find the one with matching email
      const employees = await employeeService.getAllEmployees();
      const employee = employees.find(e => e.email.toLowerCase() === email.toLowerCase());
      
      if (!employee) {
        throw new Error('Employee not found');
      }

      return employee;
    } catch (error) {
      throw error;
    }
  },

  // Add new employee
  addEmployee: async (employeeData: Omit<Employee, 'employeeId'>): Promise<Employee> => {
    try {
      const response = await api.post<ApiResponse<Employee>>('/Employee', employeeData);

      if (!response.data.status) {
        throw new Error(response.data.error || 'Failed to add employee');
      }

      return response.data.data;
    } catch (error) {
      throw error;
    }
  },

  // Update employee
  updateEmployee: async (employeeData: EmployeeEditPayload): Promise<EmployeeEditPayload> => {
    try {
      const response = await api.put<ApiResponse<EmployeeEditPayload>>(`/Employee`, employeeData);

      if (!response.data.status) {
        throw new Error(response.data.error || 'Failed to update employee');
      }

      return response.data.data;
    } catch (error) {
      throw error;
    }
  },

  // Update employee password
  updateEmployeePassword: async (employeeId: number, passwordData: { oldPassword: string; newPassword: string }): Promise<boolean> => {
    try {
      // Get current employee data first
      const currentEmployee = await employeeService.getEmployeeById(employeeId);
      
      // Prepare update payload with new password
      const updateData: EmployeeEditPayload = {
        employeeId: employeeId,
        name: currentEmployee.name,
        contactNo: currentEmployee.contactNo,
        email: currentEmployee.email,
        address: currentEmployee.address,
        profileImageUrl: currentEmployee.profileImageUrl || '',
        role: currentEmployee.role,
        isActive: currentEmployee.isActive,
        password: passwordData.newPassword
      };

      const response = await api.put<ApiResponse<EmployeeEditPayload>>(`/Employee`, updateData);

      if (!response.data.status) {
        throw new Error(response.data.error || 'Failed to update password');
      }

      return true;
    } catch (error) {
      throw error;
    }
  },

  // Delete employee
  deleteEmployee: async (id: number): Promise<boolean> => {
    try {
      const response = await api.delete<ApiResponse<boolean>>(`/Employee/${id}`);

      if (!response.data.status) {
        throw new Error(response.data.error || 'Failed to delete employee');
      }

      return response.data.data;
    } catch (error) {
      throw error;
    }
  },

  // Check if employee exists by email
  checkEmployeeExists: async (email: string): Promise<boolean> => {
    try {
      const employees = await employeeService.getAllEmployees();
      return employees.some(employee => 
        employee.email.toLowerCase().trim() === email.toLowerCase().trim()
      );
    } catch (error) {
      throw error;
    }
  },

  // Get assigned projects
  getAssignedProjects: async () => {
    try {
      const response = await api.get('/Employee/projects');

      if (!response.data.status) {
        throw new Error(response.data.error || 'Failed to fetch assigned projects');
      }

      return response.data.data;
    } catch (error) {
      throw error;
    }
  }
};
