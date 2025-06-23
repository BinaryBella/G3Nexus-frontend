// src/app/services/termsService.ts
import api from './api';
import { ApiResponse, TermsConditions } from '@/app/lib/types';

export const termsService = {
  // Get current terms and conditions
  getTerms: async (): Promise<TermsConditions> => {
    try {
      const response = await api.get<ApiResponse<TermsConditions>>('/terms');

      if (!response.data.status) {
        throw new Error(response.data.error || 'Failed to fetch terms and conditions');
      }

      return response.data.data;
    } catch (error) {
      throw error;
    }
  },

  // Add new terms
  addTerms: async (content: string): Promise<TermsConditions> => {
    try {
      const response = await api.post<ApiResponse<TermsConditions>>('/terms', { content });

      if (!response.data.status) {
        throw new Error(response.data.error || 'Failed to add terms and conditions');
      }

      return response.data.data;
    } catch (error) {
      throw error;
    }
  },

  // Update terms
  updateTerms: async (tcId: number, content: string): Promise<TermsConditions> => {
    try {
      const response = await api.put<ApiResponse<TermsConditions>>(`/terms/${tcId}`, { content });

      if (!response.data.status) {
        throw new Error(response.data.error || 'Failed to update terms and conditions');
      }

      return response.data.data;
    } catch (error) {
      throw error;
    }
  }
};
