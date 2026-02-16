const mongoose = require("mongoose");

const chatHistorySchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  conversation_id: {
    type: String,
    required: true,
    index: true,
  },

  role: {
    type: String,
    enum: ["user", "bot"],
    required: true,
  },

  message: {
    type: String,
    required: true,
  },

  context_metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
}, { timestamps: true });

// Index for efficient queries
chatHistorySchema.index({ user_id: 1, conversation_id: 1, createdAt: -1 });

module.exports = mongoose.model("ChatHistory", chatHistorySchema);
