# CashMate - Financial Management API Server

A comprehensive RESTful API backend for a personal finance management application with AI chatbot support, built with **Node.js**, **Express**, and **MongoDB**.

## 📋 Features

### 🔐 Authentication
- User registration with secure password hashing (bcryptjs)
- Login with JWT token-based authentication
- Protected routes with token verification
- Logout functionality

### 👤 User Management
- Get and update user profile information
- Change password with verification
- Delete account (with cascade deletion)
- Upload and manage avatar pictures
- Track monthly income

### 💰 Financial Tracking
- **Add Transactions**: Create income/expense entries with categories
- **Manage Transactions**: Update, delete, and retrieve transactions
- **Financial Insights**:
  - Total income and expense tracking
  - Remaining balance calculation
  - Financial health score (0-100)
  - Categorical expense breakdown
- **Transaction History**: View all or recent transactions with pagination

### 🔔 Notifications
- Send real-time notifications to users
- Mark notifications as read
- Delete notifications
- Filter unread notifications
- Notification history with timestamps

### 🤖 AI Chatbot
- Chat history storage per user
- User context awareness (financial data)
- Message persistence
- Clear chat history
- Ready for AI integration (OpenAI, Google Gemini, etc.)

---

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or cloud)
- npm or yarn

### Installation

1. **Clone or navigate to the server directory**
```bash
cd server
```

2. **Install dependencies**
```bash
npm install
```

3. **Create `.env` file**
```bash
cp .env.example .env
```

Edit `.env` with your configuration:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/cashmate
JWT_SECRET=your_super_secret_key_change_this_in_production
```

4. **Start the server**
```bash
npm start
```

The server will run at `http://localhost:5000`

---

## 📚 Documentation

### API Reference
See [API_DOCUMENTATION.md](API_DOCUMENTATION.md) for complete endpoint documentation with examples.

### Implementation Guide
See [IMPLEMENTATION_GUIDE.md](IMPLEMENTATION_GUIDE.md) for setup, integration points, and production checklist.

### Frontend Integration
See [FRONTEND_INTEGRATION.md](FRONTEND_INTEGRATION.md) for React/Vue integration examples.

---

## 📁 Project Structure

```
server/
├── app.js                          # Express app configuration
├── server.js                       # Server entry point
├── package.json                    # Dependencies
├── .env.example                    # Environment template
│
├── config/
│   └── db.js                       # MongoDB connection
│
├── middleware/
│   └── isAuth.js                   # JWT authentication middleware
│
├── models/
│   ├── User.js                     # User schema
│   ├── Transaction.js              # Transaction schema
│   ├── Category.js                 # Category schema
│   ├── Notification.js             # Notification schema
│   └── ChatHistory.js              # Chat history schema
│
├── controllers/
│   ├── authController.js           # Auth logic (register, login, logout)
│   ├── userController.js           # User/profile operations
│   ├── transactionController.js    # Transaction CRUD operations
│   ├── notificationController.js   # Notification management
│   └── chatController.js           # Chatbot functionality
│
├── routes/
│   └── routes.js                   # All API route definitions
│
├── API_DOCUMENTATION.md            # Complete API docs
├── IMPLEMENTATION_GUIDE.md         # Setup and integration guide
└── FRONTEND_INTEGRATION.md         # Frontend code examples
```

---

## 🔌 API Endpoints Summary

| Category | Method | Endpoint | Auth |
|----------|--------|----------|------|
| **Auth** | POST | `/api/auth/register` | ❌ |
| | POST | `/api/auth/login` | ❌ |
| | POST | `/api/auth/logout` | ✅ |
| **User** | GET | `/api/user/info` | ✅ |
| | GET | `/api/user/profile` | ✅ |
| | PUT | `/api/user/profile` | ✅ |
| | POST | `/api/user/change-password` | ✅ |
| | DELETE | `/api/user/account` | ✅ |
| **Transactions** | POST | `/api/transactions` | ✅ |
| | GET | `/api/transactions` | ✅ |
| | GET | `/api/transactions/recent` | ✅ |
| | PUT | `/api/transactions/:id` | ✅ |
| | DELETE | `/api/transactions/:id` | ✅ |
| **Expenses** | GET | `/api/expenses/categorical` | ✅ |
| **Notifications** | GET | `/api/notifications` | ✅ |
| | GET | `/api/notifications/unread` | ✅ |
| | PUT | `/api/notifications/:id/read` | ✅ |
| | DELETE | `/api/notifications/:id` | ✅ |
| **Chat** | GET | `/api/chat/context` | ✅ |
| | POST | `/api/chat/message` | ✅ |
| | GET | `/api/chat/history` | ✅ |
| | DELETE | `/api/chat/history` | ✅ |

---

## 🔧 Technology Stack

- **Runtime**: Node.js
- **Framework**: Express.js v5.2.1
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT (jsonwebtoken)
- **Password Hashing**: bcryptjs
- **Environment**: dotenv
- **Development**: Nodemon

---

## 🛡️ Security Features

- ✅ Password hashing with bcryptjs (10 salt rounds)
- ✅ JWT-based authentication (7-day expiration)
- ✅ Protected routes with middleware
- ✅ Email uniqueness validation
- ✅ Input validation
- ✅ CORS enabled
- ✅ Account deletion cascade (removes all user data)

---

## 📊 Database Schema

### User Schema
```javascript
{
  fullName: String (required),
  email: String (unique, required),
  password: String (hashed, required),
  monthly_income: Number,
  total_income: Number,
  total_expense: Number,
  financial_health: Number (0-100),
  avatarUrl: String,
  member_since: Date
}
```

### Transaction Schema
```javascript
{
  user_id: ObjectId (ref: User),
  description: String,
  amount: Number (required),
  type: String (enum: ['income', 'expense']),
  category: {
    category_id: ObjectId,
    name: String
  },
  date: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### Notification Schema
```javascript
{
  user_id: ObjectId (ref: User),
  type: String,
  message: String,
  is_read: Boolean (default: false),
  metadata: Mixed,
  createdAt: Date
}
```

### ChatHistory Schema
```javascript
{
  user_id: ObjectId (ref: User),
  role: String (enum: ['user', 'bot']),
  message: String,
  context_metadata: Mixed,
  createdAt: Date
}
```

---

## 🧪 Testing

### Using Postman

1. **Register a User**
```
POST http://localhost:5000/api/auth/register
{
  "fullName": "Test User",
  "email": "test@example.com",
  "password": "Test123!",
  "monthlyIncome": 5000
}
```

2. **Login**
```
POST http://localhost:5000/api/auth/login
{
  "email": "test@example.com",
  "password": "Test123!"
}
```

3. **Get User Info** (add `Authorization: Bearer <token>` header)
```
GET http://localhost:5000/api/user/info
```

4. **Add Transaction** (add token in Authorization header)
```
POST http://localhost:5000/api/transactions
{
  "description": "Grocery shopping",
  "category": "Food",
  "amount": 50.50,
  "type": "expense"
}
```

---

## 🔌 Integration Points

### AI Chatbot
The chatbot currently has placeholder responses. Integrate with:
- **OpenAI GPT**: `npm install openai`
- **Google Gemini**: `npm install @google/generative-ai`
- **Hugging Face**: Custom API calls

### Cloud Storage
For avatar uploads:
- **Cloudinary**: `npm install cloudinary`
- **AWS S3**: `npm install aws-sdk`

### Email Notifications
- **Nodemailer**: `npm install nodemailer`
- **SendGrid**: `npm install @sendgrid/mail`

See [IMPLEMENTATION_GUIDE.md](IMPLEMENTATION_GUIDE.md) for code examples.

---

## ⚙️ Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `PORT` | Server port (default: 5000) | ❌ |
| `MONGO_URI` | MongoDB connection string | ✅ |
| `JWT_SECRET` | Secret key for JWT tokens | ✅ |
| `OPENAI_API_KEY` | OpenAI API key (for chatbot) | ❌ |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name (for uploads) | ❌ |
| `CLOUDINARY_API_KEY` | Cloudinary API key | ❌ |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret | ❌ |

---

## 📈 Financial Health Score

The financial health score is calculated based on the income-to-expense ratio:

```
Financial Health = 100 - (Total Expense / Total Income * 50)
Range: 0-100
- 80-100: Excellent
- 60-79: Good
- 40-59: Fair
- 0-39: Poor
```

---

## 🚀 Production Deployment

### Checklist

- [ ] Set strong `JWT_SECRET` environment variable
- [ ] Configure production MongoDB URI
- [ ] Set `NODE_ENV=production`
- [ ] Enable HTTPS
- [ ] Set up environment variables securely (use .env file or secret manager)
- [ ] Configure CORS for your frontend domain
- [ ] Enable rate limiting
- [ ] Set up logging and monitoring
- [ ] Enable request signing for API calls
- [ ] Configure database backups
- [ ] Set up error tracking (Sentry, etc.)
- [ ] Add API versioning (`/api/v1/...`)

### Recommended Packages

```bash
npm install helmet express-rate-limit winston morgan joi
```

---

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| MongoDB connection failed | Check `MONGO_URI` in .env and ensure MongoDB is running |
| JWT token invalid | Verify `JWT_SECRET` is set and consistent |
| Cannot find module 'X' | Run `npm install` to install all dependencies |
| Port already in use | Change `PORT` in .env or kill the process using the port |
| CORS errors | Check frontend URL in cors configuration |

---

## 📝 License

This project is for educational purposes.

---

## 📞 Support & Questions

Need help? Check out:
1. [API_DOCUMENTATION.md](API_DOCUMENTATION.md) - API endpoint details
2. [IMPLEMENTATION_GUIDE.md](IMPLEMENTATION_GUIDE.md) - Setup and integration
3. [FRONTEND_INTEGRATION.md](FRONTEND_INTEGRATION.md) - Frontend code examples

---

## 🙏 Acknowledgments

Built with Node.js, Express, MongoDB, and passion for financial wellness! 💰

