const Goal = require('../models/Goal');
const Saving = require('../models/Saving');
const notificationController = require('./notificationController');

// Create a new goal
exports.createGoal = async (req, res) => {
  try {
    const { title, description, target_amount, target_date } = req.body;

    if (!title || !target_amount || !target_date) {
      return res.status(400).json({ success: false, message: 'Title, target_amount, and target_date are required' });
    }

    if (target_amount <= 0) {
      return res.status(400).json({ success: false, message: 'Target amount must be greater than 0' });
    }

    const goal = new Goal({
      user_id: req.user.id,
      title,
      description: description || '',
      target_amount,
      achieved_amount: 0,
      target_date: new Date(target_date),
      status: 'active',
    });

    await goal.save();

    res.status(201).json({
      success: true,
      message: 'Goal created successfully',
      data: goal,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get all goals for a user
exports.getUserGoals = async (req, res) => {
  try {
    const goals = await Goal.find({ user_id: req.user.id }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: goals,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get a single goal by ID
exports.getGoal = async (req, res) => {
  try {
    const goal = await Goal.findOne({ _id: req.params.goalId, user_id: req.user.id });

    if (!goal) {
      return res.status(404).json({ success: false, message: 'Goal not found' });
    }

    res.status(200).json({
      success: true,
      data: goal,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update a goal
exports.updateGoal = async (req, res) => {
  try {
    const { title, description, target_amount, target_date, status } = req.body;
    const goal = await Goal.findOne({ _id: req.params.goalId, user_id: req.user.id });

    if (!goal) {
      return res.status(404).json({ success: false, message: 'Goal not found' });
    }

    if (title) goal.title = title;
    if (description) goal.description = description;
    if (target_amount) goal.target_amount = target_amount;
    if (target_date) goal.target_date = new Date(target_date);
    if (status) goal.status = status;

    await goal.save();

    res.status(200).json({
      success: true,
      message: 'Goal updated successfully',
      data: goal,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete a goal
exports.deleteGoal = async (req, res) => {
  try {
    const goal = await Goal.findOneAndDelete({ _id: req.params.goalId, user_id: req.user.id });

    if (!goal) {
      return res.status(404).json({ success: false, message: 'Goal not found' });
    }

    // Also delete all savings for this goal
    await Saving.deleteMany({ goal_id: req.params.goalId });

    res.status(200).json({
      success: true,
      message: 'Goal and associated savings deleted successfully',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
