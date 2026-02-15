const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true },

  // null → global/default category
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },

  icon: String,
  color: String,
}, { timestamps: true });

module.exports = mongoose.model("Category", categorySchema);
