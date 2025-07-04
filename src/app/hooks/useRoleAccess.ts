// src/hooks/useRoleAccess.ts
import { useAuth } from '@/app/contexts/AuthContext';
import { CLIENT_ADMIN, CLIENT_USER, COMPANY_ADMIN, COMPANY_DEVELOPER } from '@/app/lib/constants';

export const useRoleAccess = () => {
    const { user, hasRole, isClient, isCompanyUser, isAdmin } = useAuth();

    const canAccessClientRoutes = () => {
        return isClient();
    };

    const canAccessCompanyRoutes = () => {
        return isCompanyUser();
    };

    const canAccessAdminRoutes = () => {
        return isAdmin();
    };

    const canManageClients = () => {
        return hasRole(COMPANY_ADMIN);
    };

    const canManageEmployees = () => {
        return hasRole(COMPANY_ADMIN);
    };

    const canManageProjects = () => {
        return hasRole(CLIENT_ADMIN) || hasRole(COMPANY_ADMIN) || hasRole(COMPANY_DEVELOPER);
    };

    const canViewFinancials = () => {
        return hasRole(CLIENT_ADMIN) || hasRole(COMPANY_ADMIN);
    };

    const canManageRequirements = () => {
        return hasRole(CLIENT_ADMIN) || hasRole(CLIENT_USER) || hasRole(COMPANY_ADMIN);
    };

    const canManageBugs = () => {
        return hasRole(CLIENT_ADMIN) || hasRole(CLIENT_USER) || hasRole(COMPANY_ADMIN) || hasRole(COMPANY_DEVELOPER);
    };

    const canManagePayments = () => {
        return hasRole(COMPANY_ADMIN);
    };

    const canManageTerms = () => {
        return hasRole(COMPANY_ADMIN);
    };

    return {
        user,
        canAccessClientRoutes,
        canAccessCompanyRoutes,
        canAccessAdminRoutes,
        canManageClients,
        canManageEmployees,
        canManageProjects,
        canViewFinancials,
        canManageRequirements,
        canManageBugs,
        canManagePayments,
        canManageTerms,
        hasRole,
        isClient,
        isCompanyUser,
        isAdmin,
    };
};
