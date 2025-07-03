export interface ApiResponse<T> {
    data: T;  // This will either be an object or an array, depending on the type
    error: string | null;
    status: boolean;
    message: string | null;
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
    employeeId: number;
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
}
