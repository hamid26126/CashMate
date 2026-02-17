const mongoose = require('mongoose');

const reminderSchema = new mongoose.Schema(
  {
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true, maxlength: 100 },
    description: { type: String, maxlength: 500 },
    date: { type: Date, required: true },
    time: { type: String, required: true }, // Format: HH:MM (24-hour)
    frequency: { type: String, enum: ['once', 'daily', 'weekly', 'monthly', 'yearly'], default: 'once' },
    is_completed: { type: Boolean, default: false },
    active: { type: Boolean, default: true }, // To allow ending recurring reminders
    last_triggered: { type: Date }, // Track when last triggered for recurring reminders
    notified: { type: Boolean, default: false }, // Track if notification was sent for this occurrence
  },
  { timestamps: true }
);

module.exports = mongoose.model('Reminder', reminderSchema);
