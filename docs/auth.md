# Authentication Documentation

## Overview

FitTrack implements a secure authentication system using JWT (JSON Web Tokens) for session management and role-based access control. The system supports three user roles: Admin, Trainer, and Member.

## Authentication Flow

### Registration Process

1. **Member Registration**

   ```javascript
   // actions/auth/register.js
   "use server";

   async function registerMember(formData) {
     // Implementation
   }
   ```

   **Flow:**

   1. Validate registration data
   2. Hash password
   3. Create user record
   4. Create profile record
   5. Generate verification email
   6. Return success response

2. **Trainer Registration**

   ```javascript
   // actions/auth/registerTrainer.js
   "use server";

   async function registerTrainer(formData) {
     // Implementation
   }
   ```

   **Flow:**

   1. Validate trainer credentials
   2. Verify admin approval
   3. Create trainer account
   4. Set up trainer profile
   5. Generate welcome email

### Login Process

```javascript
// actions/auth/login.js
"use server";

async function login(formData) {
  // Implementation
}
```

**Flow:**

1. Validate credentials
2. Verify account status
3. Generate JWT token
4. Set session cookie
5. Return user data

## Session Management

### JWT Structure

```javascript
{
  "sub": "user_id",
  "role": "member|trainer|admin",
  "iat": "issued_at",
  "exp": "expiration_time"
}
```

### Token Storage

- Access Token: HTTP-only cookie
- Refresh Token: HTTP-only cookie
- Token Expiration: 24 hours

## Role-Based Access Control

### Role Definitions

1. **Admin**

   - Full system access
   - User management
   - System configuration
   - Analytics access

2. **Trainer**

   - Client management
   - Workout plan creation
   - Nutrition plan creation
   - Progress tracking

3. **Member**
   - Personal profile
   - Workout logging
   - Nutrition logging
   - Progress viewing

### Access Control Implementation

```javascript
// middleware.js
export function middleware(request) {
  // Implementation
}
```

**Protected Routes:**

- `/dashboard/*`: All authenticated users
- `/admin/*`: Admin only
- `/trainer/*`: Trainer and Admin
- `/member/*`: All users

## Security Measures

### Password Security

```javascript
// lib/auth.js
async function hashPassword(password) {
  // Implementation
}
```

- Bcrypt hashing
- Salt rounds: 12
- Minimum length: 8 characters
- Complexity requirements

### Session Security

- HTTP-only cookies
- Secure flag
- SameSite attribute
- CSRF protection

### Rate Limiting

```javascript
// middleware/rateLimit.js
export function rateLimit(request) {
  // Implementation
}
```

- Login attempts: 5 per minute
- API requests: 60 per minute
- Registration: 3 per hour

## Authentication Components

### LoginForm

```javascript
// components/auth/LoginForm.jsx
"use client";

export default function LoginForm() {
  // Implementation
}
```

**Features:**

- Email/password validation
- Error handling
- Remember me option
- Password reset link

### RegisterForm

```javascript
// components/auth/RegisterForm.jsx
"use client";

export default function RegisterForm() {
  // Implementation
}
```

**Features:**

- Form validation
- Password strength meter
- Terms acceptance
- Role selection

## Error Handling

### Authentication Errors

```javascript
{
  "error": {
    "code": "AUTH_ERROR",
    "message": "Invalid credentials",
    "details": {}
  }
}
```

### Common Error Codes

- `INVALID_CREDENTIALS`
- `ACCOUNT_LOCKED`
- `TOKEN_EXPIRED`
- `INVALID_TOKEN`
- `ACCESS_DENIED`

## Password Reset Flow

1. **Request Reset**

   ```javascript
   // actions/auth/requestReset.js
   "use server";

   async function requestPasswordReset(email) {
     // Implementation
   }
   ```

2. **Reset Password**

   ```javascript
   // actions/auth/resetPassword.js
   "use server";

   async function resetPassword(token, newPassword) {
     // Implementation
   }
   ```

## Session Management

### Session Store

```javascript
// lib/session.js
export class SessionStore {
  // Implementation
}
```

**Features:**

- Token refresh
- Session invalidation
- Concurrent session handling
- Session timeout

### Session Middleware

```javascript
// middleware/session.js
export function sessionMiddleware(request) {
  // Implementation
}
```

## Testing

### Authentication Tests

```javascript
// __tests__/auth.test.js
describe("Authentication", () => {
  it("should login successfully", () => {
    // Test implementation
  });

  it("should handle invalid credentials", () => {
    // Test implementation
  });
});
```

## Security Best Practices

1. **Password Requirements**

   - Minimum 8 characters
   - At least one uppercase letter
   - At least one number
   - At least one special character

2. **Session Management**

   - Regular token rotation
   - Session timeout
   - Concurrent session limits
   - Secure cookie settings

3. **Access Control**
   - Principle of least privilege
   - Role-based permissions
   - Resource ownership validation
   - API endpoint protection
