// src/app/services/paymentService.ts
import api from './api';
import { ApiResponse, Payment } from '@/app/lib/types';

export const paymentService = {
  // Get all payments
  getAllPayments: async (): Promise<Payment[]> => {
    try {
      const response = await api.get<ApiResponse<Payment[]>>('/payment');

      if (!response.data.status) {
        throw new Error(response.data.error || 'Failed to fetch payments');
      }

      return response.data.data;
    } catch (error) {
      throw error;
    }
  },

  // Get payments by project
  getPaymentsByProject: async (projectId: number): Promise<Payment[]> => {
    try {
      const response = await api.get<ApiResponse<Payment[]>>(`/payment/project/${projectId}`);

      if (!response.data.status) {
        throw new Error(response.data.error || 'Failed to fetch payments for project');
      }

      return response.data.data;
    } catch (error) {
      throw error;
    }
  },

  // Add payment
  addPayment: async (paymentData: Omit<Payment, 'paymentId'>): Promise<Payment> => {
    try {
      const response = await api.post<ApiResponse<Payment>>('/payment', paymentData);

      if (!response.data.status) {
        throw new Error(response.data.error || 'Failed to add payment');
      }

      return response.data.data;
    } catch (error) {
      throw error;
    }
  },

  // Update payment
  updatePayment: async (id: number, paymentData: Partial<Omit<Payment, 'paymentId'>>): Promise<Payment> => {
    try {
      const response = await api.put<ApiResponse<Payment>>(`/payment/${id}`, paymentData);

      if (!response.data.status) {
        throw new Error(response.data.error || 'Failed to update payment');
      }

      return response.data.data;
    } catch (error) {
      throw error;
    }
  },

  // Delete payment
  deletePayment: async (id: number): Promise<boolean> => {
    try {
      const response = await api.delete<ApiResponse<boolean>>(`/payment/${id}`);

      if (!response.data.status) {
        throw new Error(response.data.error || 'Failed to delete payment');
      }

      return response.data.data;
    } catch (error) {
      throw error;
    }
  },

  // Upload payment attachment/receipt
  uploadAttachment: async (paymentId: number, file: File): Promise<string> => {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await api.post<ApiResponse<string>>(
        `/payment/${paymentId}/attachment`,
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
