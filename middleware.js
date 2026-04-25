// middleware.ts
import { NextResponse } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET);

export async function middleware(req) {
    const path = req.nextUrl.pathname;
    const url = req.nextUrl.clone();

    // Check protected routes (admin and dashboard)
    if (path.startsWith("/admin") || path.startsWith("/api/admin") || path.startsWith("/dashboard")) {
        const token = req.cookies.get("token")?.value;

        if (!token) {
            // 401 Unauthorized - User not logged in
            url.pathname = "/unauthorized";
            url.searchParams.set("error", "unauthorized");
            url.searchParams.set("redirect", path);
            return NextResponse.redirect(url); // Changed from rewrite to redirect
        }

        try {
            const { payload } = await jwtVerify(token, JWT_SECRET, {
                algorithms: ["HS256"],
                issuer: process.env.NODE_ENV === "production"
                    ? process.env.NEXT_PUBLIC_BASE_URL
                    : "http://localhost:3000",
                audience: "yourapp-users",
            });
            
            // For admin routes, check if user has admin role
            if ((path.startsWith("/admin") || path.startsWith("/api/admin")) && payload.role !== "admin") {
                // 403 Forbidden - User logged in but not authorized for admin
                url.pathname = "/unauthorized";
                url.searchParams.set("error", "forbidden");
                url.searchParams.set("redirect", "/dashboard");
                return NextResponse.redirect(url); // Changed from rewrite to redirect
            }

            // For dashboard routes, check if user has allowed roles
            if (path.startsWith("/dashboard") && !["admin", "guest", "staff"].includes(payload.role)) {
                // 403 Forbidden - User logged in but not authorized for dashboard
                url.pathname = "/unauthorized";
                url.searchParams.set("error", "forbidden");
                url.searchParams.set("redirect", "/");
                return NextResponse.redirect(url); // Changed from rewrite to redirect
            }

            // ✅ JWT valid & appropriate role
            return NextResponse.next();
        } catch (err) {
            console.error("[SECURITY] Middleware JWT verification failed:", err.message);

            // Check if error is due to token expiration
            if (err.message.includes("exp claim") || err.message.includes("expiration")) {
                // Session expired
                url.pathname = "/unauthorized";
                url.searchParams.set("error", "session_expired");
                url.searchParams.set("redirect", path);
                return NextResponse.redirect(url); // Changed from rewrite to redirect
            }

            // Other JWT verification errors (malformed token, etc.)
            url.pathname = "/unauthorized";
            url.searchParams.set("error", "unauthorized");
            url.searchParams.set("redirect", path);
            return NextResponse.redirect(url); // Changed from rewrite to redirect
        }
    }

    // For all other routes, continue
    return NextResponse.next();
}

export const config = {
    matcher: ["/admin/:path*", "/api/admin/:path*", "/dashboard/:path*"],
};