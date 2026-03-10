const Question = require('../models/Question');
const aiService = require('../services/aiService');
const Answer = require('../models/Answer');

exports.getMockQuestion = (req, res) => {
    const interviewQuestion = {
        id: 1,
        topic: "Java",
        question: "What is the difference between an Interface and an Abstract Class?",
        difficulty: "Medium"
    };

    res.status(200).json(interviewQuestion);
};

exports.createQuestion = async (req, res) => {
    try {
        const { topic, questionText, difficulty } = req.body;
        const newQuestion = new Question({
            topic,
            questionText,
            difficulty
        });

        const savedQuestion = await newQuestion.save();

        res.status(201).json(savedQuestion);

    } catch (error) {
        res.status(500).json({ 
            message: "Error saving question", 
            error: error.message 
        });
    }
};

exports.getAllQuestions = async (req, res) => {
    try {
        const questions = await Question.find();
        
        res.status(200).json(questions);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.askAIForQuestion = async (req, res) => {
    try {
        const { topic, difficulty } = req.body;
        
        const aiQuestionText = await aiService.generateAIQuestion(topic, difficulty);

        const newQuestion = new Question({
            topic: topic,
            questionText: aiQuestionText,
            difficulty: difficulty || 'Medium'
        });

        const savedQuestion = await newQuestion.save();

        res.status(201).json(savedQuestion);

    } catch (error) {
        console.error("Controller Error:", error.message);
        res.status(500).json({ message: error.message });
    }
};

exports.evaluateAnswer = async (req, res) => {
  try {
    const { question, userAnswer, topic } = req.body;

    const evaluation = await aiService.evaluateUserAnswer(question, userAnswer);

    const newAnswer = new Answer({
      questionText: question,
      userAnswer: userAnswer,
      feedback: evaluation.feedback,
      score: evaluation.score,
      modelAnswer: evaluation.modelAnswer,
      topic: topic
    });

    await newAnswer.save();

    res.status(200).json(evaluation);
  } catch (error) {
    console.error("DETAILED ERROR:", error.message); 
    res.status(500).json({ message: "Server error during evaluation" });
  }
};

exports.getHistory = async (req, res) => {
    try {
        const history = await Answer.find().sort({ createdAt: -1 });
        res.status(200).json(history);
    } catch (error) {
        res.status(500).json({ message: "Error fetching history" });
    }
};

exports.clearHistory = async (req, res) => {
    try {
        await Answer.deleteMany({});
        res.status(200).json({ message: "History cleared!" });
    } catch (error) {
        res.status(500).json({ message: "Error clearing history" });
    }
};