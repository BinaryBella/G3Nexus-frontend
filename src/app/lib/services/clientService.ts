// src/app/services/clientService.ts
import api from './api';
import { ApiResponse, Client, ClientEditPayload } from '@/app/lib/types';

// Re-export Client interface for convenience
export type { Client };

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

  // Get client by email
  getClientByEmail: async (email: string): Promise<Client> => {
    try {
      const response = await api.get<ApiResponse<Client>>(`/client/email/${email}`);

      if (!response.data.status) {
        throw new Error(response.data.error || 'Failed to fetch client by email');
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
  updateClient: async (clientData: ClientEditPayload): Promise<ClientEditPayload> => {
    try {
      const response = await api.put<ApiResponse<ClientEditPayload>>(`/client`, clientData);

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
  },

  // Check if client exists by email
  checkClientExists: async (email: string): Promise<boolean> => {
    try {
      const clients = await clientService.getAllClients();
      return clients.some(client => 
        client.email.toLowerCase().trim() === email.toLowerCase().trim()
      );
    } catch (error) {
      throw error;
    }
  },
};
