// src/services/api.ts
import axios from 'axios';
import { AuthUser, LoginRequest, LoginResponse, ApiResponse, JWTPayload, TermsConditions } from '@/app/lib/types';
import { CLIENT_ADMIN, CLIENT_USER, COMPANY_ADMIN, COMPANY_DEVELOPER } from '@/app/lib/constants';
import { createHmac } from 'crypto';

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

        // Skip token refresh for login endpoints to avoid infinite loops and page refreshes
        const isLoginEndpoint = originalRequest.url?.includes('/Auth/login') ||
                               originalRequest.url?.includes('/auth/login');

        if (error.response?.status === 401 && !originalRequest._retry && !isLoginEndpoint) {
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
    console.log('decodeJWTToken called with token:', token?.substring(0, 50) + '...');
    
    try {
        if (!token) {
            console.error('No token provided to decodeJWTToken');
            return null;
        }

        const parts = token.split('.');
        if (parts.length !== 3) {
            console.error('Invalid JWT format - expected 3 parts, got:', parts.length);
            return null;
        }

        const [header, payload, signature] = parts;
        console.log('JWT parts:', { 
            headerLength: header.length, 
            payloadLength: payload.length, 
            signatureLength: signature.length 
        });

        // Decode the payload (base64url)
        const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
        const padded = base64.padEnd(base64.length + (4 - base64.length % 4) % 4, '=');
        
        const decodedPayload = JSON.parse(atob(padded));
        console.log('Successfully decoded JWT payload:', decodedPayload);
        
        // For client-side usage, we don't need to verify the signature
        // The server should handle verification
        return decodedPayload;
        
    } catch (error) {
        console.error('Error decoding JWT token:', error);
        return null;
    }
};

// Utility function to verify JWT signature (simplified example)
const verifyJWTSignature = (header: string, payload: string, signature: string, secret: string): boolean => {
    const expectedSignature = createHmac('sha256', secret)
        .update(`${header}.${payload}`)
        .digest('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '');
    return expectedSignature === signature;
};

// Function to extract user data from JWT token
const getUserFromToken = (accessToken: string): AuthUser | null => {
    console.log('getUserFromToken called with token preview:', accessToken?.substring(0, 50) + '...');
    
    try {
        const payload = decodeJWTToken(accessToken);
        console.log('Decoded JWT payload:', payload);
        
        if (!payload) {
            console.error('Failed to decode JWT token');
            return null;
        }

        // Extract role - check multiple possible field names
        const role = payload.role ||
                     payload['Role'] ||
                     payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] ||
                     payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/role'] ||
                     payload['roles'] ||
                     payload['authorities'] ||
                     'UNKNOWN_ROLE';

        // Extract email - check multiple possible field names
        const userEmail = payload.email ||
                          payload['Email'] ||
                          payload['email_address'] ||
                          payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'] ||
                          '';

        console.log('Extracted user data:', {
            email: userEmail,
            role: role,
            allPayloadKeys: Object.keys(payload)
        });

        const user = {
            email: userEmail,
            role: role,
            isActive: true,
            organizationName: payload.organizationName || payload['OrganizationName'],
            contactNo: payload.contactNo || payload['ContactNo'],
            address: payload.address || payload['Address'],
            employeeId: payload.employeeId || payload['EmployeeId'],
            clientId: payload.clientId || payload['ClientId'],
        };
        
        console.log('Returning user object:', user);
        return user;
    } catch (error) {
        console.error('Error in getUserFromToken:', error);
        return null;
    }
};

// reset password function
export const authService = {
    login: async (email: string, password: string): Promise<ApiResponse<LoginResponse>> => {
        try {
            console.log('AuthService login called with email:', email);
            const loginData: LoginRequest = {
                emailAddress: email,
                password: password
            };
            console.log('Sending login request with data:', { ...loginData, password: '[REDACTED]' });
            
            const response = await api.post('/Auth/login', loginData);
            console.log('Raw axios response:', {
                status: response.status,
                statusText: response.statusText,
                data: response.data
            });
            
            return response.data;
        } catch (error) {
            console.error('AuthService login error:', error);
            console.error('Error details:', {
                message: error instanceof Error ? error.message : 'Unknown error',
                response: error && typeof error === 'object' && 'response' in error ? (error as any).response : 'No response',
                request: error && typeof error === 'object' && 'request' in error ? 'Request exists' : 'No request'
            });
            throw error;
        }
    },

    // Get the current user's information from the stored access token
    getCurrentUser: (): AuthUser => {
        console.log('getCurrentUser called');
        const { accessToken } = authService.getTokens();
        console.log('Retrieved token from storage:', { hasToken: !!accessToken });
        
        if (!accessToken) {
            console.error('No access token found in storage');
            throw new Error('No access token found');
        }

        const user = getUserFromToken(accessToken);
        console.log('getUserFromToken result:', user);
        
        if (!user) {
            console.error('Failed to extract user from token');
            throw new Error('Invalid access token');
        }

        console.log('getCurrentUser returning user:', user);
        return user;
    },

    // Store tokens in localStorage when user logs in
    setTokens: (accessToken: string, refreshToken: string) => {
        if (typeof window === 'undefined') return;
        sessionStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
    },

    // Get the stored tokens
    getTokens: () => {
        if (typeof window === 'undefined') {
            return { accessToken: null, refreshToken: null };
        }

        return {
            accessToken: sessionStorage.getItem('accessToken'),
            refreshToken: localStorage.getItem('refreshToken'),
        };
    },

    // Clear tokens on logout
    clearTokens: () => {
        if (typeof window === 'undefined') return;
        sessionStorage.removeItem('accessToken');
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
            const response = await api.post('auth/forget-password', email);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // Verify reset code (email as query param, code in body)
    verifyResetCode: async (email: string, code: string) => {
        try {
            console.log(code)
            const response = await api.post(`auth/verify-email`, { verificationCode: code, email: email });
            console.log(response)
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // Reset password with email, new password, and verification code
    resetPassword: async (email: string, newPassword: string, verificationCode: string) => {
        try {
            const response = await api.post('auth/reset-password', {
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
