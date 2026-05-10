const express = require('express');
const router = express.Router();
const Poll = require('../models/Poll');
const Response = require('../models/Response');
const { optionalAuth } = require('../middleware/auth');
const { computeAnalytics } = require('./polls');

// GET /api/responses/results/:shareId — public analytics (only if published)
router.get('/results/:shareId', async (req, res) => {
  try {
    const poll = await Poll.findOne({ shareId: req.params.shareId });
    if (!poll) {
      return res.status(404).json({ success: false, message: 'Poll not found' });
    }
    if (!poll.isPublished) {
      return res
        .status(403)
        .json({ success: false, message: 'Results have not been published yet' });
    }

    const analytics = await computeAnalytics(poll);
    res.json({ success: true, data: analytics });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// POST /api/responses/:shareId — submit a response
router.post('/:shareId', optionalAuth, async (req, res) => {
  try {
    const poll = await Poll.findOne({ shareId: req.params.shareId });
    if (!poll) {
      return res.status(404).json({ success: false, message: 'Poll not found' });
    }

    // Check expiry
    if (new Date() > poll.expiresAt) {
      return res
        .status(400)
        .json({ success: false, message: 'This poll has expired' });
    }

    // Check if poll is published (closed)
    if (poll.isPublished) {
      return res
        .status(400)
        .json({ success: false, message: 'This poll has been closed' });
    }

    // Check auth requirement
    if (poll.requireAuth && !req.user) {
      return res.status(401).json({
        success: false,
        message: 'You must be logged in to respond to this poll',
      });
    }

    // Check for duplicate authenticated response
    if (req.user) {
      const existing = await Response.findOne({
        poll: poll._id,
        respondent: req.user._id,
      });
      if (existing) {
        return res
          .status(400)
          .json({ success: false, message: 'You have already responded to this poll' });
      }
    }

    const { answers } = req.body;
    if (!answers || !Array.isArray(answers)) {
      return res
        .status(400)
        .json({ success: false, message: 'Answers are required' });
    }

    // Validate mandatory questions
    const requiredQuestions = poll.questions.filter((q) => q.isRequired);
    for (const q of requiredQuestions) {
      const answer = answers.find(
        (a) => a.questionId && a.questionId.toString() === q._id.toString()
      );
      if (!answer || !answer.selectedOption) {
        return res.status(400).json({
          success: false,
          message: `Question "${q.text}" is required`,
        });
      }
    }

    // Validate that selected options exist in the question
    for (const answer of answers) {
      const question = poll.questions.find(
        (q) => q._id.toString() === answer.questionId?.toString()
      );
      if (!question) continue;
      if (answer.selectedOption && !question.options.includes(answer.selectedOption)) {
        return res.status(400).json({
          success: false,
          message: `Invalid option for question "${question.text}"`,
        });
      }
    }

    const isAnonymous = !req.user;

    const response = await Response.create({
      poll: poll._id,
      respondent: req.user ? req.user._id : null,
      isAnonymous,
      answers,
    });

    // Increment total responses count
    await Poll.findByIdAndUpdate(poll._id, { $inc: { totalResponses: 1 } });

    // Emit real-time analytics update to poll room
    const updatedPoll = await Poll.findById(poll._id);
    const analytics = await computeAnalytics(updatedPoll);
    const io = req.app.get('io');
    io.to(`poll-${poll._id}`).emit('analytics-update', analytics);
    io.to(`poll-${poll._id}`).emit('new-response', {
      totalResponses: analytics.totalResponses,
    });

    res.status(201).json({
      success: true,
      message: 'Response submitted successfully',
      data: { id: response._id },
    });
  } catch (err) {
    if (err.code === 11000) {
      return res
        .status(400)
        .json({ success: false, message: 'You have already responded to this poll' });
    }
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
