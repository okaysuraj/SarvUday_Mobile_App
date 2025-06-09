// models/mentalHealthModel.js
const mongoose = require('mongoose');

const mentalHealthSchema = new mongoose.Schema({
  name: String,
  description: String,
  copingStrategies: [String],
});

module.exports = mongoose.model('MentalHealth', mentalHealthSchema);
