const Saving = require('../models/Saving');
const Goal = require('../models/Goal');
const User = require('../models/User');
const mongoose = require('mongoose');
const notificationController = require('./notificationController');

// Allocate savings to a goal
exports.allocateSaving = async (req, res) => {
  try {
    const { goal_id, amount } = req.body;

    if (!goal_id || !amount || amount <= 0) {
      return res.status(400).json({ success: false, message: 'Goal ID and valid amount are required' });
    }

    const goal = await Goal.findOne({ _id: goal_id, user_id: req.user.id });
    if (!goal) {
      return res.status(404).json({ success: false, message: 'Goal not found' });
    }

    if (goal.status !== 'active') {
      return res.status(400).json({ success: false, message: 'Goal is not active' });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const remainingBalance = user.total_income - user.total_expense;
    if (amount > remainingBalance) {
      return res.status(400).json({ success: false, message: 'Insufficient balance' });
    }

    // Create saving record
    const saving = new Saving({
      user_id: req.user.id,
      goal_id,
      amount,
      status: 'allocated',
    });

    await saving.save();

    // Update goal's achieved_amount
    goal.achieved_amount += amount;

    // Check if goal is completed
    let completionSaving = null;
    if (goal.achieved_amount >= goal.target_amount) {
      goal.status = 'completed';
      completionSaving = saving;

      // Send success notification
      await notificationController.createNotification(
        req.user.id,
        'success',
        'Goal Completed! 🎉',
        `You've reached your goal: "${goal.title}" with $${goal.achieved_amount.toFixed(2)}!`
      );
    }

    await goal.save();

    res.status(201).json({
      success: true,
      message: 'Saving allocated successfully',
      data: {
        saving,
        goal,
        goalCompleted: goal.status === 'completed',
        completionSaving: completionSaving,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get user's savings
exports.getUserSavings = async (req, res) => {
  try {
    const savings = await Saving.find({ user_id: req.user.id })
      .populate('goal_id', 'title target_amount achieved_amount')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: savings,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get savings for a specific goal
exports.getGoalSavings = async (req, res) => {
  try {
    const { goal_id } = req.params;

    const goal = await Goal.findOne({ _id: goal_id, user_id: req.user.id });
    if (!goal) {
      return res.status(404).json({ success: false, message: 'Goal not found' });
    }

    const savings = await Saving.find({ goal_id, user_id: req.user.id }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: savings,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Refund a saving (mark as refunded and subtract from goal)
exports.refundSaving = async (req, res) => {
  try {
    const { saving_id } = req.params;

    const saving = await Saving.findOne({ _id: saving_id, user_id: req.user.id });
    if (!saving) {
      return res.status(404).json({ success: false, message: 'Saving not found' });
    }

    if (saving.status === 'refunded') {
      return res.status(400).json({ success: false, message: 'This saving has already been refunded' });
    }

    const goal = await Goal.findById(saving.goal_id);
    if (!goal) {
      return res.status(404).json({ success: false, message: 'Goal not found' });
    }

    // Mark saving as refunded
    saving.status = 'refunded';
    await saving.save();

    // Subtract from goal's achieved_amount
    goal.achieved_amount = Math.max(0, goal.achieved_amount - saving.amount);

    // If goal was completed but is no longer, revert status (optional)
    if (goal.status === 'completed' && goal.achieved_amount < goal.target_amount) {
      goal.status = 'active';
    }

    await goal.save();

    res.status(200).json({
      success: true,
      message: 'Saving refunded successfully',
      data: {
        saving,
        goal,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get total saved across all goals
exports.getTotalSaved = async (req, res) => {
  try {
    const allocatedSavings = await Saving.find({ user_id: req.user.id, status: 'allocated' });
    const totalSaved = allocatedSavings.reduce((sum, saving) => sum + saving.amount, 0);

    res.status(200).json({
      success: true,
      data: { totalSaved },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
