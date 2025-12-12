# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a NestJS + MongoDB backend for a Country Delight-style milk & grocery delivery application. The core functionality includes multi-role authentication (Customer, Delivery Boy, Admin), OTP-based signup, JWT authentication, and user management.

## Development Commands

### Installation
```bash
npm install
```

### Running the Application
```bash
# Development mode with hot reload
npm run start:dev

# Production mode
npm run build
npm run start:prod

# Debug mode
npm run start:debug
```

### Code Quality
```bash
# Linting
npm run lint

# Format code
npm run format
```

### Testing
```bash
# Run all tests
npm test

# Run tests in watch mode
npm test:watch

# Run tests with coverage
npm test:cov

# Run e2e tests
npm test:e2e
```

## Architecture Overview

### Module Structure

The application follows NestJS modular architecture:

- **auth/**: Handles all authentication flows (OTP, password-based login, token refresh)
- **users/**: User management, CRUD operations, profile management
- **admin/**: Admin-specific operations (creating delivery boys, viewing users)
- **otp/**: OTP generation, verification, and cleanup
- **tokens/**: JWT token generation and verification (access + refresh tokens)
- **common/**: Shared utilities including decorators, guards, enums, and interfaces

### Authentication Flow

1. **Customer Signup/Login**:
   - Request OTP → Verify OTP → Auto-create user if new → Return JWT tokens
   - OTP expires in 10 minutes with max 5 verification attempts

2. **Delivery Boy OTP Login**:
   - Must be created by admin first
   - Request OTP → Verify account exists and is active → Send OTP → Verify OTP → Return JWT tokens
   - Cannot signup on their own, only existing delivery boys can login via OTP

3. **Password-based Login** (Delivery Boy/Customer):
   - Login with phone/email + password → Validate credentials → Return JWT tokens

4. **Admin Login**:
   - Email + password → Validate admin role → Return JWT tokens

5. **Token Refresh**:
   - Submit refresh token → Verify stored hash → Return new token pair

### Security Implementation

- **Global JWT Guard**: All routes protected by default via `APP_GUARD` in `auth.module.ts`
- **Public Routes**: Use `@Public()` decorator to bypass authentication
- **Role-Based Access**: Use `@Roles(UserRole.ADMIN)` decorator with `RolesGuard`
- **Password Hashing**: bcrypt with 10 salt rounds
- **Refresh Token Storage**: Hashed in database for security

### Key Decorators

- `@Public()`: Mark routes as public (no auth required)
- `@Roles(UserRole.ADMIN, UserRole.CUSTOMER)`: Restrict access by role
- `@CurrentUser()`: Extract user from JWT payload
- `@CurrentUser('sub')`: Extract specific field (e.g., user ID)

### Database Schema

**User Schema** (`users/schemas/user.schema.ts`):
- Supports three roles: admin, customer, delivery_boy
- Phone number is unique and required
- Email is unique but optional
- Includes address object, verification flags, and refresh token storage
- Indexed on phone, email, and role for performance

**OTP Schema** (`otp/schemas/otp.schema.ts`):
- Auto-expires documents using MongoDB TTL index
- Tracks verification attempts to prevent brute force
- One active OTP per phone number

### Environment Configuration

Required environment variables (see `.env.example`):
- `MONGODB_URI`: MongoDB connection string
- `JWT_ACCESS_SECRET`: Secret for access tokens
- `JWT_REFRESH_SECRET`: Secret for refresh tokens
- `JWT_ACCESS_EXPIRY`: Access token expiry (default: 15m)
- `JWT_REFRESH_EXPIRY`: Refresh token expiry (default: 7d)

### Important Implementation Details

1. **Global Validation**: ValidationPipe enabled in `main.ts` with `whitelist: true` to strip unknown properties

2. **API Prefix**: All routes prefixed with `/api/v1`

3. **OTP in Development**: OTP is logged to console and returned in response. In production, remove the OTP from response and integrate SMS service in `otp.service.ts`

4. **First Admin User**: Must be manually created in MongoDB or via script (see README.md)

5. **Refresh Token Rotation**: New refresh token issued on every refresh request, old one invalidated

6. **Delivery Boy Authentication**:
   - Two authentication methods: OTP-based and password-based
   - Delivery boys MUST be created by admin first via `/admin/delivery-boy` endpoint
   - OTP login endpoints: `/auth/delivery-boy/request-otp` and `/auth/delivery-boy/verify-otp`
   - Password login uses same `/auth/login` endpoint as customers
   - OTP request validates that user exists, is a delivery boy, and account is active

### Common Patterns

**Creating a Protected Route**:
```typescript
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@Get('protected')
someMethod(@CurrentUser() user: JwtPayload) {
  // Route only accessible by authenticated admins
}
```

**Creating a Public Route**:
```typescript
@Public()
@Post('public')
someMethod() {
  // No authentication required
}
```

### Error Handling

Controllers throw appropriate HTTP exceptions:
- `UnauthorizedException`: Invalid credentials, expired tokens
- `BadRequestException`: Invalid OTP, validation errors
- `ConflictException`: Duplicate user registration
- `NotFoundException`: User not found

### Extension Points

When adding new features:

1. **New Module**: Use `nest g module <name>` to generate scaffolding
2. **New Role**: Add to `UserRole` enum in `common/enums/user-role.enum.ts`
3. **SMS Integration**: Modify `otp.service.ts` to call SMS provider API
4. **Additional User Fields**: Update User schema and DTOs accordingly
5. **New Protected Routes**: Use existing guard and decorator patterns

### Database Indexes

Existing indexes for performance:
- User: phone (unique), email (unique, sparse), role
- OTP: phone, expiresAt (TTL index)

Add indexes for new query patterns to maintain performance at scale.

### Testing Approach

- Unit tests should be co-located with services (e.g., `users.service.spec.ts`)
- E2E tests in `test/` directory
- Mock external dependencies (database, SMS service) in tests
- Test authentication flows thoroughly including token expiry and refresh

### Production Checklist

Before deploying:
1. Remove OTP from API responses
2. Integrate real SMS service
3. Set strong JWT secrets
4. Enable MongoDB authentication
5. Configure CORS properly
6. Add rate limiting middleware
7. Set up monitoring and logging
8. Use environment-specific configs
