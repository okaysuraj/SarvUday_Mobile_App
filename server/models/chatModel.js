const mongoose = require("mongoose");

const chatSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  message: { type: String },
  response: { type: String },
  conversationId: { type: String, required: true, index: true },
  conversationName: { type: String },
  isSessionHeader: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now, index: true }
}, { timestamps: true });

module.exports = mongoose.model("Chat", chatSchema);
