name: "FitTrack - Comprehensive Fitness Center Management System PRP"
description: |

## Purpose
Complete implementation blueprint for FitTrack, a full-stack Next.js 15 fitness center management system with role-based architecture (Admin, Trainer, Member), comprehensive health tracking, workout planning, nutrition management, and gamification features.

## Core Principles
1. **Context is King**: All necessary documentation, patterns, and constraints included
2. **Role-Based Security**: Strict access control and data isolation
3. **Mobile-First Design**: Responsive, touch-optimized interfaces
4. **Server Actions Pattern**: All database operations via Next.js Server Actions
5. **Global rules**: Follow all rules in CLAUDE.md

---

## Goal
Build a complete fitness center management system that enables admins to manage trainers, trainers to manage members and create fitness plans, and members to track their fitness journey with comprehensive health metrics, workout logging, nutrition tracking, and gamification.

## Why
- **Business Value**: Streamlines fitness center operations, reduces manual paperwork, improves member engagement
- **User Impact**: Provides personalized fitness tracking, progress visualization, and motivation through gamification
- **Integration**: Unified platform for all stakeholders with real-time data synchronization
- **Problems Solved**: Manual tracking inefficiencies, lack of progress visibility, member retention challenges

## What
A role-based web application with three distinct user interfaces:
- **Admin Portal**: Trainer management, member oversight, package configuration, financial reporting
- **Trainer Dashboard**: Member management, workout/nutrition plan creation, progress monitoring
- **Member App**: Personal dashboard, goal tracking, workout logging, nutrition tracking, gamification

### Success Criteria
- [ ] Complete authentication system with JWT-based registration links
- [ ] Fully functional admin, trainer, and member modules
- [ ] Real-time health metrics tracking with photo uploads
- [ ] Comprehensive workout plan creation and logging system
- [ ] Nutrition planning with macro tracking
- [ ] Gamification system with points, badges, and challenges
- [ ] Mobile-responsive design across all modules
- [ ] Secure database operations with parameterized queries
- [ ] Payment integration with QR code generation
- [ ] Progress analytics and reporting features

## All Needed Context

### Documentation & References
```yaml
# MUST READ - Core documentation for implementation
- url: https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations
  why: Next.js 15 Server Actions patterns and best practices
  critical: Security considerations and error handling patterns

- url: https://ui.shadcn.com/docs
  why: Component library patterns and customization approaches
  critical: Composition patterns and accessibility requirements

- url: https://sidorares.github.io/node-mysql2/docs
  why: MySQL2 connection pooling and query optimization
  critical: Performance patterns and prepared statements

- file: /Users/panyakkd/Desktop/Cloner/project2/fitnes/CLAUDE.md
  why: Project-specific guidelines, architecture patterns, and constraints
  critical: Server Actions pattern, file organization, testing requirements

- file: /Users/panyakkd/Desktop/Cloner/project2/fitnes/schema/schema.sql
  why: Complete database schema and relationships
  critical: Table structures, constraints, and foreign key relationships

- file: /Users/panyakkd/Desktop/Cloner/project2/fitnes/actions/admin/createTrainer.js
  why: Server Actions pattern example with error handling
  critical: Password hashing, validation, and response structure

- file: /Users/panyakkd/Desktop/Cloner/project2/fitnes/actions/member/healthActions.js
  why: Health data operations pattern with JSDoc documentation
  critical: Input validation, error handling, and security patterns

- file: /Users/panyakkd/Desktop/Cloner/project2/fitnes/app/admin/_components/TrainerTable.jsx
  why: Component organization, state management, and UI patterns
  critical: Performance optimization, pagination, and user interactions

- file: /Users/panyakkd/Desktop/Cloner/project2/fitnes/components/ui/button.jsx
  why: shadcn/ui component structure and variant patterns
  critical: Class variance authority usage and Tailwind integration

- file: /Users/panyakkd/Desktop/Cloner/project2/fitnes/lib/db.js
  why: Database connection pooling pattern
  critical: Global connection pool management and error handling
```

### Current Codebase Structure
```bash
fitnes/
├── CLAUDE.md                      # Development guidelines
├── schema/schema.sql              # Database schema
├── package.json                   # Dependencies and scripts
├── actions/                       # Server Actions by domain
│   ├── admin/                     # Admin-specific operations
│   ├── member/                    # Member-specific operations
│   ├── trainer/                   # Trainer-specific operations
│   ├── macro-engine/              # Nutrition calculation engine
│   └── register/                  # Registration system
├── app/                          # Next.js 15 App Router
│   ├── admin/                    # Admin portal pages
│   ├── trainer/[trainerId]/      # Dynamic trainer routes
│   ├── member/[id]/              # Dynamic member routes
│   └── register/[token]/         # Token-based registration
├── components/                   # Reusable UI components
│   ├── ui/                       # shadcn/ui components
│   ├── navigation/               # Role-based navigation
│   ├── button/                   # Specialized buttons
│   └── Theme/                    # Theme provider
├── lib/                          # Utilities and database
│   └── db.js                     # MySQL2 connection pool
├── hooks/                        # Custom React hooks
├── data/                         # Static data (exercises)
├── public/                       # Static assets
│   ├── exercises/                # Exercise demonstration images
│   ├── uploads/                  # User uploaded files
│   └── slip/                     # Payment slip uploads
└── utils/                        # Utility functions
```

### Known Gotchas & Library Quirks
```javascript
// CRITICAL: Next.js 15 Server Actions security
// All Server Actions are public HTTP endpoints - validate everything
// Use "use server" directive at function level, not file level for security

// CRITICAL: MySQL2 connection pooling
// Use global connection pool to prevent connection leaks
// Always use parameterized queries - never string concatenation

// CRITICAL: File upload handling
// Store files in public/uploads/ with UUID names
// Validate file types and sizes on server side

// CRITICAL: Role-based access
// Always verify user permissions in Server Actions
// Never trust client-side role checking

// CRITICAL: Password hashing
// Use bcryptjs instead of bcrypt for compatibility
// Always hash passwords with salt rounds >= 10

// CRITICAL: Form validation
// Project uses manual validation - not Yup schemas yet
// Validate on both client and server sides

// CRITICAL: Mobile responsiveness
// All components must work on mobile devices
// Use Tailwind responsive prefixes (sm:, md:, lg:)

// CRITICAL: Image optimization
// Use Next.js Image component for exercise photos
// Implement lazy loading for large image sets
```

## Implementation Blueprint

### Data Models and Structure

The system uses MySQL with the following core entities:
```sql
-- Core user tables
- trainer: Trainer accounts and profiles
- member: Member accounts and profiles  
- registration: Trainer-member relationships with packages

-- Health tracking
- member_health: Weight, measurements, photos, body fat
- fitness_goal: Member fitness goals and targets

-- Workout system
- workout_plan: Trainer-created workout plans
- workout_program: Individual workout sessions
- program_exercise: Exercises within programs
- program_exercise_set: Sets, reps, weights for exercises
- exercise_log: Member workout completions

-- Nutrition system
- macro_plan: Trainer-created nutrition plans
- intake_logs: Member food/macro intake tracking

-- Gamification
- challenge: Fitness challenges created by trainers
- member_challenge: Member participation in challenges

-- Business
- packages: Membership packages and pricing
```

### List of Tasks to Complete (In Order)

```yaml
Phase 1: Foundation & Security
Task 1: Authentication System
  - REVIEW: actions/register/ for token-based registration
  - ENHANCE: JWT validation and role-based access control
  - CREATE: Password reset functionality
  - SECURE: All authentication endpoints

Task 2: Database Operations Audit
  - REVIEW: All existing Server Actions for security
  - STANDARDIZE: Error handling patterns across actions
  - IMPLEMENT: Input validation for all database operations
  - OPTIMIZE: Query performance with proper indexing

Phase 2: Admin Module Completion
Task 3: Admin Dashboard
  - COMPLETE: app/admin/page.jsx with analytics
  - ENHANCE: Real-time statistics and reporting
  - CREATE: System settings management
  - IMPLEMENT: Bulk operations for trainers

Task 4: Trainer Management
  - ENHANCE: app/admin/trainers/ with full CRUD
  - CREATE: Trainer performance analytics
  - IMPLEMENT: Status management workflow
  - ADD: Advanced search and filtering

Task 5: Package Management
  - COMPLETE: app/admin/packages/ system
  - CREATE: Package templates and customization
  - IMPLEMENT: Pricing rules and discounts
  - ADD: Package analytics and reporting

Phase 3: Trainer Module Enhancement
Task 6: Member Management
  - ENHANCE: app/trainer/[trainerId]/ member dashboard
  - CREATE: Member progress visualization
  - IMPLEMENT: Bulk member operations
  - ADD: Member communication tools

Task 7: Workout Plan System
  - COMPLETE: Workout plan creation interface
  - IMPLEMENT: Exercise library search and filter
  - CREATE: Plan templates and sharing
  - ADD: Progress tracking integration

Task 8: Nutrition Planning
  - ENHANCE: Macro calculation engine
  - CREATE: Meal plan templates
  - IMPLEMENT: Nutrition goal setting
  - ADD: Progress monitoring tools

Phase 4: Member Module Development
Task 9: Member Dashboard
  - CREATE: app/member/[id]/page.jsx comprehensive dashboard
  - IMPLEMENT: Goal progress visualization
  - ADD: Achievement and badge system
  - CREATE: Quick action shortcuts

Task 10: Workout Tracking
  - CREATE: Workout logging interface
  - IMPLEMENT: Exercise form tracking
  - ADD: Rest timer and workout music
  - CREATE: Workout history and analytics

Task 11: Nutrition Tracking
  - CREATE: Food logging interface
  - IMPLEMENT: Macro tracking with visual progress
  - ADD: Meal photo capture
  - CREATE: Nutrition analytics and trends

Task 12: Progress Monitoring
  - CREATE: Health metrics logging
  - IMPLEMENT: Photo progress comparison
  - ADD: Measurement tracking charts
  - CREATE: Progress sharing features

Phase 5: Advanced Features
Task 13: Gamification System
  - CREATE: Points and badge system
  - IMPLEMENT: Challenge participation
  - ADD: Leaderboards and social features
  - CREATE: Reward redemption system

Task 14: Mobile Optimization
  - OPTIMIZE: All components for mobile
  - IMPLEMENT: Touch gestures and interactions
  - ADD: Offline capability for basic features
  - CREATE: PWA configuration

Task 15: Payment Integration
  - COMPLETE: QR code payment system
  - IMPLEMENT: Payment verification workflow
  - ADD: Automated billing and reminders
  - CREATE: Financial reporting tools

Phase 6: Testing & Performance
Task 16: Comprehensive Testing
  - CREATE: Jest test suites for all Server Actions
  - IMPLEMENT: Component testing with React Testing Library
  - ADD: Integration tests for critical workflows
  - CREATE: Performance benchmarking

Task 17: Performance Optimization
  - OPTIMIZE: Database queries and indexing
  - IMPLEMENT: Image optimization and lazy loading
  - ADD: Caching strategies for frequent data
  - CREATE: Bundle size optimization

Task 18: Security Hardening
  - AUDIT: All user inputs and validation
  - IMPLEMENT: Rate limiting for sensitive operations
  - ADD: Security headers and CSRF protection
  - CREATE: Data encryption for sensitive information
```

### Critical Implementation Patterns

```javascript
// Server Action Pattern (Follow this exactly)
"use server";

import pool from "@/lib/db";

/**
 * Server Action with proper error handling and validation
 * @param {Object} data - Input data to validate
 * @returns {Promise<Object>} Standard response format
 */
export async function exampleAction(data) {
  try {
    // 1. Always validate input first
    if (!data.required_field) {
      throw new Error("Required field missing");
    }

    // 2. Verify user permissions
    // await verifyUserPermission(userId, requiredRole);

    // 3. Use parameterized queries
    const [result] = await pool.query(
      `SELECT * FROM table WHERE field = ?`,
      [data.required_field]
    );

    // 4. Return standardized response
    return { 
      success: true, 
      data: result,
      message: "Operation completed successfully"
    };
  } catch (error) {
    console.error("Action error:", error);
    return { 
      success: false, 
      error: error.message 
    };
  }
}

// Component Pattern (Follow this structure)
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function ExampleComponent({ initialData }) {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(initialData);

  // Mobile-responsive classes
  const containerClasses = "p-4 sm:p-6 lg:p-8";
  const gridClasses = "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4";

  const handleAction = async () => {
    setLoading(true);
    try {
      const result = await exampleAction(data);
      if (result.success) {
        // Handle success
        setData(result.data);
      } else {
        // Handle error
        console.error(result.error);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className={containerClasses}>
      <div className={gridClasses}>
        {/* Component content */}
      </div>
      <Button 
        onClick={handleAction} 
        disabled={loading}
        className="w-full sm:w-auto"
      >
        {loading ? "Loading..." : "Action"}
      </Button>
    </Card>
  );
}
```

### Integration Points
```yaml
DATABASE:
  - connection: Use existing MySQL2 pool from lib/db.js
  - migrations: All schema changes in schema/schema.sql
  - indexing: Add indexes for frequently queried fields

AUTHENTICATION:
  - pattern: JWT-based registration tokens
  - storage: Session management in client state
  - validation: Server-side role verification

ROUTING:
  - admin: /admin/* - Admin portal routes
  - trainer: /trainer/[trainerId]/* - Trainer-specific routes  
  - member: /member/[id]/* - Member-specific routes
  - api: Use Server Actions, not API routes

STYLING:
  - framework: Tailwind CSS with shadcn/ui components
  - theme: Dark/light mode with next-themes
  - responsive: Mobile-first approach with breakpoints

FILE UPLOADS:
  - storage: public/uploads/ directory
  - naming: UUID-based file names
  - validation: Server-side type and size checks
```

## Validation Loop

### Level 1: Syntax & Style
```bash
# Run these FIRST - fix any errors before proceeding
npm run lint                    # Next.js linting
npm run build                   # Build verification

# Expected: No errors. If errors, read and fix before continuing.
```

### Level 2: Unit Tests (Create comprehensive test suite)
```javascript
// CREATE tests/ directory with test files
// tests/actions/admin/createTrainer.test.js
import { createTrainer } from "@/actions/admin/createTrainer";

describe("createTrainer", () => {
  test("creates trainer with valid data", async () => {
    const validData = {
      trainer_username: "testuser",
      trainer_password: "password123",
      trainer_firstname: "John",
      trainer_lastname: "Doe",
      trainer_email: "john@example.com"
    };
    
    const result = await createTrainer(validData);
    expect(result.success).toBe(true);
    expect(result.trainer_id).toBeDefined();
  });

  test("fails with missing required fields", async () => {
    const invalidData = {
      trainer_username: "testuser"
      // Missing required fields
    };
    
    const result = await createTrainer(invalidData);
    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });

  test("handles duplicate username", async () => {
    // Test duplicate prevention
  });
});
```

```bash
# Run tests and iterate until passing:
npm run test
# If failing: Read error, understand root cause, fix code, re-run
```

### Level 3: Integration Test
```bash
# Start development server
npm run dev

# Test admin functionality
curl -X POST http://localhost:3000/admin/trainers \
  -H "Content-Type: application/json" \
  -d '{"trainer_username": "test", "trainer_email": "test@example.com"}'

# Test trainer functionality
# Navigate to http://localhost:3000/trainer/1 and verify interface

# Test member functionality  
# Navigate to http://localhost:3000/member/1 and verify interface

# Expected: All interfaces load without errors, data persists correctly
```

## Final Validation Checklist
- [ ] All Server Actions have proper error handling
- [ ] Database queries use parameterized statements
- [ ] All components are mobile-responsive
- [ ] Role-based access control implemented
- [ ] File uploads are secure and validated
- [ ] Password hashing uses bcryptjs with proper salt
- [ ] All forms have client and server validation
- [ ] Image optimization implemented for exercise photos
- [ ] Payment system integrates with QR code generation
- [ ] Gamification features are engaging and bug-free
- [ ] Performance is optimized for mobile devices
- [ ] Security best practices followed throughout

---

## Anti-Patterns to Avoid
- ❌ Don't use API routes - use Server Actions exclusively
- ❌ Don't trust client-side role checking for security
- ❌ Don't store sensitive data in client state
- ❌ Don't use string concatenation for SQL queries
- ❌ Don't skip mobile responsiveness testing
- ❌ Don't implement authentication without proper validation
- ❌ Don't upload files without security checks
- ❌ Don't create components longer than 500 lines
- ❌ Don't ignore database connection pooling
- ❌ Don't skip error boundaries in complex components

## Implementation Confidence Score: 9/10

This PRP provides comprehensive context, follows established patterns, includes security considerations, and provides executable validation steps. The high confidence score reflects the thorough research conducted on the existing codebase, comprehensive documentation of patterns, and clear implementation roadmap with validation loops.