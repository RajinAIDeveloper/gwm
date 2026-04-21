# Garment Waste Marketplace MVP Test Plan

## Scope
- Validate the lean MVP only: public landing, auth entry points, seller route protection, public browse/detail, seller listing flow, and the single inquiry form.
- Exclude deferred features: admin UI, threaded messaging, notifications, payments, saved items, and advanced search.

## Automated Smoke Coverage
- `tests/smoke.spec.ts`
  - Confirms `/`, `/sign-in`, and `/sign-up` render for anonymous users.
  - Confirms anonymous access to `/seller` redirects to `/sign-in?next=/seller`.
  - Conditionally validates `/browse` only when real Supabase env values are present.
  - Conditionally validates `/listings/[id]` anonymous inquiry gating only when real Supabase env values and `E2E_LISTING_ID` are present.

## Runtime Prerequisites For Full Smoke Validation
- `NEXT_PUBLIC_SUPABASE_URL` must point to a real Supabase project.
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` must be a real anon key.
- `E2E_LISTING_ID` must reference an existing public listing to validate the detail page and inquiry gating.
- Optional authenticated flow checks require disposable buyer/seller credentials and any Supabase email-confirmation constraints resolved outside the app.

## Manual Validation Checklist
- Anonymous access
  - `/` loads the landing page.
  - `/browse` loads for anonymous users.
  - `/listings/[id]` loads for anonymous users.
  - `/seller` redirects anonymous users to `/sign-in?next=/seller`.
- Auth and roles
  - Sign-up persists the selected `buyer` or `seller` role.
  - Sign-in redirects sellers to `/seller` and buyers to `/browse`.
  - Auth pages redirect signed-in users away from `/sign-in` and `/sign-up`.
- Seller flow
  - Seller can create a listing with required fields and images.
  - Seller can edit an existing owned listing.
  - Seller dashboard shows owned listings.
  - Seller inbox shows inquiries on owned listings only.
- Buyer flow
  - Buyer can browse public listings.
  - Buyer can open listing detail.
  - Buyer can submit one inquiry to a seller.
  - Buyer cannot inquire on their own listing.
- Security assumptions
  - Seller-only routes stay inaccessible to anonymous users and buyers.
  - Inquiry submission remains buyer-only.
  - RLS-backed behavior should be confirmed against a real Supabase project because placeholder env values block runtime verification in this repo snapshot.

## QA Reporting Rules
- Separate environment/setup blockers from code defects.
- For code defects, report the exact route or feature, the likely file/area owner, and the observed failure.
