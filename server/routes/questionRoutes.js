const express = require('express');
const router = express.Router();
const questionController = require('../controllers/questionController');

router.get('/mock', questionController.getMockQuestion);

router.post('/add', questionController.createQuestion);

router.get('/all', questionController.getAllQuestions);

router.post('/generate', questionController.askAIForQuestion);

router.post('/evaluate', questionController.evaluateAnswer);

router.get('/history', questionController.getHistory);

router.delete('/history', questionController.clearHistory);

module.exports = router;
