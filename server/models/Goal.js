const mongoose = require('mongoose');

const goalSchema = new mongoose.Schema(
  {
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true, maxlength: 100 },
    description: { type: String, maxlength: 500 },
    target_amount: { type: Number, required: true, min: 0 },
    achieved_amount: { type: Number, default: 0, min: 0 },
    target_date: { type: Date, required: true },
    status: { type: String, enum: ['active', 'completed', 'abandoned'], default: 'active' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Goal', goalSchema);
