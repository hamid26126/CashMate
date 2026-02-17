const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  avatarUrl: String,
  avatarPublicId: String,

  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },

  monthly_income: { type: Number, default: 0 },
  total_income: { type: Number, default: 0 },
  total_expense: { type: Number, default: 0 },

  financial_health: { type: Number, default: 50 },

  member_since: { type: Date, default: Date.now },
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);