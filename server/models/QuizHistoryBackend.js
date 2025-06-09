const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { requireSignIn } = require('../middlewares/authMiddlewares');

// Define the QuizHistory schema
const QuizHistorySchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    quizType: { type: String, required: true },
    score: { type: Number, required: true },
    remark: { type: String, required: true },
    date: { type: Date, default: Date.now }
});

const QuizHistory = mongoose.model('QuizHistory', QuizHistorySchema);

// Endpoint to submit quiz results
router.post('/submit',  requireSignIn , async (req, res) => {
    try {
        const { quizType, score, remark } = req.body;
        const userId = req.user.id;

        const newQuiz = new QuizHistory({
            userId,
            quizType,
            score,
            remark,
        });

        await newQuiz.save();
        res.status(201).json({ message: 'Quiz result saved successfully.' });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ error: 'Server error.' });
    }
});

// Endpoint to fetch past quiz history
router.get('/history', requireSignIn , async (req, res) => {
    try {
        const userId = req.user.id;
        const history = await QuizHistory.find({ userId }).sort({ date: -1 });

        res.status(200).json(history);
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ error: 'Server error.' });
    }
});

// Integrating into main app
module.exports = router;