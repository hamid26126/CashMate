# Frontend Integration Examples

## Using the CashMate API from Your React/Vue Frontend

### 1. Axios Setup
```javascript
// utils/apiClient.js
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to every request
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default apiClient;
```

---

## Authentication Examples

### Register User
```javascript
import apiClient from '@/utils/apiClient';

async function registerUser(fullName, email, password, monthlyIncome) {
  try {
    const response = await apiClient.post('/auth/register', {
      fullName,
      email,
      password,
      monthlyIncome,
    });

    if (response.data.success) {
      localStorage.setItem('token', response.data.token);
      return response.data.user;
    }
  } catch (error) {
    console.error('Registration failed:', error.response.data.message);
    throw error;
  }
}
```

### Login User
```javascript
async function loginUser(email, password) {
  try {
    const response = await apiClient.post('/auth/login', {
      email,
      password,
    });

    if (response.data.success) {
      localStorage.setItem('token', response.data.token);
      return response.data.user;
    }
  } catch (error) {
    console.error('Login failed:', error.response.data.message);
    throw error;
  }
}
```

### Logout
```javascript
async function logoutUser() {
  try {
    await apiClient.post('/auth/logout');
    localStorage.removeItem('token');
  } catch (error) {
    console.error('Logout error:', error);
  }
}
```

---

## User Profile Examples

### Get User Info
```javascript
async function getUserInfo() {
  try {
    const response = await apiClient.get('/user/info');
    return response.data.data; // Returns: total_income, total_expense, remaining_balance, financial_health
  } catch (error) {
    console.error('Failed to fetch user info:', error);
  }
}
```

### Get Profile
```javascript
async function getProfile() {
  try {
    const response = await apiClient.get('/user/profile');
    return response.data.data;
  } catch (error) {
    console.error('Failed to fetch profile:', error);
  }
}
```

### Update Profile
```javascript
async function updateProfile(fullName, monthlyIncome, avatarUrl) {
  try {
    const response = await apiClient.put('/user/profile', {
      fullName,
      monthlyIncome,
      avatarUrl,
    });
    return response.data.data;
  } catch (error) {
    console.error('Profile update failed:', error);
  }
}
```

### Change Password
```javascript
async function changePassword(current, newPassword, confirm) {
  try {
    const response = await apiClient.post('/user/change-password', {
      current,
      new: newPassword,
      confirm,
    });
    return response.data.message;
  } catch (error) {
    console.error('Password change failed:', error);
  }
}
```

---

## Transaction Examples

### Add Transaction
```javascript
async function addTransaction(description, category, amount, type, date) {
  try {
    const response = await apiClient.post('/transactions', {
      description,
      category,
      amount: parseFloat(amount),
      type, // 'income' or 'expense'
      date: date || new Date().toISOString().split('T')[0],
    });
    return response.data.data;
  } catch (error) {
    console.error('Transaction creation failed:', error);
  }
}
```

### Get Recent Transactions
```javascript
async function getRecentTransactions(limit = 10) {
  try {
    const response = await apiClient.get(`/transactions/recent?limit=${limit}`);
    return response.data.data;
  } catch (error) {
    console.error('Failed to fetch recent transactions:', error);
  }
}
```

### Get All Transactions
```javascript
async function getAllTransactions() {
  try {
    const response = await apiClient.get('/transactions');
    return response.data.data;
  } catch (error) {
    console.error('Failed to fetch transactions:', error);
  }
}
```

### Update Transaction
```javascript
async function updateTransaction(transactionId, description, category, amount) {
  try {
    const response = await apiClient.put(`/transactions/${transactionId}`, {
      description,
      category,
      amount: parseFloat(amount),
    });
    return response.data.data;
  } catch (error) {
    console.error('Transaction update failed:', error);
  }
}
```

### Delete Transaction
```javascript
async function deleteTransaction(transactionId) {
  try {
    await apiClient.delete(`/transactions/${transactionId}`);
    return true;
  } catch (error) {
    console.error('Transaction deletion failed:', error);
  }
}
```

---

## Categorical Expenses Examples

### Get Categorical Expenses
```javascript
async function getCategoricalExpenses() {
  try {
    const response = await apiClient.get('/expenses/categorical');
    // Returns array with category_name, money, color
    return response.data.data;
  } catch (error) {
    console.error('Failed to fetch categorical expenses:', error);
  }
}
```

---

## Notification Examples

### Get All Notifications
```javascript
async function getAllNotifications() {
  try {
    const response = await apiClient.get('/notifications');
    return response.data.data;
  } catch (error) {
    console.error('Failed to fetch notifications:', error);
  }
}
```

### Get Unread Notifications
```javascript
async function getUnreadNotifications() {
  try {
    const response = await apiClient.get('/notifications/unread');
    return response.data.data;
  } catch (error) {
    console.error('Failed to fetch unread notifications:', error);
  }
}
```

### Mark as Read
```javascript
async function markNotificationAsRead(notificationId) {
  try {
    const response = await apiClient.put(`/notifications/${notificationId}/read`);
    return response.data.data;
  } catch (error) {
    console.error('Failed to mark notification as read:', error);
  }
}
```

### Delete Notification
```javascript
async function deleteNotification(notificationId) {
  try {
    await apiClient.delete(`/notifications/${notificationId}`);
    return true;
  } catch (error) {
    console.error('Failed to delete notification:', error);
  }
}
```

---

## Chatbot Examples

### Get Chatbot Context
```javascript
async function getChatbotContext() {
  try {
    const response = await apiClient.get('/chat/context');
    return response.data.data; // Returns user info + financial info + recent transactions
  } catch (error) {
    console.error('Failed to fetch chatbot context:', error);
  }
}
```

### Send Chat Message
```javascript
async function sendChatMessage(message) {
  try {
    const response = await apiClient.post('/chat/message', {
      message,
      role: 'user',
    });
    return {
      userMessage: response.data.data.user_message,
      botResponse: response.data.data.bot_response,
    };
  } catch (error) {
    console.error('Failed to send message:', error);
  }
}
```

### Get Chat History
```javascript
async function getChatHistory() {
  try {
    const response = await apiClient.get('/chat/history');
    return response.data.data;
  } catch (error) {
    console.error('Failed to fetch chat history:', error);
  }
}
```

### Clear Chat History
```javascript
async function clearChatHistory() {
  try {
    await apiClient.delete('/chat/history');
    return true;
  } catch (error) {
    console.error('Failed to clear chat history:', error);
  }
}
```

---

## React Hook Example

### useAuth Hook
```javascript
import { useState, useCallback } from 'react';
import apiClient from '@/utils/apiClient';

export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const register = useCallback(async (fullName, email, password, monthlyIncome) => {
    setLoading(true);
    try {
      const response = await apiClient.post('/auth/register', {
        fullName,
        email,
        password,
        monthlyIncome,
      });
      if (response.data.success) {
        localStorage.setItem('token', response.data.token);
        setUser(response.data.user);
        return response.data.user;
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const login = useCallback(async (email, password) => {
    setLoading(true);
    try {
      const response = await apiClient.post('/auth/login', { email, password });
      if (response.data.success) {
        localStorage.setItem('token', response.data.token);
        setUser(response.data.user);
        return response.data.user;
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await apiClient.post('/auth/logout');
      localStorage.removeItem('token');
      setUser(null);
    } catch (err) {
      setError('Logout failed');
    }
  }, []);

  return { user, loading, error, register, login, logout };
}
```

---

## Error Handling Pattern

```javascript
async function apiCall(apiFunction) {
  try {
    const result = await apiFunction();
    return { success: true, data: result };
  } catch (error) {
    const message = error.response?.data?.message || 'An error occurred';
    return { success: false, error: message };
  }
}

// Usage:
const result = await apiCall(() => getUserInfo());
if (result.success) {
  console.log('User info:', result.data);
} else {
  console.error('Error:', result.error);
}
```

