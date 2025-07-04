// src/services/api.ts
import axios from 'axios';
import { AuthUser, LoginRequest, LoginResponse, ApiResponse, JWTPayload } from '@/app/lib/types';
import { CLIENT_ADMIN, CLIENT_USER, COMPANY_ADMIN, COMPANY_DEVELOPER } from '@/app/lib/constants';

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

// Utility function to decode JWT token
const decodeJWTToken = (token: string): JWTPayload | null => {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
            atob(base64)
                .split('')
                .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                .join('')
        );
        return JSON.parse(jsonPayload);
    } catch (error) {
        console.error('Error decoding JWT token:', error);
        return null;
    }
};

// Function to extract user data from JWT token
const getUserFromToken = (accessToken: string): AuthUser | null => {
    const payload = decodeJWTToken(accessToken);
    if (!payload) return null;

    // Debug: log the payload to see what's actually in the token
    console.log('JWT Payload:', payload);

    // Extract role - check multiple possible field names
    const role = payload.role || 
                 payload['Role'] || 
                 payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] ||
                 payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/role'] ||
                 payload['roles'] ||
                 payload['authorities'] ||
                 'UNKNOWN_ROLE';
    
    // Extract user ID - check multiple possible field names
    const userId = payload.sub || 
                   payload['id'] || 
                   payload['userId'] || 
                   payload['nameid'] || 
                   payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'] ||
                   '0';
    
    // Extract name - check multiple possible field names
    const userName = payload.name || 
                     payload['Name'] || 
                     payload['unique_name'] || 
                     payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'] ||
                     'Unknown User';
    
    // Extract email - check multiple possible field names
    const userEmail = payload.email || 
                      payload['Email'] || 
                      payload['email_address'] || 
                      payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'] ||
                      '';

    console.log('Extracted user data:', {
        id: userId,
        name: userName,
        email: userEmail,
        role: role
    });

    return {
        id: parseInt(userId) || 0,
        name: userName,
        email: userEmail,
        role: role,
        isActive: true,
        organizationName: payload.organizationName || payload['OrganizationName'],
        contactNo: payload.contactNo || payload['ContactNo'],
        address: payload.address || payload['Address'],
        employeeId: payload.employeeId || payload['EmployeeId'],
        clientId: payload.clientId || payload['ClientId'],
    };
};

// reset password function
export const authService = {
    login: async (email: string, password: string): Promise<ApiResponse<LoginResponse>> => {
        try {
            const loginData: LoginRequest = {
                emailAddress: email,
                password: password
            };
            const response = await api.post('/Auth/login', loginData);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // Get the current user's information from the stored access token
    getCurrentUser: (): AuthUser => {
        const { accessToken } = authService.getTokens();
        if (!accessToken) {
            throw new Error('No access token found');
        }

        const user = getUserFromToken(accessToken);
        if (!user) {
            throw new Error('Invalid access token');
        }

        return user;
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

    // Check if user has a specific role
    hasRole: (role: string): boolean => {
        const { accessToken } = authService.getTokens();
        if (!accessToken) return false;
        
        const user = getUserFromToken(accessToken);
        return user?.role === role;
    },

    // Check if user is a client (CLIENT_ADMIN or CLIENT_USER)
    isClient: (): boolean => {
        return authService.hasRole(CLIENT_ADMIN) || authService.hasRole(CLIENT_USER);
    },

    // Check if user is a company user (COMPANY_ADMIN or COMPANY_DEVELOPER)
    isCompanyUser: (): boolean => {
        return authService.hasRole(COMPANY_ADMIN) || authService.hasRole(COMPANY_DEVELOPER);
    },

    // Check if user is an admin (CLIENT_ADMIN or COMPANY_ADMIN)
    isAdmin: (): boolean => {
        return authService.hasRole(CLIENT_ADMIN) || authService.hasRole(COMPANY_ADMIN);
    },

    // Check if access token is expired
    isTokenExpired: (): boolean => {
        const { accessToken } = authService.getTokens();
        if (!accessToken) return true;

        const payload = decodeJWTToken(accessToken);
        if (!payload || !payload.exp) return true;

        return Date.now() >= payload.exp * 1000;
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
