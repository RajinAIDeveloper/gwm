# Architecture

## Roles

- Seller → uploads waste
- Buyer → browses & buys
- Admin → moderates

## Core Features (MVP)

- Auth (Supabase)
- Create listing
- Browse listings
- Listing detail
- Contact seller

## Entities

### User

- id
- role (seller | buyer | admin)

### Listing

- id
- title
- description
- category
- quantity
- price
- images[]
- user_id

### Inquiry

- id
- listing_id
- buyer_id
- message
