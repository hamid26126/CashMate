const mongoose = require("mongoose");

const expenseCategoryDivisionSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  category_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
  },

  category_name: String,

  month: String, // example: "2026-02"

  money: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model("ExpenseCategoryDivision", expenseCategoryDivisionSchema);
