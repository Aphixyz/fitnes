# API Documentation

## Overview

FitTrack uses Next.js Server Actions for API endpoints. All API routes are implemented as server actions in the `actions` directory. This documentation covers all available endpoints, their parameters, and response formats.


<!-- ## Achievement System

### Award Achievement

```javascript
// actions/achievements/awardAchievement.js
"use server";

async function awardAchievement(formData) {
  // Implementation
}
```

**Parameters:**

- `userId`: string (required)
- `achievementId`: string (required)

**Response:**

```javascript
{
  success: boolean,
  achievement?: {
    id: string,
    name: string,
    points: number,
    earnedAt: Date
  },
  error?: string
}
``` -->

<!-- ## Error Handling

All API endpoints follow a consistent error handling pattern:

1. **Validation Errors**

   ```javascript
   {
     success: false,
     error: "Validation error message"
   }
   ```

2. **Authentication Errors**

   ```javascript
   {
     success: false,
     error: "Authentication failed"
   }
   ```

3. **Database Errors**
   ```javascript
   {
     success: false,
     error: "Database operation failed"
   }
   ``` -->

## Rate Limiting

AI endpoints are rate-limited to prevent abuse:

- Authentication endpoints: 5 requests per minute
- Other endpoints: 60 requests per minute
P
## Security

1. **Authentication**

   - JWT-based authentication
   - Token expiration: 24 hours
   - Refresh token rotation

2. **Authorization**

   - Role-based access control
   - Resource ownership validation
   - API key validation for external services

3. **Data Protection**
   - Input sanitization
   - SQL injection prevention
   - XSS protection
   - CSRF protection
