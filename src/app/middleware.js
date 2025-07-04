import { NextResponse } from "next/server";
import { decrypt } from "@/app/lib/session";
import { cookies } from "next/headers";

const publicRoutes = [
    "/auth/login",
    "/auth/verify-email",
    "/auth/verification-code",
    "/auth/forget-password",
    "/auth/verification-success",
];

export default async function middleware(req) {
    const path = req.nextUrl.pathname;
    const isPublicRoute = publicRoutes.includes(path);

    // Get session from cookies
    const cookie = (await cookies()).get("session")?.value;
    const session = await decrypt(cookie);

    // Redirect to login if user is not authenticated
    if (!session?.userId && !isPublicRoute) {
        return NextResponse.redirect(new URL("/auth/login", req.nextUrl));
    }

    // Redirect authenticated users away from auth pages
    if (session?.userId && isPublicRoute) {
        return NextResponse.redirect(new URL("/company/projects", req.nextUrl));
    }

    // Check user role authorization
    const userRole = session?.role; // Expecting role: companyAdmin, companyUser, clientAdmin, clientUser
    const allowedRoutes = rolePermissions[userRole] || [];

    // Redirect unauthorized users
    if (!allowedRoutes.includes(path)) {
        return NextResponse.redirect(new URL("/auth/login", req.nextUrl));
    }

    return NextResponse.next();
}

// Apply middleware to all routes except API, static, and image files
export const config = {
    matcher: ["/((?!api|_next/static|_next/image|.*\\.png$).*)"],
};
