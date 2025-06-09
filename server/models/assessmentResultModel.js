const mongoose = require("mongoose");

const assessmentResultSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  conversationId: { type: String, required: true, index: true },
  category: { type: String, required: true, enum: ['PHQ-9', 'BDI', 'HDRS'] },
  question: { type: String, required: true },
  response: { type: String, required: false, default: null },
  score: { type: Number, required: false, default: -1 },
  timestamp: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model("AssessmentResult", assessmentResultSchema);