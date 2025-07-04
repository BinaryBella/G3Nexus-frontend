// src/utils/authDebug.ts
import { authService } from '@/app/lib/services';
import { CLIENT_ADMIN, CLIENT_USER, COMPANY_ADMIN, COMPANY_DEVELOPER } from '@/app/lib/constants';

export const debugAuthState = () => {
    const tokens = authService.getTokens();
    console.log('=== AUTH DEBUG ===');
    console.log('Tokens:', {
        hasAccessToken: !!tokens.accessToken,
        hasRefreshToken: !!tokens.refreshToken,
        accessTokenPreview: tokens.accessToken ? tokens.accessToken.substring(0, 50) + '...' : null
    });
    
    if (tokens.accessToken) {
        try {
            const user = authService.getCurrentUser();
            console.log('Current user from token:', user);
            
            console.log('Role constants:', {
                CLIENT_ADMIN,
                CLIENT_USER,
                COMPANY_ADMIN,
                COMPANY_DEVELOPER
            });
            
            console.log('Role checks:', {
                isClient: authService.isClient(),
                isCompanyUser: authService.isCompanyUser(),
                isAdmin: authService.isAdmin(),
                hasClientAdmin: authService.hasRole(CLIENT_ADMIN),
                hasClientUser: authService.hasRole(CLIENT_USER),
                hasCompanyAdmin: authService.hasRole(COMPANY_ADMIN),
                hasCompanyDeveloper: authService.hasRole(COMPANY_DEVELOPER)
            });
            
        } catch (error) {
            console.error('Error getting user from token:', error);
        }
    }
    
    console.log('Token expired:', authService.isTokenExpired());
    console.log('=== END AUTH DEBUG ===');
};

// Helper function to decode and display JWT payload
export const showJWTPayload = (token: string) => {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
            atob(base64)
                .split('')
                .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                .join('')
        );
        const payload = JSON.parse(jsonPayload);
        console.log('Raw JWT Payload:', payload);
        return payload;
    } catch (error) {
        console.error('Error decoding JWT:', error);
        return null;
    }
};
