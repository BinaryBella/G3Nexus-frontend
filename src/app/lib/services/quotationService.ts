// src/app/lib/services/quotationService.ts
import api from './api';
import { ApiResponse, QuotationHistory } from '@/app/lib/types';

export const quotationService = {
    // Get all quotations
    getAllQuotations: async (): Promise<QuotationHistory[]> => {
        try {
            const response = await api.get('/Quotation/all');
            
            // Handle different response structures
            if (Array.isArray(response.data)) {
                // Direct array response
                return response.data;
            } else if (response.data?.status && response.data?.data) {
                // Wrapped response
                return response.data.data;
            } else if (response.data?.data) {
                // Data property exists
                return response.data.data;
            }
            
            // Fallback - assume response.data is the array
            return response.data || [];
        } catch (error: any) {
            console.error('Error fetching all quotations:', error);
            throw new Error(error.response?.data?.message || error.message || 'Failed to fetch quotations');
        }
    },

    // Get quotation by ID
    getQuotationById: async (quotationId: number): Promise<QuotationHistory> => {
        try {
            const response = await api.get(`/Quotation/${quotationId}`);
            
            if (response.data?.status && response.data?.data) {
                return response.data.data;
            } else if (response.data?.data) {
                return response.data.data;
            }
            
            return response.data;
        } catch (error: any) {
            console.error('Error fetching quotation by ID:', error);
            throw new Error(error.response?.data?.message || error.message || 'Failed to fetch quotation');
        }
    },

    // Get quotations by client ID
    getQuotationsByClientId: async (clientId: number): Promise<QuotationHistory[]> => {
        try {
            const response = await api.get(`/Quotation/client/${clientId}`);
            
            if (Array.isArray(response.data)) {
                return response.data;
            } else if (response.data?.status && response.data?.data) {
                return response.data.data;
            } else if (response.data?.data) {
                return response.data.data;
            }
            
            return response.data || [];
        } catch (error: any) {
            console.error('Error fetching quotations by client:', error);
            throw new Error(error.response?.data?.message || error.message || 'Failed to fetch quotations by client');
        }
    },

    // Get quotations by project ID
    getQuotationsByProjectId: async (projectId: number): Promise<QuotationHistory[]> => {
        try {
            const response = await api.get(`/Quotation/project/${projectId}`);
            
            if (Array.isArray(response.data)) {
                return response.data;
            } else if (response.data?.status && response.data?.data) {
                return response.data.data;
            } else if (response.data?.data) {
                return response.data.data;
            }
            
            return response.data || [];
        } catch (error: any) {
            console.error('Error fetching quotations by project:', error);
            throw new Error(error.response?.data?.message || error.message || 'Failed to fetch quotations by project');
        }
    },

    // Get quotations by type
    getQuotationsByType: async (type: string): Promise<QuotationHistory[]> => {
        try {
            const response = await api.get(`/Quotation/type/${type}`);
            
            if (Array.isArray(response.data)) {
                return response.data;
            } else if (response.data?.status && response.data?.data) {
                return response.data.data;
            } else if (response.data?.data) {
                return response.data.data;
            }
            
            return response.data || [];
        } catch (error: any) {
            console.error('Error fetching quotations by type:', error);
            throw new Error(error.response?.data?.message || error.message || 'Failed to fetch quotations by type');
        }
    },
};
