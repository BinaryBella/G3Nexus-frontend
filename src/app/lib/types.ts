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
    email: string,
    role: string,
    isActive: boolean,
    userId: number,
    clientId?: number,
    organizationName?: string,
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
    clientId: number;
    name: string;
    contactNo: string;
    email: string;
    address: string;
    password: string;
    role: string;
    isActive: boolean;
    companyId: number;
    profileImageUrl?: string;
}

export interface ClientEditPayload {
    clientId: number;
    name: string;
    contactNo: string;
    email: string;
    address: string;
    profileImageUrl: string;
    role: string;
    isActive: boolean;
    companyId: number;
    password?: string; // Optional for password updates
}

export interface Employee {
    employeeId: number;
    name: string;
    contactNo: string;
    email: string;
    address: string;
    password: string;
    role: string;
    profileImageUrl?: string;
    isActive: boolean;
}

export interface EmployeeEditPayload {
    employeeId: number;
    name: string;
    contactNo: string;
    email: string;
    address: string;
    password?: string; // Optional for password updates
    role: string;
    profileImageUrl: string;
    isActive: boolean;
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

export interface RequirementListItem {
    requirementId: number;
    requirementTitle: string;
    priority: string;
    clientId: number;
    projectId: number;
    isNew?: boolean;
    clientName?: string;
    projectName?: string;
}

export interface BugListItem {
    bugId: number;
    bugTitle: string;
    severity: string;
    clientId: number;
    projectId: number;
    isNew?: boolean;
    clientName?: string;
    projectName?: string;
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
    isNew?: boolean;
}

export interface Payment {
    paymentId: number;
    projectId: number;
    clientId: number;
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

// Quotation related interfaces
export interface QuotationRequest {
  requirementId: number;
  quotationCost: number;
  estimatedDuration: string;
  description: string;
  deliveryDate: string;
}

export interface BulkQuotationRequest {
  selectedRequirements: QuotationRequest[];
  employeeId: number
  clientId: number;
  projectId: number;
  additionalNotes: string;
}

// Bug quotation related interfaces
export interface BugQuotationRequest {
  bugId: number;
  quotationCost: number;
  estimatedDuration: string;
  description: string;
  deliveryDate: string;
}

export interface BulkBugQuotationRequest {
  selectedBugs: BugQuotationRequest[];
  clientId: number;
  employeeId: number;
  projectId: number;
  additionalNotes: string;
}

// Quotation history interface
export interface QuotationHistory {
  quotationId: number;
  clientId: number;
  clientName: string;
  clientEmail: string;
  projectId: number;
  projectName: string;
  projectDescription: string;
  employeeId: number;
  employeeName: string;
  employeeEmail: string;
  createdDate: string;
  type: string;
  totalCost: number;
  formattedCreatedDate: string;
  formattedTotalCost: string;
  items: QuotationItem[];
}

// Quotation item interface
export interface QuotationItem {
  itemId: number;
  itemType: string;
  title: string;
  description: string;
  category: string;
  priority: string;
  cost: number;
  formattedCost: string;
  attachment: string;
  isActive: boolean;
  createdAt: string;
  formattedCreatedAt: string;
}