const mongoose = require('mongoose');

const savingSchema = new mongoose.Schema(
  {
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    goal_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Goal', required: true },
    amount: { type: Number, required: true, min: 0 },
    status: { type: String, enum: ['allocated', 'refunded'], default: 'allocated' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Saving', savingSchema);
