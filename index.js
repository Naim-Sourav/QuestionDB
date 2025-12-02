const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error("❌ MONGODB_URI is missing in .env file");
}

mongoose.connect(MONGODB_URI)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('❌ MongoDB Connection Error:', err));

// Question Schema
// Updated to include Category/Subject info
const questionSchema = new mongoose.Schema({
  question: { type: String, required: true },
  options: [{ type: String, required: true }],
  correctOption: { type: String, required: true }, // Storing as index string "0", "1", etc.
  explanation: { type: String },
  
  // Categorization Fields
  subject: { type: String },
  chapter: { type: String },
  topic: { type: String },
  examType: { type: String },
  
  createdAt: { type: Date, default: Date.now }
});

const Question = mongoose.model('Question', questionSchema);

// Routes
app.get('/', (req, res) => {
  res.send('HSC GenAI Backend is Running! 🚀');
});

// Save Questions API
app.post('/api/questions', async (req, res) => {
  try {
    const data = req.body;
    
    // Ensure we are working with an array
    const questionsToSave = Array.isArray(data) ? data : [data];

    if (questionsToSave.length === 0) {
        return res.status(400).json({ success: false, message: "No questions provided" });
    }

    const savedQuestions = await Question.insertMany(questionsToSave);

    console.log(`✅ Saved ${savedQuestions.length} questions`);
    
    res.status(201).json({ 
      success: true, 
      message: 'Questions saved successfully!', 
      count: savedQuestions.length,
      data: savedQuestions
    });

  } catch (error) {
    console.error('❌ Error saving questions:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to save questions', 
      details: error.message 
    });
  }
});

// Get Questions API (Optional: For checking data)
app.get('/api/questions', async (req, res) => {
    try {
        const { subject, chapter } = req.query;
        let query = {};
        if (subject) query.subject = subject;
        if (chapter) query.chapter = chapter;

        const questions = await Question.find(query).sort({ createdAt: -1 }).limit(100);
        res.json({ success: true, count: questions.length, data: questions });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
