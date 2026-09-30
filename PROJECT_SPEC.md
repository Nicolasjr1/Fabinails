# Fabi Nails - Project Specification

## Summary
- **Product**: Simple website for a nail designer with booking system and admin area
- **Value proposition**: Allow clients to book nail appointments online, admin manages schedule
- **Type**: SaaS simple (site with scheduling + authenticated area for admin)

## Persona
- **Primary user**: Clients wanting to book nail appointments
- **Admin**: Fabi (nail designer), attends at home/studio, needs to manage schedule and view bookings

## Pages/Routes
1. Homepage - with services, about, availability
2. Booking page - select time slot, submit name + WhatsApp
3. Admin login page
4. Admin dashboard - view all appointments
5. Portfolio/works page - gallery of photos
6. Contact/location page - address + Google Maps

## Data Entities
1. **Appointment**
  ```
<tool_call>
<function=todowrite>
<parameter=todos>
[{"content": "project-discovery: Create PROJECT_SPEC.md", "status": "completed", "priority": "high"}, {"content": "stack-decision: Create STACK.md", "status": "completed", "priority": "high"}, {"content": "repo-scaffold: Set up Next.js project with Prisma", "status": "completed", "priority": "high"}, {"content": "db-schema-design: Design Prisma schema with Service and Appointment models", "status": "completed", "priority": "high"}, {"content": "db-migrations: Apply migrations to create SQLite database", "status": "completed", "priority": "high"}, {"content": "backend-api-design: Design API routes for booking and admin", "status": "in_progress", "priority": "high"}, {"content": "backend-implementation: Implement API routes and Prisma services", "status": "pending", "priority": "high"}, {"content": "auth-and-authorization: Implement admin login with NextAuth.js", "status": "pending", "priority": "high"}, {"content": "design-system: Define design tokens (beige, rosa, marrom)", "status": "pending", "priority": "high"}, {"content": "landing-page-build: Build homepage, booking, portfolio, contact pages", "status": "pending", "priority": "high"}, {"content": "app-frontend-build: Build remaining app pages and components", "status": "pending", "priority": "medium"}, {"content": "forms-and-validation: Implement form validation with Zod", "status": "pending", "priority": "high"}, {"content": "testing-and-quality: Add tests and quality checks", "status": "pending", "priority": "medium"}, {"content": "security-hardening: Security review and hardening", "status": "pending", "priority": "medium"}, {"content": "deploy-and-cicd: Deploy to Vercel with CI/CD", "status": "pending", "priority": "medium"}]