const ChatHistory = require('../models/ChatHistory');
const User = require('../models/User');
const Transaction = require('../models/Transaction');

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
    const { message, role = 'user' } = req.body;

    if (!message) {
      return res.status(400).json({ success: false, message: 'Message is required' });
    }

    // Save user message
    const userMessage = new ChatHistory({
      user_id: req.user.id,
      role: 'user',
      message,
      context_metadata: {},
    });

    await userMessage.save();

    // TODO: Integrate with AI service (OpenAI, Gemini, etc.)
    // For now, return a placeholder response
    const aiResponse = await generateAIResponse(message);

    // Save bot response
    const botMessage = new ChatHistory({
      user_id: req.user.id,
      role: 'bot',
      message: aiResponse,
      context_metadata: {},
    });

    await botMessage.save();

    res.status(200).json({
      success: true,
      message: 'Message sent successfully',
      data: {
        user_message: userMessage,
        bot_response: botMessage,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get Chat History
exports.getChatHistory = async (req, res) => {
  try {
    const messages = await ChatHistory.find({ user_id: req.user.id })
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
    await ChatHistory.deleteMany({ user_id: req.user.id });

    res.status(200).json({
      success: true,
      message: 'Chat history cleared successfully',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Helper function to generate AI response (placeholder)
async function generateAIResponse(message) {
  // This is a placeholder. You'll need to integrate your AI API here.
  // Examples: OpenAI GPT, Google Gemini, Hugging Face, etc.

  const responses = [
    'I understand you\'re asking about your finances. Could you provide more details?',
    'That\'s a great question! Let me help you with that.',
    'Based on your financial data, here are some suggestions...',
    'I can help you with that. Let me analyze your transactions.',
  ];

  return responses[Math.floor(Math.random() * responses.length)];
}
