# CashMate API Documentation

## Base URL
```
http://localhost:5000/api
```

## Authentication
All protected routes require a JWT token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

---

## 🔐 AUTHENTICATION ROUTES

### 1. Register
**POST** `/auth/register`

**Request Body:**
```json
{
  "fullName": "Muntaha",
  "email": "user@example.com",
  "password": "securePassword123",
  "monthlyIncome": 5000
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user_id",
    "fullName": "Muntaha",
    "email": "user@example.com"
  }
}
```

---

### 2. Login
**POST** `/auth/login`

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user_id",
    "fullName": "Muntaha",
    "email": "user@example.com"
  }
}
```

---

### 3. Logout
**POST** `/auth/logout`

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

## 👤 USER/PROFILE ROUTES

### 4. Get User Info
**GET** `/user/info`

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "total_income": 15000,
    "total_expense": 5000,
    "remaining_balance": 10000,
    "financial_health": 85
  }
}
```

---

### 5. Get Profile Information
**GET** `/user/profile`

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "fullName": "Muntaha",
    "email": "user@example.com",
    "monthlyIncome": 5000,
    "avatarUrl": "https://cloudinary.com/..."
  }
}
```

---

### 6. Update Profile Information
**PUT** `/user/profile`

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "fullName": "Muntaha Updated",
  "monthlyIncome": 6000,
  "avatarUrl": "https://cloudinary.com/..."
}
```

**Response:**
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "fullName": "Muntaha Updated",
    "email": "user@example.com",
    "monthlyIncome": 6000,
    "avatarUrl": "https://cloudinary.com/..."
  }
}
```

---

### 7. Update Profile Photo
**POST** `/user/profile-photo`

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "avatarUrl": "https://cloudinary.com/..."
}
```

**Response:**
```json
{
  "success": true,
  "message": "Profile photo updated successfully",
  "data": {
    "avatarUrl": "https://cloudinary.com/..."
  }
}
```

---

### 8. Change Password
**POST** `/user/change-password`

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "current": "oldPassword123",
  "new": "newPassword456",
  "confirm": "newPassword456"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Password changed successfully"
}
```

---

### 9. Delete Account
**DELETE** `/user/account`

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "message": "Account deleted successfully"
}
```

---

## 💰 TRANSACTION ROUTES

### 10. Add Transaction
**POST** `/transactions`

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "description": "Grocery shopping",
  "category": "Food",
  "amount": 50.50,
  "type": "expense",
  "date": "2026-02-16"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Transaction added successfully",
  "data": {
    "_id": "transaction_id",
    "user_id": "user_id",
    "description": "Grocery shopping",
    "category": { "name": "Food" },
    "amount": 50.50,
    "type": "expense",
    "date": "2026-02-16",
    "createdAt": "2026-02-16T10:00:00Z",
    "updatedAt": "2026-02-16T10:00:00Z"
  }
}
```

---

### 11. Get Recent Transactions
**GET** `/transactions/recent?limit=10`

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "transaction_description": "Grocery shopping",
      "category": "Food",
      "amount": 50.50,
      "date": "02/16/2026",
      "type": "expense"
    }
  ]
}
```

---

### 12. Get All Transactions
**GET** `/transactions`

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "transaction_id": "transaction_id",
      "transaction_description": "Grocery shopping",
      "user_id": "user_id",
      "amount": 50.50,
      "category_id": "category_id",
      "category_name": "Food",
      "transaction_type": "expense",
      "created_at": "2026-02-16T10:00:00Z",
      "updated_at": "2026-02-16T10:00:00Z"
    }
  ]
}
```

---

### 13. Update Transaction
**PUT** `/transactions/:transactionId`

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "description": "Updated description",
  "category": "Food",
  "amount": 60.00
}
```

**Response:**
```json
{
  "success": true,
  "message": "Transaction updated successfully",
  "data": {
    "_id": "transaction_id",
    "description": "Updated description",
    "amount": 60.00
  }
}
```

---

### 14. Delete Transaction
**DELETE** `/transactions/:transactionId`

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "message": "Transaction deleted successfully"
}
```

---

## 📊 CATEGORICAL EXPENSES

### 15. Get Categorical Expenses
**GET** `/expenses/categorical`

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "category_name": "Food",
      "money": 250.75,
      "color": "auto"
    },
    {
      "category_name": "Transport",
      "money": 150.00,
      "color": "auto"
    }
  ]
}
```

---

## 🔔 NOTIFICATION ROUTES

### 16. Get All Notifications
**GET** `/notifications`

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "notif_id": "notification_id",
      "user_id": "user_id",
      "type": "warning",
      "message": "Your spending exceeded budget",
      "is_read": false,
      "created_at": "2026-02-16T10:00:00Z",
      "timestamp": "02/16/2026",
      "read": false
    }
  ]
}
```

---

### 17. Get Unread Notifications
**GET** `/notifications/unread`

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "message": "Your spending exceeded budget",
      "type": "warning",
      "timestamp": "02/16/2026",
      "read": false
    }
  ]
}
```

---

### 18. Mark Notification as Read
**PUT** `/notifications/:notificationId/read`

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "message": "Notification marked as read",
  "data": {
    "_id": "notification_id",
    "is_read": true
  }
}
```

---

### 19. Delete Notification
**DELETE** `/notifications/:notificationId`

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "message": "Notification deleted successfully"
}
```

---

## 🤖 CHATBOT ROUTES

### 20. Get Chatbot Context
**GET** `/chat/context`

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "fullName": "Muntaha",
      "email": "user@example.com",
      "avatarUrl": "https://cloudinary.com/..."
    },
    "financial_info": {
      "total_income": 15000,
      "total_expense": 5000,
      "remaining_balance": 10000,
      "financial_health": 85,
      "monthly_income": 5000
    },
    "recent_transactions": [
      {
        "description": "Grocery shopping",
        "category": "Food",
        "amount": 50.50,
        "type": "expense",
        "date": "2026-02-16"
      }
    ]
  }
}
```

---

### 21. Send Chat Message
**POST** `/chat/message`

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "message": "How can I improve my financial health?",
  "role": "user"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Message sent successfully",
  "data": {
    "user_message": {
      "_id": "message_id",
      "user_id": "user_id",
      "role": "user",
      "message": "How can I improve my financial health?",
      "createdAt": "2026-02-16T10:00:00Z"
    },
    "bot_response": {
      "_id": "message_id",
      "user_id": "user_id",
      "role": "bot",
      "message": "Based on your financial data, here are some suggestions...",
      "createdAt": "2026-02-16T10:00:00Z"
    }
  }
}
```

---

### 22. Get Chat History
**GET** `/chat/history`

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "message_id",
      "user_id": "user_id",
      "role": "user",
      "message": "How can I improve my financial health?",
      "context_metadata": {},
      "createdAt": "2026-02-16T10:00:00Z"
    },
    {
      "_id": "message_id",
      "user_id": "user_id",
      "role": "bot",
      "message": "Based on your financial data, here are some suggestions...",
      "context_metadata": {},
      "createdAt": "2026-02-16T10:00:00Z"
    }
  ]
}
```

---

### 23. Clear Chat History
**DELETE** `/chat/history`

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "message": "Chat history cleared successfully"
}
```

---

## 📋 SUMMARY OF ALL ENDPOINTS

| # | Method | Endpoint | Description | Auth Required |
|---|--------|----------|-------------|---|
| 1 | POST | `/auth/register` | Register new user | ❌ |
| 2 | POST | `/auth/login` | Login user | ❌ |
| 3 | POST | `/auth/logout` | Logout user | ✅ |
| 4 | GET | `/user/info` | Get financial info | ✅ |
| 5 | GET | `/user/profile` | Get profile info | ✅ |
| 6 | PUT | `/user/profile` | Update profile | ✅ |
| 7 | POST | `/user/profile-photo` | Update avatar | ✅ |
| 8 | POST | `/user/change-password` | Change password | ✅ |
| 9 | DELETE | `/user/account` | Delete account | ✅ |
| 10 | POST | `/transactions` | Add transaction | ✅ |
| 11 | GET | `/transactions/recent` | Get recent transactions | ✅ |
| 12 | GET | `/transactions` | Get all transactions | ✅ |
| 13 | PUT | `/transactions/:id` | Update transaction | ✅ |
| 14 | DELETE | `/transactions/:id` | Delete transaction | ✅ |
| 15 | GET | `/expenses/categorical` | Get expenses by category | ✅ |
| 16 | GET | `/notifications` | Get all notifications | ✅ |
| 17 | GET | `/notifications/unread` | Get unread notifications | ✅ |
| 18 | PUT | `/notifications/:id/read` | Mark as read | ✅ |
| 19 | DELETE | `/notifications/:id` | Delete notification | ✅ |
| 20 | GET | `/chat/context` | Get chatbot context | ✅ |
| 21 | POST | `/chat/message` | Send chat message | ✅ |
| 22 | GET | `/chat/history` | Get chat history | ✅ |
| 23 | DELETE | `/chat/history` | Clear chat history | ✅ |

---

## 🔧 Implementation Notes

1. **JWT Secret**: Change `JWT_SECRET` in `.env` for production
2. **Financial Health**: Calculated automatically based on income vs expense ratio
3. **Notifications**: Create notifications programmatically using the `createNotification` helper
4. **Chatbot**: Currently has placeholder responses. Integrate with OpenAI/Gemini to your choice
5. **Cloudinary**: For avatar uploads, integrate with Cloudinary API
6. **Transaction Updates**: Automatically recalculates user's financial metrics

---

## 📝 Error Handling

All endpoints return standardized error responses:

```json
{
  "success": false,
  "message": "Error description"
}
```

Common HTTP status codes:
- `200`: Success
- `201`: Created
- `400`: Bad Request
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Not Found
- `500`: Server Error

