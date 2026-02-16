const Transaction = require('../models/Transaction');
const User = require('../models/User');
const notificationController = require('./notificationController');

// Get recent transactions
exports.getRecentTransactions = async (req, res) => {
  try {
    const limit = req.query.limit || 10;

    const transactions = await Transaction.find({ user_id: req.user.id })
      .sort({ date: -1 })
      .limit(parseInt(limit));

    const formattedTransactions = transactions.map((trans) => ({
      transaction_description: trans.description,
      category: trans.category?.name || 'Uncategorized',
      amount: trans.amount,
      date: new Date(trans.date).toLocaleDateString('en-US'), // Format: MM/DD/YYYY
      type: trans.type,
    }));

    res.status(200).json({
      success: true,
      data: formattedTransactions,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Add Transaction
exports.addTransaction = async (req, res) => {
  try {
    const { description, category, amount, type, date } = req.body;

    // Validation
    if (!description || !category || !amount || !type) {
      await notificationController.createNotification(
        req.user.id,
        'failure',
        'Transaction Failure',
        'Your transaction failed. Please check all fields and try again.'
      );
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    if (!['income', 'expense'].includes(type)) {
      await notificationController.createNotification(
        req.user.id,
        'failure',
        'Transaction Failure',
        'Invalid transaction type. Please try again.'
      );
      return res.status(400).json({ success: false, message: 'Type must be income or expense' });
    }

    const newTransaction = new Transaction({
      user_id: req.user.id,
      description,
      category: { name: category },
      amount: parseFloat(amount),
      type,
      date: date || new Date(),
    });

    await newTransaction.save();

    // Update user totals
    const user = await User.findById(req.user.id);
    const parsedAmount = parseFloat(amount);
    
    if (type === 'income') {
      user.total_income += parsedAmount;
    } else {
      user.total_expense += parsedAmount;
    }

    // Update financial health
    const healthScore = Math.max(0, Math.min(100, 100 - (user.total_expense / (user.total_income || 1)) * 50));
    user.financial_health = healthScore;

    await user.save();

    // Create notifications
    if (type === 'expense') {
      // Create expense alert notification
      await notificationController.createNotification(
        req.user.id,
        'alert',
        'Money Spent',
        `You spent $${parsedAmount.toFixed(2)} on ${category}`
      );

      // Check if balance is low (<=10% of monthly income) - only for expenses
      const remainingBalance = user.total_income - user.total_expense;
      const thresholdAmount = user.monthly_income * 0.1;
      
      if (remainingBalance <= thresholdAmount) {
        await notificationController.createNotification(
          req.user.id,
          'warning',
          'Warning: Low Balance',
          `You have only $${remainingBalance.toFixed(2)} in your account`
        );
      }
    } else if (type === 'income') {
      // Create income success notification
      await notificationController.createNotification(
        req.user.id,
        'success',
        `$${parsedAmount.toFixed(2)} Received`,
        `You received $${parsedAmount.toFixed(2)}`
      );
    }

    res.status(201).json({
      success: true,
      message: 'Transaction added successfully',
      data: newTransaction,
    });
  } catch (error) {
    // Create failure notification on error
    await notificationController.createNotification(
      req.user.id,
      'failure',
      'Transaction Failure',
      `Your transaction couldn't be created. Error: ${error.message}`
    );
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update Transaction
exports.updateTransaction = async (req, res) => {
  try {
    const { transactionId } = req.params;
    const { description, category, amount } = req.body;

    const transaction = await Transaction.findById(transactionId);

    if (!transaction) {
      await notificationController.createNotification(
        req.user.id,
        'failure',
        'Transaction Failure',
        'Transaction not found. Try again.'
      );
      return res.status(404).json({ success: false, message: 'Transaction not found' });
    }

    // Check if user owns this transaction
    if (transaction.user_id.toString() !== req.user.id) {
      await notificationController.createNotification(
        req.user.id,
        'failure',
        'Transaction Failure',
        'You are not authorized to update this transaction.'
      );
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    // Get old amount to recalculate totals
    const oldAmount = transaction.amount;
    const amountDifference = (amount || oldAmount) - oldAmount;

    // Update transaction
    transaction.description = description || transaction.description;
    transaction.category.name = category || transaction.category.name;
    transaction.amount = amount || transaction.amount;

    await transaction.save();

    // Update user totals
    const user = await User.findById(req.user.id);
    if (transaction.type === 'income') {
      user.total_income += amountDifference;
    } else {
      user.total_expense += amountDifference;
    }

    // Update financial health
    const healthScore = Math.max(0, Math.min(100, 100 - (user.total_expense / (user.total_income || 1)) * 50));
    user.financial_health = healthScore;

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Transaction updated successfully',
      data: transaction,
    });
  } catch (error) {
    // Create failure notification on error
    await notificationController.createNotification(
      req.user.id,
      'failure',
      'Transaction Failure',
      'Your transaction couldn\'t be updated. Try again.'
    );
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete Transaction
exports.deleteTransaction = async (req, res) => {
  try {
    const { transactionId } = req.params;

    const transaction = await Transaction.findById(transactionId);

    if (!transaction) {
      await notificationController.createNotification(
        req.user.id,
        'failure',
        'Transaction Failure',
        'Transaction not found. Try again.'
      );
      return res.status(404).json({ success: false, message: 'Transaction not found' });
    }

    // Check if user owns this transaction
    if (transaction.user_id.toString() !== req.user.id) {
      await notificationController.createNotification(
        req.user.id,
        'failure',
        'Transaction Failure',
        'You are not authorized to delete this transaction.'
      );
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    // Update user totals
    const user = await User.findById(req.user.id);
    if (transaction.type === 'income') {
      user.total_income -= transaction.amount;
    } else {
      user.total_expense -= transaction.amount;
    }

    // Update financial health
    const healthScore = Math.max(0, Math.min(100, 100 - (user.total_expense / (user.total_income || 1)) * 50));
    user.financial_health = healthScore;

    await user.save();

    await Transaction.findByIdAndDelete(transactionId);

    res.status(200).json({
      success: true,
      message: 'Transaction deleted successfully',
    });
  } catch (error) {
    // Create failure notification on error
    await notificationController.createNotification(
      req.user.id,
      'failure',
      'Transaction Failure',
      'Your transaction couldn\'t be deleted. Try again.'
    );
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get All Transactions
exports.getAllTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find({ user_id: req.user.id })
      .sort({ createdAt: -1 });

    const formattedTransactions = transactions.map((trans) => ({
      transaction_id: trans._id,
      transaction_description: trans.description,
      user_id: trans.user_id,
      amount: trans.amount,
      category_id: trans.category?.category_id || null,
      category_name: trans.category?.name || 'Uncategorized',
      transaction_type: trans.type,
      created_at: trans.createdAt,
      updated_at: trans.updatedAt,
    }));

    res.status(200).json({
      success: true,
      data: formattedTransactions,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
