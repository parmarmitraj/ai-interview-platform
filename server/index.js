const dotenv = require('dotenv');
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

// Load Environment Variables
dotenv.config();

const app = express();
app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://ai-interview-platform-six-theta.vercel.app/"
  ]
}));
app.use(express.json());
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("✅ MongoDB Connected Successfully!"))
    .catch((err) => console.log("❌ MongoDB Connection Error:", err));

// Routes
const questionRoutes = require('./routes/questionRoutes');
app.use('/api/questions', questionRoutes);

app.get('/', (req, res) => {
    res.send("Server is running with Database Connection!");
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});