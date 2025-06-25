# CodeCampus - Online Coding Education Platform

## Overview

CodeCampus is a comprehensive online coding education platform that provides interactive programming challenges, real-time code editing, skill tracking, and competitive programming features. The platform serves multiple user types including learners, examiners, administrators, and super administrators, each with tailored dashboards and functionality.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Styling**: Tailwind CSS with shadcn/ui component library
- **State Management**: TanStack Query (React Query) for server state
- **Routing**: Wouter for client-side routing
- **Code Editor**: Monaco Editor integration for multi-language support
- **Form Handling**: React Hook Form with Zod validation
- **Build Tool**: Vite for development and production builds

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **Authentication**: Passport.js with local strategy and express-session
- **Session Storage**: PostgreSQL-backed session store
- **Password Security**: Node.js crypto module with scrypt hashing

### Database Architecture
- **Primary Database**: PostgreSQL hosted on Neon
- **ORM**: Drizzle ORM for type-safe database operations
- **Migrations**: Drizzle Kit for schema management
- **Connection Pooling**: pg Pool for efficient database connections

## Key Components

### Authentication & Authorization
- Role-based access control (super_admin, admin, examiner, learner)
- Session-based authentication with secure cookie configuration
- Protected routes with role-specific access restrictions
- Password hashing using scrypt with salt generation

### Problem Management System
- CRUD operations for coding problems with difficulty levels
- Tag-based categorization system
- Test case management with JSON storage
- Starter code templates for multiple programming languages
- Admin and examiner interfaces for content management

### Code Execution Environment
- Monaco Editor integration with syntax highlighting
- Multi-language support (JavaScript, Python, Java, C++, etc.)
- Real-time code editing with customizable themes
- Code submission and evaluation system

### User Progress Tracking
- Submission history with status tracking
- Skill-based progress monitoring
- Performance analytics and reporting
- Competition participation tracking

### Competitive Programming
- Contest creation and management
- Leaderboard systems
- Time-based challenges
- User competition history

## Data Flow

### User Authentication Flow
1. User submits login credentials via React form
2. Express server validates credentials against PostgreSQL
3. Passport.js creates authenticated session
4. Session stored in PostgreSQL with express-session
5. Client receives user data and updates application state

### Problem Solving Flow
1. User selects problem from categorized list
2. Monaco Editor loads with starter code template
3. User writes solution in preferred programming language
4. Code submission triggers backend validation
5. Results stored in submissions table with status
6. User progress and statistics updated accordingly

### Content Management Flow
1. Admin/Examiner creates problems via form interface
2. Data validated using Zod schemas
3. Drizzle ORM persists to PostgreSQL
4. Problem tags and relationships managed
5. Content immediately available to learners

## External Dependencies

### Production Dependencies
- **Database**: Neon PostgreSQL for cloud database hosting
- **UI Components**: Radix UI primitives via shadcn/ui
- **Charting**: Chart.js for analytics visualization
- **Date Handling**: date-fns for date manipulation
- **Icons**: Lucide React for consistent iconography

### Development Dependencies
- **Build Tools**: Vite, esbuild for bundling and transpilation
- **Type Checking**: TypeScript for static type safety
- **Code Quality**: ESLint and Prettier for code standards
- **CSS Processing**: PostCSS with Autoprefixer

### Runtime Environment
- **Platform**: Replit deployment with Node.js 20
- **Process Management**: tsx for TypeScript execution
- **Environment Variables**: dotenv for configuration management

## Deployment Strategy

### Development Environment
- **Server**: tsx with hot reloading on port 5000
- **Database**: Direct connection to Neon PostgreSQL
- **Build Process**: Vite dev server with HMR
- **Session Secret**: Environment variable configuration

### Production Environment
- **Build Process**: Vite production build + esbuild server bundling
- **Static Assets**: Served from dist/public directory
- **Database**: Connection pooling with environment-based configuration
- **Deployment**: Replit autoscale deployment target

### Database Management
- **Migrations**: Drizzle Kit push for schema updates
- **Seeding**: Custom seed script for initial data population
- **Backup Strategy**: Relies on Neon's built-in backup systems

## Changelog
```
Changelog:
- June 25, 2025. Initial setup
```

## User Preferences
```
Preferred communication style: Simple, everyday language.
```