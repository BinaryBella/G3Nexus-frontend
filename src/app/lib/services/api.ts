// src/services/api.ts
import axios from 'axios';
import { AuthUser, LoginRequest, LoginResponse, ApiResponse, JWTPayload } from '@/app/lib/types';
import { CLIENT_ADMIN, CLIENT_USER, COMPANY_ADMIN, COMPANY_DEVELOPER } from '@/app/lib/constants';
import { companyService } from './companyService';
import { employeeService } from './employeeService';

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
    try {
        console.log('Decoding JWT token:', token?.substring(0, 50) + '...');
        
        if (!token) {
            console.error('No token provided');
            return null;
        }
        
        const parts = token.split('.');
        if (parts.length !== 3) {
            console.error('Invalid JWT format - should have 3 parts, got:', parts.length);
            return null;
        }

        const [header, payload, signature] = parts;
        console.log('JWT parts:', { 
            hasHeader: !!header, 
            hasPayload: !!payload, 
            hasSignature: !!signature 
        });
        
        // Decode the payload (we don't verify signature on client-side for security reasons)
        const base64Url = payload;
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
            atob(base64)
                .split('')
                .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                .join('')
        );
        
        console.log('Decoded JSON payload string:', jsonPayload);
        const decodedPayload = JSON.parse(jsonPayload);
        console.log('Parsed payload object:', decodedPayload);
        
        // Check if token is expired
        if (decodedPayload.exp && Date.now() >= decodedPayload.exp * 1000) {
            console.warn('JWT token is expired');
            return null;
        }
        
        return decodedPayload;
    } catch (error) {
        console.error('Error decoding JWT token:', error);
        console.error('Token that failed to decode:', token);
        return null;
    }
};



// Function to extract user data from JWT token
const getUserFromToken = (accessToken: string): AuthUser | null => {
    console.log('Parsing JWT token...');
    const payload = decodeJWTToken(accessToken);
    console.log('JWT payload:', payload);
    
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

    const userId = payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'];

    // Extract clientId from JWT payload
    const clientId = payload.clientId || payload['ClientId'] || payload['client_id'];

    console.log('Extracted user data:', {
        email: userEmail,
        role: role,
        id: userId,
        clientId: clientId,
        payload: payload
    });

    const userData = {        
        email: userEmail,
        role: role,
        isActive: true,
        userId: parseInt(userId),
        clientId: clientId ? parseInt(clientId) : undefined
    };
    
    console.log('Final user data object:', userData);
    return userData;
};

// reset password function
export const authService = {
    login: async (email: string, password: string): Promise<ApiResponse<LoginResponse>> => {
        try {
            const loginData: LoginRequest = {
                emailAddress: email,
                password: password
            };
            console.log('Sending login request with data:', loginData);
            const response = await api.post('/Auth/login', loginData);
            console.log('Raw login response:', response);
            console.log('Login response data:', response.data);
            return response.data;
        } catch (error: any) {
            console.error('Login request failed:', error);
            console.error('Error response:', error.response?.data);
            throw error;
        }
    },

    // Get the current user's information from the stored access token
    getCurrentUser: async (): Promise<AuthUser> => {
        const { accessToken } = authService.getTokens();
        if (!accessToken) {
            throw new Error('No access token found');
        }

        const user = getUserFromToken(accessToken);
        const isClient = authService.isClient();
        const isCompanyUser = authService.isCompanyUser();
        
        if (isClient && user) {
            try {
                console.log('Fetching client data for userId:', user.userId);
                const clientData = await profileService.getClientById(user.userId);
                console.log('Client data received:', clientData);
                
                if (clientData && clientData.data) {
                    const companyId = clientData.data.companyId;
                    const companyData = await companyService.getCompanyById(companyId);
                    user.organizationName = companyData.companyName;
                    // Set the clientId from the profile data
                    user.clientId = clientData.data.id;
                    // Set the profile image URL
                    user.profileImageUrl = clientData.data.profileImageUrl;
                    console.log('Set clientId to:', user.clientId);
                    console.log('Set profileImageUrl to:', user.profileImageUrl);
                } else {
                    console.warn('No client data found for userId:', user.userId);
                }
            } catch (error) {
                console.error('Error fetching client profile:', error);
                // Don't throw here, let the user continue but without client data
            }
        } else if (isCompanyUser && user && user.email) {
            try {
                console.log('Fetching employee data for email:', user.email);
                const employeeData = await employeeService.getEmployeeByEmail(user.email);
                console.log('Employee data received:', employeeData);
                
                if (employeeData) {
                    // Set the profile image URL
                    user.profileImageUrl = employeeData.profileImageUrl;
                    console.log('Set profileImageUrl to:', user.profileImageUrl);
                } else {
                    console.warn('No employee data found for email:', user.email);
                }
            } catch (error) {
                console.error('Error fetching employee profile:', error);
                // Don't throw here, let the user continue but without employee data
            }
        }
        
        if (!user) {
            throw new Error('Invalid access token');
        }

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

    // Get client ID for the current authenticated user
    getClientId: async (): Promise<number | null> => {
        try {
            const { accessToken } = authService.getTokens();
            if (!accessToken) {
                throw new Error('No access token found');
            }

            const user = getUserFromToken(accessToken);
            if (!user || !authService.isClient()) {
                return null;
            }

            // Try to get clientId from JWT first
            if (user.clientId) {
                console.log('ClientId found in JWT:', user.clientId);
                return user.clientId;
            }

            // Fallback: Try to get client by userId
            try {
                console.log('Fetching client data by userId:', user.userId);
                const clientData = await profileService.getClientById(user.userId);
                if (clientData && clientData.data && clientData.data.id) {
                    console.log('ClientId found via profile service:', clientData.data.id);
                    return clientData.data.id;
                }
            } catch (error) {
                console.log('Failed to get client by userId, trying by email...');
            }

            // Fallback: Get client by email
            try {
                console.log('Fetching client data by email:', user.email);
                const response = await api.get(`/Client/email/${encodeURIComponent(user.email)}`);
                if (response.data && response.data.data && response.data.data.id) {
                    console.log('ClientId found via email lookup:', response.data.data.id);
                    return response.data.data.id;
                }
            } catch (error) {
                console.error('Failed to get client by email:', error);
            }

            console.warn('Could not determine client ID for user:', user);
            return null;
        } catch (error) {
            console.error('Error getting client ID:', error);
            return null;
        }
    },
};

// Profile Service
export const profileService = {
    // Get all clients
    getAllClients: async () => {
        try {
            const response = await api.get('/Client');
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // Get client by ID
    getClientById: async (clientId: number) => {
        try {
            const response = await api.get(`/Client/${clientId}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // Update client profile
    updateClientProfile: async (clientId: number, profileData: any) => {
        try {
            const response = await api.put(`/Client/${clientId}`, profileData);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // Get all employees
    getAllEmployees: async () => {
        try {
            const response = await api.get('/Employee');
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // Get employee by ID
    getEmployeeById: async (employeeId: number) => {
        try {
            const response = await api.get(`/Employee/${employeeId}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // Update employee profile
    updateEmployeeProfile: async (profileData: any) => {
        try {
            const response = await api.put(`/Employee/`, profileData);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // Find client by email
    findClientByEmail: async (email: string) => {
        try {
            const response = await api.get('/Client');
            if (response.data.status && response.data.data) {
                const clients = Array.isArray(response.data.data) 
                    ? response.data.data 
                    : [response.data.data];
                return clients.find((client: any) => client.email === email);
            }
            return null;
        } catch (error) {
            throw error;
        }
    },

    // Find employee by email
    findEmployeeByEmail: async (email: string) => {
        try {
            const response = await api.get('/Employee');
            if (response.data.status && response.data.data) {
                const employees = Array.isArray(response.data.data) 
                    ? response.data.data 
                    : [response.data.data];
                return employees.find((employee: any) => employee.email === email);
            }
            return null;
        } catch (error) {
            throw error;
        }
    },
};

export default api;
