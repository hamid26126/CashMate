# CashMate Server - Implementation Guide

## 📁 Project Structure

```
server/
├── app.js                          # Express app setup
├── server.js                       # Server entry point
├── package.json                    # Dependencies
├── .env.example                    # Environment variables template
├── API_DOCUMENTATION.md            # Complete API docs
├── IMPLEMENTATION_GUIDE.md         # This file
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
│   ├── ChatHistory.js              # Chat history schema
│   └── ExpenseCategoryDivision.js  # (Optional) Expense division
│
├── controllers/
│   ├── authController.js           # Authentication logic
│   ├── userController.js           # User/Profile logic
│   ├── transactionController.js    # Transaction logic
│   ├── notificationController.js   # Notification logic
│   └── chatController.js           # Chatbot logic
│
└── routes/
    └── routes.js                   # All API routes
```

---

## ⚙️ Setup Instructions

### 1. Environment Variables
Create a `.env` file in the server directory:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/cashmate
JWT_SECRET=your_super_secret_key_change_this_in_production
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Run the Server
```bash
npm start
```

The server should be running at `http://localhost:5000`

---

## 🔌 Integration Points

### 1. **AI Chatbot Integration**
The chatbot endpoint is at `/chat/message`. Currently, it has a placeholder response generator.

**To integrate with OpenAI (GPT):**

```bash
npm install openai
```

Update [chatController.js](controllers/chatController.js) - `generateAIResponse()` function:

```javascript
const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function generateAIResponse(message, userContext) {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: `You are a helpful financial advisor. 
                   User's financial info: ${JSON.stringify(userContext)}`
        },
        {
          role: 'user',
          content: message
        }
      ],
      temperature: 0.7,
      max_tokens: 500,
    });

    return response.choices[0].message.content;
  } catch (error) {
    console.error('OpenAI Error:', error);
    return 'I apologize, I could not process your request at this moment.';
  }
}
```

### 2. **Cloudinary Integration** (for avatar uploads)

```bash
npm install cloudinary
```

Create a new file `controllers/cloudinaryController.js`:

```javascript
const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

exports.uploadAvatar = async (req, res) => {
  try {
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: 'cashmate/avatars',
      resource_type: 'auto',
    });

    res.json({
      success: true,
      avatarUrl: result.secure_url,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
```

Add to `.env`:
```env
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### 3. **Email Notifications** (optional)

```bash
npm install nodemailer
```

Create `controllers/emailController.js`:

```javascript
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

exports.sendEmail = async (to, subject, text) => {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to,
      subject,
      text,
    });
  } catch (error) {
    console.error('Email sent failed:', error);
  }
};
```

### 4. **Password Reset Feature**

You can add password reset routes:

```javascript
// routes/routes.js
router.post('/auth/forgot-password', authController.forgotPassword);
router.put('/auth/reset-password/:token', authController.resetPassword);
```

### 5. **Transaction Category Management**

Add category endpoints to manage user-specific categories:

```javascript
// Add to routes
router.get('/categories', isAuth, categoryController.getCategories);
router.post('/categories', isAuth, categoryController.createCategory);
router.delete('/categories/:categoryId', isAuth, categoryController.deleteCategory);
```

---

## 📊 Features Implemented

### ✅ Authentication
- User registration with password hashing (bcryptjs)
- Login with JWT token generation
- Token-based route protection
- Logout endpoint

### ✅ User Management
- Get user profile information
- Update profile (name, income, avatar)
- Change password with verification
- Delete account (removes all data)
- Display avatar from Cloudinary

### ✅ Financial Tracking
- Add income/expense transactions
- Update transaction details
- Delete transactions
- View all transactions with pagination
- View recent transactions
- Get categorical expense breakdown
- Calculate remaining balance
- Track financial health score

### ✅ Notifications
- Send notifications to users
- Mark notifications as read
- Delete notifications
- Get unread notifications
- Get all notifications with timestamp

### ✅ Chatbot
- Store chat history per user
- Send/receive messages
- Get user context for AI prompts
- Clear chat history
- Placeholder AI responses (ready for integration)

---

## 🧪 Testing the API

Use Postman or any API testing tool:

### Register a User:
```
POST http://localhost:5000/api/auth/register
Content-Type: application/json

{
  "fullName": "Test User",
  "email": "test@example.com",
  "password": "Test123!",
  "monthlyIncome": 5000
}
```

### Login:
```
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "Test123!"
}
```

Use the returned token in Authorization header for protected routes:
```
Authorization: Bearer <your_token_here>
```

---

## 🚀 Production Checklist

- [ ] Set strong `JWT_SECRET` in `.env`
- [ ] Configure MongoDB URI for production
- [ ] Add rate limiting (install `express-rate-limit`)
- [ ] Add input validation (install `joi`)
- [ ] Enable CORS properly (restrict to frontend domain)
- [ ] Add error logging (Winston or Morgan)
- [ ] Set up environment variables securely
- [ ] Enable HTTPS
- [ ] Add request/response logging
- [ ] Set up database backups
- [ ] Add API versioning (`/api/v1/...`)
- [ ] Document any custom integrations

---

## 📦 Additional Packages to Consider

```bash
# Input validation
npm install joi

# Rate limiting
npm install express-rate-limit

# Logging
npm install morgan winston

# Environment validation
npm install joi-env

# Helmet for security headers
npm install helmet

# CORS handling
npm install cors

# File uploads
npm install multer
```

---

## 🐛 Troubleshooting

**Issue**: "Cannot find module 'bcryptjs'"
- Solution: Run `npm install bcryptjs`

**Issue**: "JWT token invalid"
- Solution: Make sure JWT_SECRET is set in .env and matches across server

**Issue**: MongoDB connection fails
- Solution: Check `MONGO_URI` in .env and ensure MongoDB is running

**Issue**: Cloudinary upload fails
- Solution: Verify Cloudinary credentials in .env

---

## 📞 Support

For issues or questions:
1. Check the API_DOCUMENTATION.md
2. Review error messages in the response
3. Check server console logs
4. Verify all environment variables are set correctly

