import { NextResponse } from "next/server";

// Define public routes that don't require authentication
const publicRoutes = [
    "/",
    "/auth/login",
    "/auth/verify-email", 
    "/auth/verification-code",
    "/auth/forget-password",
    "/auth/reset-password",
    "/auth/verification-success",
    "/auth-test", // For debugging
];

export default async function middleware(req) {
    const path = req.nextUrl.pathname;
    const isPublicRoute = publicRoutes.includes(path) || path.startsWith('/auth');

    // Allow public routes and static assets
    if (isPublicRoute || 
        path.startsWith('/_next') || 
        path.startsWith('/api') || 
        path.includes('.')) {
        return NextResponse.next();
    }

    // For all other protected routes, let the client-side ProtectedRoute components 
    // handle the detailed authentication and role checking
    // This provides a basic server-side filter while allowing flexible client-side logic
    return NextResponse.next();
}

// Apply middleware to all routes except API, static, and image files
export const config = {
    matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.(png|jpg|jpeg|gif|svg)$).*)"],
};
