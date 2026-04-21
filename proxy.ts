import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { AUTH_ROUTES, getDefaultRouteForRole, SIGN_IN_ROUTE } from "@/lib/auth/routes";
import { getMiddlewareSession } from "@/lib/supabase/middleware";

function redirectWithResponse(target: URL, response: NextResponse) {
  const redirectResponse = NextResponse.redirect(target);

  for (const cookie of response.cookies.getAll()) {
    redirectResponse.cookies.set(cookie);
  }

  return redirectResponse;
}

export async function proxy(request: NextRequest) {
  const { response, sessionUser } = await getMiddlewareSession(request);
  const pathname = request.nextUrl.pathname;
  const isSellerRoute = pathname === "/seller" || pathname.startsWith("/seller/");
  const isAuthRoute = AUTH_ROUTES.has(pathname);

  if (isSellerRoute && !sessionUser) {
    const redirectUrl = new URL(SIGN_IN_ROUTE, request.url);
    redirectUrl.searchParams.set("next", pathname);
    return redirectWithResponse(redirectUrl, response);
  }

  if (isSellerRoute && sessionUser?.role !== "seller") {
    if (!sessionUser) {
      const redirectUrl = new URL(SIGN_IN_ROUTE, request.url);
      redirectUrl.searchParams.set("next", pathname);
      return redirectWithResponse(redirectUrl, response);
    }

    return redirectWithResponse(new URL(getDefaultRouteForRole(sessionUser.role), request.url), response);
  }

  if (isAuthRoute && sessionUser) {
    return redirectWithResponse(new URL(getDefaultRouteForRole(sessionUser.role), request.url), response);
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|avif|ico)$).*)",
  ],
};
