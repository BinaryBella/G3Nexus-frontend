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
    id?: number;
    name?: string;
    email: string;
    role: string;
    isActive: boolean;
    profileImage?: string;
    // Additional fields that might be present in the user data
    organizationName?: string;
    contactNo?: string;
    address?: string;
    employeeId?: number;
    clientId?: number;
    companyId?: number;
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
    companyId?: number;
    iat?: number;
    exp?: number;
    // Additional possible fields from different JWT implementations
    [key: string]: any; // Allow any additional claims
}

export interface Client {
    id: number;
    name: string;
    contactNo: string;
    email: string;
    address: string;
    password: string;
    role: string;
    isActive: boolean;
    companyId: number;
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
    profileImageUrl?: string | null;
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
    isNew?: boolean;
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
    projectId?: number; // Optional for backwards compatibility
}

export interface Company {
  companyId: number;
  companyName: string;
  address: string;
  isActive: boolean;
}

export interface Project {
  projectId: number;
  projectName: string;
  projectType: string;
  projectSize: string;
  creationDate: string;
  projectDescription: string;
  estimatedBudget: number;
  actualStartDate: string;
  actualEndDate: string;
  totalBudget: number;
  paymentType: string;
  paymentStatus: string;
  status: string;
  isActive: boolean;
  companyId?: number;
}
