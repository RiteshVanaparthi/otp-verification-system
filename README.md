# OTP Verification System

A complete OTP Verification System with:

- Frontend: HTML, CSS, JavaScript
- Backend: Node.js + Express
- Database: MongoDB (optional, with in-memory fallback)
- OTP delivery: Nodemailer (email) + Twilio (SMS)
- Middleware: Validation + Authentication
- CRUD APIs: User management
- OTP APIs: Generate, Verify, Expiry

## Project Structure

```text
OTP VERIFICATION SYSTEM/
  backend/
    src/
      config/
      controllers/
      data/
      middlewares/
      models/
      routes/
      services/
      utils/
      validators/
      app.js
      server.js
    .env.example
    package.json
  frontend/
    index.html
    style.css
    script.js
  postman/
    OTP-System.postman_collection.json
  docs/
    screenshots/
  VIVA.md
  README.md
```

## Features Implemented

1. Generate OTP (6-digit)
2. Verify OTP
3. OTP expiry handling
4. User CRUD operations (Create, Read, Update, Delete)
5. Protected routes with JWT authentication middleware
6. Input validation middleware using express-validator
7. Error handling middleware for clean API responses
8. Frontend integration with backend APIs
9. **Verification History Logs** — Real-time tracking of all OTP/CRUD operations with timestamps, status indicators, and auto-clearing

### ✨ Verification Logs Feature

The frontend now includes a **📜 Verification History** section that:
- **Tracks all operations** in real-time (OTP generation, verification, user creation)
- **Displays with timestamps** (HH:MM:SS format)
- **Color-coded status** — Green for success, red for errors
- **Shows details** — Contact, operation type, result message
- **Auto-updates count** — Badge shows total log entries
- **Clear button** — Reset all logs with one click
- **Scrollable list** — Handles unlimited log entries

See [LOGS_FEATURE_GUIDE.md](LOGS_FEATURE_GUIDE.md) for detailed testing instructions.

## API Endpoints

### Public

- `GET /api/health`
- `POST /api/auth/generate-otp`
- `POST /api/auth/verify-otp`

### Protected (Bearer token required)

- `GET /api/users`
- `GET /api/users/:id`
- `POST /api/users`
- `PUT /api/users/:id`
- `DELETE /api/users/:id`

## Setup Instructions

## 1) Backend Setup

```bash
cd backend
npm install
```

Create `.env` in `backend`:

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/otp_verification_system
JWT_SECRET=change_this_secret
OTP_EXPIRY_MINUTES=5
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_email_app_password
SMTP_FROM=your_email@gmail.com
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=+12345678901
SMS_DEFAULT_COUNTRY_CODE=+91
```

If MongoDB is not running, app automatically falls back to in-memory store.

Run backend:

```bash
npm run dev
```

## 2) Frontend Setup

Open `frontend/index.html` in browser.

For best results, use Live Server extension or any static server.

## Project Flow (as required)

User enters email/phone  
-> Server generates 6-digit OTP  
-> OTP stored temporarily with expiry timestamp  
-> OTP is sent through Nodemailer (email) or Twilio (SMS)  
-> User enters OTP  
-> Server verifies OTP (valid, expired, or invalid)  
-> Access granted (JWT token) or denied  
-> JWT token is used for protected CRUD APIs.

## Postman Testing

### How to Run Requests in Postman

1. **Download and open Postman**
   - https://www.postman.com/downloads/

2. **Import collection**
   - Click **File → Import**
   - Select `postman/OTP-System.postman_collection.json`
   - Click **Import**

3. **Run requests in sequence**

   **Step 1: Generate OTP**
   ```
   POST http://localhost:5000/api/auth/generate-otp
   Body: {
     "contact": "test@example.com"
   }
   ```
   Response: Returns 6-digit OTP code

   **Step 2: Verify OTP**
   ```
   POST http://localhost:5000/api/auth/verify-otp
   Body: {
     "contact": "test@example.com",
     "otp": "906830"
   }
   ```
   Response: Returns JWT token (auto-saved to collection variable)

   **Step 3: Create User (protected)**
   ```
   POST http://localhost:5000/api/users
   Headers: Authorization: Bearer <token>
   Body: {
     "name": "John Doe",
     "contact": "test@example.com",
     "contactType": "email"
   }
   ```

   **Step 4: List Users (protected)**
   ```
   GET http://localhost:5000/api/users
   Headers: Authorization: Bearer <token>
   ```

   **Step 5: Other CRUD Operations**
   - `GET /api/users/:id` - View one user
   - `PUT /api/users/:id` - Update user
   - `DELETE /api/users/:id` - Delete user

4. **Tips**
   - Test scripts auto-populate OTP and token variables
   - Use same verified contact for creating user
   - All CRUD endpoints require valid JWT token

## Screenshots to Submit

Capture and place screenshots in `docs/screenshots`:

1. Frontend page loaded
2. Generate OTP success response
3. Verify OTP success response
4. CRUD list users response
5. Error case (invalid/expired OTP)

## Notes

- OTP value is returned in API response for demo/testing only.
- In production, never return OTP in API response.
