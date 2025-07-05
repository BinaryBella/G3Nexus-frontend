export interface ApiResponse<T> {
    data: T;  // This will either be an object or an array, depending on the type
    error: string | null;
    status: boolean;
    message: string | null;
}

// Authentication related interfaces
export interface LoginRequest {
    emailAddress: string;
    password: string;
}

export interface LoginResponse {
    accessToken: string;
    refreshToken: string;
}

export interface AuthUser {
    id: number;
    name: string;
    email: string;
    role: string;
    isActive: boolean;
    // Additional fields that might be present in the user data
    organizationName?: string;
    contactNo?: string;
    address?: string;
    employeeId?: number;
    clientId?: number;
}

// JWT Token payload interface
export interface JWTPayload {
    sub: string; // user id
    email: string;
    name: string;
    role: string;
    organizationName?: string;
    contactNo?: string;
    address?: string;
    employeeId?: number;
    clientId?: number;
    iat?: number;
    exp?: number;
    // Additional possible fields from different JWT implementations
    [key: string]: any; // Allow any additional claims
}

export interface Client {
    id: number;
    organizationName: string;
    name: string;
    contactNo: string;
    email: string;
    address: string;
    password: string;
    role: string;
    isActive: boolean;
}

export interface Employee {
    employeeId?: number;
    contactNo: string;
    email: string;
    address: string;
    isActive: boolean;
    name: string;
    password: string;
    role: string;
}


export interface Requirement {
    requirementId: number;
    requirementTitle: string;
    priority: string;
    requirementDescription: string;
    attachment: string;
    isActive: boolean;
    clientId: number;
    projectId: number;
}

export interface Bug {
    bugId: number;
    bugTitle: string;
    severity: string;
    bugDescription: string;
    attachment: string;
    isActive: boolean;
    clientId: number;
    projectId: number;
}

export interface Payment {
    paymentId: number;
    projectId: number;
    paymentAmount: string;
    paymentType: string;
    paymentDescription: string;
    paymentDate: string;
    attachment: string;
    isActive: boolean;
}


export interface TermsConditions {
    tcId: number;
    content: string;
    updatedDate: string;
    isActive: boolean;
}

export interface Company {
  companyId: number;
  companyName: string;
  address: string;
  isActive: boolean;
}