# CashMate API - Quick Reference Card

## 🚀 Getting Started

```bash
cd server
npm install
# Edit .env file with MongoDB URI
npm start
```

**Base URL**: `http://localhost:5000/api`

---

## 🔐 Authentication

Add to every protected request:
```
Authorization: Bearer <your_token>
```

---

## 📋 All Endpoints at a Glance

### Authentication
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/auth/register` | ❌ | Register user |
| POST | `/auth/login` | ❌ | Login user |
| POST | `/auth/logout` | ✅ | Logout user |

### User/Profile
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/user/info` | ✅ | Financial summary |
| GET | `/user/profile` | ✅ | Get profile |
| PUT | `/user/profile` | ✅ | Update profile |
| POST | `/user/profile-photo` | ✅ | Update avatar |
| POST | `/user/change-password` | ✅ | Change password |
| DELETE | `/user/account` | ✅ | Delete account |

### Transactions
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/transactions` | ✅ | Add transaction |
| GET | `/transactions` | ✅ | Get all |
| GET | `/transactions/recent` | ✅ | Get recent (limit: 10) |
| PUT | `/transactions/:id` | ✅ | Update |
| DELETE | `/transactions/:id` | ✅ | Delete |

### Expenses
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/expenses/categorical` | ✅ | By category |

### Notifications
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/notifications` | ✅ | Get all |
| GET | `/notifications/unread` | ✅ | Get unread |
| PUT | `/notifications/:id/read` | ✅ | Mark read |
| DELETE | `/notifications/:id` | ✅ | Delete |

### Chat/Chatbot
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/chat/context` | ✅ | Get AI context |
| POST | `/chat/message` | ✅ | Send message |
| GET | `/chat/history` | ✅ | Get history |
| DELETE | `/chat/history` | ✅ | Clear history |

---

## 📝 Common Request Examples

### Register
```
POST /auth/register
{
  "fullName": "Name",
  "email": "user@email.com",
  "password": "pass123",
  "monthlyIncome": 5000
}
```

### Login
```
POST /auth/login
{
  "email": "user@email.com",
  "password": "pass123"
}
→ Returns: { token, user }
```

### Add Transaction
```
POST /transactions (with token)
{
  "description": "Grocery",
  "category": "Food",
  "amount": 50.50,
  "type": "expense",
  "date": "2026-02-16"
}
```

### Chat
```
POST /chat/message (with token)
{
  "message": "How's my budget?"
}
→ Returns: { user_message, bot_response }
```

---

## 🔍 Response Format

**Success (2xx)**
```json
{
  "success": true,
  "message": "Description",
  "data": { /* actual data */ }
}
```

**Error (4xx, 5xx)**
```json
{
  "success": false,
  "message": "Error description"
}
```

---

## 📊 Financial Health Score

```
Score = 100 - (Total Expense / Total Income * 50)
Range: 0-100
80+  → Excellent
60-79 → Good
40-59 → Fair
0-39  → Poor
```

---

## 🗂️ Database Collections

- **users** - User accounts
- **transactions** - Income/expense entries
- **notifications** - User notifications
- **chathistories** - Chat messages
- **categories** - Transaction categories

---

## 🔑 Environment Variables Required

```env
PORT=5000
MONGO_URI=mongodb://...
JWT_SECRET=your_secret_key
```

---

## ⚙️ Dependencies

```json
{
  "bcryptjs": "hashing",
  "jsonwebtoken": "JWT auth",
  "mongoose": "MongoDB",
  "express": "API",
  "cors": "Cross-origin",
  "dotenv": "Env config"
}
```

---

## 🐛 Common Issues & Fixes

| Issue | Fix |
|-------|-----|
| MongoDB connection error | Check MONGO_URI in .env |
| Token invalid | Ensure JWT_SECRET is consistent |
| CORS error | Check origin in app.js |
| Module not found | Run `npm install` |
| Port in use | Change PORT in .env |

---

## 📚 Full Documentation

- **API_DOCUMENTATION.md** - Complete endpoint specs
- **IMPLEMENTATION_GUIDE.md** - Setup & integration
- **FRONTEND_INTEGRATION.md** - Code examples
- **README.md** - Project overview

---

## 🎯 What's Ready

✅ 23 API endpoints
✅ JWT authentication
✅ Password hashing
✅ Financial calculations
✅ Notification system
✅ Chat history storage
✅ Error handling
✅ Request validation

---

## 🔌 What Needs Integration

⏳ AI Chatbot responses (OpenAI/Gemini ready)
⏳ Avatar uploads (Cloudinary ready)
⏳ Email notifications (Nodemailer ready)

See IMPLEMENTATION_GUIDE.md for code.

