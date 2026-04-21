import type { AppRole } from "@/types/domain";

export const SIGN_IN_ROUTE = "/sign-in";
export const SIGN_UP_ROUTE = "/sign-up";
export const SELLER_ROOT_ROUTE = "/seller";
export const BUYER_HOME_ROUTE = "/browse";

export const AUTH_ROUTES = new Set([SIGN_IN_ROUTE, SIGN_UP_ROUTE]);

export function getDefaultRouteForRole(role: AppRole) {
  if (role === "seller") {
    return SELLER_ROOT_ROUTE;
  }

  return BUYER_HOME_ROUTE;
}
