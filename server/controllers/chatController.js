const ChatHistory = require('../models/ChatHistory');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const axios = require('axios');

// Groq API Configuration\nconst GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_API_ENDPOINT = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL = 'llama-3.1-8b-instant';

// Rate limiting implementation
const rateLimitStore = new Map(); // { userId: { count: number, resetTime: timestamp } }
const RATE_LIMIT = 3; // Max API calls per minute per user
const RATE_LIMIT_WINDOW = 60000; // 1 minute in milliseconds

function checkAndUpdateRateLimit(userId) {
  const now = Date.now();
  const userLimit = rateLimitStore.get(userId);

  if (!userLimit || now > userLimit.resetTime) {
    // Reset the limit
    rateLimitStore.set(userId, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return { allowed: true, remaining: RATE_LIMIT - 1 };
  }

  if (userLimit.count >= RATE_LIMIT) {
    const waitTime = Math.ceil((userLimit.resetTime - now) / 1000);
    return { allowed: false, remaining: 0, waitTime };
  }

  userLimit.count++;
  return { allowed: true, remaining: RATE_LIMIT - userLimit.count };
}

// Response cache to avoid duplicate API calls
const responseCache = new Map(); // { cacheKey: { response: string, timestamp: number } }
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

function getCacheKey(userId, messageHash) {
  return `${userId}:${messageHash}`;
}

function hashMessage(message) {
  let hash = 0;
  for (let i = 0; i < message.length; i++) {
    const char = message.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash).toString();
}

// Fallback response generator when API is unavailable
function generateFallbackResponse(userMessage, summary) {
  if (!summary) {
    return "I'm unable to access your financial data at the moment. Please make sure you have some transactions or financial data in your account and try again.";
  }

  const message = userMessage.toLowerCase();
  const balance = summary.current_balance || 0;
  const income = summary.total_income || 0;
  const expense = summary.total_expense || 0;
  const health = summary.financial_health_score || 50;
  const monthlyIncome = summary.monthly_income || 0;
  const savingsRate = summary.savings_rate || '0';
  
  // Check what the user is asking about
  if (message.includes('balance') || message.includes('money') || message.includes('left')) {
    return `Based on your financial data, you currently have a balance of $${balance.toFixed(2)}. This is calculated from your total income of $${income.toFixed(2)} minus your total expenses of $${expense.toFixed(2)}. Keep up the good financial tracking!`;
  }
  
  if (message.includes('spend') || message.includes('expense')) {
    const topSpending = Object.entries(summary.expenses_by_category || {})
      .sort((a, b) => b[1] - a[1])
      .slice(0, 1);
    const topCategory = topSpending.length > 0 ? `${topSpending[0][0]} ($${topSpending[0][1].toFixed(2)})` : 'general expenses';
    return `Your total expenses are $${expense.toFixed(2)}. Your highest spending category is ${topCategory}. To improve your financial health, consider reviewing and reducing these expenses.`;
  }
  
  if (message.includes('income') || message.includes('earn')) {
    return `Your total income is $${income.toFixed(2)}, and your monthly income is $${monthlyIncome.toFixed(2)}. Your savings rate is ${savingsRate}%, which shows how much of your income you're able to save.`;
  }
  
  if (message.includes('health') || message.includes('score')) {
    return `Your financial health score is ${health}/100. This is based on your income, expenses, and savings patterns. Keep working towards improving this score by increasing savings and managing expenses wisely.`;
  }
  
  if (message.includes('save') || message.includes('goal')) {
    return `To improve your savings, I recommend focusing on your highest spending categories and finding areas to cut back. With your current income of $${monthlyIncome.toFixed(2)}, you can set realistic savings goals. Start with aiming to save 10-20% of your monthly income.`;
  }
  
  return `Thank you for your question about your finances. Your current balance is $${balance.toFixed(2)}, and your financial health score is ${health}/100. Would you like to know more about your income, expenses, or savings strategies?`;
}

// Create a comprehensive transaction summary for the chatbot
async function createTransactionSummary(userId) {
  try {
    const user = await User.findById(userId);
    
    if (!user) {
      console.error('User not found for ID:', userId);
      return null;
    }

    const transactions = await Transaction.find({ user_id: userId })
      .populate('category')
      .sort({ date: -1 })
      .limit(30);

    // Calculate analytics
    const income = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + (t.amount || 0), 0);
    const expenses = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + (t.amount || 0), 0);
    
    // Group expenses by category
    const expensesByCategory = {};
    transactions
      .filter(t => t.type === 'expense')
      .forEach(t => {
        const catName = t.category?.name || 'Uncategorized';
        expensesByCategory[catName] = (expensesByCategory[catName] || 0) + (t.amount || 0);
      });

    // Recent transactions
    const recentTransactions = transactions.slice(0, 5).map(t => ({
      description: t.description || 'Transaction',
      category: t.category?.name || 'Other',
      amount: t.amount || 0,
      type: t.type || 'expense',
      date: new Date(t.date || Date.now()).toLocaleDateString(),
    }));

    const totalIncome = user.total_income || 0;
    const totalExpense = user.total_expense || 0;
    const balance = totalIncome - totalExpense;
    const savingsRate = totalIncome > 0 
      ? ((totalIncome - totalExpense) / totalIncome * 100).toFixed(2)
      : 0;

    return {
      user_name: user.fullName || 'User',
      total_income: totalIncome,
      total_expense: totalExpense,
      current_balance: balance,
      savings_rate: savingsRate,
      financial_health_score: user.financial_health || 50,
      monthly_income: user.monthly_income || 0,
      recent_income: income,
      recent_expenses: expenses,
      expenses_by_category: expensesByCategory,
      recent_transactions: recentTransactions,
      transaction_count: transactions.length,
    };
  } catch (error) {
    console.error('Error creating transaction summary:', error.message);
    console.error('Stack:', error.stack);
    return null;
  }
}

// Detect if message can be answered by fallback (simple questions about financial data)
function isSimpleQuestion(message) {
  const simpleKeywords = [
    // 'balance', 'money', 'left', 'spent', 'expense', 'income', 'earn', 'health', 'score', 'save', 'goal',
    // 'how much', 'what is', 'how are', 'tell me', 'show me', 'current', 'total', 'monthly'
  ];
  const lowerMsg = message.toLowerCase();
  return simpleKeywords.some(keyword => lowerMsg.includes(keyword));
}

// Generate AI response using Groq with smart caching and rate limiting
async function generateGroqResponse(userMessage, userId, conversationHistory) {
  let summary;
  try {
    summary = await createTransactionSummary(userId);
    
    if (!summary) {
      return "I'm having trouble accessing your financial data. Please try again later.";
    }

    // STEP 1: For simple questions, use fallback immediately (NO API CALL)
    if (isSimpleQuestion(userMessage)) {
      console.log('Simple question detected, using fallback response (no API call)');
      return generateFallbackResponse(userMessage, summary);
    }

    // STEP 2: Check rate limit before attempting API call
    const rateLimit = checkAndUpdateRateLimit(userId);
    if (!rateLimit.allowed) {
      console.warn(`Rate limit exceeded for user ${userId}. Wait ${rateLimit.waitTime}s. Using fallback.`);
      return generateFallbackResponse(userMessage, summary);
    }
    console.log(`Rate limit check passed. ${rateLimit.remaining} API calls remaining this minute.`);

    // STEP 3: Check cache for similar questions
    const cacheKey = getCacheKey(userId, hashMessage(userMessage));
    const cached = responseCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      console.log('Cache hit! Using cached response');
      return cached.response;
    }

    // STEP 4: Only call Groq API if needed
    console.log('Complex question detected. Making Groq API call...');

    // Build category list string
    let topCategories = '';
    const categoryEntries = Object.entries(summary.expenses_by_category || {});
    if (categoryEntries.length > 0) {
      topCategories = categoryEntries
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([cat, amt]) => `${cat}: $${amt.toFixed(2)}`)
        .join(', ');
    } else {
      topCategories = 'None';
    }

    // Build recent transactions string
    let recentTransactionsStr = '';
    if (summary.recent_transactions && summary.recent_transactions.length > 0) {
      recentTransactionsStr = summary.recent_transactions
        .map(t => `- ${t.date}: ${t.type.toUpperCase()} - ${t.description} (${t.category}, $${t.amount.toFixed(2)})`)
        .join('\n');
    } else {
      recentTransactionsStr = 'No recent transactions';
    }

    // Create a concise system prompt (smaller = fewer tokens = faster/cheaper)
    const systemPrompt = `You are CashMate AI, a financial advisor. User: ${summary.user_name}. Balance: $${summary.current_balance.toFixed(2)}. Income: $${summary.total_income.toFixed(2)}. Expenses: $${summary.total_expense.toFixed(2)}. Health Score: ${summary.financial_health_score}/100. Top spending: ${topCategories}. Provide concise, actionable advice.`;

    // Build messages array for Groq API (OpenAI compatible format)
    const messages = [
      {
        role: 'system',
        content: systemPrompt
      }
    ];

    // Add conversation history
    if (conversationHistory && conversationHistory.length > 0) {
      conversationHistory.slice(-2).forEach(msg => {
        messages.push({
          role: msg.role === 'user' ? 'user' : 'assistant',
          content: msg.message.substring(0, 100)
        });
      });
    }

    // Add current user message
    messages.push({
      role: 'user',
      content: userMessage
    });

    console.log('Calling Groq API with model:', GROQ_MODEL);

    console.log("Groq key exists:", !!process.env.GROQ_API_KEY);

    
    const groqResponse = await axios.post(
      GROQ_API_ENDPOINT,
      {
        model: GROQ_MODEL,
        messages: messages,
        temperature: 0.7,
        max_tokens: 1024
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    if (!groqResponse.data || !groqResponse.data.choices || groqResponse.data.choices.length === 0) {
      console.error('Invalid response from Groq API');
      return generateFallbackResponse(userMessage, summary);
    }

    const response = groqResponse.data.choices[0].message.content;
    
    if (!response) {
      console.error('Empty response from Groq API');
      return generateFallbackResponse(userMessage, summary);
    }
    
    // Cache the response
    responseCache.set(cacheKey, { response, timestamp: Date.now() });
    console.log('Response cached and returned');
    
    return response;
  } catch (error) {
    console.error('Error in generateGroqResponse:', error.message);
    
    // Check if it's a rate limit error
    if (error.response && error.response.status === 429) {
      console.warn('Groq API rate limited (429). Using fallback.');
      return generateFallbackResponse(userMessage, summary);
    }
    
    // For any other error, use fallback
    if (summary) {
      console.warn('Using fallback response due to API error:', error.message);
      return generateFallbackResponse(userMessage, summary);
    }
    
    return "I encountered an error processing your request. Please try again.";
  }
}

// Periodic cleanup of cache and rate limits
setInterval(() => {
  const now = Date.now();
  
  // Clean old cache entries
  for (const [key, value] of responseCache.entries()) {
    if (now - value.timestamp > CACHE_DURATION) {
      responseCache.delete(key);
    }
  }
  
  // Clean expired rate limit entries
  for (const [userId, limit] of rateLimitStore.entries()) {
    if (now > limit.resetTime) {
      rateLimitStore.delete(userId);
    }
  }
  
}, 60000); // Run every minute

// Get user info for chatbot prompt
exports.getChatbotContext = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const recentTransactions = await Transaction.find({ user_id: req.user.id })
      .sort({ date: -1 })
      .limit(5);

    const remainingBalance = user.total_income - user.total_expense;

    res.status(200).json({
      success: true,
      data: {
        user: {
          fullName: user.fullName,
          email: user.email,
          avatarUrl: user.avatarUrl,
        },
        financial_info: {
          total_income: user.total_income,
          total_expense: user.total_expense,
          remaining_balance: remainingBalance,
          financial_health: user.financial_health,
          monthly_income: user.monthly_income,
        },
        recent_transactions: recentTransactions.map((trans) => ({
          description: trans.description,
          category: trans.category?.name,
          amount: trans.amount,
          type: trans.type,
          date: trans.date,
        })),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Send Chat Message
exports.sendMessage = async (req, res) => {
  try {
    const { message, conversationId } = req.body;

    if (!message) {
      return res.status(400).json({ success: false, message: 'Message is required' });
    }

    if (!req.user || !req.user.id) {
      console.error('User not authenticated');
      return res.status(401).json({ success: false, message: 'User not authenticated' });
    }

    const conversation = conversationId || `conv_${Date.now()}`;

    console.log('Saving user message from userId:', req.user.id);

    // Save user message
    const userMessage = new ChatHistory({
      user_id: req.user.id,
      conversation_id: conversation,
      role: 'user',
      message,
      context_metadata: { timestamp: new Date() },
    });

    await userMessage.save();
    console.log('User message saved');

    // Get conversation history for context
    const conversationHistory = await ChatHistory.find({
      user_id: req.user.id,
      conversation_id: conversation,
    }).sort({ createdAt: 1 });

    console.log('Retrieved conversation history, length:', conversationHistory.length);

    // Generate AI response using Groq
    const aiResponseText = await generateGroqResponse(message, req.user.id, conversationHistory);

    console.log('Generated AI response');

    // Save bot response
    const botMessage = new ChatHistory({
      user_id: req.user.id,
      conversation_id: conversation,
      role: 'bot',
      message: aiResponseText,
      context_metadata: { timestamp: new Date() },
    });

    await botMessage.save();
    console.log('Bot message saved');

    res.status(200).json({
      success: true,
      message: 'Message sent successfully',
      data: {
        conversationId: conversation,
        user_message: userMessage,
        bot_response: botMessage,
      },
    });
  } catch (error) {
    console.error('Error in sendMessage:', error.message);
    console.error('Error stack:', error.stack);
    console.error('Full error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to process message: ' + error.message,
      error: error.message 
    });
  }
};

// Get Chat History
exports.getChatHistory = async (req, res) => {
  try {
    const { conversationId } = req.query;

    let query = { user_id: req.user.id };
    if (conversationId) {
      query.conversation_id = conversationId;
    }

    const messages = await ChatHistory.find(query)
      .sort({ createdAt: 1 });

    res.status(200).json({
      success: true,
      data: messages,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Clear Chat History
exports.clearChatHistory = async (req, res) => {
  try {
    const { conversationId } = req.query;

    let query = { user_id: req.user.id };
    if (conversationId) {
      query.conversation_id = conversationId;
    }

    await ChatHistory.deleteMany(query);

    res.status(200).json({
      success: true,
      message: 'Chat history cleared successfully',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
