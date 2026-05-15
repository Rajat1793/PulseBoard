const { DataTypes, Model } = require('sequelize');
const bcrypt = require('bcryptjs');
const sequelize = require('../config/db');

const MAX_LOGIN_ATTEMPTS = 5;
const LOCK_DURATION_MS = 15 * 60 * 1000; // 15 minutes

class User extends Model {
  get isLocked() {
    return this.lockUntil && this.lockUntil > Date.now();
  }

  async comparePassword(candidatePassword) {
    const isMatch = await bcrypt.compare(candidatePassword, this.password);

    if (isMatch) {
      if (this.loginAttempts > 0 || this.lockUntil) {
        await User.update(
          { loginAttempts: 0, lockUntil: null },
          { where: { id: this.id } }
        );
      }
      return true;
    }

    const newAttempts = (this.loginAttempts || 0) + 1;
    const updates = { loginAttempts: newAttempts };
    if (newAttempts >= MAX_LOGIN_ATTEMPTS) {
      updates.lockUntil = new Date(Date.now() + LOCK_DURATION_MS);
    }
    await User.update(updates, { where: { id: this.id } });
    return false;
  }

  toJSON() {
    const values = { ...this.get() };
    values._id = values.id;
    delete values.password;
    delete values.loginAttempts;
    delete values.lockUntil;
    return values;
  }
}

User.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(50),
      allowNull: false,
      validate: { notEmpty: true, len: [1, 50] },
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: { isEmail: true },
      set(value) {
        this.setDataValue('email', value.toLowerCase().trim());
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    loginAttempts: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    lockUntil: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: 'User',
    tableName: 'users',
  }
);

User.addHook('beforeSave', async (user) => {
  if (user.changed('password')) {
    user.password = await bcrypt.hash(user.password, 12);
  }
});

module.exports = User;
