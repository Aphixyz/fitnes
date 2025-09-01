## FEATURE:

### FitTrack - Comprehensive Fitness Center Management System

**Core System Overview:**

- **Role-based application** serving 3 user types: Admin, Trainer, Member
- **Full-stack Next.js 15** application with Server Actions architecture
- **MySQL database** with comprehensive fitness tracking schema
- **Mobile-first responsive design** with Tailwind CSS and shadcn/ui

**Key Features by User Role:**

#### 🏢 **Admin Module** (`/app/admin/`)

- **Trainer Management**: Create, edit, delete trainer accounts
- **Member Management**: View all members, manage subscriptions
- **Package Management**: Create and manage fitness packages
- **Financial Reports**: Revenue tracking, payment management
- **System Settings**: Configure application settings and parameters
- **Analytics Dashboard**: System-wide performance metrics

#### 👨‍💼 **Trainer Module** (`/app/trainer/[trainerId]/`)

- **Member Management**: Assign and manage assigned members
- **Workout Planning**: Create personalized workout plans
- **Nutrition Planning**: Design nutrition plans macro plan macronutritien (calories,Carb,protein,fat)
- **Progress Tracking**: Monitor member progress and achievements
- **Profile Management**: Update trainer profile and availability   

#### 👤 **Member Module** (`/app/member/[id]/`)

- **Personal Dashboard**: Overview of fitness journey
- **Goal Setting**: Set and track fitness goals
- **Workout Plans**: View and follow assigned workout routines
- **Nutrition Tracking**: Log macronutrations track macronutritien intake (calories,Carb,protein,fat)
- **Progress Monitoring**: Track weight, measurements, and achievements
- **Gamification**: Earn points, badges, and rewards
- **Quick Add**: Quick logging of workouts and meals

**Technical Architecture:**

- **Server Actions**: All database operations via Next.js Server Actions
- **Authentication**: JWT-based authentication with role-based access
- **State Management**: SWR for client-side data, Server Components for server state
- **Database**: MySQL with connection pooling via MySQL2
- **UI Framework**: shadcn/ui components with Tailwind CSS
- **Form Handling**: react-hook-form with Yup validation

## DOCUMENTATION:

### **Project Documentation:**

- `CLAUDE.md` - Development guidelines and project context
- `schema/schema.sql` - Complete database schema and relationships
- `README.md` - Setup instructions and project overview

### **Technical References:**

- **Next.js 15 Documentation**: App Router, Server Actions, Server Components
- **shadcn/ui Documentation**: Component library and styling patterns
- **Tailwind CSS Documentation**: Utility-first CSS framework
- **MySQL2 Documentation**: Database connection and query patterns
- **SWR Documentation**: Data fetching and caching strategies
- **react-hook-form Documentation**: Form state management
- **Yup Documentation**: Schema validation patterns

### **Design System:**

- **Exercise Library**: `data/exercises.json` - Complete exercise database
- **Image Assets**: `public/exercises/` - Exercise demonstration images
- **UI Components**: `components/ui/` - Reusable component library

### **API Documentation:**

- **Server Actions**: Located in `actions/` directory organized by domain
- **Database Queries**: All queries use parameterized statements with MySQL2
- **Error Handling**: Structured error responses for all Server Actions

### **Development Workflow:**

- **Git Workflow**: Feature branches for each module (admin/trainer/member)
- **Testing Strategy**: Jest unit tests for components and Server Actions
- **Code Quality**: ESLint configuration for Next.js and React
- **Performance**: Image optimization, code splitting, caching strategies

## OTHER CONSIDERATIONS:

### **🔐 Security & Privacy:**

- **Role-based Access Control**: Ensure members can only access their own data
- **Trainer-Member Relationships**: Validate trainer access to member data
- **Input Validation**: All user inputs must be validated in Server Actions
- **SQL Injection Prevention**: Use parameterized queries exclusively
- **JWT Token Management**: Secure token handling for authentication
- **Data Privacy**: GDPR compliance for member health data

### **📱 Mobile-First Design:**

- **Responsive Components**: All components must work on mobile devices
- **Touch Interactions**: Optimize for touch-based interactions
- **Offline Capability**: Consider offline functionality for workout logging
- **Performance**: Optimize for slower mobile connections

### **🏗️ Architecture Patterns:**

- **Server Actions Pattern**: All database operations through Server Actions
- **Component Organization**: Use `_components/` for private components
- **File Size Limits**: Keep files under 500 lines, split when needed
- **Import Strategy**: Prefer relative imports within packages
- **Error Boundaries**: Implement proper error handling at component level

### **🎯 Business Logic:**

- **Gamification System**: Points, badges, and achievement tracking
- **Progress Calculation**: Automatic progress calculations and goal tracking
- **Payment Integration**: Subscription management and payment processing
- **Data Analytics**: Progress reporting and trend analysis

### **⚡ Performance Considerations:**

- **Database Optimization**: Use connection pooling and query optimization
- **Image Optimization**: Next.js Image component with proper sizing
- **Code Splitting**: Dynamic imports for large components
- **Caching Strategy**: Implement proper caching for frequently accessed data
- **Bundle Size**: Monitor and optimize JavaScript bundle sizes

### **🧪 Testing Strategy:**

- **Unit Tests**: Jest tests for all Server Actions and components
- **Integration Tests**: Test module interactions and data flow
- **User Role Testing**: Ensure proper access control for each user type
- **Mobile Testing**: Test responsive design across device sizes
- **Database Testing**: Test database operations and data integrity

### **🚀 Deployment & DevOps:**

- **Environment Configuration**: Separate configs for dev/staging/production
- **Database Migrations**: Version control for schema changes
- **Monitoring**: Error tracking and performance monitoring
- **Backup Strategy**: Regular database backups and data recovery
- **CI/CD Pipeline**: Automated testing and deployment processes

### **📊 Data Management:**

- **Health Data Sensitivity**: Secure handling of personal health information
- **Data Retention**: Policies for data storage and deletion
- **Backup & Recovery**: Regular backups and disaster recovery plans
- **Data Export**: Allow users to export their fitness data
- **Analytics**: Privacy-compliant analytics and reporting

### **🔄 Common AI Assistant Pitfalls:**

- **Server Actions vs API Routes**: Always use Server Actions, not API routes
- **Component Organization**: Follow established directory structure
- **Database Schema**: Always check `schema/schema.sql` before database operations
- **Role-based Logic**: Implement proper access control for each user type
- **Error Handling**: Use try-catch in Server Actions, not just client components
- **Mobile Responsiveness**: Test all components on mobile devices
- **Performance**: Consider bundle size and loading times
- **Security**: Validate all inputs and use parameterized queries
