const mongoose = require('mongoose');
const crypto = require('crypto');

const questionSchema = new mongoose.Schema({
  text: {
    type: String,
    required: [true, 'Question text is required'],
    trim: true,
    maxlength: [500, 'Question text cannot exceed 500 characters'],
  },
  isRequired: {
    type: Boolean,
    default: true,
  },
  options: {
    type: [String],
    validate: {
      validator: (arr) => arr.length >= 2,
      message: 'Each question must have at least 2 options',
    },
  },
});

const pollSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Poll title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
      default: '',
    },
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    shareId: {
      type: String,
      unique: true,
    },
    questions: {
      type: [questionSchema],
      validate: {
        validator: (arr) => arr.length >= 1,
        message: 'Poll must have at least one question',
      },
    },
    requireAuth: {
      type: Boolean,
      default: false,
    },
    expiresAt: {
      type: Date,
      required: [true, 'Expiry date is required'],
    },
    isPublished: {
      type: Boolean,
      default: false,
    },
    totalResponses: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// Auto-generate shareId before saving
pollSchema.pre('save', function (next) {
  if (!this.shareId) {
    this.shareId = crypto.randomBytes(6).toString('hex');
  }
  next();
});

// Virtual for computed status
pollSchema.virtual('status').get(function () {
  if (this.isPublished) return 'published';
  if (new Date() > this.expiresAt) return 'expired';
  return 'active';
});

pollSchema.set('toJSON', { virtuals: true });
pollSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Poll', pollSchema);
