import axios from 'axios';
import {
    Client, Employee, Requirement, Bug, Payment, TermsConditions, ApiResponse
} from './types';


// Create an axios instance with default config
const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'https://localhost:7289/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Authentication service
export const authService = {
    login: async (email: string, password: string) => {
        try {
            const response = await api.post('/auth/login', { email, password });
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // Store tokens in localStorage when user logs in
    setTokens: (accessToken: string, refreshToken: string) => {
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
    },

    // Get the stored tokens
    getTokens: () => {
        return {
            accessToken: localStorage.getItem('accessToken'),
            refreshToken: localStorage.getItem('refreshToken'),
        };
    },

    // Clear tokens on logout
    clearTokens: () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
    },
};


// Fetch Clients
export const fetchClients = async (): Promise<Client[]> => {
    const response = await axios.get<ApiResponse<Client[]>>(`${api}/Client`);

    if (!response.data.status) {
        throw new Error(response.data.error || 'Failed to fetch clients');
    }

    return response.data.data.map((client: Client) => ({
        id: client.id,
        organizationName: client.organizationName,
        name: client.name,
        role: client.role,
        contactNo: client.contactNo,
        email: client.email,
        address: client.address,
    }));
};

// Add Client
export const addClient = async (clientData: Omit<Client, 'id'>): Promise<Client> => {
    const response = await axios.post<ApiResponse<Client>>(`${api}/Client`, clientData);

    if (!response.data.status) {
        throw new Error(response.data.error || 'Failed to add client');
    }

    return response.data.data;
};

// Fetch Employees
export const fetchEmployees = async (): Promise<Employee[]> => {
    const response = await axios.get<ApiResponse<Employee[]>>(`${api}/Employee`);

    if (!response.data.status) {
        throw new Error(response.data.error || 'Failed to fetch employees');
    }

    return response.data.data.map((employee: Employee) => ({
        id: employee.id,
        name: employee.name,
        role: employee.role,
        contactNo: employee.contactNo,
        email: employee.email,
        address: employee.address,
    }));
};

// Add Employee
export const addEmployee = async (EmployeeData: Omit<Employee, 'id'>): Promise<Employee> => {
    const response = await axios.post<ApiResponse<Employee>>(`${api}/Employee`, EmployeeData);

    if (!response.data.status) {
        throw new Error(response.data.error || 'Failed to add employee');
    }

    return response.data.data;
};

// Fetch Requirements
export const fetchRequirements = async (): Promise<Requirement[]> => {
    const response = await axios.get<ApiResponse<Requirement[]>>(`${api}/Requirement`);

    if (!response.data.status) {
        throw new Error(response.data.error || 'Failed to fetch requirements');
    }

    return response.data.data.map((requirement: Requirement) => ({
        requirementTitle: requirement.requirementTitle,
        priority: requirement.priority,
        requirementDescription: requirement.requirementDescription,
        attachment: requirement.attachment,
        isActive: requirement.isActive,
        clientId: requirement.clientId,
        projectId: requirement.projectId
    }));
};

// Add Requirement
export const addRequirement = async (RequirementData: Omit<Requirement, 'id'>): Promise<Requirement> => {
    const response = await axios.post<ApiResponse<Requirement>>(`${api}/Requirement`, RequirementData);

    if (!response.data.status) {
        throw new Error(response.data.error || 'Failed to add requirement');
    }

    return response.data.data;
};

// Fetch Bugs
export const fetchBugs = async (): Promise<Bug[]> => {
    const response = await axios.get<ApiResponse<Bug[]>>(`${api}/Bug`);

    if (!response.data.status) {
        throw new Error(response.data.error || 'Failed to fetch bugs');
    }

    return response.data.data.map((bug: Bug) => ({
        bugTitle: bug.bugTitle,
        severity: bug.severity,
        bugDescription: bug.bugDescription,
        attachment: bug.attachment,
        isActive: bug.isActive,
        clientId: bug.clientId,
        projectId: bug.projectId
    }));
};

// Fetch Payments
export const fetchPayments = async (): Promise<Payment[]> => {
    const response = await axios.get<ApiResponse<Payment[]>>(`${api}/Payment`);

    if (!response.data.status) {
        throw new Error(response.data.error || 'Failed to fetch payments');
    }

    return response.data.data.map((payment: Payment) => ({
        paymentId: payment.paymentId,
        paymentAmount: payment.paymentAmount,
        paymentType: payment.paymentType,
        paymentDescription: payment.paymentDescription,
        paymentDate: payment.paymentDate,
        attachment: payment.attachment,
    }));
};

// Add Payment
export const addPayment = async (paymentData: Omit<Payment, 'paymentId'>): Promise<Payment> => {
    const response = await axios.post<ApiResponse<Payment>>(`${api}/Payment`, paymentData);

    if (!response.data.status) {
        throw new Error(response.data.error || 'Failed to add payment');
    }

    return response.data.data;
};

// Fetch Terms and Conditions
export const fetchTerms = async (): Promise<TermsConditions> => {
    const response = await axios.get<{data: TermsConditions}>('https://localhost:7289/api/terms');
    return response.data.data;
};

export const addTerms = async (content: string): Promise<TermsConditions> => {
    const response = await axios.post<TermsConditions>('https://localhost:7289/api/terms', { content });
    return response.data;
};

export const updateTerms = async (tcId: number, content: string): Promise<TermsConditions> => {
    const response = await axios.put<TermsConditions>(`https://localhost:7289/api/terms/${tcId}`, { content });
    return response.data;
};
