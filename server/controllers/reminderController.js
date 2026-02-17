const Reminder = require('../models/Reminder');
const notificationController = require('./notificationController');

// Create a new reminder
exports.createReminder = async (req, res) => {
  try {
    const { title, description, date, time, frequency } = req.body;

    if (!title || !date || !time) {
      return res.status(400).json({ success: false, message: 'Title, date, and time are required' });
    }

    // Validate time format (HH:MM)
    if (!/^\d{2}:\d{2}$/.test(time)) {
      return res.status(400).json({ success: false, message: 'Time must be in HH:MM format' });
    }

    const reminder = new Reminder({
      user_id: req.user.id,
      title,
      description: description || '',
      date: new Date(date),
      time,
      frequency: frequency || 'once',
      is_completed: false,
      active: true,
      notified: false,
    });

    await reminder.save();

    res.status(201).json({
      success: true,
      message: 'Reminder created successfully',
      data: reminder,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get all reminders for a user
exports.getUserReminders = async (req, res) => {
  try {
    const reminders = await Reminder.find({ user_id: req.user.id })
      .sort({ date: 1, time: 1 });

    res.status(200).json({
      success: true,
      data: reminders,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get a single reminder
exports.getReminder = async (req, res) => {
  try {
    const reminder = await Reminder.findOne({ _id: req.params.reminderId, user_id: req.user.id });

    if (!reminder) {
      return res.status(404).json({ success: false, message: 'Reminder not found' });
    }

    res.status(200).json({
      success: true,
      data: reminder,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update a reminder
exports.updateReminder = async (req, res) => {
  try {
    const { title, description, date, time, frequency, is_completed } = req.body;
    const reminder = await Reminder.findOne({ _id: req.params.reminderId, user_id: req.user.id });

    if (!reminder) {
      return res.status(404).json({ success: false, message: 'Reminder not found' });
    }

    if (title) reminder.title = title;
    if (description !== undefined) reminder.description = description;
    if (date) reminder.date = new Date(date);
    if (time) reminder.time = time;
    if (frequency) reminder.frequency = frequency;
    if (is_completed !== undefined) reminder.is_completed = is_completed;

    await reminder.save();

    res.status(200).json({
      success: true,
      message: 'Reminder updated successfully',
      data: reminder,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Mark reminder as completed (user manually marks it)
exports.completeReminder = async (req, res) => {
  try {
    const reminder = await Reminder.findOne({ _id: req.params.reminderId, user_id: req.user.id });

    if (!reminder) {
      return res.status(404).json({ success: false, message: 'Reminder not found' });
    }

    reminder.is_completed = true;
    reminder.notified = true; // Mark as notified when user manually completes it
    await reminder.save();

    res.status(200).json({
      success: true,
      message: 'Reminder marked as completed',
      data: reminder,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// End recurring reminder (deactivate it)
exports.endRecurringReminder = async (req, res) => {
  try {
    const reminder = await Reminder.findOne({ _id: req.params.reminderId, user_id: req.user.id });

    if (!reminder) {
      return res.status(404).json({ success: false, message: 'Reminder not found' });
    }

    reminder.active = false;

    await reminder.save();

    res.status(200).json({
      success: true,
      message: 'Recurring reminder ended',
      data: reminder,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete a reminder
exports.deleteReminder = async (req, res) => {
  try {
    const reminder = await Reminder.findOneAndDelete({ _id: req.params.reminderId, user_id: req.user.id });

    if (!reminder) {
      return res.status(404).json({ success: false, message: 'Reminder not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Reminder deleted successfully',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get reminders that need to be triggered now (for background cron job)
exports.getRemindersToTrigger = async (req, res) => {
  try {
    const now = new Date();
    const currentHour = String(now.getHours()).padStart(2, '0');
    const currentMinute = String(now.getMinutes()).padStart(2, '0');
    const currentTime = `${currentHour}:${currentMinute}`;
    const currentDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // Find all active reminders that match current date and time
    const reminders = await Reminder.find({
      active: true,
      is_completed: false,
      time: currentTime,
      date: { $lte: currentDate },
    }).populate('user_id', 'fullName email');

    res.status(200).json({
      success: true,
      data: reminders,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
