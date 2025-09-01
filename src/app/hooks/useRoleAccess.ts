// src/hooks/useRoleAccess.ts
import { useAuth } from '@/app/contexts/AuthContext';
import { CLIENT_ADMIN, CLIENT_USER, COMPANY_ADMIN, COMPANY_DEVELOPER } from '@/app/lib/constants';

export const useRoleAccess = () => {
    const { user, hasRole, isClient, isCompanyUser, isAdmin } = useAuth();

    // Route access control functions
    const canAccessClientRoutes = () => {
        return hasRole(CLIENT_ADMIN) || hasRole(CLIENT_USER);
    };

    const canAccessCompanyRoutes = () => {
        return hasRole(COMPANY_ADMIN) || hasRole(COMPANY_DEVELOPER);
    };

    const canAccessAdminRoutes = () => {
        return hasRole(CLIENT_ADMIN) || hasRole(COMPANY_ADMIN);
    };

    // Specific route access checks
    const canAccessClientFinancial = () => {
        return hasRole(CLIENT_ADMIN); // Only CLIENT_ADMIN can access financial
    };

    const canAccessCompanyPayments = () => {
        return hasRole(COMPANY_ADMIN) || hasRole(COMPANY_DEVELOPER); // Allow both COMPANY_ADMIN and COMPANY_DEVELOPER
    };

    const canAccessCompanyTerms = () => {
        return hasRole(COMPANY_ADMIN); // Only COMPANY_ADMIN can access terms
    };

    // Feature-based permissions
    const canManageClients = () => {
        return hasRole(COMPANY_ADMIN);
    };

    const canManageEmployees = () => {
        return hasRole(COMPANY_ADMIN);
    };

    const canManageCompanies = () => {
        return hasRole(COMPANY_ADMIN); // Only COMPANY_ADMIN can manage companies
    };

    const canManageProjects = () => {
        return hasRole(CLIENT_ADMIN) || hasRole(COMPANY_ADMIN);
    };

    const canViewFinancials = () => {
        return hasRole(CLIENT_ADMIN) || hasRole(COMPANY_ADMIN);
    };

    const canManageRequirements = () => {
        return hasRole(CLIENT_ADMIN) || hasRole(CLIENT_USER) || hasRole(COMPANY_ADMIN) || hasRole(COMPANY_DEVELOPER);
    };

    const canManageBugs = () => {
        return hasRole(CLIENT_ADMIN) || hasRole(CLIENT_USER) || hasRole(COMPANY_ADMIN) || hasRole(COMPANY_DEVELOPER);
    };

    const canManagePayments = () => {
        return hasRole(COMPANY_ADMIN) || hasRole(COMPANY_DEVELOPER);
    };

    const canManageTerms = () => {
        return hasRole(COMPANY_ADMIN);
    };

    // Get redirect URL based on role
    const getRedirectUrl = () => {
        if (hasRole(CLIENT_ADMIN) || hasRole(CLIENT_USER)) {
            return '/client/dashboard';
        }
        if (hasRole(COMPANY_ADMIN) || hasRole(COMPANY_DEVELOPER)) {
            return '/company/dashboard';
        }
        return '/auth/login';
    };

    // Check if user can access a specific route
    const canAccessRoute = (route: string): boolean => {
        // Auth routes - accessible to everyone
        if (route.startsWith('/auth')) {
            return true;
        }

        // Client routes
        if (route.startsWith('/client')) {
            if (route.includes('/financial')) {
                return canAccessClientFinancial();
            }
            return canAccessClientRoutes();
        }

        // Company routes
        if (route.startsWith('/company')) {
            if (route.includes('/payments')) {
                return canAccessCompanyPayments();
            }
            if (route.includes('/terms')) {
                return canAccessCompanyTerms();
            }
            return canAccessCompanyRoutes();
        }

        // Default deny
        return false;
    };

    return {
        user,
        canAccessClientRoutes,
        canAccessCompanyRoutes,
        canAccessAdminRoutes,
        canAccessClientFinancial,
        canAccessCompanyPayments,
        canAccessCompanyTerms,
        canManageClients,
        canManageEmployees,
        canManageCompanies,
        canManageProjects,
        canViewFinancials,
        canManageRequirements,
        canManageBugs,
        canManagePayments,
        canManageTerms,
        canAccessRoute,
        getRedirectUrl,
        hasRole,
        isClient,
        isCompanyUser,
        isAdmin,
    };
};
