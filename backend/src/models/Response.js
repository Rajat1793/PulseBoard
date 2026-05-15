const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/db');

class Response extends Model {}

Response.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    pollId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    respondentId: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    isAnonymous: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    answers: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: [],
    },
  },
  {
    sequelize,
    modelName: 'Response',
    tableName: 'responses',
    // PostgreSQL treats NULLs as distinct in unique indexes,
    // so anonymous responses (respondentId = NULL) are always allowed.
    indexes: [
      {
        unique: true,
        fields: ['pollId', 'respondentId'],
      },
    ],
  }
);

module.exports = Response;
