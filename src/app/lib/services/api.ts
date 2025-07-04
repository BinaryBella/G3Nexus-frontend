// src/services/api.ts
import axios from 'axios';
import { User } from '@/app/contexts/AuthContext';

// Create an axios instance with default config
const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'https://localhost:7289/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor for API calls
api.interceptors.request.use(
    (config) => {
        const { accessToken } = authService.getTokens();
        if (accessToken) {
            config.headers['Authorization'] = `Bearer ${accessToken}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor for API calls
api.interceptors.response.use(
    (response) => {
        return response;
    },
    async (error) => {
        const originalRequest = error.config;
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            try {
                // Attempt to refresh the token
                const { refreshToken } = authService.getTokens();
                if (!refreshToken) {
                    throw new Error('No refresh token available');
                }

                const response = await axios.post(
                    `${process.env.NEXT_PUBLIC_API_URL || 'https://localhost:7289/api'}/auth/refresh-token`,
                    { refreshToken }
                );

                if (response.data.status) {
                    const { accessToken, refreshToken: newRefreshToken } = response.data.data;
                    authService.setTokens(accessToken, newRefreshToken);

                    // Retry the original request with the new token
                    originalRequest.headers['Authorization'] = `Bearer ${accessToken}`;
                    return axios(originalRequest);
                }
            } catch (refreshError) {
                // If refresh fails, redirect to login
                authService.clearTokens();
                if (typeof window !== 'undefined') {
                    window.location.href = '/auth/login';
                }
            }
        }
        return Promise.reject(error);
    }
);

// reset password function
export const authService = {
    login: async (email: string, password: string) => {
        try {
            const response = await api.post('/auth/login', { email, password });
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // Get the current user's information
    getCurrentUser: async (): Promise<User> => {
        try {
            const response = await api.get('/auth/me');
            return response.data.data;
        } catch (error) {
            throw error;
        }
    },

    // Store tokens in localStorage when user logs in
    setTokens: (accessToken: string, refreshToken: string) => {
        if (typeof window === 'undefined') return;
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
    },

    // Get the stored tokens
    getTokens: () => {
        if (typeof window === 'undefined') {
            return { accessToken: null, refreshToken: null };
        }

        return {
            accessToken: localStorage.getItem('accessToken'),
            refreshToken: localStorage.getItem('refreshToken'),
        };
    },

    // Clear tokens on logout
    clearTokens: () => {
        if (typeof window === 'undefined') return;
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
    },

    // Register a new user
    register: async (userData: any) => {
        try {
            const response = await api.post('/auth/register', userData);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // Request password reset
    requestPasswordReset: async (email: string) => {
        try {
            const response = await api.post('/forget-password', { email });
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // Verify reset code (email as query param, code in body)
    verifyResetCode: async (email: string, code: string) => {
        try {
            const response = await api.post(`/verify-email?email=${encodeURIComponent(email)}`, {
                verificationCode: code
            });
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // Reset password with email, new password, and verification code
    resetPassword: async (email: string, newPassword: string, verificationCode: string) => {
        try {
            const response = await api.post('/reset-password', {
                emailAddress: email,
                newPassword: newPassword,
                verificationCode: verificationCode
            });
            return response.data;
        } catch (error) {
            throw error;
        }
    },
};

export default api;
