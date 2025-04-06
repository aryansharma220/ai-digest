const express = require('express');
const router = express.Router();
const User = require('../models/userModel');

/**
 * GET /api/user/profile
 * Get user profile
 */
router.get('/profile', async (req, res) => {
  try {
    const user = await User.findOne({ uid: req.user.uid });
    
    if (!user) {
      return res.status(404).json({ message: 'User profile not found' });
    }
    
    res.status(200).json(user);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ message: 'Error fetching user profile', error: error.message });
  }
});

/**
 * POST /api/user/profile
 * Create or update user profile
 */
router.post('/profile', async (req, res) => {
  try {
    const { displayName, photoURL, preferences } = req.body;
    
    // Find user or create a new one
    let user = await User.findOne({ uid: req.user.uid });
    
    if (!user) {
      // Create new user
      user = new User({
        uid: req.user.uid,
        email: req.user.email,
        displayName: displayName || '',
        photoURL: photoURL || '',
        preferences: preferences || {
          categories: [],
          digestFrequency: 'daily',
          notificationsEnabled: true
        }
      });
    } else {
      // Update existing user
      if (displayName !== undefined) user.displayName = displayName;
      if (photoURL !== undefined) user.photoURL = photoURL;
      if (preferences) {
        user.preferences = {
          ...user.preferences,
          ...preferences
        };
      }
      user.lastLogin = new Date();
    }
    
    await user.save();
    
    res.status(200).json(user);
  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).json({ message: 'Error updating user profile', error: error.message });
  }
});

/**
 * GET /api/user/preferences
 * Get user preferences
 */
router.get('/preferences', async (req, res) => {
  try {
    const user = await User.findOne({ uid: req.user.uid });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.status(200).json(user.preferences || {});
  } catch (error) {
    console.error('Error fetching user preferences:', error);
    res.status(500).json({ message: 'Error fetching user preferences', error: error.message });
  }
});

/**
 * PATCH /api/user/preferences
 * Update user preferences
 */
router.patch('/preferences', async (req, res) => {
  try {
    const { categories, digestFrequency, notificationsEnabled } = req.body;
    
    // Validate input data
    if (digestFrequency && !['daily', 'weekly'].includes(digestFrequency)) {
      return res.status(400).json({ message: 'Invalid digest frequency. Must be "daily" or "weekly"' });
    }
    
    const updateData = {};
    if (categories !== undefined) updateData['preferences.categories'] = categories;
    if (digestFrequency !== undefined) updateData['preferences.digestFrequency'] = digestFrequency;
    if (notificationsEnabled !== undefined) updateData['preferences.notificationsEnabled'] = notificationsEnabled;
    
    const user = await User.findOneAndUpdate(
      { uid: req.user.uid },
      { $set: updateData },
      { new: true }
    );
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.status(200).json(user.preferences);
  } catch (error) {
    console.error('Error updating user preferences:', error);
    res.status(500).json({ message: 'Error updating user preferences', error: error.message });
  }
});

/**
 * GET /api/user/history
 * Get user's read history
 */
router.get('/history', async (req, res) => {
  try {
    const user = await User.findOne({ uid: req.user.uid });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.status(200).json(user.readHistory || []);
  } catch (error) {
    console.error('Error fetching user history:', error);
    res.status(500).json({ message: 'Error fetching user history', error: error.message });
  }
});

/**
 * POST /api/user/history
 * Add digest to user's read history
 */
router.post('/history', async (req, res) => {
  try {
    const { digestId } = req.body;
    
    if (!digestId) {
      return res.status(400).json({ message: 'Digest ID is required' });
    }
    
    const updatedUser = await User.findOneAndUpdate(
      { uid: req.user.uid },
      { 
        $push: { 
          readHistory: {
            digestId,
            readAt: new Date()
          }
        }
      },
      { new: true, upsert: true }
    );
    
    res.status(200).json(updatedUser.readHistory || []);
  } catch (error) {
    console.error('Error updating user history:', error);
    res.status(500).json({ message: 'Error updating user history', error: error.message });
  }
});

module.exports = router;
