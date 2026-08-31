import { NextRequest, NextResponse } from "next/server";

import {
    AUTH_ROUTES,
    STORE_ROUTES,
    CUSTOMER_ROUTES,
    ADMIN_ROUTES,
} from "./constants/shared/routes";

export function proxy(req: NextRequest) {

    // const pathname = req.nextUrl.pathname;

    // const token =
    //     req.cookies.get("token")?.value;

    // const role =
    //     req.cookies.get("role")?.value;

    // // NEW: readable cookie reflecting User.emailVerified — set at login and
    // // updated the moment verify-otp succeeds for type "verifyEmail".
    // // JWT payload only carries { userId, role }, so middleware needs this
    // // separately since it can't hit the database.
    // const emailVerified =
    //     req.cookies.get("emailVerified")?.value === "true";

    // /*
    //  * VERIFY-EMAIL — handled FIRST, as an exact match, before anything else
    //  * gets a chance to redirect it away. This must not use startsWith,
    //  * otherwise a prefix collision with another auth route (e.g. "/verify")
    //  * would sweep this in and cause a redirect loop with AdminRoute.
    //  */
    // // if (pathname === "/verify-email") {
    // //     if (!token) {
    // //         return NextResponse.redirect(new URL("/login", req.url));
    // //     }
    // //     if (role !== "ADMIN") {
    // //         // Only admins go through this gate right now.
    // //         return NextResponse.redirect(new URL("/", req.url));
    // //     }
    // //     if (emailVerified) {
    // //         // Already verified — nothing to do here, send them onward.
    // //         return NextResponse.redirect(new URL("/dashboard", req.url));
    // //     }
    // //     // Unverified admin, correctly on the gate page — let it render.
    // //     return NextResponse.next();
    // // }

    // const isAuthRoute =
    //     AUTH_ROUTES.some((route) =>
    //         pathname.startsWith(route)
    //     );

    // const isStoreRoute =
    //     STORE_ROUTES.some((route) =>
    //         pathname === route ||
    //         pathname.startsWith(`${route}/`)
    //     );

    // const isCustomerRoute =
    //     CUSTOMER_ROUTES.some((route) =>
    //         pathname.startsWith(route)
    //     );

    // const isAdminRoute =
    //     ADMIN_ROUTES.some((route) =>
    //         pathname.startsWith(route)
    //     );

    // /*
    //  * LOGIN / SIGNUP
    //  */
    // if (isAuthRoute && token) {

    //     if (role === "ADMIN") {
    //         return NextResponse.redirect(
    //             new URL("/dashboard", req.url)
    //         );
    //     }

    //     return NextResponse.redirect(
    //         new URL("/", req.url)
    //     );
    // }

    // /*
    //  * ADMIN SHOULD NOT SEE STORE
    //  */
    // if (
    //     isStoreRoute &&
    //     token &&
    //     role === "ADMIN"
    // ) {
    //     return NextResponse.redirect(
    //         new URL("/dashboard", req.url)
    //     );
    // }

    // /*
    //  * CUSTOMER PAGES
    //  */
    // if (isCustomerRoute) {

    //     if (!token) {
    //         return NextResponse.redirect(
    //             new URL(
    //                 `/login?redirect=${pathname}`,
    //                 req.url
    //             )
    //         );
    //     }

    //     if (role !== "CUSTOMER") {
    //         return NextResponse.redirect(
    //             new URL("/dashboard", req.url)
    //         );
    //     }
    // }

    // /*
    //  * ADMIN PAGES
    //  */
    // if (isAdminRoute) {

    //     if (!token) {
    //         return NextResponse.redirect(
    //             new URL(
    //                 `/login?redirect=${pathname}`,
    //                 req.url
    //             )
    //         );
    //     }

    //     if (role !== "ADMIN") {
    //         return NextResponse.redirect(
    //             new URL("/", req.url)
    //         );
    //     }

    //     //     // NEW: unverified admins get bounced to the gate page instead of
    //     //     // ever reaching dashboard/products/orders/etc.
    //     if (!emailVerified) {
    //         return NextResponse.redirect(
    //             new URL("/verify-email", req.url)
    //         );
    //     }
    // }

    return NextResponse.next();
}

export const config = {
    matcher: [
        "/((?!api|_next/static|_next/image|favicon.ico).*)",
    ],
};