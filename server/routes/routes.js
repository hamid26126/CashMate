const express = require('express');
const router = express.Router();
const isAuth = require('../middleware/isAuth');

// Controllers
const authController = require('../controllers/authController');
const userController = require('../controllers/userController');
const transactionController = require('../controllers/transactionController');
const notificationController = require('../controllers/notificationController');
const chatController = require('../controllers/chatController');

// ==================== AUTHENTICATION ROUTES ====================
// POST /api/auth/register
router.post('/auth/register', authController.register);

// POST /api/auth/login
router.post('/auth/login', authController.login);

// POST /api/auth/logout
router.post('/auth/logout', isAuth, authController.logout);

// ==================== USER/PROFILE ROUTES ====================
// GET /api/user/info (total income, total expense, remaining balance, financial health)
router.get('/user/info', isAuth, userController.getInfo);

// GET /api/user/profile
router.get('/user/profile', isAuth, userController.getProfile);

// PUT /api/user/profile
router.put('/user/profile', isAuth, userController.updateProfile);

// POST /api/user/profile-photo
router.post('/user/profile-photo', isAuth, userController.updateProfilePhoto);

// POST /api/user/change-password
router.post('/user/change-password', isAuth, userController.changePassword);

// DELETE /api/user/account
router.delete('/user/account', isAuth, userController.deleteAccount);

// ==================== TRANSACTION ROUTES ====================
// GET /api/transactions/recent
router.get('/transactions/recent', isAuth, transactionController.getRecentTransactions);

// GET /api/transactions
router.get('/transactions', isAuth, transactionController.getAllTransactions);

// POST /api/transactions
router.post('/transactions', isAuth, transactionController.addTransaction);

// PUT /api/transactions/:transactionId
router.put('/transactions/:transactionId', isAuth, transactionController.updateTransaction);

// DELETE /api/transactions/:transactionId
router.delete('/transactions/:transactionId', isAuth, transactionController.deleteTransaction);

// ==================== CATEGORICAL EXPENSES ROUTES ====================
// GET /api/expenses/categorical
router.get('/expenses/categorical', isAuth, userController.getCategoricalExpenses);

// ==================== NOTIFICATION ROUTES ====================
// GET /api/notifications
router.get('/notifications', isAuth, notificationController.getAllNotifications);

// GET /api/notifications/unread
router.get('/notifications/unread', isAuth, notificationController.getUnreadNotifications);

// PUT /api/notifications/:notificationId/read
router.put('/notifications/:notificationId/read', isAuth, notificationController.markAsRead);

// DELETE /api/notifications/:notificationId
router.delete('/notifications/:notificationId', isAuth, notificationController.deleteNotification);

// ==================== CHATBOT ROUTES ====================
// GET /api/chat/context (Get user info for chatbot prompt)
router.get('/chat/context', isAuth, chatController.getChatbotContext);

// POST /api/chat/message
router.post('/chat/message', isAuth, chatController.sendMessage);

// GET /api/chat/history
router.get('/chat/history', isAuth, chatController.getChatHistory);

// DELETE /api/chat/history
router.delete('/chat/history', isAuth, chatController.clearChatHistory);

module.exports = router;
