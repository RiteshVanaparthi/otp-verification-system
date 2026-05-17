# Viva Preparation - OTP Verification System

## 1. What problem does this project solve?
It provides secure user verification using One-Time Passwords and allows access only after successful OTP validation.

## 2. Why Node.js + Express?
Node.js is fast for I/O tasks and Express gives a clean, modular way to build REST APIs.

## 3. Where is OTP stored?
OTP is stored temporarily with `expiresAt` and `isUsed` state. If MongoDB is not available, an in-memory fallback is used.

## 4. How is OTP expiry handled?
Each OTP has an expiry timestamp. During verification, expired OTPs are rejected and cleaned.

## 5. What middleware is used?
- Validation middleware (`express-validator`) to validate request fields.
- Auth middleware (JWT) to protect CRUD routes.
- Error middleware for centralized error responses.

## 6. Which routes are protected?
All `/api/users/*` routes require Bearer token.

## 7. Explain CRUD in your project.
User APIs support:
- Create user
- Read all users
- Read user by id
- Update user
- Delete user

## 8. How frontend integrates backend?
Frontend uses JavaScript `fetch()` API to call backend endpoints, display responses, and store JWT in memory for protected calls.

## 9. What are common error cases handled?
- Missing/invalid contact format
- Invalid OTP
- Expired OTP
- Missing or invalid token
- Route not found

## 10. How can this be improved for production?
- Move OTP notifications to provider failover queues and retries
- Rate limiting on OTP generation
- Hash OTP before storing
- Add Redis for fast OTP storage
- Add automated unit/integration tests

## 11. Which services are used for OTP delivery?
- Nodemailer sends OTP emails through SMTP.
- Twilio sends OTP SMS messages to phone numbers.
