const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  type: {
    type: String,
    enum: ['alert', 'success', 'warning', 'failure', 'reminder'],
    required: true,
  },
  
  message: {
    title: { type: String, required: true },
    message: { type: String, required: true },
  },

  is_read: { type: Boolean, default: false },

  metadata: mongoose.Schema.Types.Mixed,
}, { timestamps: true });

module.exports = mongoose.model("Notification", notificationSchema);
