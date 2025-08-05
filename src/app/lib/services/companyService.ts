// src/app/services/companyService.ts
import api from './api';
import { ApiResponse } from '@/app/lib/types';
import { Company } from '@/app/lib/types';
import { AxiosError } from "axios";


export const companyService = {
  // Get all companies
  getAllCompanies: async (): Promise<Company[]> => {
    try {
      const response = await api.get<ApiResponse<Company[]>>('/company');

      if (!response.data.status) {
        throw new Error(response.data.error || 'Failed to fetch companies');
      }

      return response.data.data;
    } catch (error) {
      throw error;
    }
  },

  // Get company by ID
  getCompanyById: async (id: number): Promise<Company> => {
    try {
      const response = await api.get<ApiResponse<Company>>(`/company/${id}`);

      if (!response.data.status) {
        throw new Error(response.data.error || 'Failed to fetch company');
      }

      return response.data.data;
    } catch (error) {
      throw error;
    }
  },

  // Add new company
  addCompany: async (companyData: Omit<Company, 'companyId'>): Promise<Company> => {
    try {
      const response = await api.post<ApiResponse<Company>>('/company', companyData);

      if (!response.data.status) {
        throw new Error(response.data.error || 'Failed to add company');
      }

      return response.data.data;
    } catch (error) {
      throw error;
    }
  },

  // Update company
  updateCompany: async (id: number, companyData: Omit<Company, 'companyId'>): Promise<Company> => {
    try {
      const updateData = {
        companyId: id,
        ...companyData
      };
      
      const response = await api.put<ApiResponse<Company>>(`/company`, updateData);

      if (!response.data.status) {
        throw new Error(response.data.error || 'Failed to update company');
      }

      return response.data.data;
    } catch (error) {
      throw error;
    }
  },

  // Delete company (soft delete by setting isActive to false)
  deleteCompany: async (id: number): Promise<{ status: boolean, message: string }> => {
    try {
      debugger;
      const response = await api.delete<ApiResponse<boolean>>(`/Company/${id}`);

      if (!response.data.status) {
        throw new Error(response.data.error || 'Failed to delete company');
      }

      return { status: true, message: response.data.message || 'Company deleted successfully' };
    } catch (error) {
      debugger;
      return { status: false, message: error instanceof AxiosError ? error.response!.data.message : 'Could not delete company.' };
    }
  },

  // Check if company exists by name
  checkCompanyExists: async (companyName: string): Promise<boolean> => {
    try {
      const companies = await companyService.getAllCompanies();
      return companies.some(company => 
        company.companyName.toLowerCase().trim() === companyName.toLowerCase().trim()
      );
    } catch (error) {
      throw error;
    }
  },
};
