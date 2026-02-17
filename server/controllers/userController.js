const User = require('../models/User');
const bcrypt = require('bcryptjs');
const Transaction = require('../models/Transaction');
const Notification = require('../models/Notification');
const ChatHistory = require('../models/ChatHistory');
const ExpenseCategoryDivision = require('../models/ExpenseCategoryDivision');
const Saving = require('../models/Saving');
const mongoose = require('mongoose');
const notificationController = require('./notificationController');
const cloudinary = require('../config/cloudinary');
const streamifier = require('streamifier');

// Get user info (total income, total expense, remaining balance, financial health)
exports.getInfo = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    // Calculate total saved using find (simpler and safer than aggregate)
    const allocatedSavings = await Saving.find({ user_id: req.user.id, status: 'allocated' });
    const totalSaved = allocatedSavings.reduce((sum, saving) => sum + saving.amount, 0);

    const remainingBalance = user.total_income - user.total_expense - totalSaved;

    res.status(200).json({
      success: true,
      data: {
        total_income: user.total_income,
        total_expense: user.total_expense,
        total_saved: totalSaved,
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
    // If a file is provided via multipart/form-data (multer memory storage)
    if (req.file && req.file.buffer) {
      const user = await User.findById(req.user.id);
      if (!user) return res.status(404).json({ success: false, message: 'User not found' });

      // If user already has an image stored in Cloudinary, delete it first
      if (user.avatarPublicId) {
        try {
          await cloudinary.uploader.destroy(user.avatarPublicId);
        } catch (e) {
          // Non-fatal: proceed even if deletion fails
          console.warn('Previous Cloudinary deletion failed:', e.message || e);
        }
      }

      // Upload new image via stream
      const result = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream({ folder: 'cashmate_avatars', resource_type: 'image' }, (error, result) => {
          if (error) return reject(error);
          resolve(result);
        });
        streamifier.createReadStream(req.file.buffer).pipe(uploadStream);
      });

      user.avatarUrl = result.secure_url;
      user.avatarPublicId = result.public_id;
      await user.save();

      return res.status(200).json({ success: true, message: 'Profile photo updated successfully', data: { avatarUrl: user.avatarUrl } });
    }

    // Fallback: allow updating avatar via URL in request body (existing behaviour)
    const { avatarUrl } = req.body;
    if (!avatarUrl) {
      return res.status(400).json({ success: false, message: 'Avatar URL is required' });
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { avatarUrl, avatarPublicId: undefined },
      { new: true }
    );

    res.status(200).json({ success: true, message: 'Profile photo updated successfully', data: { avatarUrl: user.avatarUrl } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete Profile Photo
exports.deleteProfilePhoto = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    if (user.avatarPublicId) {
      try {
        await cloudinary.uploader.destroy(user.avatarPublicId);
      } catch (err) {
        console.warn('Cloudinary deletion failed:', err.message || err);
      }
    }

    user.avatarUrl = undefined;
    user.avatarPublicId = undefined;
    await user.save();

    res.status(200).json({ success: true, message: 'Profile photo deleted successfully', data: { avatarUrl: null } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
