const { DataTypes, Model } = require('sequelize');
const crypto = require('crypto');
const sequelize = require('../config/db');

class Poll extends Model {
  get status() {
    if (this.isPublished) return 'published';
    if (new Date() > this.expiresAt) return 'expired';
    return 'active';
  }

  toJSON() {
    const values = { ...this.get() };
    values._id = values.id;
    values.status = this.status;
    return values;
  }
}

Poll.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING(200),
      allowNull: false,
      validate: { notEmpty: true },
    },
    description: {
      type: DataTypes.TEXT,
      defaultValue: '',
    },
    creatorId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    shareId: {
      type: DataTypes.STRING,
      unique: true,
    },
    questions: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: [],
    },
    requireAuth: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    expiresAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    isPublished: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    totalResponses: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
  },
  {
    sequelize,
    modelName: 'Poll',
    tableName: 'polls',
  }
);

// Assign shareId and _id to each question before create
Poll.addHook('beforeCreate', (poll) => {
  if (!poll.shareId) {
    poll.shareId = crypto.randomBytes(6).toString('hex');
  }
  if (Array.isArray(poll.questions)) {
    poll.questions = poll.questions.map((q) => ({
      ...q,
      _id: q._id || crypto.randomUUID(),
    }));
  }
});

// Assign _id to any new questions on update
Poll.addHook('beforeUpdate', (poll) => {
  if (poll.changed('questions') && Array.isArray(poll.questions)) {
    poll.questions = poll.questions.map((q) => ({
      ...q,
      _id: q._id || crypto.randomUUID(),
    }));
  }
});

module.exports = Poll;
