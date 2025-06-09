// routes/mentalHealthRoutes.js
const express = require('express');
const router = express.Router();
const { getAllDisorders } = require('../controllers/mentalHealthController');

router.get('/know-more', getAllDisorders);

module.exports = router;
