import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Brain, Loader2, CheckCircle, History, Clock } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

function App() {
  const [topic, setTopic] = useState('');
  const [question, setQuestion] = useState(null);
  const [answer, setAnswer] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [difficulty, setDifficulty] = useState('Medium');
  const [score, setScore] = useState(null);

  const fetchHistory = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/questions/history`);
      setHistory(response.data);
    } catch (error) {
      console.error("Error fetching history:", error);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const generateQuestion = async () => {
    if (loading || !topic) return alert("Please enter a topic!");
    setLoading(true);
    setFeedback(null);
    setAnswer('');
    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/questions/generate`, {
        topic: topic,
        difficulty: difficulty
      });
      setQuestion(response.data);
    } catch (error) {
      alert("Failed to get question.");
    } finally {
      setLoading(false);
    }
  };

  const submitAnswer = async () => {
    if (loading || !answer) return;
    setLoading(true);
    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/questions/evaluate`, {
        question: question.questionText,
        userAnswer: answer,
        topic: topic
      });

      setFeedback(response.data.feedback);
      setScore(response.data.score); 

      fetchHistory();
    } catch (error) {
      alert("Error evaluating answer.");
    } finally {
      setLoading(false);
    }
  };

  const clearHistory = async () => {
    if (window.confirm("Are you sure you want to delete all practice history?")) {
      await axios.delete(`${import.meta.env.VITE_API_URL}/questions/history`);
      setHistory([]);
    }
  };

  return (
    <div style={{ padding: '40px', fontFamily: 'sans-serif', maxWidth: '900px', margin: '0 auto', color: '#333', backgroundColor: '#f4f7f6', minHeight: '100vh' }}>

      {/* --- Main Interview Section --- */}
      <div style={{ background: '#fff', padding: '30px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', marginBottom: '40px' }}>
        <h1 style={{ textAlign: 'center', color: '#646cff', marginBottom: '30px' }}><Brain size={32} /> Interview Practice</h1>

        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
          <select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
            style={{ padding: '12px', borderRadius: '8px', border: '1px solid #ddd', marginRight: '10px' }}
          >
            <option value="Easy">Easy (Beginner)</option>
            <option value="Medium">Medium (Intermediate)</option>
            <option value="Hard">Hard (Expert)</option>
          </select>
          <input type="text" placeholder="Topic (Java, Python...)" value={topic} onChange={(e) => setTopic(e.target.value)} style={{ flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid #ddd' }} />
          <button onClick={generateQuestion} disabled={loading} style={{ padding: '12px 24px', borderRadius: '8px', background: '#646cff', color: 'white', border: 'none', cursor: 'pointer' }}>
            {loading ? <Loader2 className="animate-spin" /> : 'Get Question'}
          </button>
        </div>

        {question && (
          <div>
            <div style={{ padding: '15px', backgroundColor: '#f0f2ff', borderRadius: '8px', marginBottom: '15px' }}>
              <strong>Q: {question.questionText}</strong>
            </div>
            <textarea value={answer} onChange={(e) => setAnswer(e.target.value)} placeholder="Type your answer..." style={{ width: '100%', height: '100px', padding: '10px', borderRadius: '8px', border: '1px solid #ddd', marginBottom: '10px' }} />
            <button onClick={submitAnswer} disabled={loading} style={{ width: '100%', padding: '12px', background: '#2e7d32', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Submit</button>
          </div>
        )}

        {/* Score Display */}
        {score !== null && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '15px', padding: '10px', borderRadius: '8px', backgroundColor: score >= 7 ? '#e8f5e9' : score >= 5 ? '#fff3e0' : '#ffebee' }}>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: score >= 7 ? '#2e7d32' : score >= 5 ? '#ef6c00' : '#c62828' }}>
              {score}/10
            </div>
            <div style={{ fontSize: '1rem', fontWeight: '500' }}>
              {score >= 8 ? "Excellent Work!" : score >= 5 ? "Good Effort!" : "Needs Improvement"}
            </div>
          </div>
        )}

        {feedback && (
          <div style={{ marginTop: '20px', padding: '20px', backgroundColor: '#e8f5e9', borderRadius: '12px', border: '1px solid #a5d6a7' }}>
            <h3 style={{ color: '#2e7d32', marginTop: 0 }}>AI Evaluation</h3>
            <p><strong>Feedback:</strong> {feedback}</p>

            {/* Model Answer Section */}
            <details style={{ marginTop: '15px', cursor: 'pointer' }}>
              <summary style={{ color: '#646cff', fontWeight: 'bold' }}>View Model Answer</summary>
              <div style={{ marginTop: '10px', padding: '10px', backgroundColor: '#fff', borderRadius: '8px', borderLeft: '4px solid #646cff', fontStyle: 'italic' }}>
                {question?.modelAnswer || "Analyze the feedback above for the ideal response."}
              </div>
            </details>
          </div>
        )}
      </div>

      {/* Progress Chart Section */}
      {history.length > 1 && (
        <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 10px rgba(0,0,0,0.05)', marginBottom: '30px' }}>
          <h3 style={{ marginTop: 0, color: '#444' }}>Your Score Trend</h3>
          <div style={{ height: '250px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={[...history].reverse().slice(-10)}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="createdAt" tick={false} label={{ value: 'Past Attempts', position: 'insideBottom', offset: -5 }} />
                <YAxis domain={[0, 10]} />
                <Tooltip contentStyle={{ borderRadius: '10px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                <Line type="monotone" dataKey="score" stroke="#646cff" strokeWidth={4} dot={{ r: 6, fill: '#646cff' }} activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Progress History Section */}
      <div>
        <button onClick={clearHistory} style={{ fontSize: '0.8rem', color: 'red', cursor: 'pointer', background: 'none', border: 'none' }}>
          Clear All
        </button>
        <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#444' }}><History /> Practice History</h2>
        <div style={{ display: 'grid', gap: '15px' }}>
          {history.length === 0 ? <p>No history yet. Start practicing!</p> : history.map((item, index) => (
            <div key={index} style={{ background: '#fff', padding: '20px', borderRadius: '10px', border: '1px solid #e0e0e0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                <div style={{
                  float: 'right',
                  fontWeight: 'bold',
                  color: item.score >= 7 ? '#2e7d32' : '#666'
                }}>
                  Score: {item.score}/10
                </div>
                <span style={{ background: '#646cff', color: 'white', padding: '2px 8px', borderRadius: '4px', fontSize: '0.8rem' }}>{item.topic || 'General'}</span>
                <span style={{ color: '#999', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px' }}><Clock size={12} /> {new Date(item.createdAt).toLocaleDateString()}</span>
              </div>
              <p style={{ fontWeight: 'bold', margin: '5px 0' }}>Q: {item.questionText}</p>
              <p style={{ color: '#666', fontSize: '0.9rem', fontStyle: 'italic' }}>Your Answer: {item.userAnswer}</p>
              <div style={{ marginTop: '10px', padding: '10px', background: '#f9f9f9', borderRadius: '6px', fontSize: '0.9rem', color: '#2e7d32' }}>
                <strong>Result:</strong> {item.feedback}
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}

export default App;