const mongoose = require('mongoose');

const answerSchema = new mongoose.Schema({
  questionId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  selectedOption: {
    type: String,
    required: true,
    trim: true,
  },
});

const responseSchema = new mongoose.Schema(
  {
    poll: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Poll',
      required: true,
    },
    respondent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    isAnonymous: {
      type: Boolean,
      default: true,
    },
    answers: [answerSchema],
  },
  { timestamps: true }
);

// Prevent duplicate authenticated responses for the same poll
responseSchema.index(
  { poll: 1, respondent: 1 },
  {
    unique: true,
    partialFilterExpression: { respondent: { $ne: null } },
  }
);

module.exports = mongoose.model('Response', responseSchema);
