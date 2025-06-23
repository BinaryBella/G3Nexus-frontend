// src/app/services/clientService.ts
import api from './api';
import { ApiResponse, Client } from '@/app/lib/types';

export const clientService = {
  // Get all clients
  getAllClients: async (): Promise<Client[]> => {
    try {
      const response = await api.get<ApiResponse<Client[]>>('/client');
      
      if (!response.data.status) {
        throw new Error(response.data.error || 'Failed to fetch clients');
      }
      
      return response.data.data;
    } catch (error) {
      throw error;
    }
  },
  
  // Get client by ID
  getClientById: async (id: number): Promise<Client> => {
    try {
      const response = await api.get<ApiResponse<Client>>(`/client/${id}`);
      
      if (!response.data.status) {
        throw new Error(response.data.error || 'Failed to fetch client');
      }
      
      return response.data.data;
    } catch (error) {
      throw error;
    }
  },
  
  // Add new client
  addClient: async (clientData: Omit<Client, 'id'>): Promise<Client> => {
    try {
      const response = await api.post<ApiResponse<Client>>('/client', clientData);
      
      if (!response.data.status) {
        throw new Error(response.data.error || 'Failed to add client');
      }
      
      return response.data.data;
    } catch (error) {
      throw error;
    }
  },
  
  // Update client
  updateClient: async (id: number, clientData: Partial<Omit<Client, 'id'>>): Promise<Client> => {
    try {
      const response = await api.put<ApiResponse<Client>>(`/client/${id}`, clientData);
      
      if (!response.data.status) {
        throw new Error(response.data.error || 'Failed to update client');
      }
      
      return response.data.data;
    } catch (error) {
      throw error;
    }
  },
  
  // Delete client
  deleteClient: async (id: number): Promise<boolean> => {
    try {
      const response = await api.delete<ApiResponse<boolean>>(`/client/${id}`);
      
      if (!response.data.status) {
        throw new Error(response.data.error || 'Failed to delete client');
      }
      
      return response.data.data;
    } catch (error) {
      throw error;
    }
  }
};
