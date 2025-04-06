const express = require('express');
const router = express.Router();
const User = require('../models/userModel');
const authMiddleware = require('../middleware/authMiddleware');

/**
 * POST /api/auth/verify
 * Verify authentication token and return user data
 */
router.post('/verify', authMiddleware, async (req, res) => {
  try {
    // Token is valid if middleware passed
    // Find or create user in database
    let user = await User.findOne({ uid: req.user.uid });
    
    if (!user) {
      // Create basic user profile
      user = new User({
        uid: req.user.uid,
        email: req.user.email,
        displayName: '',
        lastLogin: new Date()
      });
      await user.save();
    } else {
      // Update last login
      await User.updateOne(
        { uid: req.user.uid },
        { $set: { lastLogin: new Date() }}
      );
    }
    
    res.status(200).json({
      message: 'Authentication successful',
      user: {
        uid: req.user.uid,
        email: req.user.email,
        emailVerified: req.user.emailVerified
      }
    });
  } catch (error) {
    console.error('Auth verification error:', error);
    res.status(500).json({ message: 'Authentication verification failed', error: error.message });
  }
});

module.exports = router;
