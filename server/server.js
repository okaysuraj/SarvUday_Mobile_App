const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const colors = require('colors');
const morgan = require('morgan');
const mentalHealthRoutes = require('./routes/mentalHealthRoutes');
const connectDB = require('./config/db');
//const assessmentHistoryRoutes = require("./routes/assessmentHistoryRoutes");
const quizHistoryRouter = require('./models/QuizHistoryBackend');


dotenv.config()
connectDB()
const app = express()

app.use(cors())
app.use(express.json())
app.use(morgan('dev'))

app.use("/api/v1/auth", require('./routes/userRoutes'))
app.use("/api/v1/doctor", require('./routes/doctorRoutes'))
app.use('/api', mentalHealthRoutes)
app.use('/api/v1/chat', require('./routes/chatRoutes'))
app.use('/api/v1/appointments', require('./routes/appointmentRoutes'))
//app.use("/api/v1", assessmentHistoryRoutes);
app.use('/api/quizzes', quizHistoryRouter);

const PORT = process.env.PORT || 8080

app.listen(PORT, '0.0.0.0',() => {
    console.log(`Server running on ${PORT}`.yellow.bold)
})