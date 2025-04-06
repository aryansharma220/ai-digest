const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  uid: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  displayName: String,
  photoURL: String,
  preferences: {
    categories: [{
      type: String,
      enum: ['llm', 'computer_vision', 'reinforcement_learning', 'nlp', 'mlops', 'multimodal', 'research', 'ai_tools']
    }],
    digestFrequency: {
      type: String,
      enum: ['daily', 'weekly'],
      default: 'daily'
    },
    notificationsEnabled: {
      type: Boolean,
      default: true
    }
  },
  readHistory: [{
    digestId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Digest'
    },
    readAt: {
      type: Date,
      default: Date.now
    }
  }],
  lastLogin: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  collection: 'users'
});

// Create index for faster queries
userSchema.index({ 'uid': 1 });
userSchema.index({ 'preferences.categories': 1 });
userSchema.index({ 'readHistory.digestId': 1 });

module.exports = mongoose.model('User', userSchema);
