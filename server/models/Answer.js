const mongoose = require('mongoose');

const answerSchema = new mongoose.Schema({
    questionText: { type: String, required: true },
    userAnswer: { type: String, required: true },
    feedback: { type: String, required: true },
    score: { type: Number, default: 0 },
    modelAnswer: { type: String, default: "" },
    topic: { type: String },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Answer', answerSchema);