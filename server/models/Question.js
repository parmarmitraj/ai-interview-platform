const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
    topic: {
        type: String,
        required: true 
    },
    questionText: {
        type: String,
        required: true
    },
    difficulty: {
        type: String,
        enum: ['Easy', 'Medium', 'Hard'], 
        default: 'Medium'
    },
    createdAt: {
        type: Date,
        default: Date.now 
    }
});

module.exports = mongoose.model('Question', questionSchema);