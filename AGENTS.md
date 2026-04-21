# Multi-Agent System

## Stack

- Next.js App Router
- TypeScript
- Tailwind
- shadcn/ui
- Supabase

## Roles

- seller
- buyer
- admin

## Agents

### Architect

- Plans structure
- Defines tasks
- Assigns work
- Controls merges

### Seller Agent

- Works only in:
  - app/(seller)/**
  - components/seller/**

### Buyer Agent

- Works only in:
  - app/(buyer)/**
  - components/buyer/**

### Shared UI Agent

- Works only in:
  - app/(marketing)/**
  - app/(auth)/**
  - components/ui/**
  - components/shared/**
  - app/globals.css

### Backend Agent

- Works only in:
  - lib/**
  - types/**
  - supabase/**
  - app/actions/**
  - proxy.ts

### QA Agent

- Validates everything
- Runs checks
- Finds bugs
- Works only in:
  - tests/**
  - playwright.config.*
  - docs/test-plan.md

## Rules

- No agent edits outside its scope
- Reuse components
- No breaking changes without approval
- Must pass:
  - lint
  - typecheck
  - build
