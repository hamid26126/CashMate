const User = require('../models/User');
const bcrypt = require('bcryptjs');
const Transaction = require('../models/Transaction');
const Notification = require('../models/Notification');
const ChatHistory = require('../models/ChatHistory');
const ExpenseCategoryDivision = require('../models/ExpenseCategoryDivision');
const notificationController = require('./notificationController');

// Get user info (total income, total expense, remaining balance, financial health)
exports.getInfo = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const remainingBalance = user.total_income - user.total_expense;

    res.status(200).json({
      success: true,
      data: {
        total_income: user.total_income,
        total_expense: user.total_expense,
        remaining_balance: remainingBalance,
        financial_health: user.financial_health,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get categorical expenses
exports.getCategoricalExpenses = async (req, res) => {
  try {
    const transactions = await Transaction.find({
      user_id: req.user.id,
      type: 'expense',
    });

    // Group by category
    const categoryMap = {};
    transactions.forEach((trans) => {
      const categoryName = trans.category?.name || 'Uncategorized';
      categoryMap[categoryName] = (categoryMap[categoryName] || 0) + trans.amount;
    });

    const result = Object.entries(categoryMap).map(([categoryName, money]) => ({
      category_name: categoryName,
      money,
      color: 'auto', // Color can be assigned from Category model if extended
    }));

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get Profile Information
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.status(200).json({
      success: true,
      data: {
        fullName: user.fullName,
        email: user.email,
        monthlyIncome: user.monthly_income,
        avatarUrl: user.avatarUrl || null,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update Profile Information
exports.updateProfile = async (req, res) => {
  try {
    const { fullName, monthlyIncome, avatarUrl } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      {
        fullName: fullName || undefined,
        monthly_income: monthlyIncome || undefined,
        avatarUrl: avatarUrl || undefined,
      },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        fullName: user.fullName,
        email: user.email,
        monthlyIncome: user.monthly_income,
        avatarUrl: user.avatarUrl,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Change Password
exports.changePassword = async (req, res) => {
  try {
    const { current, new: newPassword, confirm } = req.body;

    // Validation
    if (!current || !newPassword || !confirm) {
      await notificationController.createNotification(
        req.user.id,
        'failure',
        'Password Change Failed',
        'All fields are required.'
      );
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    if (newPassword !== confirm) {
      await notificationController.createNotification(
        req.user.id,
        'failure',
        'Password Change Failed',
        'New passwords do not match.'
      );
      return res.status(400).json({ success: false, message: 'New passwords do not match' });
    }

    const user = await User.findById(req.user.id);

    // Verify current password
    const isPasswordValid = await bcrypt.compare(current, user.password);
    if (!isPasswordValid) {
      await notificationController.createNotification(
        req.user.id,
        'failure',
        'Password Change Failed',
        'Current password is incorrect.'
      );
      return res.status(401).json({ success: false, message: 'Current password is incorrect' });
    }

    // Hash and update new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password changed successfully',
    });
  } catch (error) {
    await notificationController.createNotification(
      req.user.id,
      'failure',
      'Password Change Failed',
      'An error occurred while changing your password. Try again.'
    );
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete Account
exports.deleteAccount = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Delete all user-related data in the following order
    await Transaction.deleteMany({ user_id: userId });
    await Notification.deleteMany({ user_id: userId });
    await ChatHistory.deleteMany({ user_id: userId });
    await ExpenseCategoryDivision.deleteMany({ user_id: userId });
    
    // Finally, delete the user account
    await User.findByIdAndDelete(userId);

    res.status(200).json({
      success: true,
      message: 'Account and all associated data deleted successfully',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update Profile Photo
exports.updateProfilePhoto = async (req, res) => {
  try {
    const { avatarUrl } = req.body;

    if (!avatarUrl) {
      return res.status(400).json({ success: false, message: 'Avatar URL is required' });
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { avatarUrl },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: 'Profile photo updated successfully',
      data: {
        avatarUrl: user.avatarUrl,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
