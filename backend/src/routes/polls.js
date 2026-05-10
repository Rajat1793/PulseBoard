const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Poll = require('../models/Poll');
const Response = require('../models/Response');
const { protect } = require('../middleware/auth');

// Helper: compute analytics for a poll
const computeAnalytics = async (poll) => {
  const responses = await Response.find({ poll: poll._id });

  const questions = poll.questions.map((q) => {
    const optionCounts = {};
    q.options.forEach((opt) => {
      optionCounts[opt] = 0;
    });

    let responseCount = 0;
    responses.forEach((r) => {
      const answer = r.answers.find(
        (a) => a.questionId.toString() === q._id.toString()
      );
      if (answer && optionCounts[answer.selectedOption] !== undefined) {
        optionCounts[answer.selectedOption]++;
        responseCount++;
      }
    });

    return {
      questionId: q._id,
      text: q.text,
      isRequired: q.isRequired,
      options: q.options,
      optionCounts,
      responseCount,
      skippedCount: responses.length - responseCount,
    };
  });

  return {
    totalResponses: responses.length,
    anonymousResponses: responses.filter((r) => r.isAnonymous).length,
    authenticatedResponses: responses.filter((r) => !r.isAnonymous).length,
    questions,
    poll: {
      _id: poll._id,
      title: poll.title,
      description: poll.description,
      expiresAt: poll.expiresAt,
      status: poll.status,
      isPublished: poll.isPublished,
      shareId: poll.shareId,
      requireAuth: poll.requireAuth,
    },
  };
};

// ─── Public route — must be defined BEFORE /:id ───────────────────────────────

// GET /api/polls/public/:shareId — get poll for public respondent
router.get('/public/:shareId', async (req, res) => {
  try {
    const poll = await Poll.findOne({ shareId: req.params.shareId }).select(
      '-creator'
    );
    if (!poll) {
      return res.status(404).json({ success: false, message: 'Poll not found' });
    }

    res.json({ success: true, data: poll });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ─── Protected routes ─────────────────────────────────────────────────────────

// POST /api/polls — create poll
router.post(
  '/',
  protect,
  [
    body('title').trim().notEmpty().withMessage('Poll title is required'),
    body('expiresAt')
      .notEmpty()
      .withMessage('Expiry date is required')
      .isISO8601()
      .withMessage('Expiry must be a valid date'),
    body('questions')
      .isArray({ min: 1 })
      .withMessage('At least one question is required'),
    body('questions.*.text')
      .notEmpty()
      .withMessage('Question text is required'),
    body('questions.*.options')
      .isArray({ min: 2 })
      .withMessage('Each question must have at least 2 options'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    // Validate expiry is in the future
    if (new Date(req.body.expiresAt) <= new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Expiry date must be in the future',
      });
    }

    try {
      const poll = await Poll.create({
        ...req.body,
        creator: req.user._id,
      });

      res.status(201).json({ success: true, data: poll });
    } catch (err) {
      res.status(500).json({ success: false, message: 'Server error' });
    }
  }
);

// GET /api/polls — list creator's polls
router.get('/', protect, async (req, res) => {
  try {
    const polls = await Poll.find({ creator: req.user._id }).sort({
      createdAt: -1,
    });
    res.json({ success: true, data: polls });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET /api/polls/:id — get single poll (creator only)
router.get('/:id', protect, async (req, res) => {
  try {
    const poll = await Poll.findOne({
      _id: req.params.id,
      creator: req.user._id,
    });
    if (!poll) {
      return res
        .status(404)
        .json({ success: false, message: 'Poll not found' });
    }
    res.json({ success: true, data: poll });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// PUT /api/polls/:id — update poll (creator only)
router.put(
  '/:id',
  protect,
  [
    body('title').optional().trim().notEmpty().withMessage('Title cannot be empty'),
    body('expiresAt')
      .optional()
      .isISO8601()
      .withMessage('Expiry must be a valid date'),
    body('questions')
      .optional()
      .isArray({ min: 1 })
      .withMessage('At least one question is required'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    try {
      const poll = await Poll.findOne({
        _id: req.params.id,
        creator: req.user._id,
      });
      if (!poll) {
        return res
          .status(404)
          .json({ success: false, message: 'Poll not found' });
      }

      const { title, description, expiresAt, requireAuth, questions } = req.body;
      if (title !== undefined) poll.title = title;
      if (description !== undefined) poll.description = description;
      if (expiresAt !== undefined) poll.expiresAt = expiresAt;
      if (requireAuth !== undefined) poll.requireAuth = requireAuth;
      if (questions !== undefined) poll.questions = questions;

      await poll.save();
      res.json({ success: true, data: poll });
    } catch (err) {
      res.status(500).json({ success: false, message: 'Server error' });
    }
  }
);

// DELETE /api/polls/:id — delete poll (creator only)
router.delete('/:id', protect, async (req, res) => {
  try {
    const poll = await Poll.findOneAndDelete({
      _id: req.params.id,
      creator: req.user._id,
    });
    if (!poll) {
      return res
        .status(404)
        .json({ success: false, message: 'Poll not found' });
    }
    // Also remove all responses for this poll
    await Response.deleteMany({ poll: req.params.id });
    res.json({ success: true, message: 'Poll deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// POST /api/polls/:id/publish — publish poll results
router.post('/:id/publish', protect, async (req, res) => {
  try {
    const poll = await Poll.findOne({
      _id: req.params.id,
      creator: req.user._id,
    });
    if (!poll) {
      return res
        .status(404)
        .json({ success: false, message: 'Poll not found' });
    }

    poll.isPublished = true;
    await poll.save();

    const io = req.app.get('io');
    io.to(`poll-${poll._id}`).emit('poll-published', { pollId: poll._id });

    res.json({ success: true, message: 'Poll results published', data: poll });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET /api/polls/:id/analytics — analytics for creator
router.get('/:id/analytics', protect, async (req, res) => {
  try {
    const poll = await Poll.findOne({
      _id: req.params.id,
      creator: req.user._id,
    });
    if (!poll) {
      return res
        .status(404)
        .json({ success: false, message: 'Poll not found' });
    }

    const analytics = await computeAnalytics(poll);
    res.json({ success: true, data: analytics });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
module.exports.computeAnalytics = computeAnalytics;
