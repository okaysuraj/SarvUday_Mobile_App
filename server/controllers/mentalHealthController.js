// controllers/mentalHealthController.js
const MentalHealth = require('../models/mentalHealthModel');

exports.getAllDisorders = async (req, res) => {
  try {
    const disorders = await MentalHealth.find();
    res.status(200).json(disorders);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch data' });
  }
};
